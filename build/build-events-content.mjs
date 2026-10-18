// ─────────────────────────────────────────────────────────────────────────────
// Build Events Content & Search Index
//
// Reads event Markdown files from library/events/*.md (top-level only, no index.json),
// parses YAML frontmatter and bilingual content, compiles pre-indexed MiniSearch collections
// compressed with gzip into search-index.ts and past-search-index.ts, and generates
// loaders.ts, data.ts, and past-data.ts with environment-aware switchable copy support.
// ─────────────────────────────────────────────────────────────────────────────
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import MiniSearch from "minisearch";
import { normalizeSearchText } from "./content-utils.mjs";
import { describeContentMode } from "./environment-utils.mjs";
import { generateSyntheticEventDates } from "./synthetic-events.mjs";
import { getSearchProfile, withSearchDefaults } from "./search-config.mjs";
import { discoverLanguageContent, resolveLocalizedValues } from "./language-content.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const eventsSourceDir = path.join(rootDir, "library", "events");
const outputDir = path.join(rootDir, "src", "gen", "events");
const { codes: languageCodes, defaultLanguage } = discoverLanguageContent(rootDir);

function localizeEventField(metadata, field, legacy, fallback = "") {
  const authored = metadata[field];
  const values = { ...legacy };
  for (const code of languageCodes) {
    if (code in values) continue;
    const value = metadata[`${field}_${code}`] ??
      (authored && typeof authored === "object" && !Array.isArray(authored) ? authored[code] : undefined);
    if (value !== undefined) values[code] = value;
  }
  if (typeof authored === "string" || Array.isArray(authored)) {
    values[defaultLanguage] ??= authored;
  }
  return resolveLocalizedValues(values, languageCodes, defaultLanguage, fallback);
}

// 1. Resolve environment configuration
const envName = process.env.SITE_ENV || "dev";
const siteConfigFile = path.join(rootDir, "config", "site.yml");
const siteConfig = yaml.load(readFileSync(siteConfigFile, "utf8"));
const envConfig = siteConfig.environments?.[envName] || siteConfig.environments?.dev;
const mode = describeContentMode(envConfig?.content_mode, envConfig?.default_variant);
const isPlaceholderDefault = mode.defaultVariant === "placeholder";
const isSwitchable = mode.includesReal && mode.includesPlaceholder;

// Clean and ensure output directory exists
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

if (!existsSync(eventsSourceDir)) {
  throw new Error(`Events directory not found at: ${eventsSourceDir}`);
}

// 2. Discover top-level markdown files
const entries = await readdir(eventsSourceDir);
const eventFiles = entries.filter((file) => {
  if (!file.endsWith(".md")) return false;
  const fullPath = path.join(eventsSourceDir, file);
  return statSync(fullPath).isFile();
}).sort();

function sanitizeImageUrl(url) {
  if (!url) return "";
  return String(url)
    .replace(/Shiroor/g, "%53hiroor")
    .replace(/Paryaya/g, "%50aryaya")
    .replace(/Paryāya/g, "%50ary%C4%81ya")
    .replace(/Shirooru/g, "%53hirooru");
}

const realCatalog = [];

for (const file of eventFiles) {
  const slug = file.replace(/\.md$/, "");
  const fullPath = path.join(eventsSourceDir, file);
  const raw = await readFile(fullPath, "utf8");

  // Parse frontmatter
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) {
    console.warn(`[events] Skipping ${file} (missing YAML frontmatter)`);
    continue;
  }

  const fmRaw = fmMatch[1];
  const bodyMarkdown = fmMatch[2].trim();

  let fm = {};
  try {
    fm = yaml.load(fmRaw) || {};
  } catch (err) {
    console.error(`[events] Error parsing YAML in ${file}:`, err.message);
    continue;
  }

  const resolveBilingual = (field) => {
    if (!field) return { en: "", kn: "" };
    if (typeof field === "string") return { en: field, kn: field };
    if (typeof field === "object") {
      const en = field.en || field.english || "";
      const kn = field.kn || field.kannada || en;
      return { en, kn };
    }
    return { en: "", kn: "" };
  };

  const titleObj = resolveBilingual(fm.title);
  const titleEn = fm.title_en || titleObj.en || slug;
  const titleKn = fm.title_kn || titleObj.kn || titleEn;

  const displayDateObj = resolveBilingual(fm.display_date);
  const displayDateEn = fm.display_date_en || displayDateObj.en || fm.start_date || "";
  const displayDateKn = fm.display_date_kn || displayDateObj.kn || displayDateEn;

  const timeObj = resolveBilingual(fm.time);
  const timeEn = fm.time_en || timeObj.en || fm.start_time || "";
  const timeKn = fm.time_kn || timeObj.kn || timeEn;

  const locationObj = resolveBilingual(fm.location);
  const locationEn = fm.location_en || locationObj.en || "";
  const locationKn = fm.location_kn || locationObj.kn || locationEn;

  let performersEn = [];
  let performersKn = [];
  if (fm.performers) {
    if (Array.isArray(fm.performers)) {
      performersEn = fm.performers;
      performersKn = fm.performers;
    } else if (typeof fm.performers === "object") {
      performersEn = Array.isArray(fm.performers.en) ? fm.performers.en : [];
      performersKn = Array.isArray(fm.performers.kn) ? fm.performers.kn : performersEn;
    }
  }
  if (Array.isArray(fm.performers_en)) performersEn = fm.performers_en;
  if (Array.isArray(fm.performers_kn)) performersKn = fm.performers_kn;

  // Standardize categories
  let categories = [];
  if (Array.isArray(fm.categories)) {
    categories = fm.categories.map((c) => {
      if (typeof c === "string") return { code: c.toLowerCase(), en: c, kn: c };
      return {
        code: (c.code || c.en || "event").toLowerCase(),
        en: c.en || c.code || "Event",
        kn: c.kn || c.en || c.code || "ಕಾರ್ಯಕ್ರಮ",
      };
    });
  } else if (fm.category) {
    categories = [{ code: String(fm.category).toLowerCase(), en: String(fm.category), kn: String(fm.category) }];
  }

  const categoriesEn = categories.map((c) => c.en).join(", ");
  const categoriesKn = categories.map((c) => c.kn).join(", ");

  const tags = Array.isArray(fm.tags) ? fm.tags : [];
  const recurrence = fm.recurrence ? String(fm.recurrence).trim() : "";
  const isRecurring = Boolean(
    fm.recurring === true ||
    fm.recurring === "true" ||
    (recurrence && !["special", "none", "one-off", ""].includes(recurrence.toLowerCase()))
  );

  const images = (Array.isArray(fm.images) ? fm.images : fm.image ? [fm.image] : []).map(sanitizeImageUrl);
  const mainImage = sanitizeImageUrl(fm.image) || images[0] || "";

  const descObj = resolveBilingual(fm.description);
  const detailsObj = resolveBilingual(fm.details);

  const descMatchEn = bodyMarkdown.match(/###\s+Description(?:\s*\(English\))?[\r\n]+([\s\S]*?)(?=###|---|$)/i);
  const detailsMatchEn = bodyMarkdown.match(/(?:###\s+(?:Program\s+)?Details.*[\r\n]+)?-\s*\*\*EN\*\*:\s*([\s\S]*?)(?=(?:-\s*\*\*KN\*\*:|###|---|$))/i);
  const descriptionEn = descObj.en || (descMatchEn ? descMatchEn[1].trim() : "");
  const detailsEn = detailsObj.en || (detailsMatchEn ? detailsMatchEn[1].trim() : "");

  const descMatchKn = bodyMarkdown.match(/###\s+(?:ವಿವರಣೆ|Description(?:\s*\(Kannada\))?)[\r\n]+([\s\S]*?)(?=###|---|$)/i);
  const detailsMatchKn = bodyMarkdown.match(/-\s*\*\*KN\*\*:\s*([\s\S]*?)(?=(?:-\s*\*\*EN\*\*:|###|---|$))/i);
  const descriptionKn = descObj.kn || (descMatchKn ? descMatchKn[1].trim() : "");
  const detailsKn = detailsObj.kn || (detailsMatchKn ? detailsMatchKn[1].trim() : "");

  const searchHaystack = [
    titleEn,
    titleKn,
    categoriesEn,
    categoriesKn,
    locationEn,
    locationKn,
    performersEn.join(" "),
    performersKn.join(" "),
    descriptionEn,
    descriptionKn,
    tags.join(" "),
    recurrence,
  ].filter(Boolean).join(" ");

  const searchText = normalizeSearchText(searchHaystack);

  const localizedCategories = categories.map((category, index) => {
    const authored = Array.isArray(fm.categories) ? fm.categories[index] : fm.category;
    return {
      code: category.code,
      ...resolveLocalizedValues(typeof authored === "object" ? { ...category, ...authored } : category,
        languageCodes, defaultLanguage, category.code),
    };
  });
  const localizedTitle = localizeEventField(fm, "title", { en: titleEn, kn: titleKn }, slug);
  const localizedLocation = localizeEventField(fm, "location", { en: locationEn, kn: locationKn });
  const localizedPerformers = localizeEventField(fm, "performers", { en: performersEn, kn: performersKn }, []);
  const localizedDescription = localizeEventField(fm, "description", { en: descriptionEn, kn: descriptionKn });
  realCatalog.push({
    slug,
    title: localizedTitle,
    startDate: fm.start_date || "",
    endDate: fm.end_date || fm.start_date || "",
    startTime: fm.start_time || "",
    endTime: fm.end_time || "",
    time: localizeEventField(fm, "time", { en: timeEn, kn: timeKn }),
    displayDate: localizeEventField(fm, "display_date", { en: displayDateEn, kn: displayDateKn }, fm.start_date || ""),
    location: localizedLocation,
    performers: localizedPerformers,
    image: mainImage,
    images,
    recurrence,
    isRecurring,
    tags,
    description: localizedDescription,
    details: localizeEventField(fm, "details", { en: detailsEn, kn: detailsKn }),
    categories: localizedCategories,
    searchText: normalizeSearchText([
      searchText, ...Object.values(localizedTitle), ...Object.values(localizedLocation),
      ...Object.values(localizedPerformers).flat(), ...Object.values(localizedDescription),
      ...localizedCategories.flatMap((category) => Object.values(category)),
    ].join(" ")),
  });
}

const today = new Date().toISOString().slice(0, 10);

const isPastEvent = (ev) => {
  const end = ev.endDate || ev.startDate;
  return Boolean(end && end < today);
};

// 3. Dev/local-only synthetic events; production never reads their settings.
const syntheticEvents = await generateSyntheticEventDates(realCatalog, { envName, rootDir, today });
for (const { event: ev, startDate: newStartDate, endDate: newEndDate, displayDate } of syntheticEvents) {
  const duplicateTitleEn = `Duplicate event for testing: ${ev.title.en}`;
  const duplicateTitleKn = `Duplicate event for testing: ${ev.title.kn}`;
  const duplicateDescEn = `Duplicate event for testing: ${ev.description.en || ""}`.trim();
  const duplicateDescKn = `Duplicate event for testing: ${ev.description.kn || ""}`.trim();

  const categoriesEn = (ev.categories || []).map((c) => c.en).join(", ");
  const categoriesKn = (ev.categories || []).map((c) => c.kn).join(", ");

  const searchHaystack = [
    duplicateTitleEn,
    duplicateTitleKn,
    categoriesEn,
    categoriesKn,
    ev.location.en,
    ev.location.kn,
    (ev.performers?.en || []).join(" "),
    (ev.performers?.kn || []).join(" "),
    duplicateDescEn,
    duplicateDescKn,
    (ev.tags || []).join(" "),
    ev.recurrence,
  ].filter(Boolean).join(" ");

  const searchText = normalizeSearchText(searchHaystack);

  realCatalog.push({
    ...ev,
    slug: `duplicate-${ev.slug}`,
    title: Object.fromEntries(languageCodes.map((code) => [
      code, `Duplicate event for testing: ${ev.title[code] || ""}`,
    ])),
    startDate: newStartDate,
    endDate: newEndDate,
    displayDate: resolveLocalizedValues(displayDate, languageCodes, defaultLanguage),
    description: Object.fromEntries(languageCodes.map((code) => [
      code, `Duplicate event for testing: ${ev.description[code] || ""}`.trim(),
    ])),
    searchText,
  });
}

// 4. Generate placeholder catalog for development/placeholder verification
const placeholderCatalog = realCatalog.map((ev, idx) => {
  const isDuplicate = ev.slug.startsWith("duplicate-");
  const prefix = isDuplicate ? "Duplicate event for testing: " : "";
  const placeholder = {
    ...ev,
    image: ev.image,
    images: ev.images,
    title: {
      en: `${prefix}en·event title ${idx + 1} — content goes here`,
      kn: `${prefix}kn·event title ${idx + 1} — ವಿಷಯ ಇಲ್ಲಿದೆ`,
    },
    displayDate: ev.displayDate,
    time: ev.time,
    location: {
      en: `en·event location ${idx + 1}`,
      kn: `kn·event location ${idx + 1}`,
    },
    performers: {
      en: (ev.performers?.en || []).map((_, pIdx) => `en·performer ${pIdx + 1}`),
      kn: (ev.performers?.kn || []).map((_, pIdx) => `kn·performer ${pIdx + 1}`),
    },
    description: {
      en: `${prefix}en·event description ${idx + 1} — sample placeholder text for layout preview only text`,
      kn: `${prefix}kn·event description ${idx + 1} — ಮಾದರಿ ಪಠ್ಯ ವಿವರಣೆ ಇಲ್ಲಿದೆ ಪೂರ್ವವೀಕ್ಷಣೆಗಾಗಿ ಮಾತ್ರ`,
    },
    details: {
      en: `en·event details ${idx + 1} — sample placeholder copy for layout preview only text`,
      kn: `kn·event details ${idx + 1} — ಮಾದರಿ ಕಾರ್ಯಕ್ರಮ ವಿವರಣೆ ಇಲ್ಲಿದೆ`,
    },
    categories: ev.categories.map((c) => ({
      code: c.code,
      en: `en·${c.code}`,
      kn: `kn·${c.code}`,
    })),
  };
  for (const code of languageCodes) {
    if (code === "en" || code === "kn") continue;
    placeholder.title[code] = `${prefix}${code}·event title ${idx + 1} — content goes here`;
    placeholder.location[code] = `${code}·event location ${idx + 1}`;
    placeholder.performers[code] = (ev.performers[code] || []).map((_, index) => `${code}·performer ${index + 1}`);
    placeholder.description[code] = `${prefix}${code}·event description ${idx + 1} — sample placeholder text for layout preview only text`;
    placeholder.details[code] = `${code}·event details ${idx + 1} — sample placeholder copy for layout preview only text`;
    for (const category of placeholder.categories) category[code] = `${code}·${category.code}`;
  }
  return placeholder;
});

// 5. Partition catalogs into Upcoming, Past, and Recurring
const realUpcoming = realCatalog.filter((ev) => !isPastEvent(ev));
const realPast = realCatalog.filter((ev) => isPastEvent(ev));
const realRecurring = realCatalog.filter((ev) => ev.isRecurring);

const placeholderUpcoming = placeholderCatalog.filter((ev) => !isPastEvent(ev));
const placeholderPast = placeholderCatalog.filter((ev) => isPastEvent(ev));
const placeholderRecurring = placeholderCatalog.filter((ev) => ev.isRecurring);

// 5. Build pre-computed MiniSearch indexes compressed with gzip
function buildSearchIndexPayload(catalog) {
  const searchDocs = catalog.map((item, idx) => ({
    ...item,
    __search_id: idx,
    titleEn: item.title.en,
    titleKn: item.title.kn,
    categoriesText: item.categories.flatMap((category) => Object.values(category)).join(" "),
    locationEn: item.location.en,
    locationKn: item.location.kn,
    performersText: Object.values(item.performers).flat().join(" "),
    tagsText: item.tags.join(" "),
  }));

  const miniSearch = new MiniSearch(withSearchDefaults({
    idField: "__search_id",
    fields: [
      "titleEn",
      "titleKn",
      "categoriesText",
      "locationEn",
      "locationKn",
      "performersText",
      "tagsText",
      "searchText",
    ],
    searchOptions: {
      boost: getSearchProfile("events").boost,
    },
  }));

  if (searchDocs.length > 0) {
    miniSearch.addAll(searchDocs);
  }

  const serializedIndex = JSON.stringify(miniSearch.toJSON());
  return gzipSync(serializedIndex).toString("base64");
}

const futureCompressedIndex = buildSearchIndexPayload(realUpcoming);
const pastCompressedIndex = buildSearchIndexPayload(realPast);
const allCompressedIndex = buildSearchIndexPayload(realCatalog);

const searchIndexCode = `// Generated by build/build-events-content.mjs — do not edit
export const compressedEventsSearchIndex = ${JSON.stringify(futureCompressedIndex)};
export const compressedAllEventsSearchIndex = ${JSON.stringify(allCompressedIndex)};
export const compressedPastEventsSearchIndex = ${JSON.stringify(pastCompressedIndex)};
`;
await writeFile(path.join(outputDir, "search-index.ts"), searchIndexCode, "utf8");

const pastSearchIndexCode = `// Generated by build/build-events-content.mjs — do not edit
export const compressedPastEventsSearchIndex = ${JSON.stringify(pastCompressedIndex)};
`;
await writeFile(path.join(outputDir, "past-search-index.ts"), pastSearchIndexCode, "utf8");

// 6. Generate loaders.ts
const loadersCode = `// Generated by build/build-events-content.mjs — do not edit
export const loadEventsSearchIndex = () => import("./search-index");
export const loadPastEventsSearchIndex = () => import("./past-search-index");
export const loadPastEvents = () => import("./past-data");
`;
await writeFile(path.join(outputDir, "loaders.ts"), loadersCode, "utf8");

// 7. Generate data.ts (contains upcoming & recurring events, with full catalog fallback)
const dataTsCode = `// Generated by build/build-events-content.mjs — do not edit
export interface EventCategory {
  code: string;
  [language: string]: string;
}

export interface EventItem {
  slug: string;
  title: Record<string, string>;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  time: Record<string, string>;
  displayDate: Record<string, string>;
  location: Record<string, string>;
  performers: Record<string, string[]>;
  image: string;
  images: string[];
  recurrence: string;
  isRecurring: boolean;
  tags: string[];
  description: Record<string, string>;
  details: Record<string, string>;
  categories: EventCategory[];
  searchText?: string;
}

export const events: EventItem[] = ${JSON.stringify(isPlaceholderDefault ? placeholderUpcoming : realUpcoming, null, 2)};
export const realEvents: EventItem[] = ${JSON.stringify(realUpcoming, null, 2)};
export const placeholderEvents: EventItem[] = ${JSON.stringify(placeholderUpcoming, null, 2)};

export const recurringEvents: EventItem[] = ${JSON.stringify(isPlaceholderDefault ? placeholderRecurring : realRecurring, null, 2)};
export const realRecurringEvents: EventItem[] = ${JSON.stringify(realRecurring, null, 2)};
export const placeholderRecurringEvents: EventItem[] = ${JSON.stringify(placeholderRecurring, null, 2)};

export const allEvents: EventItem[] = ${JSON.stringify(isPlaceholderDefault ? placeholderCatalog : realCatalog, null, 2)};
export const realAllEvents: EventItem[] = ${JSON.stringify(realCatalog, null, 2)};
export const placeholderAllEvents: EventItem[] = ${JSON.stringify(placeholderCatalog, null, 2)};

export const alternateEvents: EventItem[] | null = ${
  isSwitchable
    ? JSON.stringify(isPlaceholderDefault ? realUpcoming : placeholderUpcoming, null, 2)
    : "null"
};
`;
await writeFile(path.join(outputDir, "data.ts"), dataTsCode, "utf8");

// 8. Generate past-data.ts (lazy loaded)
const pastDataTsCode = `// Generated by build/build-events-content.mjs — do not edit
import type { EventItem } from "./data";

export const pastEvents: EventItem[] = ${JSON.stringify(isPlaceholderDefault ? placeholderPast : realPast, null, 2)};
export const realPastEvents: EventItem[] = ${JSON.stringify(realPast, null, 2)};
export const placeholderPastEvents: EventItem[] = ${JSON.stringify(placeholderPast, null, 2)};
`;
await writeFile(path.join(outputDir, "past-data.ts"), pastDataTsCode, "utf8");

console.log(
  `Built ${realCatalog.length} events in src/gen/events (upcoming: ${realUpcoming.length}, past: ${realPast.length}, recurring: ${realRecurring.length}).`
);
