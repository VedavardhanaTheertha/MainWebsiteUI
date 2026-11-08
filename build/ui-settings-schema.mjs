const timerMaximum = 2147483647;
const number = (group, key, minimum = 1, maximum = Number.MAX_SAFE_INTEGER) =>
  ({ group, key, kind: "number", minimum, maximum, integer: true });
const flag = (group, key) => ({ group, key, kind: "boolean" });
const choice = (group, key, options) => ({ group, key, kind: "choice", options });

/** @type {import("../src/lib/ui-settings-types").UiFieldDefinition[]} */
export const uiFieldDefinitions = [
  number("collections", "initialVisible"), number("collections", "loadIncrement"),
  flag("autoScroll", "enabled"),
  { ...number("autoScroll", "pixelsPerSecond", 0), integer: false, exclusiveMinimum: true },
  number("autoScroll", "returnDurationMs"), number("autoScroll", "resumeDelayMs", 0, timerMaximum),
  flag("hero", "autoplay"), number("hero", "intervalMs", 1, timerMaximum), number("hero", "fadeDurationMs", 0),
  number("upcomingEvents", "lookAheadDays", 0, 365000), number("upcomingEvents", "maxCards"),
  number("reading", "wordsPerMinute"),
  ...["initialSize", "minSize", "maxSize", "step"].map((key) => number("reading", key)),
  number("mediaViewer", "swipeThresholdPx"), number("mediaViewer", "videoControlExclusionPx", 0),
  flag("mediaViewer", "wrap"), flag("browserDefaults", "advancedFiltersOpen"),
  choice("browserDefaults", "lineageView", ["list", "timeline"]),
  choice("browserDefaults", "eventsUpcomingSort", ["earliest", "latest"]),
  choice("browserDefaults", "eventsPastSort", ["earliest", "latest"]),
  choice("browserDefaults", "albumsSort", ["newest", "oldest"]),
  ...["dropdownCloseDelayMs", "modalResetDelayMs", "searchPreloadDelayMs"].map((key) => number("interaction", key, 0, timerMaximum)),
  number("presentation", "tileOverlayOpacity", 0, 100),
  number("presentation", "tileCornerRadius", 0, 48),
  number("presentation", "tileMinHeight", 100, 1000),
];

export class UiSettingsError extends Error {}

function fail(field, message) {
  throw new UiSettingsError(`settings/ui_elements.json ${field} ${message}`);
}

function object(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("", `must define an ${field} object.`);
  }
  return value;
}

/** @returns {import("../src/lib/ui-settings-types").UiElements} */
export function validateUiElements(value) {
  const root = object(value, "settings");
  const groups = new Set(uiFieldDefinitions.map((field) => field.group));
  for (const key of Object.keys(root)) {
    if (!groups.has(key)) fail(key, "is an unknown settings group.");
  }
  const result = {};
  for (const group of groups) {
    const source = object(root[group], group);
    const fields = uiFieldDefinitions.filter((field) => field.group === group);
    for (const key of Object.keys(source)) {
      if (!fields.some((field) => field.key === key)) fail(`${group}.${key}`, "is an unknown option.");
    }
    result[group] = {};
    for (const field of fields) {
      const current = source[field.key];
      const location = `${group}.${field.key}`;
      if (field.kind === "boolean") {
        if (typeof current !== "boolean") fail(location, "must be a boolean.");
      } else if (field.kind === "choice") {
        if (!field.options.includes(current)) fail(location, `must be one of: ${field.options.join(", ")}.`);
      } else {
        if (field.integer && (!Number.isSafeInteger(current) || current < field.minimum)) {
          fail(location, `must be ${field.minimum ? "a positive" : "a non-negative"} integer.`);
        }
        if (!field.integer && (!Number.isFinite(current) || current <= field.minimum)) {
          fail(location, "must be a positive finite number.");
        }
        if (current > field.maximum) fail(location, `must not exceed ${field.maximum}.`);
      }
      result[group][field.key] = current;
    }
  }
  const reader = result.reading;
  if (reader.minSize > reader.maxSize || reader.initialSize < reader.minSize || reader.initialSize > reader.maxSize) {
    fail("reading", "requires minSize <= initialSize <= maxSize.");
  }
  if ((reader.maxSize - reader.minSize) % reader.step || (reader.initialSize - reader.minSize) % reader.step) {
    fail("reading", "initialSize and maxSize must align with step from minSize.");
  }
  return result;
}

/** @returns {import("../src/lib/ui-settings-types").UiSettings} */
export function parseUiSettings(value) {
  const raw = validateUiElements(value);
  return {
    collectionPagination: raw.collections,
    railAutoScroll: raw.autoScroll,
    heroSettings: raw.hero,
    upcomingEventSettings: raw.upcomingEvents,
    readingSettings: raw.reading,
    mediaViewerSettings: raw.mediaViewer,
    browserDefaults: raw.browserDefaults,
    interactionSettings: raw.interaction,
    presentationSettings: raw.presentation,
  };
}

/** @returns {import("../src/lib/ui-settings-types").UiElements} */
export function validateUiPreferences(value, defaults) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (Object.hasOwn(value, "layout")) {
      const migrated = { ...value };
      delete migrated.layout;
      value = migrated;
    }
    if (Object.hasOwn(value, "readingTime") || Object.hasOwn(value, "bhaktiReader")) {
      const migrated = { ...value };
      const reading = { ...(migrated.reading ?? {}) };
      if (migrated.readingTime?.wordsPerMinute && !reading.wordsPerMinute) {
        reading.wordsPerMinute = migrated.readingTime.wordsPerMinute;
      }
      for (const k of ["initialSize", "minSize", "maxSize", "step"]) {
        if (migrated.bhaktiReader?.[k] && !reading[k]) {
          reading[k] = migrated.bhaktiReader[k];
        }
      }
      migrated.reading = reading;
      delete migrated.readingTime;
      delete migrated.bhaktiReader;
      value = migrated;
    }
  }
  const autoScroll = value?.autoScroll;
  if (autoScroll && typeof autoScroll === "object" && !Array.isArray(autoScroll)) {
    const migrated = { ...autoScroll };
    delete migrated.holdDurationMs;
    delete migrated.slideDurationMs;
    value = { ...value, autoScroll: migrated };
  }
  const reading = value?.reading;
  if (reading && typeof reading === "object" && !Array.isArray(reading)) {
    const migrated = { ...reading };
    for (const key of ["wordsPerMinute", "initialSize", "minSize", "maxSize", "step"]) {
      if (!Object.hasOwn(migrated, key)) migrated[key] = defaults.reading[key];
    }
    value = { ...value, reading: migrated };
  }
  const presentation = value?.presentation;
  if (presentation && typeof presentation === "object" && !Array.isArray(presentation)) {
    const migrated = { ...presentation };
    delete migrated.imageTreatment;
    delete migrated.imageBackedTiles;
    for (const key of ["tileOverlayOpacity", "tileCornerRadius", "tileMinHeight"]) {
      if (!Object.hasOwn(migrated, key)) migrated[key] = defaults.presentation[key];
    }
    return validateUiElements({
      ...value,
      presentation: migrated,
    });
  }
  return validateUiElements(value);
}
