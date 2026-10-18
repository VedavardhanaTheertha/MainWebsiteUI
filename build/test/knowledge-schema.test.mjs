import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { parseKnowledge, validateRelatedArticles, knowledgeCollectionCounts } from "../knowledge-schema.mjs";
import { parseMarkdownFrontmatter } from "../content-utils.mjs";
import { librarySections } from "../library-sections.config.mjs";

const copy = { en: "Reviewed text", kn: "ಪರಿಶೀಲಿತ ಪಠ್ಯ" };
const dated = { text: copy, date: "2026-02-28" };

test("legacy articles need no knowledge metadata and remain valid without source edits", async () => {
  assert.equal(parseKnowledge(undefined, "mantra"), undefined);
  for (const section of librarySections) {
    const root = new URL(`../../library/${section.id}/`, import.meta.url);
    const items = [];
    for (const file of (await readdir(root)).filter((file) => file.endsWith(".md"))) {
      const { metadata } = parseMarkdownFrontmatter(await readFile(new URL(file, root), "utf8"), file);
      items.push({ id: metadata.id, knowledge: parseKnowledge(metadata.knowledge, section.id, file) });
    }
    validateRelatedArticles(items, section.id);
  }
});

test("project metadata is structured and outcomes require explicit verification", () => {
  assert.deepEqual(parseKnowledge({ project: { status: "active", milestones: [dated], updates: [dated], outcomes: [{ ...dated, verified: true }] } }, "projects"), {
    project: { status: "active", milestones: [dated], updates: [dated], outcomes: [dated] },
  });
  for (const status of ["upcoming", "", "done", null]) assert.throws(() => parseKnowledge({ project: { status } }, "projects"));
  for (const verified of [false, undefined, "true"]) assert.throws(() => parseKnowledge({ project: { status: "completed", outcomes: [{ ...dated, verified }] } }, "projects"));
});

test("mantra parts are independent and audio is explicitly approved", () => {
  const parts = { original: copy, transliteration: copy, meaning: copy, guidance: copy };
  const audio = { approved: true, src: "https://media.example.org/approved.mp3", label: copy };
  assert.deepEqual(parseKnowledge({ mantra: { ...parts, audio } }, "mantra").mantra, { ...parts, audio: { src: audio.src, label: copy } });
  assert.throws(() => parseKnowledge({ mantra: { audio: { ...audio, approved: false } } }, "mantra"));
});

test("illustration coordinates and approval are validated", () => {
  const illustration = { approved: true, src: "/approved.png", alt: copy, annotations: [{ x: 0, y: 100, label: copy, explanation: copy }] };
  assert.equal(parseKnowledge({ illustration }, "symbolism").illustration.annotations.length, 1);
  for (const x of [-1, 101, NaN, Infinity, "50"]) assert.throws(() => parseKnowledge({ illustration: { ...illustration, annotations: [{ ...illustration.annotations[0], x }] } }, "symbolism"));
  assert.throws(() => parseKnowledge({ illustration: { ...illustration, approved: false } }, "symbolism"));
});

test("unsafe media and reference URLs are rejected", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "//untrusted.example.org", "http://example.org", "https://user:password@example.org", "/../private", "/bad\\path"]) {
    assert.throws(() => parseKnowledge({ references: [{ label: copy, url }] }, "articles"), url);
    assert.throws(() => parseKnowledge({ mantra: { audio: { approved: true, src: url, label: copy } } }, "mantra"), url);
  }
  assert.equal(parseKnowledge({ references: [{ label: copy, url: "https://example.org/reference" }] }, "articles").references.length, 1);
});

test("dates must be real calendar dates and review metadata is complete", () => {
  for (const publishedOn of ["2026-02-29", "2026-13-01", "yesterday", "2026-1-01"]) assert.throws(() => parseKnowledge({ publishedOn }, "articles"));
  assert.equal(parseKnowledge({ publishedOn: "2024-02-29", author: copy, reviewer: copy, reviewedOn: "2026-01-01" }, "articles").publishedOn, "2024-02-29");
  assert.deepEqual(parseKnowledge({ editorial: { reviewer: copy, reviewedOn: "2026-01-01" } }, "remedies").editorial, { reviewer: copy, reviewedOn: "2026-01-01" });
  assert.throws(() => parseKnowledge({ editorial: { reviewedOn: "2026-01-01" } }, "remedies"));
});

test("knowledge text validates default-language sources and inherits missing translations", () => {
  assert.deepEqual(parseKnowledge({ glossary: [{ term: copy, definition: copy }] }, "jnana").glossary, [{ term: copy, definition: copy }]);
  assert.deepEqual(parseKnowledge({ themes: [copy], readMinutes: 4 }, "stories"), { themes: [copy], readMinutes: 4 });
  assert.deepEqual(parseKnowledge({ practical: { hours: copy, contacts: copy }, verifiedOn: "2026-01-01" }, "pilgrim"), { practical: { hours: copy, contacts: copy }, verifiedOn: "2026-01-01" });
  assert.throws(() => parseKnowledge({ practical: { inventedField: copy } }, "pilgrim"));
  assert.deepEqual(parseKnowledge({ themes: [{ en: "Default translation" }] }, "stories").themes,
    [{ en: "Default translation", kn: "Default translation" }]);
  assert.throws(() => parseKnowledge({ themes: [{ kn: "Missing default" }] }, "stories"));
  assert.throws(() => parseKnowledge({ readMinutes: 0 }, "stories"));
  assert.throws(() => parseKnowledge({ project: { status: "active" } }, "stories"));
  assert.throws(() => parseKnowledge({ imaginary: true }, "articles"));
});

test("related reading only references existing unique sibling articles", () => {
  validateRelatedArticles([{ id: "a", knowledge: { related: ["b"] } }, { id: "b" }]);
  for (const related of [["a"], ["missing"], ["b", "b"]]) assert.throws(() => validateRelatedArticles([{ id: "a", knowledge: { related } }, { id: "b" }]));
});

test("collection counts include generated Bhakti metadata without bundling its index into the hub", () => {
  const sections = [{ route: "/projects", items: [{ id: "a" }, { id: "b" }] }];
  assert.deepEqual(knowledgeCollectionCounts(sections, { items: [{ id: "song" }] }), { "/projects": 2, "/library/bhakti": 1 });
  assert.deepEqual(knowledgeCollectionCounts(sections), { "/projects": 2 });
  assert.throws(() => knowledgeCollectionCounts(sections, {}));
});
