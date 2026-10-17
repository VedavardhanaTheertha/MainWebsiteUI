import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parseSevaImage } from "../seva-image.mjs";

async function loadHelper(name) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(await readFile(
    new URL(`../../src/lib/${name}.ts`, import.meta.url), "utf8",
  ), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
  { exports, URL, TextEncoder });
  return exports;
}
const { matchesEventDates, createEventCalendar, eventDetailUrl } = await loadHelper("event-tools");
const { filterAndSortSevas } = await loadHelper("seva-filtering");
const event = {
  slug: "festival", startDate: "2026-10-31", endDate: "2026-11-02",
  startTime: "7:00 PM", endTime: "21:30",
};
const calendar = (value) => createEventCalendar(value, "Title, test", "Line 1\nLine 2",
  "Venue", "https://example.org/events/?event=festival");

test("event filters include overlapping ranges/months and reject reversed or disjoint ranges", () => {
  assert.equal(matchesEventDates(event, "2026-11-01", "2026-11-01", ""), true);
  assert.equal(matchesEventDates(event, "", "", "2026-11"), true);
  assert.equal(matchesEventDates(event, "", "", "2026-12"), false);
  assert.equal(matchesEventDates(event, "2026-11-03", "", ""), false);
  assert.equal(matchesEventDates(event, "2026-11-02", "2026-11-01", ""), false);
  assert.equal(matchesEventDates({ ...event, startDate: "" }, "", "", ""), true);
  assert.equal(matchesEventDates({ ...event, startDate: "" }, "", "", "2026-11"), false);
});

test("calendar converts structured IST times to unambiguous UTC without inventing duration", () => {
  const result = calendar(event);
  assert.match(result, /DTSTART:20261031T133000Z\r\n/);
  assert.match(result, /DTEND:20261102T160000Z\r\n/);
  assert.doesNotMatch(result, /TZID/);
  assert.match(result, /SUMMARY:Title\\, test/);
  assert.match(result, /DESCRIPTION:Line 1\\nLine 2/);
  assert.doesNotMatch(calendar({ ...event, endTime: "" }), /DTEND/);
});

test("IST calendar conversion handles midnight, noon and previous UTC date/year boundaries", () => {
  const value = { ...event, startDate: "2026-01-01", endDate: "2026-01-01", startTime: "12:00 AM", endTime: "12:00 PM" };
  const result = calendar(value);
  assert.match(result, /DTSTART:20251231T183000Z\r\n/);
  assert.match(result, /DTEND:20260101T063000Z\r\n/);
  assert.match(calendar({ ...value, startDate: "2024-03-01", endDate: "2024-03-01", startTime: "00:15", endTime: "01:00" }),
    /DTSTART:20240229T184500Z\r\n/);
});

test("calendar exports ambiguous/missing times as date-only inclusive days and rejects invalid dates", () => {
  for (const startTime of ["evening", "", "25:00", "7:80 PM"]) {
    const result = calendar({ ...event, startTime });
    assert.match(result, /DTSTART;VALUE=DATE:20261031\r\n/);
    assert.match(result, /DTEND;VALUE=DATE:20261103\r\n/);
  }
  assert.match(calendar({ ...event, endTime: "after supper" }), /DTSTART;VALUE=DATE/);
  assert.match(calendar({ ...event, endDate: event.startDate, endTime: "18:00" }), /DTSTART;VALUE=DATE/);
  assert.equal(calendar({ ...event, startDate: "2026-02-30" }), null);
});

test("calendar folds multilingual text into lines no longer than 75 UTF-8 bytes", () => {
  const result = createEventCalendar(event, "ದೇವರ ಪೂಜೆ ".repeat(25), "", "", "https://example.org");
  for (const line of result.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  assert.ok(result.includes("\r\n "));
});

test("detail URLs preserve origin/base path, other parameters and encoded slugs", () => {
  const url = new URL(eventDetailUrl("https://example.org/preview/events/?lang=x#section", "festival & music"));
  assert.equal(url.pathname, "/preview/events/");
  assert.equal(url.searchParams.get("event"), "festival & music");
  assert.equal(url.searchParams.get("lang"), "x");
  const homepageLink = new URL(eventDetailUrl("https://example.org/preview/#home", "past-event", "/preview/events/"));
  assert.equal(homepageLink.pathname, "/preview/events/");
  assert.equal(homepageLink.hash, "");
});

const sevas = [
  { id: "a", amount: 500, deity: { en: "one" }, category: { code: "daily" } },
  { id: "b", amount: 0, deity: { en: "one" }, category: { code: "daily" } },
  { id: "c", amount: 250, deity: { en: "two" }, category: { code: "special" } },
  { id: "d", amount: 500, deity: { en: "two" }, category: { code: "special" } },
];
const filter = (...args) => Array.from(filterAndSortSevas(sevas, ...args, "en"), (seva) => seva.id);
test("seva filters intersect deity/category/amount, including zero, without mutating sources", () => {
  assert.deepEqual(filter("daily", "one", "0", "500", "ascending"), ["b", "a"]);
  assert.deepEqual(filter("", "two", "250", "500", "descending"), ["d", "c"]);
  assert.deepEqual(filter("", "", "", "", "ascending"), ["b", "c", "a", "d"]);
  assert.deepEqual(filter("", "", "", "", "descending"), ["a", "d", "c", "b"]);
  assert.deepEqual(filter("", "", "600", "500", ""), []);
  assert.deepEqual(sevas.map((seva) => seva.id), ["a", "b", "c", "d"]);
});

test("seva deity filters use configured-default keys independently of displayed translations", () => {
  const records = [
    { amount: 10, category: { code: "daily" }, deity: { selected: "Shown", configured: "Stable" } },
    { amount: 20, category: { code: "daily" }, deity: { selected: "Other", configured: "Other stable" } },
  ];
  assert.deepEqual(Array.from(filterAndSortSevas(records, "", "Stable", "", "", "", "configured")),
    [records[0]]);
});

test("optional approved seva images accept HTTPS/root paths, never unsafe URLs", () => {
  assert.equal(parseSevaImage(undefined, "source"), "");
  assert.equal(parseSevaImage("/images/offering.webp", "source"), "/images/offering.webp");
  assert.equal(parseSevaImage("https://example.org/offering.webp", "source"), "https://example.org/offering.webp");
  for (const value of ["javascript:alert(1)", "//example.org/image", "http://example.org/image", {}, "/\\example.org/image"]) {
    assert.throws(() => parseSevaImage(value, "source"), /image/);
  }
});
