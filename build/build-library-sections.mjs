import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { parseMarkdownFrontmatter, normalizeSearchText } from "./content-utils.mjs";
import { renderMarkdown } from "./markdown.mjs";
import { describeContentMode } from "./environment-utils.mjs";
import { librarySections as sectionDefinitions } from "./library-sections.config.mjs";
import { parseKnowledge, validateRelatedArticles, knowledgeCollectionCounts } from "./knowledge-schema.mjs";
import { loadEditorialContent, mergeAuthoredSources } from "./editorial-content.mjs";
import { resolveImageUrl } from "./image-resolution.mjs";
import { discoverLanguageContent, resolveLocalizedValues, splitLocalizedArticleBody } from "./language-content.mjs";
import { holdWorkspaceLock } from "./workspace-lock.mjs";

holdWorkspaceLock("library generation");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "library");
const outputRoot = path.join(projectRoot, "src", "gen", "library");
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const { codes: languageCodes, defaultLanguage, metadata: languageMetadata } = discoverLanguageContent(projectRoot);

const environmentName = process.env.SITE_ENV || "dev";
const siteConfig = yaml.load(
  readFileSync(path.join(projectRoot, "config", "site.yml"), "utf8"),
);
const defaultLanguageContent = mergeAuthoredSources(JSON.parse(
  readFileSync(path.join(projectRoot, siteConfig.content.languages_dir, `${siteConfig.site.default_language}.json`), "utf8"),
), loadEditorialContent(projectRoot, siteConfig.site.default_language));
const environment = siteConfig.environments?.[environmentName];
if (!environment) {
  throw new Error(`SITE_ENV="${environmentName}" is not defined in config/site.yml.`);
}

function requireLocalized(value, field, sourceName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${sourceName} must define ${field} as a language map.`);
  }
  requireString(value[defaultLanguage], `${field}.${defaultLanguage}`, sourceName);
  for (const [code, text] of Object.entries(value)) requireString(text, `${field}.${code}`, sourceName);
  return resolveLocalizedValues(value, languageCodes, defaultLanguage);
}

function requireLocalizedTags(value, sourceName) {
  if (!Array.isArray(value)) {
    throw new Error(`${sourceName} tags must be an array.`);
  }
  return value.map((tag, index) => {
    if (!tag || typeof tag !== "object" || Array.isArray(tag)) {
      throw new Error(`${sourceName} tags[${index}] must define code and localized labels.`);
    }
    return {
      code: requireId(tag.code, `tags[${index}].code`, sourceName),
      ...requireLocalized(Object.fromEntries(Object.entries(tag).filter(([key]) => key !== "code")), `tags[${index}]`, sourceName),
    };
  });
}

const contentMode = describeContentMode(
  environment.content_mode,
  environment.default_variant,
);
const settingsEnvironment = environmentName === "local" ? "dev" : environmentName;

function requireString(value, field, sourceName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${sourceName} must define a non-empty ${field}.`);
  }
  return value.trim();
}

function requireId(value, field, sourceName) {
  const id = requireString(value, field, sourceName);
  if (!idPattern.test(id)) {
    throw new Error(`${sourceName} ${field} must use lowercase kebab-case.`);
  }
  return id;
}

function requireRoute(value, sourceName) {
  const route = requireString(value, "route", sourceName);
  if (!route.startsWith("/") || route.endsWith("/") || route.includes("..")) {
    throw new Error(`${sourceName} route must be a root-relative path without a trailing slash.`);
  }
  return route;
}

function loadImageResolver() {
  const sourceName = `settings/${settingsEnvironment}/images.json`;
  const imageConfig = JSON.parse(
    readFileSync(path.join(projectRoot, sourceName), "utf8"),
  );
  const baseUrl = imageConfig.baseUrl ?? "";
  const paths = imageConfig.paths ?? {};

  return (value, field, recordName) => {
    const image = requireString(value, field, recordName);
    if (!image.startsWith("@image.")) return image;
    const key = image.slice("@image.".length);
    const imagePath = paths[key];
    if (typeof imagePath !== "string") {
      throw new Error(`${recordName} ${field} references unknown image alias "${image}".`);
    }
    return resolveImageUrl(imagePath, baseUrl);
  };
}

function placeholderSection(section, sectionIndex) {
  const localized = (text) => Object.fromEntries(languageCodes.map((code) => [code, text]));
  return {
    ...section,
    metadataTitle: `dev·library metadata title ${sectionIndex + 1}`,
    metadataDescription: `dev·library metadata description ${sectionIndex + 1} — placeholder copy for layout preview only`,
    items: section.items.map((item, itemIndex) => ({
      ...item,
      knowledge: undefined,
      title: localized(`dev·library item title ${sectionIndex + 1}.${itemIndex + 1}`),
      summary: localized(`dev·library item summary ${sectionIndex + 1}.${itemIndex + 1} — placeholder copy for layout preview only`),
      status: localized(`dev·library status ${itemIndex + 1}`),
      tags: item.tags.map((tag, tagIndex) => ({
        ...tag,
        ...localized(`tag ${tagIndex + 1}`),
      })),
      searchText: `dev library item ${sectionIndex + 1} ${itemIndex + 1} placeholder`,
      html: localized(`<p>dev·library article ${sectionIndex + 1}.${itemIndex + 1} — placeholder copy for layout preview only.</p>`),
    })),
  };
}

async function loadSections(resolveImage) {
  return Promise.all(sectionDefinitions.map(async (definition) => {
    const id = requireId(definition.id, "id", "library section configuration");
    const sectionRoot = path.join(sourceRoot, id);
    const sectionSourceName = `library/${id}`;
    const sectionCopy = defaultLanguageContent.library_sections?.[id];
    if (!sectionCopy || typeof sectionCopy !== "object" || Array.isArray(sectionCopy)) {
      throw new Error(`The configured default language must define library_sections.${id}.`);
    }
    const files = (await readdir(sectionRoot))
      .filter((file) => file.endsWith(".md") && file !== "_index.md")
      .sort();
    if (files.length < 4) {
      throw new Error(`${sectionSourceName} requires at least four article Markdown files.`);
    }

    const items = await Promise.all(files.map(async (file) => {
      const sourceName = `library/${id}/${file}`;
      const source = await readFile(path.join(sectionRoot, file), "utf8");
      const { metadata, body } = parseMarkdownFrontmatter(source, sourceName);
      const itemId = requireId(metadata.id, "id", sourceName);
      if (`${itemId}.md` !== file) {
        throw new Error(`${sourceName} id must match its filename.`);
      }
      const title = requireLocalized(metadata.title, "title", sourceName);
      const summary = requireLocalized(metadata.summary, "summary", sourceName);
      const status = requireLocalized(metadata.status, "status", sourceName);
      const tags = requireLocalizedTags(metadata.tags, sourceName);
      const markdown = splitLocalizedArticleBody(body, sourceName, languageCodes, defaultLanguage, languageMetadata);
      const html = Object.fromEntries(Object.entries(markdown).map(([code, text]) => [code, renderMarkdown(text)]));

      return {
        id: itemId,
        knowledge: parseKnowledge(metadata.knowledge, id, sourceName),
        title,
        summary,
        status,
        image: resolveImage(metadata.image ?? definition.image, "image", sourceName),
        tags,
        searchText: normalizeSearchText([
          ...Object.values(title),
          ...Object.values(summary),
          ...Object.values(status),
          ...tags.flatMap((tag) => Object.values(tag)),
          ...Object.values(markdown),
        ].join(" ")),
        html,
      };
    }));

    const itemIds = new Set();
    validateRelatedArticles(items, sectionSourceName);
    for (const item of items) {
      if (itemIds.has(item.id)) {
        throw new Error(`${sectionSourceName} contains duplicate article id "${item.id}".`);
      }
      itemIds.add(item.id);
    }

    return {
      id,
      order: Number(definition.order),
      route: requireRoute(definition.route, sectionSourceName),
      image: resolveImage(definition.image, "image", sectionSourceName),
      metadataTitle: requireString(sectionCopy.title, "title", `library_sections.${id}`),
      metadataDescription: requireString(
        sectionCopy.description,
        "description",
        `library_sections.${id}`,
      ),
      items,
    };
  }));
}

async function applyFeaturedSettings(sections) {
  const sourceName = `settings/${settingsEnvironment}/toplibrary.json`;
  const parsed = JSON.parse(await readFile(path.join(projectRoot, sourceName), "utf8"));
  const configuredSections = parsed?.sections;
  if (!configuredSections || typeof configuredSections !== "object" || Array.isArray(configuredSections)) {
    throw new Error(`${sourceName} must define a sections object.`);
  }

  const knownSectionIds = new Set(sections.map((section) => section.id));
  const sharedCollectionIds = new Set(["album", "sevas"]);
  for (const configuredId of Object.keys(configuredSections)) {
    if (!knownSectionIds.has(configuredId) && !sharedCollectionIds.has(configuredId)) {
      throw new Error(`${sourceName} references unknown section "${configuredId}".`);
    }
  }

  return sections.map((section) => {
    const featuredItemIds = configuredSections[section.id];
    if (!Array.isArray(featuredItemIds) || featuredItemIds.length === 0) {
      throw new Error(`${sourceName} must configure at least one item for section "${section.id}".`);
    }

    const knownItemIds = new Set(section.items.map((item) => item.id));
    const seen = new Set();
    for (const itemId of featuredItemIds) {
      if (typeof itemId !== "string" || !knownItemIds.has(itemId)) {
        throw new Error(`${sourceName} section "${section.id}" references unknown item "${itemId}".`);
      }
      if (seen.has(itemId)) {
        throw new Error(`${sourceName} section "${section.id}" contains duplicate item "${itemId}".`);
      }
      seen.add(itemId);
    }

    return { ...section, featuredItemIds };
  });
}

const resolveImage = loadImageResolver();
const realSections = (await applyFeaturedSettings(await loadSections(resolveImage)))
  .sort((a, b) => a.order - b.order);
const sectionIds = new Set();
const sectionRoutes = new Set();
for (const section of realSections) {
  if (!Number.isInteger(section.order) || section.order < 1) {
    throw new Error(`Library section "${section.id}" order must be a positive integer.`);
  }
  if (sectionIds.has(section.id)) throw new Error(`Duplicate library section id "${section.id}".`);
  if (sectionRoutes.has(section.route)) throw new Error(`Duplicate library section route "${section.route}".`);
  sectionIds.add(section.id);
  sectionRoutes.add(section.route);
}

const placeholderSections = realSections.map(placeholderSection);
const defaultSections = contentMode.defaultVariant === "placeholder"
  ? placeholderSections
  : realSections;
let bhaktiIndex;
try {
  bhaktiIndex = JSON.parse(await readFile(path.join(projectRoot, "src", "gen", "bhakti", "index.json"), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const collectionCounts = knowledgeCollectionCounts(realSections, bhaktiIndex);

await rm(outputRoot, { recursive: true, force: true });
await mkdir(path.join(outputRoot, "content"), { recursive: true });

for (const section of realSections) {
  const sectionOutput = path.join(outputRoot, "content", section.id);
  await mkdir(sectionOutput, { recursive: true });
  await Promise.all(section.items.map((item) =>
    Promise.all(Object.entries(item.html).map(([code, html]) =>
      writeFile(path.join(sectionOutput, `${item.id}-${code}.html`), html, "utf8"))),
  ));
}

const output = `// Generated by build/build-library-sections.mjs — do not edit
import type { KnowledgeDetails } from "@/lib/knowledge-types";
export interface LibraryArticle {
  id: string;
  knowledge?: KnowledgeDetails;
  title: Record<string, string>;
  summary: Record<string, string>;
  status: Record<string, string>;
  image: string;
  tags: Array<{ code: string } & Record<string, string>>;
  searchText: string;
  html: Record<string, string>;
}

export interface LibrarySection {
  id: string;
  order: number;
  route: string;
  image: string;
  metadataTitle: string;
  metadataDescription: string;
  featuredItemIds: string[];
  items: LibraryArticle[];
}

export const realLibrarySections: LibrarySection[] = ${JSON.stringify(realSections)};
export const placeholderLibrarySections: LibrarySection[] = ${JSON.stringify(placeholderSections)};
export const librarySections: LibrarySection[] = ${JSON.stringify(defaultSections)};
`;

await writeFile(path.join(outputRoot, "data.ts"), output, "utf8");
await writeFile(
  path.join(outputRoot, "presentation.ts"),
  `// Generated by build/build-library-sections.mjs — do not edit\n` +
    `export const knowledgeCollectionCounts: Record<string, number> = ${JSON.stringify(collectionCounts)};\n` +
    `export const knowledgeSections = ${JSON.stringify(realSections.map(({ route, order, image }) => ({ route, order, image })))};\n`,
  "utf8",
);
console.log(
  `Built ${realSections.length} library sections with ` +
    `${realSections.reduce((total, section) => total + section.items.length, 0)} articles.`,
);
