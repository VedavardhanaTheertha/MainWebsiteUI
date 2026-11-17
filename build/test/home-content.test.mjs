import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import yaml from "js-yaml";
import { loadHomeContent } from "../home-content.mjs";
import { loadPageReferences, loadRemedyCarouselCandidates, loadAllGuidanceCandidates, sampleUnique } from "../home-carousels.mjs";
import { parseMarkdownFrontmatter } from "../content-utils.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));
const original = JSON.parse(readFileSync(path.join(repository, "settings", "home.json"), "utf8"));
const config = readFileSync(path.join(repository, "config", "site.yml"), "utf8");
const language = yaml.load(config).site.default_language;
const rawTopCarousel = (Array.isArray(original.top_carousel) ? original.top_carousel : (original.top_carousel.pool || [
  "events.md", "projects.md", "story.md", "history--parampara.md", "albums.md", "sevas.md"
])).slice(0, 6);
const rawBottomCarousel = (Array.isArray(original.bottom_carousel) ? original.bottom_carousel : (original.bottom_carousel.pool || [
  "learn.md", "library--bhakti.md", "library--mantra.md", "library--shastra.md", "library--pilgrim-guide.md", "volunteer.md"
])).slice(0, 6);

function fixture(t) {
  const root = mkdtempSync(path.join(repository, "build", ".home-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }));
  mkdirSync(path.join(root, "settings"));
  mkdirSync(path.join(root, "config"));
  writeFileSync(path.join(root, "config", "site.yml"), config);
  for (const folder of ["pages", "remedies"]) {
    cpSync(path.join(repository, "library", folder), path.join(root, "library", folder), { recursive: true });
  }
  const settings = structuredClone(original);
  const save = () => writeFileSync(path.join(root, "settings", "home.json"), JSON.stringify(settings));
  save();
  return { root, settings, save };
}

test("home settings include only carousels", () => {
  const content = loadHomeContent(repository, language);
  assert.equal(content.pages, undefined);
  assert.equal(content.legacy_home, undefined);
  const lengths = Object.fromEntries(Object.entries(content.home).filter(([key]) => key.endsWith("_carousel")).map(([key, cards]) => [key, cards.length]));
  assert.equal(lengths.icon_carousel, 5);
  assert.equal(lengths.bottom_carousel, 6);
  assert.ok(lengths.top_carousel >= 6);
  assert.ok(lengths.explore_carousel >= 3);
  assert.ok(lengths.guidance_carousel >= 3);
  for (const key of ["spotlight", "tiles", "features", "carousel1", "carousel2", "explore_links", "guidance_cards"]) {
    assert.equal(content.home[key], undefined);
  }
});

test("carousel settings reject unknown fields", (t) => {
  const { root, settings, save } = fixture(t);
  settings.typo = "unexpected";
  save();
  assert.throws(() => loadHomeContent(root, language), /unknown homepage field|expected the configured homepage carousels/);
});

test("page cards use canonical translated metadata, shared URLs/images and intentionally empty footnotes", () => {
  const pages = loadPageReferences(repository, language);
  for (const code of ["en", "kn"]) {
    const home = loadHomeContent(repository, code).home;
    for (const key of ["top_carousel", "icon_carousel", "bottom_carousel"]) {
      for (const [index, card] of home[key].entries()) {
        const configured = original[key];
        const record = key === "icon_carousel"
          ? pages.get(configured[index].page)
          : [...pages.values()].find((p) => p.url === card.url);
        assert.ok(record, `page record found for ${card.title}`);
        for (const field of ["title", "description", "page_type", "footnote"]) {
          assert.equal(card[field], record[field][code] ?? record[field][language]);
        }
        assert.equal(card.url, record.url);
        assert.equal(card.image, record.image);
        if (key === "icon_carousel") {
          assert.equal(card.icon, original[key][index].icon);
          assert.equal(card.tone, original[key][index].tone);
        }
      }
    }
  }
});

test("carousel references reject missing, unsafe, duplicate and incorrectly sized lists", (t) => {
  const { root, settings, save } = fixture(t);
  for (const [value, error] of [
    [rawTopCarousel.slice(0, 5), /exactly 6/],
    [["missing.md", ...rawTopCarousel.slice(1)], /unknown page reference missing.md/],
    [["..\\events.md", ...rawTopCarousel.slice(1)], /Unsafe|unknown page reference/],
    [["../events.md", ...rawTopCarousel.slice(1)], /Unsafe|unknown page reference/],
    [[rawTopCarousel[1], ...rawTopCarousel.slice(1)], /duplicate page reference/],
  ]) {
    settings.top_carousel = value;
    save();
    assert.throws(() => loadHomeContent(root, language), error);
  }
  settings.top_carousel = rawTopCarousel;
  settings.bottom_carousel = [rawTopCarousel[0], ...rawBottomCarousel.slice(1, 6)];
  save();
  assert.throws(() => loadHomeContent(root, language), /six different pages/);
  settings.bottom_carousel = original.bottom_carousel;
  settings.icon_carousel[0].icon = "unknown";
  save();
  assert.throws(() => loadHomeContent(root, language), /known icon and tone/);
  settings.icon_carousel[0].icon = original.icon_carousel[0].icon;
  settings.icon_carousel[0].tone = "unknown";
  save();
  assert.throws(() => loadHomeContent(root, language), /known icon and tone/);
  settings.icon_carousel[0].tone = original.icon_carousel[0].tone;
  settings.extra_unknown = [];
  save();
  assert.throws(() => loadHomeContent(root, language), /expected the configured homepage carousels only/);
});

test("page-reference metadata rejects malformed maps, unsafe destinations, duplicate URLs and unknown fields", (t) => {
  const { root } = fixture(t);
  const file = path.join(root, "library", "pages", rawTopCarousel[0]);
  const { metadata } = parseMarkdownFrontmatter(readFileSync(file, "utf8"), file);
  for (const [change, error] of [
    [(record) => { record.title = "Not localized"; }, /expected a language map/],
    [(record) => { record.footnote[language] = null; }, /valid string values/],
    [(record) => { record.url = "javascript:alert(1)"; }, /site-root-relative/],
    [(record) => { record.url = "/../private"; }, /site-root-relative/],
    [(record) => { record.image = "data:image/svg+xml,unsafe"; }, /HTTP\(S\) image/],
    [(record) => { record.url = "/albums"; }, /duplicate page URL/],
    [(record) => { record.unexpected = true; }, /unknown field unexpected/],
  ]) {
    const record = structuredClone(metadata);
    change(record);
    writeFileSync(file, `---\n${yaml.dump(record)}---\n`);
    assert.throws(() => loadHomeContent(root, language), error);
  }
});

test("guidance items are distinct generated detail links with the same selection across languages and repeated loads", () => {
  let selected;
  for (const code of ["en", "kn"]) {
    const cards = loadHomeContent(repository, code).home.guidance_carousel;
    const candidates = new Map(loadAllGuidanceCandidates(repository, code, language).map((card) => [card.id, card]));
    const ids = cards.map(({ id }) => id);
    assert.equal(new Set(ids).size, cards.length);
    if (selected) assert.deepEqual(ids, selected);
    selected = ids;
    for (const card of cards) {
      assert.deepEqual(card, candidates.get(card.id));
      assert.ok(card.url);
      assert.ok(card.title);
    }
    assert.deepEqual(loadHomeContent(repository, code).home.guidance_carousel, cards);
  }
});

test("sampling can choose any four distinct candidates, including beyond the first four", () => {
  assert.deepEqual(sampleUnique(["a", "b", "c", "d", "e"], 4, (size) => size - 1), ["e", "a", "b", "c"]);
  assert.deepEqual(sampleUnique(["a", "b", "c", "d", "e"], 4, () => 0), ["a", "b", "c", "d"]);
  assert.throws(() => sampleUnique([1, 2, 3], 4), /requires at least 4/);
  assert.throws(() => sampleUnique([1, 2, 3, 4], 4, () => -1), /invalid index/);
});

test("all remedy candidates are available to verification, and dynamic guidance carousel selects candidates", (t) => {
  const { root, settings, save } = fixture(t);
  const source = path.join(root, "library", "remedies", "chanting-for-steadiness.md");
  const { metadata, body } = parseMarkdownFrontmatter(readFileSync(source, "utf8"), source);
  metadata.id = "additional-remedy";
  metadata.title[language] = "An additional remedy for full-corpus verification";
  writeFileSync(path.join(root, "library", "remedies", `${metadata.id}.md`), `---\n${yaml.dump(metadata)}---\n${body}`);
  const candidates = loadRemedyCarouselCandidates(root, language, language);
  assert.equal(candidates.length, 5);
  assert.equal(candidates.find(({ id }) => id === metadata.id).title, metadata.title[language]);
  settings.guidance_carousel = { count: 3 };
  save();
  const selected = loadHomeContent(root, language).home.guidance_carousel;
  assert.equal(selected.length, 3);
  rmSync(path.join(root, "library", "remedies", `${selected[0].id.replace(/^remedies--/, '')}.md`));
  const refreshed = loadHomeContent(root, language).home.guidance_carousel;
  assert.equal(refreshed.length, 3);
  assert.ok(refreshed.every((card) => card && card.id !== selected[0].id));
});

test("dynamic carousels support index-specific pinning and pool backfill", (t) => {
  const { root, settings, save } = fixture(t);
  const pinnedFirst = rawTopCarousel[0];
  const pinnedThird = rawTopCarousel[2];
  settings.top_carousel = {
    count: 6,
    pinned: [
      { index: 0, item: pinnedFirst },
      { index: 2, item: pinnedThird },
    ],
    pool: rawTopCarousel,
  };
  save();
  const content = loadHomeContent(root, language).home.top_carousel;
  assert.equal(content.length, 6);
  assert.equal(content[0].id, pinnedFirst.slice(0, -3));
  assert.equal(content[2].id, pinnedThird.slice(0, -3));
  const ids = new Set(content.map((c) => c.id));
  assert.equal(ids.size, 6);
});

test("dynamic carousels honor calendar date overrides for index pinning", (t) => {
  const { root, settings, save } = fixture(t);
  const today = new Date().toISOString().slice(0, 10);
  const overrideItem = rawTopCarousel[5];
  settings.top_carousel = {
    count: 6,
    pinned: [{ index: 0, item: rawTopCarousel[0] }],
    pool: rawTopCarousel,
    overrides: [
      {
        date: today,
        pinned: [{ index: 0, item: overrideItem }],
      },
    ],
  };
  save();
  const content = loadHomeContent(root, language).home.top_carousel;
  assert.equal(content[0].id, overrideItem.slice(0, -3));
});

test("dynamic carousels prioritize enabled pages over disabled pages when backfilling empty slots", (t) => {
  const { root, settings, save } = fixture(t);
  // pool contains 2 enabled pages and 2 disabled pages
  settings.top_carousel = {
    count: 2,
    pinned: [],
    pool: ["events.md", "library--dharma.md", "panchanga.md", "library--articles.md"],
  };
  save();
  const content = loadHomeContent(root, language).home.top_carousel;
  assert.equal(content.length, 2);
  const ids = content.map((c) => c.id);
  // Both chosen slots must come from enabled pages
  assert.ok(ids.includes("library--dharma") || ids.includes("library--articles"));
  assert.equal(ids.includes("events"), false);
  assert.equal(ids.includes("panchanga"), false);
});

test("dynamic carousels fill remaining slots with disabled pages so slots are not lost", (t) => {
  const { root, settings, save } = fixture(t);
  // pool contains only 1 enabled page and 2 disabled pages, but count is 3
  settings.top_carousel = {
    count: 3,
    pinned: [],
    pool: ["events.md", "library--dharma.md", "panchanga.md"],
  };
  save();
  const content = loadHomeContent(root, language).home.top_carousel;
  assert.equal(content.length, 3);
  const ids = content.map((c) => c.id);
  // Enabled page is selected first
  assert.ok(ids.includes("library--dharma"));
  // Remaining slots are filled with the disabled pages
  assert.ok(ids.includes("events"));
  assert.ok(ids.includes("panchanga"));
});
