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
  number("readingTime", "wordsPerMinute"),
  ...["initialSize", "minSize", "maxSize", "step"].map((key) => number("bhaktiReader", key)),
  number("mediaViewer", "swipeThresholdPx"), number("mediaViewer", "videoControlExclusionPx", 0),
  flag("mediaViewer", "wrap"), flag("browserDefaults", "advancedFiltersOpen"),
  choice("browserDefaults", "lineageView", ["list", "timeline"]),
  choice("browserDefaults", "eventsUpcomingSort", ["earliest", "latest"]),
  choice("browserDefaults", "eventsPastSort", ["earliest", "latest"]),
  choice("browserDefaults", "albumsSort", ["newest", "oldest"]),
  ...["dropdownCloseDelayMs", "modalResetDelayMs", "searchPreloadDelayMs"].map((key) => number("interaction", key, 0, timerMaximum)),
  ...["imageTreatment", "imageBackedTiles"].map((key) => flag("presentation", key)),
  number("presentation", "tileOverlayOpacity", 0, 100),
  number("presentation", "tileCornerRadius", 0, 48),
  ...["featuredTiles", "sectionHeaders", "layoutProfiles", "compactCollections", "tileInformation", "carouselNavigation"].map((key) => flag("layout", key)),
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
  const reader = result.bhaktiReader;
  if (reader.minSize > reader.maxSize || reader.initialSize < reader.minSize || reader.initialSize > reader.maxSize) {
    fail("bhaktiReader", "requires minSize <= initialSize <= maxSize.");
  }
  if ((reader.maxSize - reader.minSize) % reader.step || (reader.initialSize - reader.minSize) % reader.step) {
    fail("bhaktiReader", "initialSize and maxSize must align with step from minSize.");
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
    readingTimeSettings: raw.readingTime,
    bhaktiReaderSettings: raw.bhaktiReader,
    mediaViewerSettings: raw.mediaViewer,
    browserDefaults: raw.browserDefaults,
    interactionSettings: raw.interaction,
    presentationSettings: raw.presentation,
    layoutSettings: raw.layout,
  };
}

/** @returns {import("../src/lib/ui-settings-types").UiElements} */
export function validateUiPreferences(value, defaults) {
  const autoScroll = value?.autoScroll;
  if (autoScroll && typeof autoScroll === "object" && !Array.isArray(autoScroll)) {
    const migrated = { ...autoScroll };
    delete migrated.holdDurationMs;
    delete migrated.slideDurationMs;
    value = { ...value, autoScroll: migrated };
  }
  if (value && typeof value === "object" && !Array.isArray(value) && !Object.hasOwn(value, "layout")) {
    value = { ...value, layout: defaults.layout };
  }
  const layout = value?.layout;
  if (layout && typeof layout === "object" && !Array.isArray(layout) && Object.hasOwn(layout, "centeredCarousel")) {
    const migrated = { ...layout };
    delete migrated.centeredCarousel;
    value = { ...value, layout: migrated };
  }
  const presentation = value?.presentation;
  if (presentation && typeof presentation === "object" && !Array.isArray(presentation) &&
      (!Object.hasOwn(presentation, "imageBackedTiles") || !Object.hasOwn(presentation, "tileOverlayOpacity") || !Object.hasOwn(presentation, "tileCornerRadius"))) {
    const migrated = { ...presentation };
    for (const key of ["imageBackedTiles", "tileOverlayOpacity", "tileCornerRadius"]) {
      if (!Object.hasOwn(migrated, key)) migrated[key] = defaults.presentation[key];
    }
    return validateUiElements({
      ...value,
      presentation: migrated,
    });
  }
  return validateUiElements(value);
}
