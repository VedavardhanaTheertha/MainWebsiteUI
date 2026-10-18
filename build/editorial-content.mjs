import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseMarkdownFrontmatter } from "./content-utils.mjs";

const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);
const plainObject = (value) => value !== null && typeof value === "object" &&
  !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;

function validateValue(value, source) {
  if (value === null || typeof value === "string" || typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value))) return;
  if (Array.isArray(value)) {
    value.forEach((item) => validateValue(item, source));
    return;
  }
  if (plainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (unsafeKeys.has(key)) throw new Error(`${source}: unsafe content key "${key}".`);
      validateValue(child, source);
    }
    return;
  }
  throw new Error(`${source}: content must contain only JSON-compatible values; quote dates.`);
}

function assignField(result, dottedPath, value, source) {
  const segments = dottedPath.split(".");
  if (segments.some((key) => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) || unsafeKeys.has(key))) {
    throw new Error(`${source}: invalid content field "${dottedPath}".`);
  }
  let current = result;
  for (const key of segments.slice(0, -1)) {
    if (key in current && !plainObject(current[key])) {
      throw new Error(`${source}: conflicting content field "${dottedPath}".`);
    }
    current = current[key] ??= {};
  }
  const key = segments.at(-1);
  if (key in current) throw new Error(`${source}: duplicate content field "${dottedPath}".`);
  validateValue(value, source);
  current[key] = value;
}

function* markdownFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith(".")) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(file);
    else if (entry.isFile() && entry.name.endsWith(".md")) yield file;
  }
}

/** Page frontmatter preserves the public dictionary API without duplicate prose. */
export function loadEditorialContent(rootDir, languageCode) {
  const result = {};
  for (const file of markdownFiles(path.join(rootDir, "library"))) {
    const markdown = readFileSync(file, "utf8");
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    if (!frontmatter || !/^kind:\s*(?:localized-copy|learning-collection)\s*$/m.test(frontmatter)) continue;
    const source = path.relative(rootDir, file);
    const { metadata, body } = parseMarkdownFrontmatter(markdown, source);
    if (!plainObject(metadata.fields) || !Object.keys(metadata.fields).length) {
      throw new Error(`${source}: localized-copy needs a non-empty fields map.`);
    }
    if (body.trim()) throw new Error(`${source}: structured page copy belongs in frontmatter, not an unused body.`);
    validateProgressSnapshot(metadata.fields, source);
    for (const [field, translations] of Object.entries(metadata.fields)) {
      if (!plainObject(translations) || !Object.keys(translations).length) {
        throw new Error(`${source}: "${field}" needs a language-keyed translation map.`);
      }
      for (const [code, value] of Object.entries(translations)) {
        if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(code)) throw new Error(`${source}: invalid language code "${code}".`);
        if (field === "pages.local_copy.yajna_progress_percent" &&
            (typeof value !== "string" || !/^\d+(?:\.\d+)?%$/.test(value) || Number.parseFloat(value) > 100)) {
          throw new Error(`${source}: yajna_progress_percent must be a percentage between 0% and 100%.`);
        }
        validateValue(value, source);
      }
      if (Object.hasOwn(translations, languageCode)) assignField(result, field, translations[languageCode], source);
    }
    if (metadata.kind === "learning-collection") {
      if (!Array.isArray(metadata.subjects) || !metadata.subjects.length ||
          new Set(metadata.subjects).size !== metadata.subjects.length) {
        throw new Error(`${source}: subjects must be a non-empty list of unique IDs.`);
      }
      const subjects = [];
      for (const id of metadata.subjects) {
        if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
          throw new Error(`${source}: unsafe learning subject ID.`);
        }
        const subjectFile = path.join(path.dirname(file), `${id}.md`);
        const subject = parseMarkdownFrontmatter(readFileSync(subjectFile, "utf8"), subjectFile);
        if (subject.metadata.kind !== "learning-subject" || subject.metadata.id !== id ||
            !plainObject(subject.metadata.translations) || subject.body.trim()) {
          throw new Error(`${subjectFile}: needs matching learning-subject metadata and no unused body.`);
        }
        const translated = subject.metadata.translations[languageCode];
        if (translated === undefined) continue;
        if (!plainObject(translated) || ["title", "sub", "img"].some((key) =>
          typeof translated[key] !== "string" || !translated[key].trim())) {
          throw new Error(`${subjectFile}: translated subjects need title, sub and img.`);
        }
        if (Object.hasOwn(translated, "id")) throw new Error(`${subjectFile}: id belongs in shared frontmatter.`);
        const allowed = ["title", "sub", "img", "href", "description", "level", "language", "format", "duration", "enrollmentUrl", "availability"];
        for (const [field, value] of Object.entries(translated)) {
          if (!allowed.includes(field) || typeof value !== "string" || !value.trim()) {
            throw new Error(`${subjectFile}: unknown or invalid learning field "${field}".`);
          }
          if (["href", "enrollmentUrl"].includes(field)) {
            let safe = /^\/(?!\/)[^\s\\]*$/.test(value);
            if (!safe) {
              let url;
              try {
                url = new URL(value);
              } catch (error) {
                throw new Error(`${subjectFile}: ${field} must be a safe site-relative or HTTPS destination.`, { cause: error });
              }
              safe = url.protocol === "https:" && !url.username && !url.password;
            }
            if (!safe || value.trim() !== value || /[*<>]/.test(value)) {
              throw new Error(`${subjectFile}: ${field} must be a safe site-relative or HTTPS destination.`);
            }
          }
        }
        validateValue(translated, subjectFile);
        subjects.push({ id, ...translated });
      }
      if (subjects.length && subjects.length !== metadata.subjects.length) {
        throw new Error(`${source}: a translated collection must supply every subject or inherit the whole default collection.`);
      }
      if (subjects.length) assignField(result, "learn", subjects, source);
      const paths = result.pages?.learn?.suggested_paths;
      if (paths !== undefined && (!Array.isArray(paths) || paths.some((entry) =>
        !plainObject(entry) || typeof entry.title !== "string" || !entry.title.trim() ||
        typeof entry.description !== "string" || !entry.description.trim() ||
        !Array.isArray(entry.itemIds) || !entry.itemIds.length ||
        new Set(entry.itemIds).size !== entry.itemIds.length ||
        entry.itemIds.some((id) => !metadata.subjects.includes(id))))) {
        throw new Error(`${source}: suggested_paths need titles, descriptions and unique existing subject IDs.`);
      }
    }
  }
  return result;
}

export function validateProgressSnapshot(fields, source) {
  const counts = fields["pages.local_copy.yajna_count"];
  if (!counts) return;
  const dates = fields["pages.local_copy.yajna_as_of_date"];
  if (!plainObject(dates) || Object.keys(counts).some((code) => !Object.hasOwn(dates, code))) {
    throw new Error(`${source}: Yajna progress needs an authored as-of date for every count translation.`);
  }
  for (const date of Object.values(dates)) {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
      throw new Error(`${source}: Yajna as-of date must be a valid quoted YYYY-MM-DD date.`);
    }
  }
  if (new Set(Object.values(dates)).size !== 1) {
    throw new Error(`${source}: all Yajna translations must refer to the same progress snapshot date.`);
  }
}

export function mergeAuthoredSources(base, overlay, source = "authored content", prefix = "") {
  const result = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    const field = prefix ? `${prefix}.${key}` : key;
    if (unsafeKeys.has(key)) throw new Error(`${source}: unsafe content key "${field}".`);
    if (Object.hasOwn(result, key)) {
      if (!plainObject(result[key]) || !plainObject(value)) {
        throw new Error(`${source}: duplicate authority for "${field}"; remove the old language JSON value.`);
      }
      result[key] = mergeAuthoredSources(result[key], value, source, field);
    } else {
      result[key] = value;
    }
  }
  return result;
}
