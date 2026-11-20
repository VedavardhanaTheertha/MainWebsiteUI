import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import { assertSafeSourceFile, parseMarkdownFrontmatter } from "./content-utils.mjs";
import { librarySections } from "./library-sections.config.mjs";

const textFields = ["title", "description", "page_type", "footnote"];
const optionalTextFields = ["icon_title"];
const iconNames = new Set([
  "home", "volunteer", "lekhana-yajna", "library", "seva",
  "events", "media", "story", "projects", "learn", "connect", "panchanga",
]);
const tones = new Set(["saffron", "green", "amber", "rose", "plum"]);
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function fail(source, message) {
  throw new Error(`${source}: ${message}`);
}

function languageMap(value, source, defaultLanguage, allowEmpty = false) {
  if (!object(value) || !Object.hasOwn(value, defaultLanguage)) {
    fail(source, `expected a language map containing ${defaultLanguage}`);
  }
  for (const [code, text] of Object.entries(value)) {
    if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(code) ||
        typeof text !== "string" || (!allowEmpty && !text.trim())) {
      fail(source, "expected language codes with valid string values");
    }
  }
}

function safeLocation(value, source, image = false) {
  if (typeof value !== "string" || !value || /[\\\s\u0000-\u001f]/.test(value)) {
    fail(source, "expected a safe location");
  }
  if (!image && /[?#]/.test(value)) fail(source, "expected a site-root-relative page URL without query or fragment");
  if (image && /^@image\.[A-Za-z0-9_-]+$/.test(value)) return;
  if (/^\/(?!\/)/.test(value) && !value.split(/[/?#]/).includes("..") && !/%(?:2f|5c|2e)/i.test(value)) return;
  if (image && /^https?:\/\//.test(value)) {
    const url = new URL(value);
    if (!url.username && !url.password) return;
  }
  fail(source, image ? "expected an image alias, local path or HTTP(S) image" : "expected a site-root-relative page URL");
}

export function loadPageReferences(rootDir, defaultLanguage) {
  const directory = path.join(rootDir, "library", "pages");
  const pages = new Map();
  const urls = new Set();
  for (const file of readdirSync(directory).filter((name) => name.endsWith(".md")).sort()) {
    const source = `library/pages/${file}`;
    const { metadata, body } = parseMarkdownFrontmatter(readFileSync(path.join(directory, file), "utf8"), source);
    if (metadata.kind !== "page-reference" || body) fail(source, "expected a metadata-only page-reference record");
    for (const key of Object.keys(metadata)) {
      if (!["kind", "enabled", "fields", ...textFields, ...optionalTextFields, "image", "url", "$comment", "comment"].includes(key)) fail(source, `unknown field ${key}`);
    }
    for (const field of textFields) languageMap(metadata[field], `${source}.${field}`, defaultLanguage, field === "footnote");
    for (const field of optionalTextFields) {
      if (metadata[field] !== undefined) languageMap(metadata[field], `${source}.${field}`, defaultLanguage, false);
    }
    safeLocation(metadata.image, `${source}.image`, true);
    safeLocation(metadata.url, `${source}.url`);
    if (urls.has(metadata.url)) fail(source, `duplicate page URL ${metadata.url}`);
    urls.add(metadata.url);
    pages.set(file, { ...metadata, id: file.slice(0, -3), enabled: metadata.enabled ?? false });
  }
  return pages;
}

function localizedCard(record, language, defaultLanguage) {
  const card = {
    id: record.id,
    ...Object.fromEntries(textFields.map((field) => [field, record[field][language] ?? record[field][defaultLanguage]])),
    image: record.image,
    url: record.url,
    enabled: record.enabled ?? false,
  };
  if (record.icon_title) {
    card.icon_title = record.icon_title[language] ?? record.icon_title[defaultLanguage];
  }
  return card;
}

export function sampleUnique(items, count, draw = randomInt) {
  if (!Number.isSafeInteger(count) || count < 1 || items.length < count) {
    fail("guidance_carousel", `requires at least ${count} distinct items`);
  }
  const shuffled = [...items];
  for (let i = 0; i < count; i++) {
    const offset = draw(shuffled.length - i);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset >= shuffled.length - i) {
      fail("guidance_carousel", "random selection returned an invalid index");
    }
    const j = i + offset;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function sampleBalanced(items, count, draw = randomInt, getGroup = (item) => item.item_type || "default") {
  if (!Number.isSafeInteger(count) || count < 1 || items.length < count) {
    return sampleUnique(items, count, draw);
  }
  const groups = new Map();
  for (const item of items) {
    const groupKey = getGroup(item);
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(item);
  }
  // Shuffle each group internally
  for (const [key, list] of groups.entries()) {
    groups.set(key, sampleUnique(list, list.length, draw));
  }
  // Shuffle the group order
  const groupKeys = sampleUnique([...groups.keys()], groups.size, draw);
  const selected = [];
  let round = 0;
  while (selected.length < count) {
    let anyAdded = false;
    for (const key of groupKeys) {
      const list = groups.get(key);
      if (round < list.length) {
        selected.push(list[round]);
        anyAdded = true;
        if (selected.length === count) break;
      }
    }
    if (!anyAdded) break;
    round++;
  }
  return selected;
}

export function loadRemedyCarouselCandidates(rootDir, language, defaultLanguage, pages = loadPageReferences(rootDir, defaultLanguage)) {
  const section = librarySections.find(({ id }) => id === "remedies");
  if (!section) fail("library section configuration", "the remedies section is required");
  const collection = [...pages.values()].find(({ url }) => url === section.route);
  if (!collection) fail("library/pages", `missing page reference for ${section.route}`);
  const directory = path.join(rootDir, "library", section.id);
  return readdirSync(directory).filter((file) => file.endsWith(".md") && file !== "_index.md").sort().map((file) => {
    const source = `library/${section.id}/${file}`;
    const { metadata } = parseMarkdownFrontmatter(readFileSync(path.join(directory, file), "utf8"), source);
    if (metadata.id !== file.slice(0, -3) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.id)) {
      fail(source, "article ID must match its filename");
    }
    languageMap(metadata.title, `${source}.title`, defaultLanguage);
    languageMap(metadata.summary, `${source}.summary`, defaultLanguage);
    if (metadata.status) languageMap(metadata.status, `${source}.status`, defaultLanguage);
    safeLocation(metadata.image, `${source}.image`, true);
    return localizedCard({
      id: metadata.id, title: metadata.title, description: metadata.summary,
      page_type: collection.title, footnote: metadata.status || { [defaultLanguage]: "", [language]: "" },
      image: metadata.image, url: `${section.route}#${metadata.id}`,
      enabled: (section?.enabled ?? false) && (metadata.enabled ?? false),
    }, language, defaultLanguage);
  });
}

export function createSeededRandom(seedString) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 0x01000193);
  }
  let s = h >>> 0;
  return function seededRandomInt(max) {
    if (max <= 0) return 0;
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s % max;
  };
}

export function resolveDynamicList(key, config, expectedCount, pages, excludeFiles = new Set()) {
  const count = config.count ?? expectedCount;
  if (!Number.isSafeInteger(count) || count < 1) {
    fail(`settings/home.json.${key}`, "expected a positive integer for count");
  }
  const slots = new Array(count).fill(null);
  const today = new Date().toISOString().slice(0, 10);

  // 1. Resolve calendar overrides
  let activeOverride = null;
  if (Array.isArray(config.overrides)) {
    for (const override of config.overrides) {
      if (!override || typeof override !== "object") continue;
      const { date, startsOn, endsOn } = override;
      if (date && date === today) {
        activeOverride = override;
        break;
      }
      if (startsOn && endsOn && today >= startsOn && today <= endsOn) {
        activeOverride = override;
        break;
      }
      if (startsOn && !endsOn && today >= startsOn) {
        activeOverride = override;
        break;
      }
    }
  }

  // 2. Place pinned items
  const pinnedList = [];
  if (activeOverride && Array.isArray(activeOverride.pinned)) {
    pinnedList.push(...activeOverride.pinned);
  }
  if (Array.isArray(config.pinned)) {
    pinnedList.push(...config.pinned);
  }

  const seenItems = new Set();
  for (const entry of pinnedList) {
    let item;
    let targetIndex = null;
    if (typeof entry === "string") {
      item = entry;
    } else if (entry && typeof entry === "object") {
      item = entry.item || entry.page || entry.file;
      if (Number.isSafeInteger(entry.index) && entry.index >= 0 && entry.index < count) {
        targetIndex = entry.index;
      }
    }
    if (typeof item !== "string" || !pages.has(item) || seenItems.has(item) || excludeFiles.has(item)) continue;

    if (targetIndex !== null && slots[targetIndex] === null) {
      slots[targetIndex] = item;
      seenItems.add(item);
    } else if (targetIndex === null) {
      const freeIdx = slots.indexOf(null);
      if (freeIdx !== -1) {
        slots[freeIdx] = item;
        seenItems.add(item);
      }
    }
  }

  // 3. Fill remaining slots from candidate pool (prioritizing enabled pages over disabled pages)
  const candidatePool = (Array.isArray(config.pool) && config.pool.length > 0 ? config.pool : [...pages.keys()])
    .filter((file) => typeof file === "string" && pages.has(file) && !seenItems.has(file) && !excludeFiles.has(file));

  const emptyIndices = [];
  for (let i = 0; i < count; i++) {
    if (slots[i] === null) emptyIndices.push(i);
  }

  if (emptyIndices.length > 0) {
    if (candidatePool.length < emptyIndices.length) {
      fail(`settings/home.json.${key}`, `pool has fewer items than required empty slots (${candidatePool.length} < ${emptyIndices.length})`);
    }
    const rng = createSeededRandom(`${today}-${key}`);
    const enabledPool = candidatePool.filter((file) => pages.get(file)?.enabled === true);
    const disabledPool = candidatePool.filter((file) => pages.get(file)?.enabled !== true);

    const needed = emptyIndices.length;
    const drawFromEnabled = Math.min(needed, enabledPool.length);
    const selectedFromEnabled = drawFromEnabled > 0 ? sampleUnique(enabledPool, drawFromEnabled, rng) : [];

    const remainingNeeded = needed - selectedFromEnabled.length;
    const selectedFromDisabled = remainingNeeded > 0 ? sampleUnique(disabledPool, remainingNeeded, rng) : [];

    const selected = [...selectedFromEnabled, ...selectedFromDisabled];
    for (let i = 0; i < emptyIndices.length; i++) {
      slots[emptyIndices[i]] = selected[i];
    }
  }

  return slots;
}

export function loadAllLibraryCandidates(rootDir, language, defaultLanguage, pages = loadPageReferences(rootDir, defaultLanguage)) {
  const sectionMap = new Map(librarySections.map((s) => [s.id, s]));
  const candidates = [];
  for (const [sectionId, section] of sectionMap.entries()) {
    const dir = path.join(rootDir, "library", sectionId);
    if (!existsSync(dir)) continue;
    const collection = [...pages.values()].find(({ url }) => url === section.route);
    const pageType = collection ? (collection.title?.[language] ?? collection.title?.[defaultLanguage] ?? sectionId) : sectionId;
    let files;
    try {
      files = readdirSync(dir).filter((file) => file.endsWith(".md") && file !== "_index.md").sort();
    } catch {
      continue;
    }
    for (const file of files) {
      const source = `library/${sectionId}/${file}`;
      try {
        const raw = readFileSync(path.join(dir, file), "utf8");
        const { metadata } = parseMarkdownFrontmatter(raw, source);
        if (!metadata || metadata.enabled === false) continue;
        const id = metadata.id || file.slice(0, -3);
        const title = metadata.title?.[language] ?? metadata.title?.[defaultLanguage] ?? (typeof metadata.title === "string" ? metadata.title : id);
        const description = metadata.summary?.[language] ?? metadata.summary?.[defaultLanguage] ?? (typeof metadata.summary === "string" ? metadata.summary : "");
        const footnote = metadata.status?.[language] ?? metadata.status?.[defaultLanguage] ?? (typeof metadata.status === "string" ? metadata.status : "");
        candidates.push({
          id: `${sectionId}--${id}`,
          file: `${sectionId}/${file}`,
          key: file,
          title,
          description,
          page_type: pageType,
          footnote,
          item_type: sectionId,
          image: metadata.image || "",
          url: `${section.route}#${id}`,
          enabled: true,
        });
      } catch {
        // Skip unparseable files
      }
    }
  }

  // Bhakti / Dasasahitya compositions
  const bhaktiDir = path.join(rootDir, "library", "dasasahitya");
  if (existsSync(bhaktiDir)) {
    let files = [];
    try {
      files = readdirSync(bhaktiDir).filter((file) => file.endsWith(".md")).sort();
    } catch {}
    for (const file of files) {
      try {
        const raw = readFileSync(path.join(bhaktiDir, file), "utf8");
        const { metadata } = parseMarkdownFrontmatter(raw, `library/dasasahitya/${file}`);
        if (!metadata || metadata.enabled === false) continue;
        const id = metadata.id || file.slice(0, -3);
        const lines = raw.split("\n");
        const englishHeaderIdx = lines.findIndex((l) => l.includes("Lyrics transliterated to english"));
        let translitTitle = "";
        if (englishHeaderIdx !== -1) {
          const nextLine = lines.slice(englishHeaderIdx + 1).map((l) => l.trim()).find(Boolean) || "";
          translitTitle = nextLine.split("||")[0].split("|")[0].trim();
        }
        const knTitle = metadata.title || "";
        const enTitle = translitTitle || metadata.kruti || id;
        const composerKn = metadata["kruti-kn"] || "";
        const composerEn = metadata.kruti || "";
        candidates.push({
          id: `bhakti--${id}`,
          file: `dasasahitya/${file}`,
          key: file,
          title: language === "kn" ? (knTitle || enTitle) : (enTitle || knTitle),
          description: language === "kn" ? (composerKn || composerEn) : (composerEn || composerKn),
          page_type: language === "kn" ? "ಭಕ್ತಿ ಗಾನ" : "Bhakti Gāna",
          footnote: language === "kn" ? (metadata["ankita-kn"] || "") : (metadata.ankita || ""),
          item_type: "bhakti",
          image: "https://pub-80e0aeff507a41da90321eb9ff4616c7.r2.dev/pages/bhakti-gana.avif",
          url: `/library/bhakti#${id}`,
          enabled: true,
        });
      } catch {
        // Skip unparseable files
      }
    }
  }
  return candidates;
}

export function loadAllGuidanceCandidates(rootDir, language, defaultLanguage) {
  const candidates = [];
  // 1. Remedies
  const remediesDir = path.join(rootDir, "library", "remedies");
  if (existsSync(remediesDir)) {
    let files = [];
    try {
      files = readdirSync(remediesDir).filter((file) => file.endsWith(".md") && file !== "_index.md").sort();
    } catch {}
    for (const file of files) {
      try {
        const raw = readFileSync(path.join(remediesDir, file), "utf8");
        const { metadata } = parseMarkdownFrontmatter(raw, `library/remedies/${file}`);
        if (!metadata) continue;
        const id = metadata.id || file.slice(0, -3);
        const title = metadata.title?.[language] ?? metadata.title?.[defaultLanguage] ?? (typeof metadata.title === "string" ? metadata.title : id);
        const description = metadata.summary?.[language] ?? metadata.summary?.[defaultLanguage] ?? (typeof metadata.summary === "string" ? metadata.summary : "");
        const footnote = metadata.status?.[language] ?? metadata.status?.[defaultLanguage] ?? (typeof metadata.status === "string" ? metadata.status : "");
        candidates.push({
          id: `remedies--${id}`,
          file: `remedies/${file}`,
          key: file,
          title,
          description,
          page_type: language === "kn" ? "ಮಾರ್ಗದರ್ಶನ" : "Guidance",
          footnote,
          item_type: "remedies",
          image: metadata.image || "",
          url: `/library/remedies#${id}`,
          enabled: true,
        });
      } catch {}
    }
  }

  // 2. Sevas
  const sevasDir = path.join(rootDir, "library", "sevas");
  if (existsSync(sevasDir)) {
    let files = [];
    try {
      files = readdirSync(sevasDir).filter((file) => file.endsWith(".md")).sort();
    } catch {}
    for (const file of files) {
      try {
        const raw = readFileSync(path.join(sevasDir, file), "utf8");
        const { metadata } = parseMarkdownFrontmatter(raw, `library/sevas/${file}`);
        if (!metadata || metadata.enabled === false) continue;
        const id = metadata.id || file.slice(0, -3);
        const title = metadata.title?.[language] ?? metadata.title?.[defaultLanguage] ?? (typeof metadata.title === "string" ? metadata.title : id);
        const description = metadata.description?.[language] ?? metadata.description?.[defaultLanguage] ?? metadata.summary?.[language] ?? "";
        const category = metadata.category?.[language] ?? metadata.category?.[defaultLanguage] ?? (language === "kn" ? "ಸೇವೆ" : "Seva");
        const amount = metadata.formatted_amount?.[language] ?? metadata.formatted_amount?.[defaultLanguage] ?? (metadata.amount ? `₹${metadata.amount}` : "");
        candidates.push({
          id: `seva--${id}`,
          file: `sevas/${file}`,
          key: file,
          title,
          description,
          page_type: category,
          footnote: amount,
          item_type: "seva",
          image: metadata.image || "",
          url: `/sevas#${id}`,
          enabled: true,
        });
      } catch {}
    }
  }
  return candidates;
}

export function resolveCandidateList(key, config, candidates, defaultCount = 6) {
  const count = config?.count ?? defaultCount;
  const slots = new Array(count).fill(null);
  const today = new Date().toISOString().slice(0, 10);
  const byKey = new Map();
  for (const c of candidates) {
    byKey.set(c.id, c);
    if (c.file) byKey.set(c.file, c);
    if (c.key) {
      byKey.set(c.key, c);
      if (c.key.endsWith(".md")) byKey.set(c.key.slice(0, -3), c);
    }
  }

  // 1. Calendar overrides
  let activeOverride = null;
  if (Array.isArray(config?.overrides)) {
    for (const ov of config.overrides) {
      if (!ov || typeof ov !== "object") continue;
      const { date, startsOn, endsOn } = ov;
      if (date && date === today) { activeOverride = ov; break; }
      if (startsOn && endsOn && today >= startsOn && today <= endsOn) { activeOverride = ov; break; }
      if (startsOn && !endsOn && today >= startsOn) { activeOverride = ov; break; }
    }
  }

  // 2. Pinned items
  const pinnedList = [];
  if (activeOverride && Array.isArray(activeOverride.pinned)) pinnedList.push(...activeOverride.pinned);
  if (Array.isArray(config?.pinned)) pinnedList.push(...config.pinned);

  const seenIds = new Set();
  for (const entry of pinnedList) {
    let itemKey;
    let targetIndex = null;
    if (typeof entry === "string") {
      itemKey = entry;
    } else if (entry && typeof entry === "object") {
      itemKey = entry.item || entry.page || entry.file || entry.id;
      if (Number.isSafeInteger(entry.index) && entry.index >= 0 && entry.index < count) {
        targetIndex = entry.index;
      }
    }
    const matched = byKey.get(itemKey);
    if (!matched || seenIds.has(matched.id)) continue;
    if (targetIndex !== null && slots[targetIndex] === null) {
      slots[targetIndex] = matched;
      seenIds.add(matched.id);
    } else if (targetIndex === null) {
      const freeIdx = slots.indexOf(null);
      if (freeIdx !== -1) {
        slots[freeIdx] = matched;
        seenIds.add(matched.id);
      }
    }
  }

  // 3. Pool backfill
  let pool = candidates.filter((c) => !seenIds.has(c.id));
  if (Array.isArray(config?.pool) && config.pool.length > 0) {
    const configuredSet = new Set(config.pool);
    const filtered = pool.filter((c) => configuredSet.has(c.id) || configuredSet.has(c.file) || configuredSet.has(c.key));
    if (filtered.length > 0) pool = filtered;
  }

  const emptyIndices = [];
  for (let i = 0; i < count; i++) {
    if (slots[i] === null) emptyIndices.push(i);
  }

  if (emptyIndices.length > 0 && pool.length > 0) {
    const needed = Math.min(emptyIndices.length, pool.length);
    const rng = createSeededRandom(`${today}-${key}`);
    const enabledPool = pool.filter((c) => c.enabled === true);
    const disabledPool = pool.filter((c) => c.enabled !== true);
    const drawFromEnabled = Math.min(needed, enabledPool.length);
    const selectedFromEnabled = drawFromEnabled > 0
      ? sampleBalanced(enabledPool, drawFromEnabled, rng, (item) => item.item_type || "default")
      : [];
    const remainingNeeded = needed - selectedFromEnabled.length;
    const selectedFromDisabled = remainingNeeded > 0
      ? sampleBalanced(disabledPool, remainingNeeded, rng, (item) => item.item_type || "default")
      : [];
    const selected = [...selectedFromEnabled, ...selectedFromDisabled];
    for (let i = 0; i < selected.length; i++) {
      slots[emptyIndices[i]] = selected[i];
    }
  }

  return slots.filter(Boolean);
}

export function resolveHomeCarousels(rootDir, settings, language, defaultLanguage) {
  const pages = loadPageReferences(rootDir, defaultLanguage);
  function resolveList(key, defaultExpectedCount, excludeFiles = new Set()) {
    const raw = settings[key];
    const expectedCount = (raw && typeof raw === "object" && !Array.isArray(raw) && Number.isSafeInteger(raw.count))
      ? raw.count
      : defaultExpectedCount;
    let list;
    if (Array.isArray(raw)) {
      list = raw;
    } else if (raw && typeof raw === "object") {
      list = resolveDynamicList(key, raw, expectedCount, pages, excludeFiles);
    } else {
      fail(`settings/home.json.${key}`, expectedCount ? `expected exactly ${expectedCount} page references` : "expected page references");
    }
    if (!Array.isArray(list) || !list.length || (expectedCount && list.length !== expectedCount)) {
      fail(`settings/home.json.${key}`, expectedCount ? `expected exactly ${expectedCount} page references` : "expected page references");
    }
    const seen = new Set();
    return list.map((entry) => {
      const file = key === "icon_carousel" ? entry?.page : entry;
      if (typeof file !== "string") fail(`settings/home.json.${key}`, "expected a Markdown page filename");
      assertSafeSourceFile(file);
      if (!pages.has(file)) fail(`settings/home.json.${key}`, `unknown page reference ${file}`);
      if (seen.has(file)) fail(`settings/home.json.${key}`, `duplicate page reference ${file}`);
      seen.add(file);
      const card = localizedCard(pages.get(file), language, defaultLanguage);
      if (key !== "icon_carousel") return card;
      if (!object(entry) || Object.keys(entry).some((field) => !["page", "icon", "tone"].includes(field)) ||
          !iconNames.has(entry.icon) || !tones.has(entry.tone)) {
        fail(`settings/home.json.${key}`, "expected a known icon and tone for each page");
      }
      return { ...card, icon: entry.icon, tone: entry.tone };
    });
  }
  const globalFilter = new Set(Array.isArray(settings.filter) ? settings.filter : []);
  const top = resolveList("top_carousel", 6, new Set(globalFilter));
  const topFiles = new Set([...top.map(({ id }) => `${id}.md`), ...globalFilter]);
  const bottom = resolveList("bottom_carousel", 6, topFiles);
  const topIds = new Set(top.map(({ id }) => id));
  if (bottom.some(({ id }) => topIds.has(id))) fail("settings/home.json.bottom_carousel", "must reference six different pages from top_carousel");

  // Dynamic Explore Carousel (all eligible library items across collections, including Bhakti)
  let explore;
  const rawExplore = settings.explore_carousel;
  if (Array.isArray(rawExplore) && rawExplore.length > 0 && typeof rawExplore[0] === "string" && pages.has(rawExplore[0])) {
    explore = resolveList("explore_carousel");
  } else {
    const exploreCandidates = loadAllLibraryCandidates(rootDir, language, defaultLanguage, pages);
    const targetCount = (rawExplore && typeof rawExplore === "object" && Number.isSafeInteger(rawExplore.count)) ? rawExplore.count : 6;
    explore = resolveCandidateList("explore_carousel", rawExplore, exploreCandidates, targetCount);
  }

  // Dynamic Guidance Carousel (Sevas & Remedies, supporting pinning and overrides)
  const guidanceConfig = settings.guidance_carousel;
  const guidanceCandidates = loadAllGuidanceCandidates(rootDir, language, defaultLanguage);
  const targetGuidanceCount = (typeof guidanceConfig === "object" && Number.isSafeInteger(guidanceConfig.count))
    ? guidanceConfig.count
    : 6;
  const guidance = resolveCandidateList("guidance_carousel", guidanceConfig, guidanceCandidates, targetGuidanceCount);

  return {
    top_carousel: top,
    icon_carousel: resolveList("icon_carousel"),
    bottom_carousel: bottom,
    explore_carousel: explore,
    guidance_carousel: guidance,
  };
}
