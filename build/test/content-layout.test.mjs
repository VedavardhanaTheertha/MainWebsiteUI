import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseMarkdownFrontmatter } from "../content-utils.mjs";
import { loadEditorialContent } from "../editorial-content.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const exists = (relative) => existsSync(path.join(root, relative));
const document = (relative) => parseMarkdownFrontmatter(readFileSync(path.join(root, "library", relative), "utf8"), relative);

test("page metadata and site chrome share the corresponding primary Markdown document", () => {
  for (const page of ["privacy", "terms", "refund"]) {
    assert.equal(exists(`library/general/${page}-metadata.md`), false);
    assert.ok(document(`general/${page}.md`).metadata.fields[`page_metadata.${page}`]);
  }
  const site = document("general/site.md").metadata.fields;
  assert.ok(site.meta_title);
  assert.ok(site["editorial.site_chrome"]);
  assert.equal(exists("library/general/site-chrome.md"), false);
});

test("Sevas page strings belong to language files and retired Blog strings stay removed", () => {
  const strings = JSON.parse(readFileSync(path.join(root, "content", "languages", "en.json"), "utf8"));
  for (const field of ["sevas_title", "sevas_subtitle", "sevas_featured_title", "sevas_all_title"]) {
    assert.equal(typeof strings[field], "string", field);
  }
  assert.equal(exists("library/blog/page.md"), false);
  assert.equal(strings.blog_title, undefined);
  assert.equal(strings.blog_controls, undefined);
  assert.equal(exists("library/sevas/pages/introduction.md"), false);
  assert.equal(loadEditorialContent(root, "en").blog_title, undefined);
});

test("hero groups remain in their original library environment folders", () => {
  for (const environment of ["dev", "prod"]) {
    assert.ok(exists(`library/hero/${environment}/default.hero.json`));
    assert.equal(exists(`settings/${environment}/default.hero.json`), false);
  }
});

test("project details reside in the corresponding article Markdown, not a pages folder", () => {
  assert.equal(exists("library/projects/pages"), false);
  const project = document("projects/matha-gopura-renovation.md");
  assert.match(project.body, /Restored the 200-year-old gopura/);
  assert.match(project.metadata.status.en, /2024/);
  assert.match(document("projects/go-shala-expansion.md").body, /50 additional Gir cows/);
  const copy = loadEditorialContent(root, "en").pages.projects;
  assert.ok(copy.vision);
  assert.equal(copy.completed, undefined);
  assert.equal(copy.ongoing, undefined);
  assert.equal(copy.upcoming, undefined);
});

test("one named announcement Markdown owns popup, page prose and metadata", () => {
  const folder = path.join(root, "library", "announcement");
  assert.deepEqual(readdirSync(folder), ["krishna-mantra-lekhana-yajna.md"]);
  assert.equal(exists("library/yajna"), false);
  const fields = document("announcement/krishna-mantra-lekhana-yajna.md").metadata.fields;
  assert.ok(fields["announcement.title"]);
  assert.ok(fields["pages.local_copy.yajna_title"]);
  assert.ok(fields["page_metadata.yajna"]);
});
