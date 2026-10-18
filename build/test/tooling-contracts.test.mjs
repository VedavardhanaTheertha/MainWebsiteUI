import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import yaml from "js-yaml";
import { parseMarkdownFrontmatter } from "../content-utils.mjs";
import { normalizeEventDates, parseEventSource } from "../event-dates.mjs";
import { resolveHeroTitles } from "../hero-content.mjs";
import { validateSitemapLocations } from "../sitemap-utils.mjs";
import { contentSteps, generateContent } from "../pipeline.mjs";

test("event dates normalize quoted and YAML timestamp dates identically", () => {
  for (const quotes of ["", '"']) {
    const metadata = yaml.load(`start_date: ${quotes}2024-02-29${quotes}\nend_date: ${quotes}2024-03-01${quotes}`);
    const dates = normalizeEventDates(metadata, "fixture.md");
    assert.equal(dates.start_date, "2024-02-29");
    assert.equal(dates.end_date, "2024-03-01");
    assert.ok(dates.end_date < "2026-10-18");
    assert.equal(JSON.stringify(dates.end_date), '"2024-03-01"');
    const authored = parseEventSource(`---\nstart_date: ${quotes}2024-02-29${quotes}\n---\nBody`, "fixture.md");
    assert.equal(authored.metadata.start_date, "2024-02-29");
  }
  assert.equal(normalizeEventDates({ start_date: "2026-10-18" }, "fixture.md").end_date, "2026-10-18");
  assert.deepEqual(normalizeEventDates({}, "fixture.md"), { start_date: "", end_date: "" });
});

test("event dates reject invalid dates, timestamps, reversed ranges and orphan end dates", () => {
  for (const metadata of [
    { start_date: "2026-02-30" }, { start_date: "2026-13-01" }, { start_date: "yesterday" },
    { start_date: 20261018 }, { start_date: "2026-10-18T10:00:00Z" },
    { start_date: new Date("2026-10-18T10:00:00Z") }, { start_date: new Date(NaN) },
    { start_date: "2026-10-18", end_date: "2026-10-17" }, { end_date: "2026-10-18" },
  ]) assert.throws(() => normalizeEventDates(metadata, "fixture.md"), /fixture\.md/);
  assert.throws(() => parseEventSource("---\nstart_date: 2026-02-30\n---\n", "fixture.md"), /valid calendar date/);
});

test("event frontmatter errors are fatal and identify their source", () => {
  for (const text of ["Event without frontmatter", "---\ntitle: [broken\n---\nBody", "---\n- not-an-object\n---\n"]) {
    assert.throws(() => parseMarkdownFrontmatter(text, "event-fixture.md"), /event-fixture\.md/);
  }
  const source = readFileSync(new URL("../build-events-content.mjs", import.meta.url), "utf8");
  assert.match(source, /parseEventSource\(raw, sourceName\)/);
  assert.doesNotMatch(source, /Skipping.*frontmatter|Error parsing YAML/);
});

test("hero titles cover discovered languages with configured-default fallback", () => {
  assert.deepEqual(resolveHeroTitles({ title_en: "Default", title_kn: "Translated" },
    ["en", "kn", "third"], "en"), { en: "Default", kn: "Translated", third: "Default" });
  assert.deepEqual(resolveHeroTitles({ titles: { source: "Source", third: "Third" } },
    ["source", "third", "fourth"], "source"), { source: "Source", third: "Third", fourth: "Source" });
  assert.throws(() => resolveHeroTitles({ title_en: "Wrong default" }, ["third"], "third"), /default language/);
  assert.throws(() => resolveHeroTitles({ titles: { source: "Source", third: 42 } },
    ["source", "third"], "source"), /invalid title/);
});

test("sitemap membership rejects same-count duplicates, missing and unexpected routes", () => {
  const origin = "https://example.org";
  const routes = ["/", "/learn"];
  assert.deepEqual(validateSitemapLocations([`${origin}/`, `${origin}/learn`], routes, origin), []);
  for (const locations of [
    [`${origin}/`, `${origin}/`], [`${origin}/`, `${origin}/missing`],
    [`${origin}/`, "https://other.example/learn"], [`${origin}/`, `${origin}/learn?extra=1`],
    [`${origin}/`, "invalid"],
  ]) assert.ok(validateSitemapLocations(locations, routes, origin).length > 0);
  assert.ok(validateSitemapLocations([`${origin}/`], routes, origin).some((message) => message.includes("missing")));
});

test("shared content sequencing includes theme first, without duplicate generators", () => {
  const calls = [];
  generateContent((script) => calls.push(script));
  assert.deepEqual(calls, contentSteps);
  assert.equal(calls[0], "build/build-theme-settings.mjs");
  assert.equal(new Set(calls).size, calls.length);
  const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.scripts["test:unit"], "node build/test.mjs");
  const testEntry = readFileSync(new URL("../test.mjs", import.meta.url), "utf8");
  assert.ok(testEntry.indexOf("generateContent();") < testEntry.indexOf("runUnitTests();"));
  assert.equal(pkg.scripts.ci, "npm run check && npm run build:dev && npm run build:prod");
});
