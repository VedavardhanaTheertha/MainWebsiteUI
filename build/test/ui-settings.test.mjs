import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parseUiSettings, parseAnnouncementSettings } from "../ui-settings.mjs";
import { testUiSettings } from "./helpers/ui-settings.mjs";

const defaults = {
  collections: { initialVisible: 6, loadIncrement: 9 },
  autoScroll: { enabled: true, pixelsPerSecond: 36, returnDurationMs: 2200, resumeDelayMs: 1500 },
  hero: { autoplay: true, intervalMs: 4500, fadeDurationMs: 900 },
  upcomingEvents: { lookAheadDays: 30, maxCards: 6 },
  interaction: { dropdownCloseDelayMs: 120, modalResetDelayMs: 400, searchPreloadDelayMs: 300 },
  readingTime: { wordsPerMinute: 200 },
  bhaktiReader: { initialSize: 100, minSize: 85, maxSize: 150, step: 5 },
  mediaViewer: { swipeThresholdPx: 50, videoControlExclusionPx: 56, wrap: true },
  browserDefaults: { advancedFiltersOpen: false, lineageView: "list", eventsUpcomingSort: "earliest", eventsPastSort: "latest", albumsSort: "newest" },
  presentation: { imageTreatment: false, imageBackedTiles: false, tileOverlayOpacity: 40, tileCornerRadius: 20, headerActions: false, topSubscribe: false },
  layout: { adaptiveHero: false, featuredTiles: false, sectionHeaders: false, layoutProfiles: false, compactCollections: false, tileInformation: false, carouselNavigation: false },
};

test("reader, viewer and browser defaults validate explicit configurable contracts", () => {
  const configured = parseUiSettings({
    ...defaults,
    readingTime: { wordsPerMinute: 125 },
    bhaktiReader: { initialSize: 110, minSize: 90, maxSize: 170, step: 10 },
    mediaViewer: { swipeThresholdPx: 70, videoControlExclusionPx: 0, wrap: false },
    browserDefaults: { advancedFiltersOpen: true, lineageView: "timeline", eventsUpcomingSort: "latest", eventsPastSort: "earliest", albumsSort: "oldest" },
  });
  assert.equal(configured.readingTimeSettings.wordsPerMinute, 125);
  assert.equal(configured.bhaktiReaderSettings.initialSize, 110);
  assert.equal(configured.mediaViewerSettings.wrap, false);
  assert.equal(configured.browserDefaults.albumsSort, "oldest");
  for (const section of ["readingTime", "bhaktiReader", "mediaViewer", "browserDefaults"]) {
    for (const missing of [undefined, null, []]) {
      assert.throws(() => parseUiSettings({ ...defaults, [section]: missing }), new RegExp(section));
    }
    for (const field of Object.keys(defaults[section])) {
      for (const invalid of [undefined, null, "invalid", 1.5, -1]) {
        assert.throws(() => parseUiSettings({
          ...defaults, [section]: { ...defaults[section], [field]: invalid },
        }), new RegExp(`${section}\\.${field}`));
      }
    }
  }
  for (const bhaktiReader of [
    { initialSize: 80 }, { minSize: 160 }, { maxSize: 90 }, { step: 3 }, { initialSize: 101 },
  ]) {
    assert.throws(() => parseUiSettings({ ...defaults, bhaktiReader: { ...defaults.bhaktiReader, ...bhaktiReader } }), /bhaktiReader/);
  }
});

test("UI settings generation preserves pagination and exports custom scroll settings", async (t) => {
  const root = await mkdtemp(path.resolve(".ui-settings-test-"));
  t.after(() => rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  await mkdir(path.join(root, "build"));
  await mkdir(path.join(root, "settings"));
  const script = path.join(root, "build", "build-ui-settings.mjs");
  await copyFile(new URL("../build-ui-settings.mjs", import.meta.url), script);
  await copyFile(new URL("../workspace-lock.mjs", import.meta.url), path.join(root, "build", "workspace-lock.mjs"));
  await copyFile(new URL("../ui-settings.mjs", import.meta.url), path.join(root, "build", "ui-settings.mjs"));
  await copyFile(new URL("../ui-settings-schema.mjs", import.meta.url), path.join(root, "build", "ui-settings-schema.mjs"));
  await copyFile(new URL("../action-settings.mjs", import.meta.url), path.join(root, "build", "action-settings.mjs"));
  await copyFile(new URL("../../settings/public_actions.json", import.meta.url), path.join(root, "settings", "public_actions.json"));
  await copyFile(new URL("../search-config.mjs", import.meta.url), path.join(root, "build", "search-config.mjs"));
  await copyFile(new URL("../../settings/search.json", import.meta.url), path.join(root, "settings", "search.json"));
  await copyFile(new URL("../../settings/announcements.json", import.meta.url), path.join(root, "settings", "announcements.json"));
  const source = path.join(root, "settings", "ui_elements.json");
  const run = (settings) => {
    return writeFile(source, JSON.stringify(settings)).then(() =>
      spawnSync(process.execPath, [script], { encoding: "utf8" }),
    );
  };

  const custom = { ...defaults, autoScroll: { ...defaults.autoScroll, pixelsPerSecond: 12.5, returnDurationMs: 900 } };
  const generatedResult = await run(custom);
  assert.equal(generatedResult.status, 0, generatedResult.stderr);
  const generated = await readFile(path.join(root, "src", "gen", "settings", "ui-elements.ts"), "utf8");
  assert.match(generated, /collectionPagination = \{"initialVisible":6,"loadIncrement":9\} as const/);
  assert.match(generated, /railAutoScroll = \{"enabled":true,"pixelsPerSecond":12.5,"returnDurationMs":900,"resumeDelayMs":1500\} as const/);
  assert.match(generated, /heroSettings = \{"autoplay":true,"intervalMs":4500,"fadeDurationMs":900\}/);
  assert.match(generated, /interactionSettings = \{"dropdownCloseDelayMs":120,"modalResetDelayMs":400,"searchPreloadDelayMs":300\}/);
  assert.match(generated, /upcomingEventSettings = \{"lookAheadDays":30,"maxCards":6\}/);
  for (const name of ["readingTimeSettings", "bhaktiReaderSettings", "mediaViewerSettings", "browserDefaults"]) {
    assert.match(generated, new RegExp(`export const ${name} = `));
  }
  assert.match(await readFile(path.join(root, "src", "gen", "settings", "announcements.ts"), "utf8"), /AnnouncementSettings/);
  assert.match(await readFile(path.join(root, "src", "gen", "settings", "search.ts"), "utf8"), /export const searchSettings/);

  for (const value of [0, -1, "36", null]) {
    const result = await run({ ...defaults, autoScroll: { ...defaults.autoScroll, pixelsPerSecond: value } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /autoScroll.pixelsPerSecond must be a positive finite number/);
  }
  for (const field of ["initialVisible", "loadIncrement", "returnDurationMs"]) {
    const section = field === "returnDurationMs" ? "autoScroll" : "collections";
    const result = await run({ ...defaults, [section]: { ...defaults[section], [field]: 1.5 } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, new RegExp(`${section}.${field} must be a positive integer`));
  }
  for (const section of ["collections", "autoScroll"]) {
    const result = await run({ ...defaults, [section]: [] });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, new RegExp(`must define an? ${section} object`));
  }
});

async function createRail(config = defaults.autoScroll, itemCount = 3, manuallyPaused = false, motion = { matches: false }) {
  const source = await readFile(new URL("../../src/hooks/useAutoScrollRail.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const listeners = new Map();
  let scrollLeft = 0;
  const el = {
    get scrollLeft() { return scrollLeft; },
    set scrollLeft(value) { scrollLeft = Math.round(value * 4 / 5) * 5 / 4; },
    scrollWidth: 10000, clientWidth: 300,
    contains: () => false,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  let frame;
  let resume;
  let cleanup;
  let resumeDelay;
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    window: { addEventListener() {}, removeEventListener() {} },
    document: { hidden: false, activeElement: null, addEventListener() {}, removeEventListener() {} },
    Node: class {},
    ResizeObserver: class { observe() {} disconnect() {} },
    IntersectionObserver: class { observe() {} disconnect() {} },
    require: (name) => {
      if (name === "react") {
        return {
          useRef: () => ({ current: el }),
          useEffect: (effect) => { cleanup?.(); cleanup = effect(); },
        };
      }
      if (name === "@/hooks/useReducedMotion") return { useReducedMotion: () => motion.matches };
      if (name === "@/hooks/useDialog") return { useDialogsOpen: () => false };
      assert.equal(name, "@/context/UiSettingsContext");
      return { useUiSettings: () => ({ ...testUiSettings, railAutoScroll: config }) };
    },
    requestAnimationFrame: (callback) => { frame = callback; return 1; },
    cancelAnimationFrame: () => { frame = undefined; },
    setTimeout: (callback, delay) => { resume = callback; resumeDelay = delay; return 1; },
    clearTimeout: () => { resume = undefined; },
  });
  exports.useAutoScrollRail(itemCount, manuallyPaused);
  return {
    el, listeners, tick: (time) => frame?.(time), resume: () => resume(),
    cleanup: () => cleanup?.(),
    render: () => exports.useAutoScrollRail(itemCount, manuallyPaused),
    hasFrame: () => !!frame, resumeDelay: () => resumeDelay,
  };
}

test("row speed is configurable and independent of refresh rate, including slow speeds", async () => {
  for (const pixelsPerSecond of [0.5, 36, 72]) {
    for (const fps of [30, 60, 120]) {
      const rail = await createRail({ ...defaults.autoScroll, pixelsPerSecond });
      for (let frame = 0; frame <= fps * 2; frame++) rail.tick(frame * 1000 / fps);
      assert.ok(Math.abs(rail.el.scrollLeft - pixelsPerSecond * 2) <= 1);
      rail.cleanup();
      assert.equal(rail.hasFrame(), false);
      assert.equal(rail.listeners.size, 0);
    }
  }
});

test("rows retain interaction pauses and honor configured return duration", async () => {
  const rail = await createRail({ ...defaults.autoScroll, pixelsPerSecond: 100, returnDurationMs: 400, resumeDelayMs: 250 });
  rail.el.scrollWidth = 310;
  rail.tick(0);
  rail.tick(100);
  assert.equal(rail.el.scrollLeft, 10);
  rail.tick(200);
  rail.tick(400);
  assert.equal(rail.el.scrollLeft, 5);
  rail.tick(600);
  assert.equal(rail.el.scrollLeft, 0);
  rail.listeners.get("touchstart")();
  rail.tick(700);
  assert.equal(rail.el.scrollLeft, 0);
  rail.listeners.get("touchend")();
  assert.equal(rail.resumeDelay(), 250);
  rail.resume();
  rail.tick(800);
  assert.equal(rail.el.scrollLeft, 0, "resuming starts a fresh animation clock");
  rail.tick(900);
  assert.equal(rail.el.scrollLeft, 10);
  rail.cleanup();
});

test("rows with one item do not animate", async () => {
  const rail = await createRail(defaults.autoScroll, 1);
  assert.equal(rail.hasFrame(), false);
  assert.equal(rail.listeners.size, 0);
});

test("disabled auto-scroll leaves rows available for manual scrolling", async () => {
  const rail = await createRail({ ...defaults.autoScroll, enabled: false });
  assert.equal(rail.hasFrame(), false);
  assert.equal(rail.listeners.size, 0);
});

test("desktop rail dragging and wheel input pause automatic movement until the configured delay", async () => {
  const rail = await createRail({ ...defaults.autoScroll, pixelsPerSecond: 100, resumeDelayMs: 350 });
  rail.tick(0);
  rail.listeners.get("rail-interaction-start")();
  rail.el.scrollLeft = 150;
  rail.tick(100);
  assert.equal(rail.el.scrollLeft, 150);
  rail.listeners.get("rail-interaction-end")();
  assert.equal(rail.resumeDelay(), 350);
  rail.resume();
  rail.tick(200);
  assert.equal(rail.el.scrollLeft, 150);
  rail.tick(300);
  assert.equal(rail.el.scrollLeft, 160);
  rail.listeners.get("wheel")();
  rail.tick(400);
  assert.equal(rail.el.scrollLeft, 160);
  rail.resume();
  rail.tick(500);
  assert.equal(rail.el.scrollLeft, 160);
  rail.tick(600);
  assert.equal(rail.el.scrollLeft, 170);
  rail.cleanup();
});

test("non-home rows support manual pause and changing reduced-motion preference", async () => {
  const paused = await createRail(defaults.autoScroll, 3, true);
  assert.equal(paused.hasFrame(), false);
  assert.equal(paused.listeners.size, 0);
  const motion = { matches: true };
  const rail = await createRail({ ...defaults.autoScroll, pixelsPerSecond: 100 }, 3, false, motion);
  rail.tick(0);
  rail.tick(100);
  assert.equal(rail.el.scrollLeft, 0);
  motion.matches = false;
  rail.render();
  rail.tick(200);
  rail.tick(300);
  assert.equal(rail.el.scrollLeft, 10);
  motion.matches = true;
  rail.render();
  rail.tick(400);
  assert.equal(rail.el.scrollLeft, 10);
  rail.cleanup();
});

test("every rail respects reduced motion with explicit pause state", async () => {
  const rail = await createRail({ ...defaults.autoScroll, pixelsPerSecond: 100 }, 3, false, { matches: true });
  rail.tick(0);
  rail.tick(100);
  assert.equal(rail.el.scrollLeft, 0);
  rail.cleanup();
});

test("UI settings validate configurable behavior and allow zero delays", () => {
  const custom = structuredClone(defaults);
  custom.hero = { autoplay: false, intervalMs: 7000, fadeDurationMs: 0 };
  custom.autoScroll.enabled = false;
  custom.autoScroll.resumeDelayMs = 0;
  custom.upcomingEvents = { lookAheadDays: 0, maxCards: 2 };
  custom.interaction = { dropdownCloseDelayMs: 0, modalResetDelayMs: 0, searchPreloadDelayMs: 0 };
  const result = parseUiSettings(custom);
  assert.deepEqual(result.heroSettings, custom.hero);
  assert.deepEqual(result.upcomingEventSettings, custom.upcomingEvents);
  assert.deepEqual(result.interactionSettings, custom.interaction);
  for (const [section, field, value] of [
    ["hero", "autoplay", "yes"], ["hero", "intervalMs", 0],
    ["hero", "intervalMs", 2147483648], ["hero", "fadeDurationMs", -1],
    ["hero", "zoomDurationMs", -1],
    ["interaction", "dropdownCloseDelayMs", -1], ["interaction", "modalResetDelayMs", 2147483648],
    ["interaction", "searchPreloadDelayMs", "300"],
    ["autoScroll", "enabled", 1], ["autoScroll", "resumeDelayMs", -1],
    ["autoScroll", "resumeDelayMs", 2147483648],
    ["upcomingEvents", "lookAheadDays", -1], ["upcomingEvents", "maxCards", 0],
  ]) {
    assert.throws(() => parseUiSettings({
      ...defaults, [section]: { ...defaults[section], [field]: value },
    }), new RegExp(`${section}.${field}`));
  }
});

const announcementDefaults = {
  enabled: true, delayMs: 1800, pages: [], startsOn: null, endsOn: null, dismissal: "session",
};

test("announcement settings validate paths, real dates, timer bounds, and dismissal policy", () => {
  const custom = { ...announcementDefaults, pages: ["/", "/events"], startsOn: "2026-10-01", endsOn: "2026-10-31", dismissal: "persistent", delayMs: 0 };
  assert.deepEqual(parseAnnouncementSettings(custom), custom);
  for (const [field, value] of [
    ["enabled", "yes"], ["delayMs", -1], ["delayMs", 2147483648],
    ["pages", ["//example.com"]], ["pages", ["/events?foo=bar"]],
    ["pages", ["/events", "/events"]], ["pages", ["/../events"]],
    ["startsOn", "2026-02-30"], ["endsOn", "tomorrow"], ["dismissal", "forever"],
  ]) {
    assert.throws(() => parseAnnouncementSettings({ ...announcementDefaults, [field]: value }), new RegExp(field));
  }
  assert.throws(() => parseAnnouncementSettings({ ...custom, startsOn: "2026-11-01" }), /startsOn/);
});

async function loadUiHelpers() {
  const source = await readFile(new URL("../../src/lib/ui-settings.ts", import.meta.url), "utf8");
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports });
  return exports;
}

test("upcoming-event settings apply inclusive windows, ongoing events, ordering, and limits", async () => {
  const { selectUpcomingEvents } = await loadUiHelpers();
  const events = [
    { startDate: "2026-10-20" }, { startDate: "2026-10-17" },
    { startDate: "2026-10-01", endDate: "2026-10-17" },
    { startDate: "2026-10-16" }, { startDate: "2026-10-21" },
  ];
  const now = new Date("2026-10-17T12:00:00Z");
  assert.equal(selectUpcomingEvents(events, { lookAheadDays: 3, maxCards: 10 }, now).length, 3);
  const selected = selectUpcomingEvents(events, { lookAheadDays: 0, maxCards: 1 }, now);
  assert.equal(selected.length, 1);
  assert.equal(selected[0], events[2]);
  assert.equal(events[0].startDate, "2026-10-20");
});

test("announcement page eligibility and inclusive UTC schedule boundaries", async () => {
  const { announcementMatchesPage, announcementWindow } = await loadUiHelpers();
  assert.equal(announcementMatchesPage(announcementDefaults, "/events"), true);
  assert.equal(announcementMatchesPage({ ...announcementDefaults, enabled: false }, "/events"), false);
  const settings = { ...announcementDefaults, pages: ["/events/"], startsOn: "2026-10-17", endsOn: "2026-10-18" };
  assert.equal(announcementMatchesPage(settings, "/events"), true);
  assert.equal(announcementMatchesPage(settings, "/events/details"), false);
  const window = announcementWindow(settings);
  assert.equal(window.startsAt, Date.parse("2026-10-17T00:00:00Z"));
  assert.equal(window.endsAt, Date.parse("2026-10-19T00:00:00Z"));
});

test("knowledge hub ordering and images follow settings without moving non-registry destinations", async () => {
  const { applySectionPresentation } = await loadUiHelpers();
  const items = [
    { href: "/fixed", image: "/fixed.jpg" },
    { href: "/one", image: "/old-one.jpg" },
    { href: "/two", image: "/old-two.jpg" },
  ];
  const result = applySectionPresentation(items, [
    { route: "/one", order: 2, image: "/one.jpg" },
    { route: "/two", order: 1, image: "/two.jpg" },
  ]);
  assert.equal(result[0], items[0]);
  assert.equal(result[1].href, "/two");
  assert.equal(result[1].image, "/two.jpg");
  assert.equal(result[2].href, "/one");
  assert.equal(result[2].image, "/one.jpg");
  assert.equal(items[1].image, "/old-one.jpg");
});
