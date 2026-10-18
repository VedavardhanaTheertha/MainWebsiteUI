import path from "node:path";
import { discoverLanguageContent, resolveLocalizedValues } from "./language-content.mjs";
const { codes: languages, defaultLanguage } = discoverLanguageContent(path.resolve(import.meta.dirname, ".."));
const sectionFields = {
  projects: ["project"],
  mantra: ["mantra"],
  jnana: ["glossary"],
  stories: ["themes", "readMinutes"],
  symbolism: ["illustration"],
  remedies: ["editorial"],
  pilgrim: ["practical", "verifiedOn"],
};

export function parseKnowledge(value, sectionId, source = "article") {
  if (value === undefined) return undefined;
  const fail = (field) => { throw new Error(`${source} knowledge.${field} is invalid.`); };
  const object = (entry, field, allowed) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) fail(field);
    for (const key of Object.keys(entry)) if (!allowed.includes(key)) fail(`${field}.${key}`);
    return entry;
  };
  const text = (entry, field) => {
    if (typeof entry !== "string" || !entry.trim()) fail(field);
    return entry.trim();
  };
  const localized = (entry, field) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) fail(field);
    text(entry[defaultLanguage], `${field}.${defaultLanguage}`);
    for (const [code, value] of Object.entries(entry)) {
      if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u.test(code)) fail(`${field}.${code}`);
      text(value, `${field}.${code}`);
    }
    return resolveLocalizedValues(entry, languages, defaultLanguage);
  };
  const date = (entry, field) => {
    const result = text(entry, field);
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(result) ||
        !Number.isFinite(Date.parse(result)) ||
        new Date(result).toISOString().slice(0, 10) !== result) fail(field);
    return result;
  };
  const url = (entry, field, media = false) => {
    const result = text(entry, field);
    if (result.startsWith("/") && !result.startsWith("//") && !/[\\\s]/u.test(result) &&
        !result.split("/").includes("..")) return result;
    try {
      const parsed = new URL(result);
      if (parsed.protocol === "https:" && !parsed.username && !parsed.password) return result;
    } catch { /* Invalid URLs fail below. */ }
    fail(field + (media ? ".src" : ".url"));
  };
  const list = (entry, field, parse) => {
    if (!Array.isArray(entry) || !entry.length) fail(field);
    return entry.map((item, index) => parse(item, `${field}[${index}]`));
  };
  object(value, "", ["author", "reviewer", "publishedOn", "reviewedOn", "references", "related", ...(sectionFields[sectionId] ?? [])]);
  const result = {};
  for (const key of ["author", "reviewer"]) if (value[key] !== undefined) result[key] = localized(value[key], key);
  for (const key of ["publishedOn", "reviewedOn", "verifiedOn"]) if (value[key] !== undefined) result[key] = date(value[key], key);
  if (value.related !== undefined) result.related = list(value.related, "related", (entry, field) => {
    const id = text(entry, field);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) fail(field);
    return id;
  });
  if (value.references !== undefined) result.references = list(value.references, "references", (entry, field) => {
    object(entry, field, ["label", "url"]);
    return { label: localized(entry.label, `${field}.label`), url: url(entry.url, `${field}.url`) };
  });
  if (value.themes !== undefined) result.themes = list(value.themes, "themes", localized);
  if (value.readMinutes !== undefined) {
    if (!Number.isSafeInteger(value.readMinutes) || value.readMinutes < 1) fail("readMinutes");
    result.readMinutes = value.readMinutes;
  }
  if (value.glossary !== undefined) result.glossary = list(value.glossary, "glossary", (entry, field) => {
    object(entry, field, ["term", "definition"]);
    return { term: localized(entry.term, `${field}.term`), definition: localized(entry.definition, `${field}.definition`) };
  });
  if (value.project !== undefined) {
    const project = object(value.project, "project", ["status", "milestones", "updates", "outcomes"]);
    if (!["planned", "active", "completed"].includes(project.status)) fail("project.status");
    result.project = { status: project.status };
    for (const key of ["milestones", "updates", "outcomes"]) if (project[key] !== undefined) {
      result.project[key] = list(project[key], `project.${key}`, (entry, field) => {
        object(entry, field, key === "outcomes" ? ["text", "date", "verified"] : ["text", "date"]);
        if (key === "outcomes" && entry.verified !== true) fail(`${field}.verified`);
        return { text: localized(entry.text, `${field}.text`), date: date(entry.date, `${field}.date`) };
      });
    }
  }
  if (value.mantra !== undefined) {
    const mantra = object(value.mantra, "mantra", ["original", "transliteration", "meaning", "guidance", "audio"]);
    result.mantra = {};
    for (const key of ["original", "transliteration", "meaning", "guidance"]) if (mantra[key] !== undefined) result.mantra[key] = localized(mantra[key], `mantra.${key}`);
    if (mantra.audio !== undefined) {
      const audio = object(mantra.audio, "mantra.audio", ["approved", "src", "label"]);
      if (audio.approved !== true) fail("mantra.audio.approved");
      result.mantra.audio = { src: url(audio.src, "mantra.audio.src", true), label: localized(audio.label, "mantra.audio.label") };
    }
  }
  if (value.illustration !== undefined) {
    const image = object(value.illustration, "illustration", ["approved", "src", "alt", "annotations"]);
    if (image.approved !== true) fail("illustration.approved");
    result.illustration = {
      src: url(image.src, "illustration.src", true),
      alt: localized(image.alt, "illustration.alt"),
      annotations: list(image.annotations, "illustration.annotations", (entry, field) => {
        object(entry, field, ["x", "y", "label", "explanation"]);
        for (const key of ["x", "y"]) if (typeof entry[key] !== "number" || !Number.isFinite(entry[key]) || entry[key] < 0 || entry[key] > 100) fail(`${field}.${key}`);
        return { x: entry.x, y: entry.y, label: localized(entry.label, `${field}.label`), explanation: localized(entry.explanation, `${field}.explanation`) };
      }),
    };
  }
  if (value.editorial !== undefined) {
    const editorial = object(value.editorial, "editorial", ["reviewer", "reviewedOn"]);
    result.editorial = { reviewer: localized(editorial.reviewer, "editorial.reviewer"), reviewedOn: date(editorial.reviewedOn, "editorial.reviewedOn") };
  }
  if (value.practical !== undefined) {
    const practical = object(value.practical, "practical", ["directions", "hours", "accessibility", "customs", "meals", "accommodation", "contacts"]);
    result.practical = Object.fromEntries(Object.entries(practical).map(([key, entry]) => [key, localized(entry, `practical.${key}`)]));
  }
  return result;
}

export function validateRelatedArticles(items, source = "section") {
  const ids = new Set(items.map(({ id }) => id));
  for (const item of items) {
    const related = item.knowledge?.related ?? [];
    if (new Set(related).size !== related.length || related.some((id) => id === item.id || !ids.has(id))) {
      throw new Error(`${source}/${item.id} knowledge.related must contain unique, existing sibling article IDs other than itself.`);
    }

  }
}

export function knowledgeCollectionCounts(sections, bhaktiIndex) {
  const counts = Object.fromEntries(sections.map((section) => [section.route, section.items.length]));
  if (bhaktiIndex !== undefined) {
    if (!Array.isArray(bhaktiIndex?.items)) throw new Error("Generated Bhakti index must contain an items array.");
    counts["/library/bhakti"] = bhaktiIndex.items.length;
  }
  return counts;
}
