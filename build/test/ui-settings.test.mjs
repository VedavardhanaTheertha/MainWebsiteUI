import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parseUiSettings, parseAnnouncementSettings } from "../ui-settings.mjs";
import { validateUiPreferences } from "../ui-settings-schema.mjs";
import { testUiSettings } from "./helpers/ui-settings.mjs";

const defaults = {
  collections: { initialVisible: 6, loadIncrement: 9 },
  autoScroll: { enabled: true, pixelsPerSecond: 36, returnDurationMs: 2200, resumeDelayMs: 1500, holdDurationMs: 3000, slideDurationMs: 800 },
  hero: { autoplay: true, intervalMs: 4500, fadeDurationMs: 900 },
  upcomingEvents: { lookAheadDays: 30, maxCards: 6 },
  interaction: { dropdownCloseDelayMs: 120, modalResetDelayMs: 400, searchPreloadDelayMs: 300 },
  readingTime: { wordsPerMinute: 200 },
  bhaktiReader: { initialSize: 100, minSize: 85, maxSize: 150, step: 5 },
  mediaViewer: { swipeThresholdPx: 50, videoControlExclusionPx: 56, wrap: true },
  browserDefaults: { advancedFiltersOpen: false, lineageView: "list", eventsUpcomingSort: "earliest", eventsPastSort: "latest", albumsSort: "newest" },
  presentation: { imageTreatment: false, imageBackedTiles: false, tileOverlayOpacity: 40, tileCornerRadius: 20 },
  layout: { featuredTiles: false, sectionHeaders: false, layoutProfiles: false, compactCollections: false, tileInformation: false, carouselNavigation: false, centeredCarousel: false },
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
  await copyFile(new URL("../common-settings.mjs", import.meta.url), path.join(root, "build", "common-settings.mjs"));
  await copyFile(new URL("../image-resolution.mjs", import.meta.url), path.join(root, "build", "image-resolution.mjs"));
  await copyFile(new URL("../../settings/public_actions.json", import.meta.url), path.join(root, "settings", "public_actions.json"));
  await copyFile(new URL("../search-config.mjs", import.meta.url), path.join(root, "build", "search-config.mjs"));
  await copyFile(new URL("../../settings/search.json", import.meta.url), path.join(root, "settings", "search.json"));
  await copyFile(new URL("../../settings/announcements.json", import.meta.url), path.join(root, "settings", "announcements.json"));
  await copyFile(new URL("../../settings/common.json", import.meta.url), path.join(root, "settings", "common.json"));
  await mkdir(path.join(root, "settings", "dev"), { recursive: true });
  await copyFile(new URL("../../settings/dev/images.json", import.meta.url), path.join(root, "settings", "dev", "images.json"));
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
  assert.match(generated, /railAutoScroll = \{"enabled":true,"pixelsPerSecond":12.5,"returnDurationMs":900,"resumeDelayMs":1500,"holdDurationMs":3000,"slideDurationMs":800\} as const/);
  assert.match(generated, /heroSettings = \{"autoplay":true,"intervalMs":4500,"fadeDurationMs":900\}/);
  assert.match(generated, /interactionSettings = \{"dropdownCloseDelayMs":120,"modalResetDelayMs":400,"searchPreloadDelayMs":300\}/);
  assert.match(generated, /upcomingEventSettings = \{"lookAheadDays":30,"maxCards":6\}/);
  for (const name of ["readingTimeSettings", "bhaktiReaderSettings", "mediaViewerSettings", "browserDefaults"]) {
    assert.match(generated, new RegExp(`export const ${name} = `));
  }
  assert.match(await readFile(path.join(root, "src", "gen", "settings", "announcements.ts"), "utf8"), /AnnouncementSettings/);
  assert.match(await readFile(path.join(root, "src", "gen", "settings", "search.ts"), "utf8"), /export const searchSettings/);
  assert.match(await readFile(path.join(root, "src", "gen", "settings", "common.ts"), "utf8"), /export const commonSettings/);

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

async function createRail(config = defaults.autoScroll, itemCount = 3, manuallyPaused = false, motion = { matches: false }, { centered = false, dialogsOpen = false } = {}) {
  const source = await readFile(new URL("../../src/hooks/useAutoScrollRail.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const listeners = new Map();
  const documentListeners = new Map();
  const observers = [];
  class Element {
    constructor(index) { this.offsetLeft = 50 + index * 250; this.offsetWidth = 200; }
  }
  let scrollLeft = 0;
  const el = {
    get scrollLeft() { return scrollLeft; },
    set scrollLeft(value) { scrollLeft = Math.round(value * 4 / 5) * 5 / 4; },
    scrollWidth: centered ? 300 + (itemCount - 1) * 250 : 10000, clientWidth: 300,
    dataset: { centeredRail: centered ? "active" : undefined },
    children: Array.from({ length: itemCount }, (_, index) => new Element(index)),
    contains: () => false,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  let frame;
  let resume;
  let cleanup;
  let resumeDelay;
  const exports = {};
  const document = {
    hidden: false, activeElement: null,
    addEventListener: (name, callback) => documentListeners.set(name, callback),
    removeEventListener: (name) => documentListeners.delete(name),
  };
  vm.runInNewContext(outputText, {
    exports,
    window: { addEventListener() {}, removeEventListener() {} },
    document, HTMLElement: Element,
    Node: class {},
    ResizeObserver: class { constructor(callback) { observers.push(callback); } observe() {} disconnect() {} },
    IntersectionObserver: class { constructor(callback) { observers.push(callback); } observe() {} disconnect() {} },
    require: (name) => {
      if (name === "react") {
        return {
          useRef: () => ({ current: el }),
          useEffect: (effect) => { cleanup?.(); cleanup = effect(); },
        };
      }
      if (name === "@/hooks/useReducedMotion") return { useReducedMotion: () => motion.matches };
      if (name === "@/hooks/useDialog") return { useDialogsOpen: () => dialogsOpen };
      assert.equal(name, "@/context/UiSettingsContext");
      return { useUiSettings: () => ({
        ...testUiSettings, railAutoScroll: config,
        layoutSettings: { ...testUiSettings.layoutSettings, centeredCarousel: centered },
      }) };
    },
    requestAnimationFrame: (callback) => { frame = callback; return 1; },
    cancelAnimationFrame: () => { frame = undefined; },
    setTimeout: (callback, delay) => { resume = callback; resumeDelay = delay; return 1; },
    clearTimeout: () => { resume = undefined; },
  });
  exports.useAutoScrollRail(itemCount, manuallyPaused);
  return {
    el, listeners, document, documentListeners, observers,
    tick: (time) => { const callback = frame; frame = undefined; callback?.(time); },
    resume: () => resume(),
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

test("centered autoplay holds each exact card center, slides with easing, and reverses without skipping", async () => {
  const rail = await createRail(defaults.autoScroll, 3, false, { matches: false }, { centered: true });
  rail.tick(0);
  rail.tick(2999);
  assert.equal(rail.el.scrollLeft, 0, "first card remains still for the full hold");
  rail.tick(3000);
  rail.tick(3200);
  assert.equal(rail.el.scrollLeft, 16.25, "quarter-slide uses cubic easing");
  rail.tick(3400);
  assert.equal(rail.el.scrollLeft, 125);
  rail.tick(3800);
  assert.equal(rail.el.scrollLeft, 250, "second card is exactly centered");
  rail.tick(6799);
  assert.equal(rail.el.scrollLeft, 250, "hold starts after the slide finishes");
  rail.tick(6800);
  rail.tick(7600);
  assert.equal(rail.el.scrollLeft, 500, "last card is exactly centered");
  rail.tick(10599);
  assert.equal(rail.el.scrollLeft, 500);
  rail.tick(10600);
  rail.tick(11400);
  assert.equal(rail.el.scrollLeft, 250, "reverse visits the adjacent card, not the first card");
  rail.tick(14400);
  rail.tick(15200);
  assert.equal(rail.el.scrollLeft, 0);
  rail.tick(18200);
  rail.tick(19000);
  assert.equal(rail.el.scrollLeft, 250, "forward motion restarts at the first boundary");
  rail.cleanup();
});

test("centered timing is configurable and interaction re-centers the manually moved card before advancing", async () => {
  const rail = await createRail({ ...defaults.autoScroll, holdDurationMs: 1000, slideDurationMs: 400 }, 3, false, { matches: false }, { centered: true });
  rail.tick(0);
  rail.tick(1000);
  rail.tick(1200);
  assert.equal(rail.el.scrollLeft, 125);
  rail.listeners.get("rail-interaction-start")();
  rail.el.scrollLeft = 200;
  rail.tick(1400);
  assert.equal(rail.el.scrollLeft, 200);
  rail.listeners.get("rail-interaction-end")();
  rail.resume();
  rail.tick(2000);
  rail.tick(2999);
  assert.equal(rail.el.scrollLeft, 200);
  rail.tick(3000);
  rail.tick(3400);
  assert.equal(rail.el.scrollLeft, 250, "settles on the nearest center rather than skipping a card");
  rail.tick(4399);
  assert.equal(rail.el.scrollLeft, 250);
  rail.tick(4400);
  rail.tick(4800);
  assert.equal(rail.el.scrollLeft, 500);
  rail.cleanup();
});

test("centered rails restart their hold after resizing, offscreen or hidden periods and focus", async () => {
  for (const cause of ["resize", "offscreen", "hidden", "focus"]) {
    const rail = await createRail(defaults.autoScroll, 3, false, { matches: false }, { centered: true });
    rail.tick(0);
    rail.tick(3000);
    rail.tick(3400);
    assert.equal(rail.el.scrollLeft, 125);
    if (cause === "resize") rail.observers[0]();
    if (cause === "offscreen") rail.observers[1]([{ isIntersecting: false }]);
    if (cause === "hidden") {
      rail.document.hidden = true;
      rail.documentListeners.get("visibilitychange")();
    }
    if (cause === "focus") rail.listeners.get("focusin")();
    rail.tick(5000);
    assert.equal(rail.el.scrollLeft, 125);
    if (cause === "offscreen") rail.observers[1]([{ isIntersecting: true }]);
    if (cause === "hidden") {
      rail.document.hidden = false;
      rail.documentListeners.get("visibilitychange")();
    }
    if (cause === "focus") rail.listeners.get("focusout")({ relatedTarget: null });
    rail.tick(6000);
    rail.tick(7999);
    assert.equal(rail.el.scrollLeft, 125, `${cause} must not resume mid-slide`);
    rail.cleanup();
    assert.equal(rail.hasFrame(), false);
    assert.equal(rail.documentListeners.size, 0);
  }
});

test("centered rails honor disabled autoplay, manual pause, reduced motion, open dialogs and nonoverflow", async () => {
  for (const [config, count, paused, motion, options] of [
    [{ ...defaults.autoScroll, enabled: false }, 3, false, { matches: false }, {}],
    [defaults.autoScroll, 1, false, { matches: false }, {}],
    [defaults.autoScroll, 3, true, { matches: false }, {}],
    [defaults.autoScroll, 3, false, { matches: true }, {}],
    [defaults.autoScroll, 3, false, { matches: false }, { dialogsOpen: true }],
  ]) {
    const rail = await createRail(config, count, paused, motion, { centered: true, ...options });
    assert.equal(rail.hasFrame(), false);
    rail.cleanup();
  }
  const rail = await createRail(defaults.autoScroll, 3, false, { matches: false }, { centered: true });
  rail.el.scrollWidth = rail.el.clientWidth;
  rail.tick(0);
  assert.equal(rail.hasFrame(), false);
  rail.cleanup();
});

test("manual centering suspends autoplay without releasing a separate navigation interaction pause", async () => {
  const rail = await createRail(defaults.autoScroll, 3, false, { matches: false }, { centered: true });
  rail.tick(0);
  rail.listeners.get("rail-centering-start")();
  assert.equal(rail.hasFrame(), false);
  rail.listeners.get("rail-centering-end")();
  assert.equal(rail.hasFrame(), true);
  rail.tick(1000);
  rail.tick(3999);
  assert.equal(rail.el.scrollLeft, 0, "a full hold follows manual centering");
  rail.listeners.get("rail-interaction-start")();
  rail.listeners.get("rail-centering-start")();
  rail.listeners.get("rail-centering-end")();
  assert.equal(rail.hasFrame(), false, "navigation focus must retain its interaction pause");
  rail.listeners.get("rail-interaction-end")();
  rail.resume();
  assert.equal(rail.hasFrame(), true);
  rail.cleanup();
});

test("saved preferences inherit only missing centered timing fields and reject invalid provided timings", () => {
  const old = structuredClone(defaults);
  delete old.autoScroll.holdDurationMs;
  delete old.autoScroll.slideDurationMs;
  old.autoScroll.pixelsPerSecond = 12;
  old.layout.centeredCarousel = true;
  const migrated = validateUiPreferences(old, defaults);
  assert.deepEqual(migrated.autoScroll, { ...defaults.autoScroll, pixelsPerSecond: 12 });
  assert.equal(migrated.layout.centeredCarousel, true);
  for (const field of ["holdDurationMs", "slideDurationMs"]) {
    for (const value of [0, -1, 1.5, null, "800", 2147483648]) {
      assert.throws(() => validateUiPreferences({
        ...old, autoScroll: { ...old.autoScroll, [field]: value },
      }, defaults), new RegExp(`autoScroll\\.${field}`));
    }
  }
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
