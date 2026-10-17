import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import yaml from "js-yaml";
import { loadHomeContent } from "../home-content.mjs";
import { loadPageReferences, loadRemedyCarouselCandidates, sampleUnique } from "../home-carousels.mjs";
import { parseMarkdownFrontmatter } from "../content-utils.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));
const original = JSON.parse(readFileSync(path.join(repository, "settings", "home.json"), "utf8"));
const config = readFileSync(path.join(repository, "config", "site.yml"), "utf8");
const language = yaml.load(config).site.default_language;

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

test("home settings include only active homepage copy and carousels", () => {
  const content = loadHomeContent(repository, language);
  assert.equal(content.pages, undefined);
  assert.equal(content.legacy_home, undefined);
  assert.equal(original.legacy_home, undefined);
  for (const [key, value] of Object.entries(original.home[language])) assert.deepEqual(content.home[key], value);
  assert.deepEqual(Object.fromEntries(Object.entries(content.home).filter(([key]) => key.endsWith("_carousel")).map(([key, cards]) => [key, cards.length])), {
    top_carousel: 6, icon_carousel: 5, bottom_carousel: 6, explore_carousel: 3, remidies_carousel: 3,
  });
  assert.equal(original.remidies_carousel, undefined);
  for (const key of ["spotlight", "tiles", "features", "carousel1", "carousel2", "explore_links", "guidance_cards"]) {
    assert.equal(content.home[key], undefined);
  }
});

test("partial home languages leave fallback to the generator", (t) => {
  const { root, settings, save } = fixture(t);
  settings.home.zz = { guidance_title: "Translated guidance" };
  save();
  const content = loadHomeContent(root, "zz");
  assert.equal(content.home.guidance_title, "Translated guidance");
  assert.equal(content.home.hero, undefined);
  assert.deepEqual(content.home.top_carousel, loadHomeContent(root, language).home.top_carousel);
  assert.equal(content.hero_title, undefined);
  assert.equal(content.pages, undefined);
});

test("home settings reject unknown fields and missing default language content", (t) => {
  const { root, settings, save } = fixture(t);
  settings.home[language].typo = "unexpected";
  save();
  assert.throws(() => loadHomeContent(root, language), /unknown homepage field/);
  delete settings.home[language].typo;
  delete settings.home[language];
  save();
  assert.throws(() => loadHomeContent(root, language), /default language .* is required/);
});

test("home settings reject unsafe navigation destinations", (t) => {
  const { root, settings, save } = fixture(t);
  settings.home[language].hero_intro.cta_href = "javascript:alert(1)";
  save();
  assert.throws(() => loadHomeContent(root, language), /expected a safe/);
});

test("page cards use canonical translated metadata, shared URLs/images and intentionally empty footnotes", () => {
  const pages = loadPageReferences(repository, language);
  for (const code of Object.keys(original.home)) {
    const home = loadHomeContent(repository, code).home;
    for (const key of ["top_carousel", "icon_carousel", "bottom_carousel", "explore_carousel"]) {
      for (const [index, card] of home[key].entries()) {
        const reference = key === "icon_carousel" ? original[key][index].page : original[key][index];
        const record = pages.get(reference);
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
    [original.top_carousel.slice(0, 5), /exactly 6/],
    [["missing.md", ...original.top_carousel.slice(1)], /unknown page reference missing.md/],
    [["..\\events.md", ...original.top_carousel.slice(1)], /Unsafe|unknown page reference/],
    [["../events.md", ...original.top_carousel.slice(1)], /Unsafe|unknown page reference/],
    [[original.top_carousel[1], ...original.top_carousel.slice(1)], /duplicate page reference/],
  ]) {
    settings.top_carousel = value;
    save();
    assert.throws(() => loadHomeContent(root, language), error);
  }
  settings.top_carousel = original.top_carousel;
  settings.bottom_carousel[0] = settings.top_carousel[0];
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
  settings.remidies_carousel = [];
  save();
  assert.throws(() => loadHomeContent(root, language), /four configured page-reference carousels/);
});

test("page-reference metadata rejects malformed maps, unsafe destinations, duplicate URLs and unknown fields", (t) => {
  const { root } = fixture(t);
  const file = path.join(root, "library", "pages", original.top_carousel[0]);
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

test("remedies are three distinct generated detail links with the same selection across languages and repeated loads", () => {
  let selected;
  for (const code of Object.keys(original.home)) {
    const cards = loadHomeContent(repository, code).home.remidies_carousel;
    const candidates = new Map(loadRemedyCarouselCandidates(repository, code, language).map((card) => [card.id, card]));
    const ids = cards.map(({ id }) => id);
    assert.equal(new Set(ids).size, 3);
    if (selected) assert.deepEqual(ids, selected);
    selected = ids;
    for (const card of cards) {
      assert.deepEqual(card, candidates.get(card.id));
      assert.match(card.url, new RegExp(`^/history/remedies/${card.id}$`));
      assert.ok(card.footnote);
    }
    assert.deepEqual(loadHomeContent(repository, code).home.remidies_carousel, cards);
  }
});

test("sampling can choose any four distinct candidates, including beyond the first four", () => {
  assert.deepEqual(sampleUnique(["a", "b", "c", "d", "e"], 4, (size) => size - 1), ["e", "a", "b", "c"]);
  assert.deepEqual(sampleUnique(["a", "b", "c", "d", "e"], 4, () => 0), ["a", "b", "c", "d"]);
  assert.throws(() => sampleUnique([1, 2, 3], 4), /at least 4 distinct/);
  assert.throws(() => sampleUnique([1, 2, 3, 4], 4, () => -1), /invalid index/);
});

test("all remedy candidates are available to verification, and cached choices refresh when sources change", (t) => {
  const { root } = fixture(t);
  const source = path.join(root, "library", "remedies", "chanting-for-steadiness.md");
  const { metadata, body } = parseMarkdownFrontmatter(readFileSync(source, "utf8"), source);
  metadata.id = "additional-remedy";
  metadata.title[language] = "An additional remedy for full-corpus verification";
  writeFileSync(path.join(root, "library", "remedies", `${metadata.id}.md`), `---\n${yaml.dump(metadata)}---\n${body}`);
  const candidates = loadRemedyCarouselCandidates(root, language, language);
  assert.equal(candidates.length, 5);
  assert.equal(candidates.find(({ id }) => id === metadata.id).title, metadata.title[language]);
  const selected = loadHomeContent(root, language).home.remidies_carousel;
  assert.equal(selected.length, 3);
  rmSync(path.join(root, "library", "remedies", `${selected[0].id}.md`));
  const refreshed = loadHomeContent(root, language).home.remidies_carousel;
  assert.equal(refreshed.length, 3);
  assert.ok(refreshed.every((card) => card && card.id !== selected[0].id));
  rmSync(path.join(root, "library", "remedies", `${refreshed[0].id}.md`));
  const finalSelection = loadHomeContent(root, language).home.remidies_carousel;
  assert.equal(finalSelection.length, 3);
  rmSync(path.join(root, "library", "remedies", `${finalSelection[0].id}.md`));
  assert.throws(() => loadHomeContent(root, language), /at least 3 distinct/);
});
