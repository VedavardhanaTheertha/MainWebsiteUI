import { readFileSync } from "node:fs";
import path from "node:path";

const source = "settings/theme.json";
const namespaces = ["color", "spacing", "radius", "shadow"];
const number = String.raw`(?:\d+(?:\.\d+)?|\.\d+)`;
const length = new RegExp(`^(?:0|${number}(?:px|rem|em))$`);
const signedLength = new RegExp(`^-?(?:0|${number}(?:px|rem|em))$`);
const hex = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const colorReference = /^var\((--color-[a-z0-9]+(?:-[a-z0-9]+)*)\)$/;
const fontReference = /^var\((--font-[a-z0-9]+(?:-[a-z0-9]+)*)\)$/;

function object(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${source} ${field} must be an object.`);
  }
}

function validColor(value) {
  if (hex.test(value) || colorReference.test(value)) return true;
  const rgba = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(0|1|0?\.\d+|1\.0+)\)$/);
  return !!rgba && rgba.slice(1, 4).every((channel) => Number(channel) <= 255) &&
    Number(rgba[4]) <= 1;
}

function validFont(value) {
  return value.split(",").every((part) => {
    const family = part.trim();
    return fontReference.test(family) || /^(?:'[a-zA-Z0-9 -]+'|"[a-zA-Z0-9 -]+"|[a-zA-Z][a-zA-Z0-9-]*|-[a-zA-Z][a-zA-Z0-9-]*)$/.test(family);
  });
}

function validShadow(value) {
  const match = value.match(/^(?:inset )?(.+) (rgba\([^)]+\)|#[\da-f]+|var\(--color-[a-z0-9-]+\))$/i);
  if (!match || !validColor(match[2])) return false;
  const dimensions = match[1].split(" ");
  return dimensions.length >= 2 && dimensions.length <= 4 &&
    dimensions.every((dimension) => signedLength.test(dimension)) &&
    (dimensions.length < 3 || !dimensions[2].startsWith("-"));
}

export function parseThemeSettings(parsed) {
  object(parsed, "root");
  if (Object.keys(parsed).some((key) => key !== "tokens")) {
    throw new Error(`${source} contains unknown fields; only tokens is supported.`);
  }
  object(parsed.tokens, "tokens");
  const entries = Object.entries(parsed.tokens);
  for (const [name, value] of entries) {
    const match = name.match(/^--(color|font|spacing|radius|shadow)-[a-z0-9]+(?:-[a-z0-9]+)*$/);
    if (!match) throw new Error(`${source} invalid token name: ${name}.`);
    if (typeof value !== "string" || !value || value !== value.trim() || /[;{}\\\n\r]/.test(value)) {
      throw new Error(`${source} invalid value for ${name}.`);
    }
    const valid = match[1] === "color" ? validColor(value) :
      match[1] === "font" ? validFont(value) :
      match[1] === "shadow" ? validShadow(value) : length.test(value);
    if (!valid) throw new Error(`${source} malformed ${match[1]} value for ${name}: ${value}.`);
  }
  for (const namespace of namespaces) {
    if (!entries.some(([name]) => name.startsWith(`--${namespace}-`))) {
      throw new Error(`${source} requires at least one ${namespace} token.`);
    }
  }
  const tokens = Object.fromEntries(entries);
  function visit(name, chain = new Set()) {
    if (chain.has(name)) throw new Error(`${source} cyclic token reference: ${name}.`);
    const next = new Set(chain).add(name);
    for (const [, reference] of tokens[name].matchAll(/var\((--[a-z0-9-]+)\)/g)) {
      if (Object.hasOwn(tokens, reference)) visit(reference, next);
      // next/font defines these font-face variables on the document, not in @theme.
      else if (!fontReference.test(`var(${reference})`)) {
        throw new Error(`${source} unknown token reference: ${reference}.`);
      }
    }
  }
  for (const [name] of entries) visit(name);
  return { tokens };
}

export function loadThemeSettings(rootDir = new URL("../", import.meta.url)) {
  const file = rootDir instanceof URL ? new URL("settings/theme.json", rootDir) :
    path.join(rootDir, "settings", "theme.json");
  return parseThemeSettings(JSON.parse(readFileSync(file, "utf8")));
}

export function renderThemeCss(settings) {
  const { tokens } = parseThemeSettings(settings);
  return `/* Generated from settings/theme.json. Do not edit. */\n@theme static {\n${
    Object.entries(tokens).map(([name, value]) => `  ${name}: ${value};`).join("\n")
  }\n}\n`;
}
