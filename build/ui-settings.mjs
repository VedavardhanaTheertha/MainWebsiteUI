import { readFileSync } from "node:fs";

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

function choice(value, source, field, options) {
  if (!options.includes(value)) throw new Error(`${source} ${field} must be one of: ${options.join(", ")}.`);
  return value;
}

export function parseUiSettings(parsed) {
  const source = "settings/ui_elements.json";
  object(parsed, source, "a settings");
  const collections = object(parsed.collections, source, "a collections");
  const autoScroll = object(parsed.autoScroll, source, "an autoScroll");
  const hero = object(parsed.hero, source, "a hero");
  const upcoming = object(parsed.upcomingEvents, source, "an upcomingEvents");
  const interaction = object(parsed.interaction, source, "an interaction");
  const readingTime = object(parsed.readingTime, source, "a readingTime");
  const reader = object(parsed.bhaktiReader, source, "a bhaktiReader");
  const viewer = object(parsed.mediaViewer, source, "a mediaViewer");
  const defaults = object(parsed.browserDefaults, source, "a browserDefaults");
  const bhaktiReaderSettings = {
    initialSize: integer(reader.initialSize, source, "bhaktiReader.initialSize"),
    minSize: integer(reader.minSize, source, "bhaktiReader.minSize"),
    maxSize: integer(reader.maxSize, source, "bhaktiReader.maxSize"),
    step: integer(reader.step, source, "bhaktiReader.step"),
  };
  if (reader.minSize > reader.maxSize || reader.initialSize < reader.minSize || reader.initialSize > reader.maxSize) {
    throw new Error(`${source} bhaktiReader requires minSize <= initialSize <= maxSize.`);
  }
  if ((reader.maxSize - reader.minSize) % reader.step || (reader.initialSize - reader.minSize) % reader.step) {
    throw new Error(`${source} bhaktiReader initialSize and maxSize must align with step from minSize.`);
  }
  if (!Number.isFinite(autoScroll.pixelsPerSecond) || autoScroll.pixelsPerSecond <= 0) {
    throw new Error(`${source} autoScroll.pixelsPerSecond must be a positive finite number.`);
  }
  return {
    readingTimeSettings: {
      wordsPerMinute: integer(readingTime.wordsPerMinute, source, "readingTime.wordsPerMinute"),
    },
    bhaktiReaderSettings,
    mediaViewerSettings: {
      swipeThresholdPx: integer(viewer.swipeThresholdPx, source, "mediaViewer.swipeThresholdPx"),
      videoControlExclusionPx: integer(viewer.videoControlExclusionPx, source, "mediaViewer.videoControlExclusionPx", 0),
      wrap: boolean(viewer.wrap, source, "mediaViewer.wrap"),
    },
    browserDefaults: {
      advancedFiltersOpen: boolean(defaults.advancedFiltersOpen, source, "browserDefaults.advancedFiltersOpen"),
      lineageView: choice(defaults.lineageView, source, "browserDefaults.lineageView", ["list", "timeline"]),
      eventsUpcomingSort: choice(defaults.eventsUpcomingSort, source, "browserDefaults.eventsUpcomingSort", ["earliest", "latest"]),
      eventsPastSort: choice(defaults.eventsPastSort, source, "browserDefaults.eventsPastSort", ["earliest", "latest"]),
      albumsSort: choice(defaults.albumsSort, source, "browserDefaults.albumsSort", ["newest", "oldest"]),
    },
    collectionPagination: {
      initialVisible: integer(collections.initialVisible, source, "collections.initialVisible"),
      loadIncrement: integer(collections.loadIncrement, source, "collections.loadIncrement"),
    },
    railAutoScroll: {
      enabled: boolean(autoScroll.enabled, source, "autoScroll.enabled"),
      pixelsPerSecond: autoScroll.pixelsPerSecond,
      returnDurationMs: integer(autoScroll.returnDurationMs, source, "autoScroll.returnDurationMs"),
      resumeDelayMs: integer(autoScroll.resumeDelayMs, source, "autoScroll.resumeDelayMs", 0, 2147483647),
    },
    heroSettings: {
      autoplay: boolean(hero.autoplay, source, "hero.autoplay"),
      intervalMs: integer(hero.intervalMs, source, "hero.intervalMs", 1, 2147483647),
      fadeDurationMs: integer(hero.fadeDurationMs, source, "hero.fadeDurationMs", 0),
      zoomDurationMs: integer(hero.zoomDurationMs, source, "hero.zoomDurationMs", 0),
    },
    upcomingEventSettings: {
      lookAheadDays: integer(upcoming.lookAheadDays, source, "upcomingEvents.lookAheadDays", 0, 365000),
      maxCards: integer(upcoming.maxCards, source, "upcomingEvents.maxCards"),
    },
    interactionSettings: {
      dropdownCloseDelayMs: integer(interaction.dropdownCloseDelayMs, source, "interaction.dropdownCloseDelayMs", 0, 2147483647),
      modalResetDelayMs: integer(interaction.modalResetDelayMs, source, "interaction.modalResetDelayMs", 0, 2147483647),
      searchPreloadDelayMs: integer(interaction.searchPreloadDelayMs, source, "interaction.searchPreloadDelayMs", 0, 2147483647),
    },
  };
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
  return parseUiSettings(JSON.parse(readFileSync(new URL("../settings/ui_elements.json", import.meta.url), "utf8")));
}

export function loadAnnouncementSettings() {
  return parseAnnouncementSettings(JSON.parse(readFileSync(new URL("../settings/announcements.json", import.meta.url), "utf8")));
}
