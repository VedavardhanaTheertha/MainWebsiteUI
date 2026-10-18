import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";
import MarkdownIt from "markdown-it";
import { fileURLToPath } from "node:url";
import { loadAuthoredLanguage } from "../authored-content.mjs";
import { bhaktiSummaryModule, compositionTypeFromMetadata } from "../bhakti-metadata.mjs";

const source = readFileSync(new URL("../../src/lib/reader-utils.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { matchesBhaktiFilter, formatArticleDate, copyReaderLink } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("Bhakti exact facets intersect and leave compositions without optional types discoverable", () => {
  const item = { kruti: "composer", ankita: "signature", compositionType: "type" };
  assert.equal(matchesBhaktiFilter(item, "composer", "signature", "type"), true);
  assert.equal(matchesBhaktiFilter(item, "other", "", ""), false);
  assert.equal(matchesBhaktiFilter(item, "", "other", ""), false);
  assert.equal(matchesBhaktiFilter(item, "", "", "other"), false);
  assert.equal(matchesBhaktiFilter({ kruti: "", ankita: "" }, "", "", ""), true);
});

test("composition types come only from optional source metadata", () => {
  assert.equal(compositionTypeFromMetadata({ id: "fixture" }), "");
  assert.equal(compositionTypeFromMetadata({ compositionType: " supplied type " }), "supplied type");
  assert.throws(() => compositionTypeFromMetadata({ compositionType: 12 }), /compositionType/);
  assert.throws(() => compositionTypeFromMetadata({ compositionType: "" }), /compositionType/);
});

test("Bhakti hub counts use a tiny metadata module rather than importing the catalog", () => {
  const module = bhaktiSummaryModule(42);
  assert.ok(module.includes("export const bhaktiItemCount: number = 42;"));
  assert.ok(!module.includes("import "));
  assert.ok(bhaktiSummaryModule(0).includes("= 0;"));
  assert.throws(() => bhaktiSummaryModule(-1), /count/);
});

test("article dates are timezone-stable and tolerate invalid locale descriptors", () => {
  assert.ok(formatArticleDate("2026-07-14", "en").includes("14"));
  assert.equal(formatArticleDate("2026-07-14", "invalid_locale"), "2026-07-14");
  assert.equal(formatArticleDate("not-a-date", "en"), "not-a-date");
});

test("copy link reports unavailable clipboard instead of throwing", async () => {
  assert.equal(await copyReaderLink("https://example.org/#composition"), false);
});

test("language copy supplies every Bhakti control in each discovered language", () => {
  const directory = new URL("../../content/languages/", import.meta.url);
  const content = readdirSync(directory).filter((file) => file.endsWith(".json"))
    .map((file) => loadAuthoredLanguage(fileURLToPath(new URL("../../", import.meta.url)), file.slice(0, -5)));
  for (const group of ["bhakti_controls"]) {
    const keys = Object.keys(content[0][group]).sort();
    for (const language of content) {
      assert.deepEqual(Object.keys(language[group]).sort(), keys);
      assert.ok(Object.values(language[group]).every((value) => typeof value === "string" && value.trim()));
    }
  }
});
