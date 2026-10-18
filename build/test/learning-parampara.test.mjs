import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { loadAuthoredLanguage } from "../authored-content.mjs";
import { discoverParampara } from "../parampara-content.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const read = (file) => readFileSync(path.join(root, file), "utf8");
const helper = {};
runInNewContext(ts.transpileModule(read("src/lib/learn.ts"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: helper, URL });

test("learning links use stable detail routes or supplied safe destinations", () => {
  assert.equal(helper.learningDestination({ id: "vedic-recitation" }), "/learn/vedic-recitation");
  assert.equal(helper.learningDestination({ id: "subject", href: "https://example.org/course" }), "https://example.org/course");
  assert.equal(helper.learningDestination({ id: "subject", href: "javascript:alert(1)" }), "/learn/subject");
  assert.equal(helper.learningDestination({ title: "Unpublished" }), null);
  assert.equal(helper.learningDestination({ id: "../outside" }), null);
});

test("enrollment URLs reject placeholders, credentials, scripts and protocol-relative URLs", () => {
  for (const href of ["#", "", "//example.org", "/\\example.org", "javascript:alert(1)", "https://user:secret@example.org", " https://example.org"]) {
    assert.equal(helper.approvedLearningUrl(href), null, href);
  }
  assert.equal(helper.approvedLearningUrl("/approved-registration"), "/approved-registration");
  assert.equal(helper.approvedLearningUrl("https://example.org/register"), "https://example.org/register");
});

test("learning translations preserve the existing subjects and use genuine source descriptions", () => {
  const source = loadAuthoredLanguage(root, "en");
  const translated = loadAuthoredLanguage(root, "kn");
  assert.equal(source.learn.length, 4);
  assert.deepEqual(source.learn.map((item) => item.id), translated.learn.map((item) => item.id));
  for (const content of [source, translated]) {
    const ids = new Set(content.learn.map((item) => item.id));
    for (const item of content.learn) {
      assert.ok(item.description);
      assert.equal(item.enrollmentUrl, undefined);
      assert.ok(helper.learningDestination(item));
    }
    for (const route of content.pages.learn.suggested_paths) {
      assert.ok(route.itemIds.every((id) => ids.has(id)));
    }
  }
  assert.deepEqual(Object.keys(source.pages.local_copy), Object.keys(translated.pages.local_copy));
});

let paramparaFixtureNumber = 0;
function createParamparaFixture(t) {
  const fixtureRoot = path.join(root, "build", `.learning-parampara-fixture-${process.pid}-${paramparaFixtureNumber++}`);
  const directory = path.join(fixtureRoot, "library", "parampara");
  mkdirSync(directory, { recursive: true });
  t.after(() => rm(fixtureRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  return (item) => {
    const metadata = {
      id: "teacher", name: "Source name", summary: "Source summary",
      ...item,
    };
    const frontmatter = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n");
    writeFileSync(path.join(directory, "00-teacher.md"),
      `---\n${frontmatter}\n---\n\n# Source name\n\nSource summary\n\n## Details\n`);
    return discoverParampara(fixtureRoot, ["base"], "base");
  };
}

test("Parampara optional references remain absent unless source supplies them", (t) => {
  const discover = createParamparaFixture(t);
  const result = discover({}).base[0];
  assert.equal(result.references, undefined);
  assert.equal(result.relatedPlaces, undefined);
  assert.equal(result.relatedWorks, undefined);
});

test("Parampara references, places and works preserve supplied labels and safe URLs", (t) => {
  const discover = createParamparaFixture(t);
  for (const field of ["references", "relatedPlaces", "relatedWorks"]) {
    const result = discover({ [field]: [{ label: "Source reference", href: "https://example.org/source" }, { label: "Local place", href: "/connect" }] }).base[0];
    assert.equal(result[field][0].label, "Source reference");
    assert.equal(result[field][1].href, "/connect");
    for (const invalid of [null, "invalid", [{ label: "", href: "/connect" }], [{ label: "Unsafe", href: "javascript:alert(1)" }], [{ label: "Unsafe", href: "//example.org" }]]) {
      assert.throws(() => discover({ [field]: invalid }), /must be an array|needs a label/);
    }
  }
});

test("Parampara browser uses shared dialog and MiniSearch without independent scroll locking", () => {
  const source = read("src/components/ParamparaBrowser.tsx");
  assert.match(source, /useDialog\(Boolean\(selected\), closeGuru\)/);
  assert.match(source, /useMiniSearch\(gurus, query, \{ fields: \["name"\] \}\)/);
  assert.doesNotMatch(source, /document\.body\.style\.overflow|addEventListener\("keydown"/);
  assert.match(read("src/components/ParamparaDetailPage.tsx"), /previousGuru\.name/);
  assert.match(read("src/components/ParamparaDetailPage.tsx"), /nextGuru\.name/);
});

test("owned non-home pages have no literal prose in JSX", () => {
  const files = [
    "src/app/learn/page.tsx", "src/app/volunteer/page.tsx",
    "src/app/panchanga/page.tsx", "src/app/privacy/page.tsx", "src/app/terms/page.tsx",
    "src/app/refund/page.tsx", "src/app/events/mantra-yajna/page.tsx",
    "src/app/learn/[id]/page.tsx", "src/app/history/parampara/page.tsx",
    "src/app/history/parampara/[id]/page.tsx", "src/components/MantraYajnaPageContent.tsx",
    "src/components/LearningDetailPage.tsx", "src/components/ParamparaBrowser.tsx",
    "src/components/ParamparaDetailPage.tsx",
  ];
  for (const file of files) {
    const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node) => {
      if (ts.isJsxText(node)) assert.doesNotMatch(node.text.trim(), /[\p{L}]/u, `${file}: ${node.text.trim()}`);
      if (ts.isJsxOpeningElement(node)) assert.notEqual(node.tagName.getText(source), "main", `${file}: root layout owns the main landmark`);
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
});
