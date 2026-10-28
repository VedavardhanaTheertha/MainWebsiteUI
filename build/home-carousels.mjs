import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import { assertSafeSourceFile, parseMarkdownFrontmatter } from "./content-utils.mjs";
import { librarySections } from "./library-sections.config.mjs";

const selectionCache = new Map();
const textFields = ["title", "description", "page_type", "footnote"];
const iconNames = new Set(["calendar", "hand-heart", "sparkles", "book-open", "video", "home", "users"]);
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
      if (!["kind", ...textFields, "image", "url"].includes(key)) fail(source, `unknown field ${key}`);
    }
    for (const field of textFields) languageMap(metadata[field], `${source}.${field}`, defaultLanguage, field === "footnote");
    safeLocation(metadata.image, `${source}.image`, true);
    safeLocation(metadata.url, `${source}.url`);
    if (urls.has(metadata.url)) fail(source, `duplicate page URL ${metadata.url}`);
    urls.add(metadata.url);
    pages.set(file, { ...metadata, id: file.slice(0, -3) });
  }
  return pages;
}

function localizedCard(record, language, defaultLanguage) {
  return {
    id: record.id,
    ...Object.fromEntries(textFields.map((field) => [field, record[field][language] ?? record[field][defaultLanguage]])),
    image: record.image,
    url: record.url,
  };
}

export function sampleUnique(items, count, draw = randomInt) {
  if (!Number.isSafeInteger(count) || count < 1 || items.length < count) {
    fail("remidies_carousel", `requires at least ${count} distinct remedy articles`);
  }
  const shuffled = [...items];
  for (let i = 0; i < count; i++) {
    const offset = draw(shuffled.length - i);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset >= shuffled.length - i) {
      fail("remidies_carousel", "random selection returned an invalid index");
    }
    const j = i + offset;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
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
    languageMap(metadata.status, `${source}.status`, defaultLanguage);
    safeLocation(metadata.image, `${source}.image`, true);
    return localizedCard({
      id: metadata.id, title: metadata.title, description: metadata.summary,
      page_type: collection.title, footnote: metadata.status,
      image: metadata.image, url: `${section.route}/${metadata.id}`,
    }, language, defaultLanguage);
  });
}

export function resolveHomeCarousels(rootDir, settings, language, defaultLanguage) {
  const pages = loadPageReferences(rootDir, defaultLanguage);
  function resolveList(key, expectedCount) {
    const list = settings[key];
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
  const top = resolveList("top_carousel", 6);
  const bottom = resolveList("bottom_carousel", 6);
  const topIds = new Set(top.map(({ id }) => id));
  if (bottom.some(({ id }) => topIds.has(id))) fail("settings/home.json.bottom_carousel", "must reference six different pages from top_carousel");
  const candidates = loadRemedyCarouselCandidates(rootDir, language, defaultLanguage, pages);
  const signature = candidates.map(({ id }) => id).join("\0");
  let selection = selectionCache.get(rootDir);
  if (!selection || selection.signature !== signature) {
    selection = { signature, ids: sampleUnique(candidates, 3).map(({ id }) => id) };
    selectionCache.set(rootDir, selection);
  }
  const byId = new Map(candidates.map((card) => [card.id, card]));
  return {
    top_carousel: top,
    icon_carousel: resolveList("icon_carousel"),
    bottom_carousel: bottom,
    explore_carousel: resolveList("explore_carousel"),
    remidies_carousel: selection.ids.map((id) => byId.get(id)),
  };
}
