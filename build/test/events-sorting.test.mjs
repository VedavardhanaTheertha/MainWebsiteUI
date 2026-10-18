import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import { loadAuthoredLanguage } from "../authored-content.mjs";

const compile = (source) => ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  },
}).outputText;
const helpers = {};
const eventTools = {};
const categoryTones = {};
vm.runInNewContext(compile(await readFile(
  new URL("../../src/lib/category-tones.ts", import.meta.url), "utf8",
)), { exports: categoryTones });
vm.runInNewContext(compile(await readFile(
  new URL("../../src/lib/event-tools.ts", import.meta.url), "utf8",
)), { exports: eventTools, URL, TextEncoder });
const warnings = [];
vm.runInNewContext(compile(await readFile(
  new URL("../../src/lib/event-sorting.ts", import.meta.url), "utf8",
)), { exports: helpers, console: { warn: (message) => warnings.push(message) } });
const sort = (events, order) => Array.from(helpers.sortEventsByDateTime(events, order));
const event = (slug, startDate, startTime = "") => ({
  slug, startDate, startTime,
  title: { en: slug, kn: slug }, displayDate: { en: startDate, kn: startDate },
  time: { en: startTime, kn: startTime }, location: {}, description: {},
  categories: [{ code: "concert", en: "Concert", kn: "Concert" }],
});

test("event sorting compares dates and 12/24-hour times, including noon, midnight and seconds", () => {
  const events = [
    event("evening", "2026-10-17", "06:30 PM"),
    event("next-day", "2026-10-18", "00:00"),
    event("noon", "2026-10-17", "12:00 PM"),
    event("midnight", "2026-10-17", "12:00 AM"),
    event("morning-seconds", "2026-10-17", "09:00:01"),
    event("morning", "2026-10-17", "9:00 am"),
  ];
  const expected = ["midnight", "morning", "morning-seconds", "noon", "evening", "next-day"];
  const before = JSON.stringify(events);
  assert.deepEqual(sort(events, "earliest").map((item) => item.slug), expected);
  assert.deepEqual(sort(events, "latest").map((item) => item.slug), [...expected].reverse());
  assert.equal(JSON.stringify(events), before, "does not mutate catalogs or their items");
  assert.equal(warnings.length, 0);
});

test("unknown times follow timed entries per day; invalid dates stay last in both directions", () => {
  warnings.length = 0;
  const events = [
    event("unknown", "2026-10-17"),
    event("invalid-date", "2026-02-30", "10:00"),
    event("timed", "2026-10-17", "09:00"),
    event("invalid-time", "2026-10-17", "25:00"),
    event("previous-day", "2026-10-16"),
  ];
  assert.deepEqual(sort(events, "earliest").map((item) => item.slug),
    ["previous-day", "timed", "unknown", "invalid-time", "invalid-date"]);
  assert.deepEqual(sort(events, "latest").map((item) => item.slug),
    ["timed", "unknown", "invalid-time", "previous-day", "invalid-date"]);
  assert.ok(warnings.some((message) => /invalid-date.*2026-02-30/.test(message)));
  assert.ok(warnings.some((message) => /invalid-time.*25:00/.test(message)));
  for (const startTime of ["00:30 PM", "13:00 AM", "09:60", "09:00:60", "later"]) {
    const before = warnings.length;
    sort([event("bad-time", "2026-10-17", startTime)], "earliest");
    assert.equal(warnings.length, before + 1, startTime);
  }
});

test("equal timestamps preserve input order and display copy does not affect ordering", () => {
  const items = [event("a", "2024-02-29", "12:00"), event("b", "2024-02-29", "12:00 PM")];
  for (const item of items) {
    item.time = { en: "display only", kn: "localized display only" };
    item.displayDate = { en: "display only", kn: "localized display only" };
  }
  for (const order of ["earliest", "latest"]) {
    assert.deepEqual(sort(items, order).map((item) => item.slug), ["a", "b"]);
    assert.deepEqual(sort([], order), []);
  }
});

async function mountEvents(options = {}) {
  const copy = loadAuthoredLanguage(fileURLToPath(new URL("../../", import.meta.url)), "en");
  const upcoming = [
    event("late", "2026-10-18", "18:00"), event("early", "2026-10-17", "09:00"),
    event("noon", "2026-10-17", "12:00 PM"), event("evening", "2026-10-17", "06:00 PM"),
  ];
  upcoming[0].categories = [{ code: "festival" }];
  const past = [event("old", "2025-01-01", "09:00"), event("recent", "2025-02-01", "09:00")];
  let stateIndex = 0;
  let pastLoads = 0;
  const state = [];
  const effects = [];
  const timers = [];
  const listeners = new Map();
  const location = { href: `https://example.org/preview/events/${options.slug ? `?event=${options.slug}` : ""}` };
  const window = {
    location,
    history: { pushState: (_state, _unused, url) => { location.href = String(url); } },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  const exports = {};
  const jsx = (type, props, key) => ({ type, props, key });
  vm.runInNewContext(compile(await readFile(
    new URL("../../src/components/EventsExact.tsx", import.meta.url), "utf8",
  )), {
    exports, console: { ...console, error: () => {} }, window, URL,
    setTimeout: (callback) => { timers.push(callback); return timers.length; },
    clearTimeout: () => {},
    require: (name) => {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        useState: (initial) => {
          const index = stateIndex++;
          if (!(index in state)) state[index] = initial;
          return [state[index], (value) => {
            state[index] = typeof value === "function" ? value(state[index]) : value;
          }];
        },
        useMemo: (calculate) => calculate(),
        useCallback: (callback, deps) => {
          const index = stateIndex++;
          const previous = state[index];
          if (!previous || deps.some((value, i) => value !== previous.deps[i])) state[index] = { callback, deps };
          return state[index].callback;
        },
        useDeferredValue: (value) => value,
        useRef: (initial) => {
          const index = stateIndex++;
          if (!(index in state)) state[index] = { current: initial };
          return state[index];
        },
        useEffect: (callback, deps) => {
          const index = stateIndex++;
          const previous = state[index];
          if (!previous || deps.some((value, i) => value !== previous[i])) effects.push(callback);
          state[index] = deps;
        },
      };
      if (name === "@/context/LanguageContext") return {
        useLang: () => ({ tr: copy, lang: "test", contentMode: "real" }),
      };
      if (name === "@/gen/events/data") return { realEvents: upcoming, placeholderEvents: upcoming };
      if (name === "@/gen/events/loaders") return {
        loadPastEvents: async () => {
          pastLoads++;
          if (options.failOnce && pastLoads === 1) throw new Error("offline");
          return { realPastEvents: past, placeholderPastEvents: past };
        },
      };
      if (name === "@/hooks/useMiniSearch") return {
        useMiniSearch: (items, query) => items.filter((item) => item.slug.includes(query)),
        useLazyMiniSearch: (items, query) => ({
          results: items.filter((item) => item.slug.includes(query)),
          ensureLoaded: () => {},
        }),
      };
      if (name === "@/lib/search") return { getSearchProfile: () => ({ fields: [] }) };
      if (name === "@/lib/localization") return {
        localized: (value, lang) => value?.[lang] ?? value?.en,
        localizedText: (value, lang) => value?.[lang] ?? value?.en ?? "",
      };
      if (name === "@/lib/event-sorting") return helpers;
      if (name === "@/lib/event-tools") return eventTools;
      if (name === "@/lib/category-tones") return categoryTones;
      if (name === "@/lib/images") return { imagePaths: {} };
      if (name === "@/gen/settings/ui-elements") return {
        collectionPagination: { initialVisible: 2, loadIncrement: 2 },
        browserDefaults: { eventsUpcomingSort: "earliest", eventsPastSort: "latest", ...options.defaults },
      };
      if (name === "next/image" || name === "./EventDetailModal" || name === "./AdvancedFilters") return { default: name, __esModule: true };
      if (name === "@/components/presentation/ContentImage") return { default: "image", __esModule: true };
      if (name === "lucide-react") return {};
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const render = () => {
    stateIndex = 0;
    exports.default();
    stateIndex = 0;
    return exports.default();
  };
  const nodes = (node, predicate) => {
    if (!node || typeof node !== "object") return [];
    const children = [node.props?.children, node.props?.search, node.props?.heading].flat(Infinity);
    return [...(predicate(node) ? [node] : []), ...children.flatMap((child) => nodes(child, predicate))];
  };
  return {
    cards: () => nodes(render(), (node) => node.type === "article").map((node) => node.key),
    select: () => nodes(render(), (node) => node.type === "select")[0],
    click: (label) => {
      const button = nodes(render(), (node) => node.type === "button" && node.props.children === label)[0];
      assert.ok(button, `button exists: ${label}`);
      button.props.onClick();
    },
    search: (query) => nodes(render(), (node) => node.type === "input" && node.props.type === "search")[0]
      .props.onChange({ target: { value: query } }),
    copy,
    date: (type, value, position = 0) => nodes(render(), (node) =>
      node.type === "input" && node.props.type === type)[position].props.onChange({ target: { value } }),
    status: () => nodes(render(), (node) => node.props?.role === "status").map((node) => node.props.children),
    modal: () => nodes(render(), (node) => node.type === "./EventDetailModal")[0],
    async settle() {
      for (let i = 0; i < 6; i++) {
        render();
        effects.splice(0).forEach((callback) => callback());
        timers.splice(0).forEach((callback) => callback());
        await Promise.resolve();
      }
    },
    popTo(slug) {
      location.href = `https://example.org/preview/events/?event=${slug}`;
      listeners.get("popstate")?.();
    },
    get href() { return location.href; },
    get pastLoads() { return pastLoads; },
  };
}

test("Events control sorts before pagination, resets pagination and preserves search/category filtering", async () => {
  const page = await mountEvents();
  assert.equal(page.select().props.value, "earliest");
  assert.deepEqual(page.cards(), ["early", "noon"]);
  page.click(page.copy.events_exact.show_more);
  assert.deepEqual(page.cards(), ["early", "noon", "evening", "late"]);
  page.select().props.onChange({ target: { value: "latest" } });
  assert.deepEqual(page.cards(), ["late", "evening"], "sorting resets pagination and includes the full catalog");
  page.click(page.copy.events_exact.tabs.find((tab) => tab.id === "concert").label);
  assert.equal(page.select().props.value, "latest", "upcoming category changes preserve direction");
  assert.deepEqual(page.cards(), ["evening", "noon"]);
  page.search("noon");
  assert.deepEqual(page.cards(), ["noon"]);
  assert.equal(page.pastLoads, 0, "past data is still lazy loaded");
});

test("entering past defaults to latest; returning to upcoming defaults to earliest", async () => {
  const page = await mountEvents();
  page.click(page.copy.events_exact.tabs.find((tab) => tab.id === "past").label);
  await Promise.resolve();
  assert.equal(page.select().props.value, "latest");
  assert.deepEqual(page.cards(), ["recent", "old"]);
  page.select().props.onChange({ target: { value: "earliest" } });
  assert.deepEqual(page.cards(), ["old", "recent"]);
  page.click(page.copy.events_exact.tabs.find((tab) => tab.id === "upcoming").label);
  assert.equal(page.select().props.value, "earliest");
  assert.deepEqual(page.cards(), ["early", "noon"]);
});

test("date/month controls update counts and reset pagination alongside existing sorting", async () => {
  const page = await mountEvents();
  page.click(page.copy.events_exact.show_more);
  page.date("date", "2026-10-18");
  assert.deepEqual(page.cards(), ["late"]);
  assert.ok(page.status().includes(page.copy.events_exact.results_template.replace("{n}", "1")));
  page.date("month", "2026-11");
  assert.deepEqual(page.cards(), []);
  page.click(page.copy.events_exact.clear_filters);
  assert.deepEqual(page.cards(), ["early", "noon"]);
});

test("configured event directions apply to initial, clear, tab and deep-link paths", async () => {
  const defaults = { eventsUpcomingSort: "latest", eventsPastSort: "earliest" };
  const page = await mountEvents({ defaults });
  assert.equal(page.select().props.value, "latest");
  page.select().props.onChange({ target: { value: "earliest" } });
  page.click(page.copy.events_exact.clear_filters);
  assert.equal(page.select().props.value, "latest");
  page.click(page.copy.events_exact.tabs.find((tab) => tab.id === "past").label);
  await Promise.resolve();
  assert.equal(page.select().props.value, "earliest");
  page.select().props.onChange({ target: { value: "latest" } });
  page.click(page.copy.events_exact.clear_filters);
  assert.equal(page.select().props.value, "earliest");
  page.click(page.copy.events_exact.tabs.find((tab) => tab.id === "upcoming").label);
  assert.equal(page.select().props.value, "latest");
  const linked = await mountEvents({ defaults, slug: "recent" });
  await linked.settle();
  assert.equal(linked.select().props.value, "earliest");
});

test("deep links resolve lazy past details, recover from load failure and support history", async () => {
  const page = await mountEvents({ slug: "recent", failOnce: true });
  await page.settle();
  assert.equal(page.pastLoads, 1);
  assert.equal(page.modal().props.event, null);
  page.click(page.copy.events_exact.retry);
  await page.settle();
  assert.equal(page.pastLoads, 2);
  assert.equal(page.modal().props.event.slug, "recent");
  assert.equal(page.select().props.value, "latest");
  page.modal().props.onClose();
  assert.equal(new URL(page.href).searchParams.has("event"), false);
  page.popTo("early");
  await page.settle();
  assert.equal(page.modal().props.event.slug, "early");
});

test("upcoming and missing detail links do not eagerly reload past data", async () => {
  const upcoming = await mountEvents({ slug: "early" });
  await upcoming.settle();
  assert.equal(upcoming.pastLoads, 0);
  assert.equal(upcoming.modal().props.event.slug, "early");
  const missing = await mountEvents({ slug: "missing" });
  await missing.settle();
  assert.equal(missing.pastLoads, 1);
  assert.equal(missing.modal().props.event, null);
  assert.ok(missing.status().includes(missing.copy.events_exact.event_not_found));
  missing.search("recent");
  assert.deepEqual(missing.cards(), ["recent"], "past search uses the loaded catalog");
});
