import { readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resolveHomeCarousels } from "./home-carousels.mjs";

const homeSchema = {
  hero: { invocation: "string", title: "string", subtitle: "string", body: "string" },
  hero_intro: { title: "string", cta_label: "string", cta_href: "string", images: ["string"] },
  explore_label: "string", explore_title: "string", guidance_label: "string", guidance_title: "string",
};
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const languageCodePattern = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

function fail(source, message) {
  throw new Error(`${source}: ${message}`);
}

function validate(value, schema, source, partial = false) {
  if (typeof schema === "string") {
    if (typeof value !== schema) fail(source, `expected ${schema}`);
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) fail(source, "control characters are not allowed");
    if (value.startsWith("@image") && !/^@image\.[A-Za-z0-9_-]+$/.test(value)) fail(source, "invalid image reference");
    if (source.endsWith(".cta_href") &&
        (!/^(?:\/(?!\/)|#|https?:\/\/|mailto:|tel:)/.test(value) || /[\\\s]/.test(value))) {
      fail(source, "expected a safe site-relative, fragment, HTTP(S), mail or telephone destination");
    }
    return;
  }
  if (Array.isArray(schema)) {
    if (!Array.isArray(value)) fail(source, "expected an array");
    value.forEach((entry, index) => validate(entry, schema[0], `${source}[${index}]`));
    return;
  }
  if (!object(value)) fail(source, "expected an object");
  for (const key of Object.keys(value)) {
    if (!Object.hasOwn(schema, key)) fail(`${source}.${key}`, "unknown homepage field");
    validate(value[key], schema[key], `${source}.${key}`, partial);
  }
  if (!partial) {
    for (const key of Object.keys(schema)) {
      if (!Object.hasOwn(value, key)) fail(`${source}.${key}`, "required homepage field is missing");
    }
  }
}

/** Load only active homepage copy; translations inherit through the main generator. */
export function loadHomeContent(rootDir, languageCode) {
  const source = "settings/home.json";
  if (typeof languageCode !== "string" || !languageCodePattern.test(languageCode)) fail(source, "invalid language code");
  const settings = JSON.parse(readFileSync(path.join(rootDir, "settings", "home.json"), "utf8"));
  const config = yaml.load(readFileSync(path.join(rootDir, "config", "site.yml"), "utf8"));
  const defaultLanguage = config?.site?.default_language;
  if (typeof defaultLanguage !== "string" || !languageCodePattern.test(defaultLanguage)) {
    fail("config/site.yml", "site.default_language must be a valid language code");
  }
  if (!object(settings) || Object.keys(settings).some((key) =>
    !["home", "top_carousel", "icon_carousel", "bottom_carousel", "explore_carousel"].includes(key))) {
    fail(source, "expected language maps and the four configured page-reference carousels only");
  }
  if (!object(settings.home) || !object(settings.home[defaultLanguage])) {
    fail(`${source}.home`, `default language ${defaultLanguage} is required`);
  }
  for (const [code, content] of Object.entries(settings.home)) {
    if (!languageCodePattern.test(code)) fail(`${source}.home.${code}`, "invalid language code");
    validate(content, homeSchema, `${source}.home.${code}`, code !== defaultLanguage);
  }
  return {
    home: {
      ...settings.home[languageCode],
      ...resolveHomeCarousels(rootDir, settings, languageCode, defaultLanguage),
    },
  };
}
