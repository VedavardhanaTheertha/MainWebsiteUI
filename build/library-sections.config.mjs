import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMarkdownFrontmatter } from "./content-utils.mjs";

const sectionDefinitions = [
  { id: "mantra", route: "/library/mantra" },
  { id: "shastra", route: "/library/shastra" },
  { id: "jnana", route: "/library/jnana" },
  { id: "dharma", route: "/library/dharma" },
  { id: "projects", route: "/projects" },
  { id: "stories", route: "/library/stories" },
  { id: "articles", route: "/library/articles" },
  { id: "symbolism", route: "/library/symbolism" },
  { id: "remedies", route: "/library/remedies" },
  { id: "science", route: "/library/science" },
  { id: "pilgrim", route: "/library/pilgrim-guide" },
];

export function loadSectionImages(pagesDir = new URL("../library/pages", import.meta.url)) {
  const imagesByRoute = new Map();
  const dirPath = typeof pagesDir === "string" ? pagesDir : fileURLToPath(pagesDir);
  for (const file of readdirSync(dirPath)) {
    if (!file.endsWith(".md")) continue;
    const filePath = path.join(dirPath, file);
    const content = readFileSync(filePath, "utf8");
    const { metadata } = parseMarkdownFrontmatter(content, `library/pages/${file}`);
    if (metadata.kind === "page-reference" && metadata.url && metadata.image) {
      imagesByRoute.set(metadata.url, metadata.image);
    }
  }
  return imagesByRoute;
}

export function parseKnowledgeSections(settings, sourceName = "settings/knowledge_sections.json") {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw new Error(`${sourceName} must define an object keyed by section ID.`);
  }

  const knownIds = new Set(sectionDefinitions.map(({ id }) => id));
  for (const id of Object.keys(settings)) {
    if (!knownIds.has(id)) {
      throw new Error(`${sourceName} references unknown section "${id}".`);
    }
  }

  const orders = new Set();
  return sectionDefinitions.map((definition) => {
    const { id } = definition;
    const entry = Object.hasOwn(settings, id) ? settings[id] : undefined;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`${sourceName} must define an object for section "${id}".`);
    }
    for (const field of Object.keys(entry)) {
      if (field !== "order") {
        throw new Error(`${sourceName} section "${id}" has unknown field "${field}".`);
      }
    }
    if (!Number.isSafeInteger(entry.order) || entry.order < 1) {
      throw new Error(`${sourceName} section "${id}" order must be a positive integer.`);
    }
    if (orders.has(entry.order)) {
      throw new Error(`${sourceName} contains duplicate order ${entry.order}.`);
    }
    orders.add(entry.order);
    return { ...definition, order: entry.order };
  }).sort((a, b) => a.order - b.order);
}

const sectionImages = loadSectionImages();
export const librarySections = parseKnowledgeSections(JSON.parse(
  readFileSync(new URL("../settings/knowledge_sections.json", import.meta.url), "utf8"),
)).map((section) => {
  const image = sectionImages.get(section.route);
  if (!image) {
    throw new Error(`library/pages missing page-reference image for route "${section.route}".`);
  }
  return { ...section, image };
});
