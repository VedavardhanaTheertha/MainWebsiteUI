import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export function validateLanguageDescriptor(value, source) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${source}: _language must be an object.`);
  }
  for (const field of ["name", "native_name", "label", "short_label", "content_heading", "font_family"]) {
    if (value[field] !== undefined && (typeof value[field] !== "string" || !value[field].trim())) {
      throw new Error(`${source}: _language.${field} must be a non-empty string.`);
    }
  }
  return value;
}

export function createLanguageDescriptor(code, authored, resolved, defaultLanguage, source) {
  const original = validateLanguageDescriptor(authored ?? {}, source);
  const descriptor = validateLanguageDescriptor(resolved ?? {}, source);
  return {
    code,
    name: descriptor.name ?? code,
    native_name: descriptor.native_name ?? descriptor.name ?? code,
    label: descriptor.label ?? code.toUpperCase(),
    short_label: descriptor.short_label ?? code.toUpperCase(),
    ...(original.font_family === undefined ? {} : { font_family: original.font_family }),
    is_default: code === defaultLanguage,
  };
}

export function discoverLanguageContent(rootDir) {
  const config = yaml.load(readFileSync(path.join(rootDir, "config", "site.yml"), "utf8"));
  const directory = path.join(rootDir, config.content.languages_dir);
  const codes = readdirSync(directory).filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -5)).sort();
  const defaultLanguage = config.site.default_language;
  if (!codes.includes(defaultLanguage)) throw new Error(`Missing default language: ${defaultLanguage}`);
  const metadata = Object.fromEntries(codes.map((code) => [
    code, validateLanguageDescriptor(
      JSON.parse(readFileSync(path.join(directory, `${code}.json`), "utf8"))._language ?? {},
      path.join(directory, `${code}.json`),
    ),
  ]));
  return { codes, defaultLanguage, metadata };
}

export function resolveLocalizedValues(value, codes, defaultLanguage, fallback = "") {
  const source = typeof value === "string" ? { [defaultLanguage]: value } : value ?? {};
  return Object.fromEntries(codes.map((code) => [
    code, source[code] ?? source[defaultLanguage] ?? fallback,
  ]));
}

export function splitLocalizedArticleBody(body, sourceName, codes, defaultLanguage, metadata) {
  const labels = new Map();
  for (const code of codes) {
    for (const label of [code, metadata[code]?.name, metadata[code]?.native_name, metadata[code]?.content_heading]) {
      if (label) labels.set(label, code);
    }
  }
  const headings = [...body.matchAll(/^## (.+)\r?$/gm)]
    .filter((match) => labels.has(match[1]));
  const sections = {};
  for (let index = 0; index < headings.length; index++) {
    const match = headings[index];
    const code = labels.get(match[1]);
    if (Object.hasOwn(sections, code)) throw new Error(`${sourceName}: duplicate body language ${code}.`);
    sections[code] = body.slice(match.index + match[0].length, headings[index + 1]?.index ?? body.length).trim();
    if (!sections[code]) throw new Error(`${sourceName}: empty body for ${code}.`);
  }
  if (!sections[defaultLanguage] || body.slice(0, headings[0]?.index ?? 0).trim()) {
    throw new Error(`${sourceName}: body must start with a language heading and include ${defaultLanguage}.`);
  }
  return resolveLocalizedValues(sections, codes, defaultLanguage);
}

export function bhaktiLocalePresentation(metadata, defaultLanguage) {
  const fallback = metadata[defaultLanguage]?.bhakti;
  if (!fallback) throw new Error("Default language must configure _language.bhakti presentation.");
  return Object.fromEntries(Object.entries(metadata).map(([code, value]) => {
    const presentation = { ...fallback, ...value.bhakti };
    if (!["original", "transliteration"].includes(presentation.variant) ||
      typeof presentation.title_class !== "string" || typeof presentation.reader_class !== "string") {
      throw new Error(`Invalid _language.bhakti presentation for ${code}`);
    }

    return [code, presentation];
  }));
}

export function localizeBhaktiSong(song, title, presentation, htmlVariants) {
  return {
    localized: Object.fromEntries(Object.entries(presentation).map(([code, { variant }]) => [
      code, variant === "original" ? {
        title: song.title, kruti: song["kruti-kn"] || song.kruti || "",
        ankita: song["ankita-kn"] || song.ankita || "",
      } : { title: title || song.title, kruti: song.kruti ?? "", ankita: song.ankita ?? "" },
    ])),
    localizedHtml: Object.fromEntries(Object.entries(presentation).map(([code, { variant }]) => [
      code, htmlVariants[variant],
    ])),
  };
}
