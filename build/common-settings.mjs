import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveImageUrl } from "./image-resolution.mjs";

const source = "settings/common.json";

function toPath(dirOrUrl) {
  if (typeof dirOrUrl === "string") return dirOrUrl;
  if (dirOrUrl instanceof URL) return fileURLToPath(dirOrUrl);
  return process.cwd();
}

function object(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${source} must define ${field} object.`);
  }
  return value;
}

export function parseBackgroundSettings(parsedBackground) {
  object(parsedBackground, "background");
  if (typeof parsedBackground.backgroundImage !== "string" || !parsedBackground.backgroundImage.trim()) {
    throw new Error(`${source} background.backgroundImage must be a non-empty string.`);
  }

  let opacity = 0.12;
  if ("opacity" in parsedBackground && parsedBackground.opacity !== undefined) {
    if (typeof parsedBackground.opacity !== "number" || Number.isNaN(parsedBackground.opacity) || parsedBackground.opacity < 0 || parsedBackground.opacity > 1) {
      throw new Error(`${source} background.opacity must be a number between 0 and 1.`);
    }
    opacity = parsedBackground.opacity;
  }

  let size = "cover";
  if ("size" in parsedBackground && parsedBackground.size !== undefined) {
    if (typeof parsedBackground.size !== "string" || !parsedBackground.size.trim()) {
      throw new Error(`${source} background.size must be a non-empty string.`);
    }
    size = parsedBackground.size.trim();
  }

  let repeat = "no-repeat";
  if ("repeat" in parsedBackground && parsedBackground.repeat !== undefined) {
    if (typeof parsedBackground.repeat !== "string" || !parsedBackground.repeat.trim()) {
      throw new Error(`${source} background.repeat must be a non-empty string.`);
    }
    repeat = parsedBackground.repeat.trim();
  }

  let position = "center";
  if ("position" in parsedBackground && parsedBackground.position !== undefined) {
    if (typeof parsedBackground.position !== "string" || !parsedBackground.position.trim()) {
      throw new Error(`${source} background.position must be a non-empty string.`);
    }
    position = parsedBackground.position.trim();
  }

  return {
    backgroundImage: parsedBackground.backgroundImage.trim(),
    opacity,
    size,
    repeat,
    position,
  };
}

const fontReference = /^var\((--font-[a-z0-9]+(?:-[a-z0-9]+)*)\)$/;

function validFontFamily(value) {
  return typeof value === "string" && Boolean(value.trim()) && !/[;{}\\\n\r]/.test(value) && value.split(",").every((part) => {
    const family = part.trim();
    return fontReference.test(family) || /^(?:'[a-zA-Z0-9 -]+'|"[a-zA-Z0-9 -]+"|[a-zA-Z][a-zA-Z0-9-]*|-[a-zA-Z][a-zA-Z0-9-]*)$/.test(family);
  });
}

export function parseFontFamilySettings(parsedFontFamily) {
  if (parsedFontFamily !== undefined) {
    object(parsedFontFamily, "fontFamily");
  }
  const familyObj = parsedFontFamily ?? {};
  const validateFamily = (value, field, defaultValue) => {
    if (value === undefined) return defaultValue;
    if (!validFontFamily(value)) {
      throw new Error(`${source} fontFamily.${field} must be a valid CSS font-family string.`);
    }
    return value.trim();
  };

  return {
    display: validateFamily(familyObj.display, "display", "var(--font-marcellus), 'Cormorant Garamond', Georgia, 'Times New Roman', serif"),
    body: validateFamily(familyObj.body, "body", "var(--font-montserrat), system-ui, -apple-system, 'Segoe UI', sans-serif"),
    sanskrit: validateFamily(familyObj.sanskrit, "sanskrit", "var(--font-noto-devanagari), var(--font-marcellus), serif"),
    kannada: validateFamily(familyObj.kannada, "kannada", "var(--font-noto-kannada), var(--font-montserrat), sans-serif"),
    mono: validateFamily(familyObj.mono, "mono", "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"),
  };
}

export function parseFontSizeSettings(parsedFontSize) {
  if (parsedFontSize !== undefined) {
    object(parsedFontSize, "fontSize");
  }
  const fontObj = parsedFontSize ?? {};
  const lengthPattern = /^(?:\d+(?:\.\d+)?(?:px|rem|em))$/;
  const validateSize = (value, field, defaultValue) => {
    if (value === undefined) return defaultValue;
    if (typeof value !== "string" || !lengthPattern.test(value.trim())) {
      throw new Error(`${source} fontSize.${field} must be a valid CSS font size (e.g. "12px", "1rem").`);
    }
    return value.trim();
  };

  return {
    micro: validateSize(fontObj.micro, "micro", "12px"),
    caption: validateSize(fontObj.caption, "caption", "13px"),
    ui: validateSize(fontObj.ui, "ui", "14px"),
    nav: validateSize(fontObj.nav, "nav", "15px"),
    body: validateSize(fontObj.body, "body", "16px"),
    badge: validateSize(fontObj.badge, "badge", "12px"),
    formLabel: validateSize(fontObj.formLabel, "formLabel", "13px"),
    formInput: validateSize(fontObj.formInput, "formInput", "16px"),
    actionButton: validateSize(fontObj.actionButton, "actionButton", "14px"),
    meta: validateSize(fontObj.meta, "meta", "13px"),
  };
}

export const parseFontSettings = parseFontSizeSettings;

export function parseCommonSettings(parsed) {
  object(parsed, "a common settings");
  const backgroundSource = parsed.background ?? parsed;
  const background = parseBackgroundSettings(backgroundSource);
  const fontFamily = parseFontFamilySettings(parsed.fontFamily);
  const fontSize = parseFontSizeSettings(parsed.fontSize ?? parsed.font);

  return {
    background,
    fontFamily,
    fontSize,
    font: fontSize,
  };
}

export function resolveBackgroundSettings(background, environmentName = "dev", rootDir = process.cwd()) {
  const root = toPath(rootDir);
  const configName = environmentName === "prod" ? "prod" : "dev";
  const imageConfigFile = path.join(root, "settings", configName, "images.json");
  const imageConfig = JSON.parse(readFileSync(imageConfigFile, "utf8"));
  const baseUrl = imageConfig.baseUrl ?? "";
  const paths = imageConfig.paths ?? {};

  let resolvedImage = background.backgroundImage;
  if (resolvedImage.startsWith("@")) {
    const key = resolvedImage.startsWith("@image.")
      ? resolvedImage.slice("@image.".length)
      : resolvedImage.slice(1);
    const imagePath = paths[key];
    if (typeof imagePath !== "string") {
      throw new Error(`${source} background.backgroundImage references unknown image alias "${background.backgroundImage}".`);
    }
    resolvedImage = resolveImageUrl(imagePath, baseUrl);
  } else if (!/^https?:\/\//i.test(resolvedImage)) {
    resolvedImage = resolveImageUrl(resolvedImage, baseUrl);
  }

  return {
    ...background,
    backgroundImage: resolvedImage,
  };
}

export function resolveCommonSettings(parsed, environmentName = "dev", rootDir = process.cwd()) {
  return {
    ...parsed,
    background: resolveBackgroundSettings(parsed.background, environmentName, rootDir),
    fontFamily: parsed.fontFamily,
    fontSize: parsed.fontSize,
    font: parsed.fontSize,
  };
}

export function loadCommonSettings(environmentName = (process.env.SITE_ENV || "dev"), rootDir = process.cwd()) {
  const root = toPath(rootDir);
  const file = path.join(root, "settings", "common.json");
  const parsed = parseCommonSettings(JSON.parse(readFileSync(file, "utf8")));
  return resolveCommonSettings(parsed, environmentName, root);
}
