import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import yaml from "js-yaml";
import { loadEditorialContent, mergeAuthoredSources } from "../editorial-content.mjs";
import { applyNavigation, loadNavigation } from "../navigation-content.mjs";

const root = path.resolve(import.meta.dirname, "../..");

async function fixture(t) {
  const directory = await mkdtemp(path.join(root, "build", ".editorial-fixture-"));
  await mkdir(path.join(directory, "library"));
  await mkdir(path.join(directory, "settings"));
  t.after(() => rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  return directory;
}

async function document(directory, file, metadata, body = "") {
  const target = path.join(directory, "library", file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `---\n${yaml.dump(metadata, { noRefs: true })}---\n${body}`);
}

test("editorial and Learn content is canonical multilingual Markdown, not language JSON", () => {
  const authored = loadEditorialContent(root, "en");
  const translated = loadEditorialContent(root, "kn");
  assert.equal(authored.pages.about, undefined);
  assert.ok(authored.pages.parampara.title);
  assert.equal(authored.learn.length, 4);
  assert.deepEqual(authored.learn.map(({ id }) => id), translated.learn.map(({ id }) => id));
  const ids = new Set(authored.learn.map(({ id }) => id));
  assert.ok(authored.pages.learn.suggested_paths.every(({ itemIds }) => itemIds.every((id) => ids.has(id))));
  for (const code of ["en", "kn"]) {
    const labels = JSON.parse(readFileSync(path.join(root, "content", "languages", `${code}.json`), "utf8"));
    assert.equal(labels.learn, undefined);
    assert.equal(labels.pages.learn, undefined);
    assert.equal(labels.pages.about, undefined);
    assert.equal(labels.page_metadata?.about, undefined);
    assert.equal(labels.pages.local_copy.yajna_intro, undefined);
    assert.equal(mergeAuthoredSources(labels, loadEditorialContent(root, code)).pages.about, undefined);
  }
});

test("editorial discovery rejects duplicate authorities, unsafe paths and ignored prose", async (t) => {
  const directory = await fixture(t);
  const metadata = { kind: "localized-copy", fields: { "pages.example.title": { en: "Exact source title" } } };
  await document(directory, "general/example.md", metadata);
  assert.equal(loadEditorialContent(directory, "en").pages.example.title, "Exact source title");
  assert.deepEqual(loadEditorialContent(directory, "kn"), {});
  assert.throws(() => mergeAuthoredSources(
    { pages: { example: { title: "Old authority" } } }, loadEditorialContent(directory, "en"),
  ), /duplicate authority/);
  await document(directory, "general/duplicate.md", metadata);
  assert.throws(() => loadEditorialContent(directory, "en"), /duplicate content field/);
  await rm(path.join(directory, "library", "general", "duplicate.md"));
  await document(directory, "general/example.md", { ...metadata, fields: { "pages.__proto__.title": { en: "Unsafe" } } });
  assert.throws(() => loadEditorialContent(directory, "en"), /invalid content field/);
  await document(directory, "general/example.md", metadata, "An accidentally unused paragraph.");
  assert.throws(() => loadEditorialContent(directory, "en"), /unused body/);
});

test("navigation uses settings order and destinations, retaining translated labels", async (t) => {
  const directory = await fixture(t);
  const settings = loadNavigation(root);
  const labels = JSON.parse(readFileSync(path.join(root, "content", "languages", "en.json"), "utf8"));
  const first = settings.menu[0];
  settings.menu.reverse();
  const result = applyNavigation(labels, settings);
  assert.equal(result.nav.at(-1).key, first.key);
  assert.equal(result.nav.at(-1).href, first.href);
  assert.equal(result.nav.at(-1).label, labels.nav[first.key].label);
  assert.equal(result.footer.social[0].connectId, settings.footer.social[0].connectId);
  settings.menu[0].href = "//external.example";
  await writeFile(path.join(directory, "settings", "navigation.json"), JSON.stringify(settings));
  assert.throws(() => loadNavigation(directory), /site-relative route/);
  settings.menu[0].href = "/approved";
  settings.menu[0].typo = true;
  await writeFile(path.join(directory, "settings", "navigation.json"), JSON.stringify(settings));
  assert.throws(() => loadNavigation(directory), /unknown menu entry field/);
});

test("learning Markdown preserves supplied optional fields and rejects unsafe or malformed metadata", async (t) => {
  const directory = await fixture(t);
  await document(directory, "learn/index.md", {
    kind: "learning-collection",
    subjects: ["subject"],
    fields: { "pages.learn.title": { en: "Learning collection" } },
  });
  const subject = {
    kind: "learning-subject", id: "subject",
    translations: { en: { title: "Source subject", sub: "Source subtitle", img: "@image.source", level: "Beginner" } },
  };
  await document(directory, "learn/subject.md", subject);
  assert.deepEqual(loadEditorialContent(directory, "en").learn, [{ id: "subject", ...subject.translations.en }]);
  assert.deepEqual(loadEditorialContent(directory, "kn"), {});
  subject.translations.en.enrollmentUrl = "javascript:alert(1)";
  await document(directory, "learn/subject.md", subject);
  assert.throws(() => loadEditorialContent(directory, "en"), /safe site-relative or HTTPS/);
  delete subject.translations.en.enrollmentUrl;
  subject.translations.en.duration = 3;
  await document(directory, "learn/subject.md", subject);
  assert.throws(() => loadEditorialContent(directory, "en"), /invalid learning field "duration"/);
  await document(directory, "learn/index.md", {
    kind: "learning-collection", subjects: ["../outside"],
    fields: { "pages.learn.title": { en: "Learning collection" } },
  });
  assert.throws(() => loadEditorialContent(directory, "en"), /unsafe learning subject ID/);
});

test("Yajna progress is authored content and accepts only an in-range percentage", async (t) => {
  const directory = await fixture(t);
  const metadata = {
    kind: "localized-copy",
    fields: { "pages.local_copy.yajna_progress_percent": { en: "24.8%" } },
  };
  await document(directory, "yajna/page.md", metadata);
  assert.equal(loadEditorialContent(directory, "en").pages.local_copy.yajna_progress_percent, "24.8%");
  for (const value of ["-1%", "101%", "not a percentage", 24.8]) {
    metadata.fields["pages.local_copy.yajna_progress_percent"].en = value;
    await document(directory, "yajna/page.md", metadata);
    assert.throws(() => loadEditorialContent(directory, "en"), /between 0% and 100%/);
  }
});
