import { readFileSync } from "node:fs";
import { parseUiSettings, validateUiElements } from "./ui-settings-schema.mjs";
export { parseUiSettings } from "./ui-settings-schema.mjs";

function object(value, source, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${source} must define ${field} object.`);
  }
  return value;
}

function integer(value, source, field, minimum = 1, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new Error(`${source} ${field} must be ${minimum ? "a positive" : "a non-negative"} integer.`);
  }
  if (value > maximum) throw new Error(`${source} ${field} must not exceed ${maximum}.`);
  return value;
}

function boolean(value, source, field) {
  if (typeof value !== "boolean") throw new Error(`${source} ${field} must be a boolean.`);
  return value;
}

export function parseAnnouncementSettings(parsed) {
  const source = "settings/announcements.json";
  object(parsed, source, "an announcement settings");
  boolean(parsed.enabled, source, "enabled");
  integer(parsed.delayMs, source, "delayMs", 0, 2147483647);
  if (!Array.isArray(parsed.pages) || parsed.pages.some((page) =>
    typeof page !== "string" || !/^\/(?!\/)[^?#\\]*$/.test(page) ||
    page.includes("//") || page.split("/").some((segment) => segment === "." || segment === "..")
  ) || new Set(parsed.pages).size !== parsed.pages.length) {
    throw new Error(`${source} pages must be unique root-relative paths without queries or fragments.`);
  }
  for (const field of ["startsOn", "endsOn"]) {
    const date = parsed[field];
    if (date !== null && (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) {
      throw new Error(`${source} ${field} must be null or a valid YYYY-MM-DD date.`);
    }
  }
  if (parsed.startsOn && parsed.endsOn && parsed.startsOn > parsed.endsOn) {
    throw new Error(`${source} startsOn must not be after endsOn.`);
  }
  if (!["session", "persistent", "none"].includes(parsed.dismissal)) {
    throw new Error(`${source} dismissal must be session, persistent, or none.`);
  }
  return {
    enabled: parsed.enabled, delayMs: parsed.delayMs, pages: parsed.pages,
    startsOn: parsed.startsOn, endsOn: parsed.endsOn, dismissal: parsed.dismissal,
  };
}

export function loadUiSettings() {
  return parseUiSettings(loadUiElements());
}

export function loadUiElements() {
  return validateUiElements(JSON.parse(readFileSync(new URL("../settings/ui_elements.json", import.meta.url), "utf8")));
}

export function loadAnnouncementSettings() {
  return parseAnnouncementSettings(JSON.parse(readFileSync(new URL("../settings/announcements.json", import.meta.url), "utf8")));
}
