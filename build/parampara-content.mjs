import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { parseMarkdownFrontmatter } from "./content-utils.mjs";

const linkFields = ["references", "relatedPlaces", "relatedWorks"];
const object = (value) => value !== null && typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;
const languageCode = (value) => typeof value === "string" &&
  /^[a-z][a-z0-9]*(?:-[A-Za-z0-9]+)*$/.test(value) &&
  !["constructor", "prototype", "__proto__"].includes(value);

function keys(value, allowed, source) {
  if (!object(value)) throw new Error(`${source} must be an object.`);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`${source} has unknown field "${key}".`);
  }
}

function text(value, field, source, allowEmpty = false) {
  if (typeof value !== "string" || (!allowEmpty && !value.trim())) {
    throw new Error(`${source} needs ${allowEmpty ? "a string" : "a non-empty string"} ${field}.`);
  }
  return value;
}

function safeUrl(href) {
  if (typeof href !== "string" || !href || /[\s\\<>*]/u.test(href)) return false;
  let decoded = href;
  try {
    for (let pass = 0; pass < 5; pass += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
      if (pass === 4) return false;
    }
    if (/[\u0000-\u0020\u007f\\<>*]/u.test(decoded)) return false;
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return true;
    if (!/^https:\/\//iu.test(href) || !/^https:\/\//iu.test(decoded)) return false;
    const url = new URL(href);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function references(value, field, source) {
  if (!Array.isArray(value)) throw new Error(`${source}.${field} must be an array.`);
  return value.map((link) => {
    keys(link, ["label", "href"], `${source}.${field} link`);
    if (typeof link.label !== "string" || !link.label.trim() || !safeUrl(link.href)) {
      throw new Error(`${source}.${field} needs a label and a safe root-relative or HTTPS href.`);
    }
    return { label: link.label, href: link.href };
  });
}

function loadGuru(directory, reference, index, inherited) {
  const file = path.join(directory, reference.contentFile);
  if (!existsSync(file)) throw new Error(`${file}: canonical guru Markdown is missing.`);
  if (path.dirname(realpathSync(file)) !== realpathSync(directory)) {
    throw new Error(`${file} must remain inside library/parampara.`);
  }
  const { metadata, body } = parseMarkdownFrontmatter(readFileSync(file, "utf8"), file);
  keys(metadata, [
    "id", "name", "summary", "timePeriod",
    "thumbnailImage", "fullImage", ...linkFields,
  ], `${file} front matter`);
  if (typeof metadata.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.id) ||
      (reference.id !== undefined && metadata.id !== reference.id)) {
    throw new Error(`${file}: needs a stable id matching its canonical guru.`);
  }
  const name = text(metadata.name, "name", file).trim();
  const summary = text(metadata.summary, "summary", file).trim();
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const details = body.match(/^##\s+Details\s*$/m);
  if (!heading || !details) throw new Error(`${file} needs a title and a "## Details" heading.`);
  const bodySummary = body.slice(body.indexOf("\n") + 1, details.index)
    .split(/\r?\n/)
    .filter((line) => !/^\s*-\s+\*\*[^*]+:\*\*/.test(line) && line.trim())
    .join("\n\n").trim();
  if (heading !== name || bodySummary !== summary) {
    throw new Error(`${file} body title or summary does not match its front matter.`);
  }
  const optionalLinks = {};
  for (const field of linkFields) {
    if (Object.hasOwn(metadata, field)) optionalLinks[field] = references(metadata[field], field, file);
    else if (inherited && Object.hasOwn(inherited, field)) optionalLinks[field] = inherited[field];
  }
  const thumbnailImage = metadata.thumbnailImage ?? inherited?.thumbnailImage ?? "";
  const fullImage = metadata.fullImage ?? inherited?.fullImage ?? thumbnailImage;
  for (const field of ["thumbnailImage", "fullImage"]) {
    if (Object.hasOwn(metadata, field)) text(metadata[field], field, file, true);
  }
  for (const image of [thumbnailImage, fullImage]) {
    if (image !== "" && !safeUrl(image)) throw new Error(`${file} portraits need a safe root-relative or HTTPS URL.`);
  }
  const timePeriod = Object.hasOwn(metadata, "timePeriod")
    ? text(metadata.timePeriod, "timePeriod", file, true)
    : inherited?.timePeriod ?? "";
  return {
    id: metadata.id,
    name,
    position: index,
    officialPosition: index === 0 ? null : index,
    timePeriod,
    summary,
    thumbnailImage,
    fullImage,
    detailsMarkdown: body.slice(details.index + details[0].length).trim(),
    ...optionalLinks,
  };
}

/** Filename number prefixes are the only collection-order authority. */
export function discoverParampara(rootDir, languageCodes, defaultLang) {
  if (!Array.isArray(languageCodes) || !languageCodes.every(languageCode) ||
      new Set(languageCodes).size !== languageCodes.length || !languageCode(defaultLang)) {
    throw new Error("Parampara needs unique language codes and a valid defaultLang.");
  }
  const directory = path.join(rootDir, "library", "parampara");
  if (!existsSync(directory)) throw new Error(`${directory}: initialize the library submodule.`);
  const files = readdirSync(directory).filter((name) => name.endsWith(".md"));
  const items = [];
  const prefixes = new Set();
  for (const contentFile of files) {
    const match = /^(\d{2,})-[a-z0-9-]+\.md$/.exec(contentFile);
    if (!match) {
      if (/^\d{2,}-[a-z0-9-]+\.[a-z][a-z0-9]*(?:-[A-Za-z0-9]+)*\.md$/.test(contentFile)) continue;
      throw new Error(`${directory}: "${contentFile}" needs a numeric prefix such as 00-.`);
    }
    const order = Number(match[1]);
    if (!Number.isSafeInteger(order) || prefixes.has(order)) throw new Error(`${directory}: duplicate or invalid numeric prefix "${match[1]}".`);
    prefixes.add(order);
    items.push({ contentFile, order });
  }
  if (!items.length) throw new Error(`${directory}: no numbered guru Markdown records.`);
  items.sort((a, b) => a.order - b.order);
  const base = items.map((item, index) => loadGuru(directory, item, index));
  if (new Set(base.map(({ id }) => id)).size !== base.length) throw new Error(`${directory}: duplicate guru id.`);
  for (const filename of files) {
    if (items.some(({ contentFile }) => contentFile === filename)) continue;
    if (!items.some(({ contentFile }) => filename.startsWith(`${path.parse(contentFile).name}.`))) {
      throw new Error(`${directory}: translated file "${filename}" has no canonical guru.`);
    }
  }
  return Object.fromEntries(languageCodes.map((code) => [
    code,
    items.map((item, index) => {
      if (code === defaultLang) return base[index];
      const parsed = path.parse(item.contentFile);
      const translated = { id: base[index].id, contentFile: `${parsed.name}.${code}${parsed.ext}` };
      if (!existsSync(path.join(directory, translated.contentFile))) return base[index];
      return loadGuru(directory, translated, index, base[index]);
    }),
  ]));
}
