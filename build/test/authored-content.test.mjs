import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { loadAuthoredLanguage } from "../authored-content.mjs";
import { applyNavigation, loadNavigation } from "../navigation-content.mjs";

const root = path.resolve(import.meta.dirname, "../..");

test("authored language loading reports malformed or non-object UI JSON with its source", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "website-authored-"));
  t.after(() => rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  const languages = path.join(directory, "content", "languages");
  await mkdir(languages, { recursive: true });
  const file = path.join(languages, "example.json");
  await writeFile(file, "{ invalid JSON");
  assert.throws(() => loadAuthoredLanguage(directory, "example"), /example\.json: invalid language JSON/);
  for (const value of [null, [], "text", 1]) {
    await writeFile(file, JSON.stringify(value));
    assert.throws(() => loadAuthoredLanguage(directory, "example"), /example\.json: language UI content must be an object/);
  }
});

test("navigation labels inherit missing translations before settings resolve order and routes", () => {
  const source = readFileSync(path.join(root, "scripts", "generate-content.mjs"), "utf8");
  const start = source.indexOf("function mergeOverDefault(");
  const end = source.indexOf("\n/**", start);
  const merge = vm.runInNewContext(`${source.slice(start, end)}\nmergeOverDefault`, {
    isPlainObject: (value) => value !== null && typeof value === "object" && !Array.isArray(value),
  });
  const labels = JSON.parse(readFileSync(path.join(root, "content", "languages", "en.json"), "utf8"));
  const settings = loadNavigation(root);
  const first = settings.menu[0].key;
  const fallbacks = [];
  const merged = merge(labels, { nav: { [first]: { label: "Partial translation" } } }, fallbacks);
  const result = applyNavigation(merged, settings);
  assert.equal(result.nav.length, settings.menu.length);
  assert.equal(result.nav[0].label, "Partial translation");
  assert.equal(result.nav[1].label, labels.nav[settings.menu[1].key].label);
  assert.equal(result.nav[0].href, settings.menu[0].href);
  assert.ok(fallbacks.includes(`nav.${settings.menu[1].key}`));
  assert.match(source, /applyNavigation\(translated, navigation\)/);
});
