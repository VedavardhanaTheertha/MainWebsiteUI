import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import MiniSearch from "minisearch";
import { parseMarkdownFrontmatter } from "./content-utils.mjs";
import { renderMarkdown } from "./markdown.mjs";
import { withSearchDefaults } from "./search-config.mjs";
import { describeContentMode } from "./environment-utils.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(projectRoot, "library", "sevas");
const outputDir = path.join(projectRoot, "src", "gen", "sevas");

// Resolve environment configuration
const envName = process.env.SITE_ENV || "dev";
const siteConfigFile = path.join(projectRoot, "config", "site.yml");
const siteConfig = yaml.load(readFileSync(siteConfigFile, "utf8"));
const envConfig = siteConfig.environments?.[envName] || siteConfig.environments?.dev;
const mode = describeContentMode(envConfig?.content_mode, envConfig?.default_variant);
const isPlaceholderDefault = mode.defaultVariant === "placeholder";
const isSwitchable = mode.includesReal && mode.includesPlaceholder;

const defaultFeaturedIds = [
  "seva-001-kanike",
  "seva-003-donations",
  "seva-000-volunteer-sign-up",
];

function requireString(value, field, sourceName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${sourceName} must define a non-empty ${field}.`);
  }
  return value.trim();
}

function requireLocalizedText(value, field, sourceName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${sourceName} must define ${field} as an object.`);
  }
  return {
    en: requireString(value.en, `${field}.en`, sourceName),
    kn: requireString(value.kn, `${field}.kn`, sourceName),
  };
}

function requireUrl(value, field, sourceName) {
  const url = requireString(value, field, sourceName);
  if (url.startsWith("/")) return url;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${sourceName} ${field} must be an absolute HTTPS URL or a root-relative path.`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${sourceName} ${field} must use HTTPS.`);
  }
  return url;
}

function extractLocalizedDetails(body, sourceName) {
  const english = body.match(
    /(### Seva Guidelines & Offerings \(English\)\s*\r?\n[\s\S]*?)(?=\r?\n### ಸೇವಾ ನಿಯಮಗಳು ಮತ್ತು ಸಮರ್ಪಣೆ \(ಕನ್ನಡ\))/u,
  )?.[1]?.trim();
  const kannada = body.match(
    /(### ಸೇವಾ ನಿಯಮಗಳು ಮತ್ತು ಸಮರ್ಪಣೆ \(ಕನ್ನಡ\)\s*\r?\n[\s\S]*?)(?=\r?\n---|\r?\n### Direct Booking|$)/u,
  )?.[1]?.trim();
  if (!english || !kannada) {
    throw new Error(
      `${sourceName} must contain separate English and Kannada Seva Guidelines sections.`,
    );
  }
  return {
    en: renderMarkdown(english.replace(" (English)", "")),
    kn: renderMarkdown(kannada.replace(" (ಕನ್ನಡ)", "")),
  };
}

function parseSeva(metadata, body, sourceName) {
  const amount = Number(metadata.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${sourceName} amount must be a non-negative number.`);
  }

  const category = metadata.category;
  if (!category || typeof category !== "object" || Array.isArray(category)) {
    throw new Error(`${sourceName} must define category as an object.`);
  }

  const contact = metadata.contact ?? {};
  const record = {
    id: requireString(metadata.id, "id", sourceName),
    code: Number(metadata.code),
    title: requireLocalizedText(metadata.title ?? metadata.name, "title", sourceName),
    category: {
      code: requireString(category.code, "category.code", sourceName),
      en: requireString(category.en, "category.en", sourceName),
      kn: requireString(category.kn, "category.kn", sourceName),
    },
    deity: requireLocalizedText(metadata.deity, "deity", sourceName),
    sannidhi: requireLocalizedText(metadata.sannidhi, "sannidhi", sourceName),
    location: requireLocalizedText(metadata.location, "location", sourceName),
    amount,
    currency: requireString(metadata.currency ?? "INR", "currency", sourceName),
    formattedAmount: metadata.formatted_amount
      ? requireLocalizedText(metadata.formatted_amount, "formatted_amount", sourceName)
      : { en: "", kn: "" },
    description: requireLocalizedText(metadata.description, "description", sourceName),
    significance: requireLocalizedText(metadata.significance, "significance", sourceName),
    bookingUrl: requireUrl(metadata.booking_url, "booking_url", sourceName),
    contact: {
      phone: typeof contact.phone === "string" ? contact.phone.trim() : "",
      email: typeof contact.email === "string" ? contact.email.trim() : "",
    },
    detailsHtml: extractLocalizedDetails(body, sourceName),
    searchText: "",
  };

  if (!Number.isInteger(record.code) || record.code < 0) {
    throw new Error(`${sourceName} code must be a non-negative integer.`);
  }

  record.searchText = [
    record.title.en,
    record.title.kn,
    record.category.en,
    record.category.kn,
    record.deity.en,
    record.deity.kn,
    record.sannidhi.en,
    record.sannidhi.kn,
    record.location.en,
    record.location.kn,
    record.description.en,
    record.description.kn,
    record.significance.en,
    record.significance.kn,
    body,
  ].join(" ");

  return record;
}

function placeholderSeva(seva, index) {
  const localized = (field) => ({
    en: `en·sevas ${field} ${index + 1} — content goes here`,
    kn: `kn·sevas ${field} ${index + 1} — content goes here`,
  });
  const placeholder = {
    ...seva,
    title: localized("title"),
    category: { ...localized("category"), code: seva.category.code },
    deity: localized("deity"),
    sannidhi: localized("sannidhi"),
    location: localized("location"),
    formattedAmount: seva.amount > 0 ? localized("amount") : { en: "", kn: "" },
    description: localized("description"),
    significance: localized("significance"),
    bookingUrl: `https://example.invalid/sevas/${index + 1}`,
    contact: {
      phone: seva.contact.phone,
      email: seva.contact.email ? "support@example.invalid" : "",
    },
    detailsHtml: {
      en: `<p>en·sevas details ${index + 1} — content goes here</p>`,
      kn: `<p>kn·sevas details ${index + 1} — content goes here</p>`,
    },
    searchText: "",
  };
  placeholder.searchText = [
    ...Object.values(placeholder.title),
    ...Object.values(placeholder.category).filter((value) => value !== placeholder.category.code),
    ...Object.values(placeholder.deity),
    ...Object.values(placeholder.sannidhi),
    ...Object.values(placeholder.location),
    ...Object.values(placeholder.description),
    ...Object.values(placeholder.significance),
    `dev sevas details ${index + 1} content goes here`,
  ].join(" ");
  return placeholder;
}

async function loadFeaturedIds(sevaIds) {
  const environmentName = process.env.SITE_ENV === "local"
    ? "dev"
    : (process.env.SITE_ENV || "dev");
  const settingsFile = path.join(projectRoot, "settings", environmentName, "topsevas.json");

  try {
    await access(settingsFile);
  } catch (error) {
    if (error?.code === "ENOENT") return defaultFeaturedIds;
    throw error;
  }

  const parsed = JSON.parse(await readFile(settingsFile, "utf8"));
  const configured = Array.isArray(parsed) ? parsed : parsed?.seva_ids;
  const featuredIds = Array.isArray(configured) && configured.length > 0
    ? configured
    : defaultFeaturedIds;

  const seen = new Set();
  for (const id of featuredIds) {
    if (typeof id !== "string" || !id.trim()) {
      throw new Error(`${path.relative(projectRoot, settingsFile)} contains an invalid seva id.`);
    }
    if (!sevaIds.has(id)) {
      throw new Error(`${path.relative(projectRoot, settingsFile)} references unknown seva "${id}".`);
    }
    if (seen.has(id)) {
      throw new Error(`${path.relative(projectRoot, settingsFile)} contains duplicate seva "${id}".`);
    }
    seen.add(id);
  }
  return featuredIds;
}

const files = (await readdir(sourceDir))
  .filter((file) => file.toLowerCase().endsWith(".md"))
  .sort((a, b) => a.localeCompare(b, "en"));

const sevas = [];
const ids = new Set();
for (const file of files) {
  const sourceName = path.join("library", "sevas", file);
  const markdown = await readFile(path.join(sourceDir, file), "utf8");
  const { metadata, body } = parseMarkdownFrontmatter(markdown, sourceName);
  const seva = parseSeva(metadata, body, sourceName);
  if (ids.has(seva.id)) throw new Error(`Duplicate seva id "${seva.id}" in ${sourceName}.`);
  ids.add(seva.id);
  sevas.push(seva);
}

sevas.sort((a, b) => a.code - b.code || a.id.localeCompare(b.id, "en"));
const featuredSevaIds = await loadFeaturedIds(ids);

const realSevas = sevas;
const placeholderSevas = sevas.map(placeholderSeva);
const defaultSevas = isPlaceholderDefault ? placeholderSevas : realSevas;

await mkdir(outputDir, { recursive: true });

const dataCode = `// Generated by build/build-sevas-content.mjs — do not edit
export interface LocalizedSevaText { en: string; kn: string }
export interface SevaRecord {
  id: string;
  code: number;
  title: LocalizedSevaText;
  category: LocalizedSevaText & { code: string };
  deity: LocalizedSevaText;
  sannidhi: LocalizedSevaText;
  location: LocalizedSevaText;
  amount: number;
  currency: string;
  formattedAmount: LocalizedSevaText;
  description: LocalizedSevaText;
  significance: LocalizedSevaText;
  bookingUrl: string;
  contact: { phone: string; email: string };
  detailsHtml: LocalizedSevaText;
  searchText: string;
}
export const realSevas: SevaRecord[] = ${JSON.stringify(realSevas, null, 2)};
export const placeholderSevas: SevaRecord[] = ${JSON.stringify(placeholderSevas, null, 2)};
export const sevas: SevaRecord[] = ${JSON.stringify(defaultSevas, null, 2)};
export const featuredSevaIds: string[] = ${JSON.stringify(featuredSevaIds, null, 2)};
`;

const docs = realSevas.map((seva, index) => ({
  ...seva,
  __search_id: index,
  searchText: `${seva.searchText} ${placeholderSevas[index].searchText}`,
}));
const miniSearch = new MiniSearch(withSearchDefaults({
  idField: "__search_id",
  fields: ["searchText"],
  searchOptions: { boost: { searchText: 1 } },
}));
miniSearch.addAll(docs);

const compressed = gzipSync(JSON.stringify(miniSearch.toJSON())).toString("base64");
const searchIndexCode = `// Generated by build/build-sevas-content.mjs — do not edit
export const compressedSevasSearchIndex = ${JSON.stringify(compressed)};
`;
const loadersCode = `// Generated by build/build-sevas-content.mjs — do not edit
export const loadSevasSearchIndex = () => import("./search-index");
`;

await writeFile(path.join(outputDir, "data.ts"), dataCode, "utf8");
await writeFile(path.join(outputDir, "search-index.ts"), searchIndexCode, "utf8");
await writeFile(path.join(outputDir, "loaders.ts"), loadersCode, "utf8");

console.log(`Built ${realSevas.length} sevas from Markdown (${featuredSevaIds.length} featured).`);
