import { readFileSync } from "node:fs";

const sectionDefinitions = [
  { id: "mantra", route: "/library/mantra" },
  { id: "shastra", route: "/library/shastra" },
  { id: "jnana", route: "/library/jnana" },
  { id: "dharma", route: "/library/dharma" },
  { id: "projects", route: "/projects" },
  { id: "stories", route: "/history/stories" },
  { id: "articles", route: "/history/articles" },
  { id: "symbolism", route: "/history/symbolism" },
  { id: "remedies", route: "/history/remedies" },
  { id: "science", route: "/history/science" },
  { id: "pilgrim", route: "/history/pilgrim-guide" },
];

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
      if (field !== "order" && field !== "image") {
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
    if (typeof entry.image !== "string" || !/^@image\.[A-Za-z][A-Za-z0-9_-]*$/u.test(entry.image)) {
      throw new Error(`${sourceName} section "${id}" image must be a valid @image reference.`);
    }
    return { ...definition, order: entry.order, image: entry.image };
  }).sort((a, b) => a.order - b.order);
}

export const librarySections = parseKnowledgeSections(JSON.parse(
  readFileSync(new URL("../settings/knowledge_sections.json", import.meta.url), "utf8"),
));
