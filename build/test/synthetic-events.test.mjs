import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { normalizeSearchText } from "../content-utils.mjs";
import { resolveLocalizedValues } from "../language-content.mjs";
import {
  buildSyntheticEventDates,
  generateSyntheticEventDates,
  parseSyntheticEventsSettings,
} from "../synthetic-events.mjs";

const TODAY = "2026-03-01";
const defaults = { enabled: true, maxEvents: null, dateShift: { policy: "earliest-to-today" } };
const event = (slug, startDate, endDate = startDate) => ({
  slug, startDate, endDate,
  title: { en: `Title ${slug}`, kn: `ಶೀರ್ಷಿಕೆ ${slug}` },
  description: { en: `Description ${slug}`, kn: "" },
  location: { en: "Location", kn: "ಸ್ಥಳ" },
  performers: { en: ["Performer"], kn: [] },
  categories: [{ code: "music", en: "Music", kn: "ಸಂಗೀತ" }],
  details: { en: "Unchanged details", kn: "" },
  tags: ["tag"], image: "image.jpg", recurrence: "",
});
const events = [
  event("alphabetically-first", "2026-02-20", "2026-02-22"),
  event("earliest", "2026-02-10"),
  event("ongoing", "2026-02-25", TODAY),
  event("future", "2026-03-02"),
  event("undated", ""),
];

test("defaults and committed settings preserve enabled, uncapped earliest-to-today behavior", async () => {
  assert.deepEqual(parseSyntheticEventsSettings({}), defaults);
  assert.deepEqual(parseSyntheticEventsSettings({ dateShift: {} }), defaults);
  assert.deepEqual(parseSyntheticEventsSettings(JSON.parse(await readFile(
    new URL("../../settings/dev/synthetic_events.json", import.meta.url), "utf8",
  ))), defaults);
});

test("strict root fields reject invalid values and unknown keys", () => {
  for (const value of [null, [], false, "settings", 5]) {
    assert.throws(() => parseSyntheticEventsSettings(value), /object/);
  }
  for (const enabled of [null, 0, 1, "false", undefined]) {
    assert.throws(() => parseSyntheticEventsSettings({ enabled }), /enabled/);
  }
  for (const maxEvents of [-1, 0.1, "1", false, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, undefined]) {
    assert.throws(() => parseSyntheticEventsSettings({ maxEvents }), /maxEvents/);
  }
  assert.throws(() => parseSyntheticEventsSettings({ enable: true }), /Unknown/);
  for (const maxEvents of [0, 1, Number.MAX_SAFE_INTEGER, null]) {
    assert.equal(parseSyntheticEventsSettings({ maxEvents }).maxEvents, maxEvents);
  }
});

test("date shift policy and fields are strictly validated even when disabled", () => {
  for (const dateShift of [null, [], 5, false, "fixed-offset", { policy: null }, { policy: "unknown" },
    { policy: "fixed-offset" }, { offsetDays: 2 }, { policy: "earliest-to-today", offsetDays: 0 },
    { policy: "fixed-offset", offsetDays: 2, typo: true }]) {
    assert.throws(() => parseSyntheticEventsSettings({ enabled: false, dateShift }), /dateShift/);
  }
  for (const offsetDays of [null, "2", 1.5, false, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => parseSyntheticEventsSettings({
      dateShift: { policy: "fixed-offset", offsetDays },
    }), /offsetDays/);
  }
});

test("default dates preserve event order, duration, and relative offsets without mutating input", () => {
  const original = structuredClone(events);
  const dates = buildSyntheticEventDates(events, {}, TODAY);
  assert.deepEqual(dates.map(({ event: source }) => source.slug), ["alphabetically-first", "earliest"]);
  assert.deepEqual(dates.map(({ startDate, endDate }) => [startDate, endDate]), [
    ["2026-03-11", "2026-03-13"], [TODAY, TODAY],
  ]);
  assert.deepEqual(dates[0].displayDate, {
    en: "11 March 2026 - 13 March 2026", kn: "11 ಮಾರ್ಚ್ 2026 - 13 ಮಾರ್ಚ್ 2026",
  });
  assert.deepEqual(dates[1].displayDate, { en: "1 March 2026", kn: "1 ಮಾರ್ಚ್ 2026" });
  assert.deepEqual(events, original);
});

test("caps select the first qualifying catalog entries but shift relative to all qualifying events", () => {
  const uncapped = buildSyntheticEventDates(events, {}, TODAY);
  assert.deepEqual(buildSyntheticEventDates(events, { maxEvents: 1 }, TODAY), uncapped.slice(0, 1));
  assert.deepEqual(buildSyntheticEventDates(events, { maxEvents: 99 }, TODAY), uncapped);
  assert.deepEqual(buildSyntheticEventDates(events, { maxEvents: 0 }, TODAY), []);
  assert.deepEqual(buildSyntheticEventDates(events, { enabled: false }, TODAY), []);
  assert.deepEqual(buildSyntheticEventDates([], {}, TODAY), []);
});

test("fixed offsets support negative, zero, and positive days across UTC calendar boundaries", () => {
  for (const [offsetDays, expected] of [[-1, "2024-02-28"], [0, "2024-02-29"], [1, "2024-03-01"]]) {
    const [result] = buildSyntheticEventDates([event("leap", "2024-02-29")], {
      dateShift: { policy: "fixed-offset", offsetDays },
    }, TODAY);
    assert.equal(result.startDate, expected);
    assert.equal(result.endDate, expected);
  }
  const [result] = buildSyntheticEventDates([event("new-year", "2025-12-31")], {
    dateShift: { policy: "fixed-offset", offsetDays: 1 },
  }, TODAY);
  assert.equal(result.startDate, "2026-01-01");
});

test("invalid source dates and reversed ranges are not eligible; missing end dates use start dates", () => {
  const invalid = ["2026:01- 18", "2025-02-29", "2026-02-30", "2026-13-01", "2026-2-01",
    new Date("2026-03-01T00:00:00.000Z")];
  assert.deepEqual(buildSyntheticEventDates(invalid.map((date, index) => event(String(index), date)), {}, TODAY), []);
  assert.deepEqual(buildSyntheticEventDates([event("reversed", "2026-02-20", "2026-02-19")], {}, TODAY), []);
  assert.equal(buildSyntheticEventDates([event("no-end", "2026-02-01", "")], {}, TODAY)[0].endDate, TODAY);
  for (const today of ["2026-02-30", "invalid", new Date("2026-03-01T00:00:00.000Z")]) {
    assert.throws(() => buildSyntheticEventDates(events, {}, today), /today/);
  }
});

test("date overflow is rejected instead of serializing broken dates", () => {
  for (const offsetDays of [Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, 4000000, -4000000]) {
    assert.throws(() => buildSyntheticEventDates(events, {
      dateShift: { policy: "fixed-offset", offsetDays },
    }, TODAY), /outside/);
  }
});

test("invalid source ranges warn with the source filename and exact dates without changing real events", () => {
  const source = [
    event("malformed", "2026:01- 18"),
    event("invalid-end", "2026-02-01", "2026-02-30"),
    event("reversed", "2026-02-20", "2026-02-19"),
    event("undated", ""),
  ];
  const original = structuredClone(source);
  const warnings = [];
  assert.deepEqual(buildSyntheticEventDates(source, {}, TODAY, {
    warn: (message) => warnings.push(message),
  }), []);
  assert.equal(warnings.length, 3);
  for (const [index, slug] of ["malformed", "invalid-end", "reversed"].entries()) {
    assert.ok(warnings[index].startsWith(`[events] Skipping synthetic duplicate for ${slug}.md`));
    assert.ok(warnings[index].includes(`start_date=${JSON.stringify(source[index].startDate)}`));
    assert.ok(warnings[index].includes(`end_date=${JSON.stringify(source[index].endDate)}`));
  }
  assert.deepEqual(source, original);
});

test("dev and local read exactly the same dev configuration", async () => {
  for (const envName of ["dev", "local"]) {
    const reads = [];
    const dates = await generateSyntheticEventDates(events, {
      envName, rootDir: "fixture-root", today: TODAY,
      readConfig: async (...args) => {
        reads.push(args);
        return JSON.stringify({ maxEvents: 1 });
      },
    });
    assert.deepEqual(reads, [[path.join("fixture-root", "settings", "dev", "synthetic_events.json"), "utf8"]]);
    assert.equal(dates.length, 1);
  }
});

test("production and unsupported environments never read settings or inspect events", async () => {
  const unusableEvents = new Proxy([], { get() { throw new Error("must not inspect events"); } });
  for (const envName of ["prod", "production", "staging", "", undefined]) {
    assert.deepEqual(await generateSyntheticEventDates(unusableEvents, {
      envName, today: "invalid",
      readConfig: () => { throw new Error("must not read settings"); },
    }), []);
  }
});

test("missing files, malformed JSON, and invalid file fields fail clearly for dev/local", async () => {
  for (const envName of ["dev", "local"]) {
    for (const readConfig of [
      async () => { throw new Error("ENOENT"); },
      async () => "{",
    ]) {
      await assert.rejects(generateSyntheticEventDates(events, {
        envName, rootDir: ".", today: TODAY, readConfig,
      }), /Unable to read synthetic event settings/);
    }
    await assert.rejects(generateSyntheticEventDates(events, {
      envName, rootDir: ".", today: TODAY, readConfig: async () => '{"maxEvent":2}',
    }), /Unknown/);
  }
});

test("generator block preserves duplicate labels, slugs, search text and untouched serialized fields", async () => {
  const source = await readFile(new URL("../build-events-content.mjs", import.meta.url), "utf8");
  const block = source.slice(source.indexOf("// 3."), source.indexOf("// 4."));
  assert.ok(block.includes("generateSyntheticEventDates"), "exercise the actual generator integration");
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const run = new AsyncFunction("realCatalog", "envName", "rootDir", "today", "normalizeSearchText",
    "generateSyntheticEventDates", "languageCodes", "defaultLanguage", "resolveLocalizedValues", `${block}\nreturn realCatalog;`);
  const catalog = structuredClone(events);
  const output = await run(catalog, "dev", ".", TODAY, normalizeSearchText,
    (input, options) => generateSyntheticEventDates(input, {
      ...options, readConfig: async () => "{}",
    }), ["en", "kn"], "en", resolveLocalizedValues);
  const duplicate = output[events.length];
  assert.equal(output.length, events.length + 2);
  assert.equal(duplicate.slug, `duplicate-${events[0].slug}`);
  assert.equal(duplicate.title.en, `Duplicate event for testing: ${events[0].title.en}`);
  assert.equal(duplicate.title.kn, `Duplicate event for testing: ${events[0].title.kn}`);
  assert.equal(duplicate.description.en, `Duplicate event for testing: ${events[0].description.en}`);
  assert.equal(duplicate.description.kn, "Duplicate event for testing:");
  assert.match(duplicate.searchText, /duplicate event for testing/);
  for (const key of ["details", "image", "categories", "performers", "tags", "recurrence"]) {
    assert.equal(JSON.stringify(duplicate[key]), JSON.stringify(events[0][key]), key);
  }
  const production = structuredClone(events);
  assert.deepEqual(await run(production, "prod", ".", TODAY, normalizeSearchText,
    generateSyntheticEventDates, ["en", "kn"], "en", resolveLocalizedValues), events);
});
