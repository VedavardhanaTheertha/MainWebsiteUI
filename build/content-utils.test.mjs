import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSafeSourceFile,
  buildSearchText,
  normalizeSearchText,
  parseMarkdownFrontmatter,
  removeSearchTags,
  splitSongContent,
  toTitleCase,
  validateSongs,
} from "./content-utils.mjs";

test("removeSearchTags omits the metadata-only Markdown section", () => {
  const source = "# Title\n\nVisible content\n\n## Search Tags\n\nnot, visible";
  assert.equal(removeSearchTags(source), "# Title\n\nVisible content");
});

test("toTitleCase converts markdown filenames to title-cased English names", () => {
  assert.equal(toTitleCase("aadidano ranga.md"), "Aadidano Ranga");
  assert.equal(toTitleCase("krishna nee begane baaro.md"), "Krishna Nee Begane Baaro");
  assert.equal(toTitleCase(""), "");
});

test("splitSongContent splits bilingual markdown into language-specific variants", () => {
  const source = `# ಆಡಿದನೋ ರಂಗ ಅದ್ಭುತದಿಂದಲಿ

ಸಾಹಿತ್ಯ : ಶ್ರೀ ಪುರಂದರ ದಾಸರು (ಪುರಂದರ ವಿಠಲ)
Kruti: Sri Purandara Dasaru (Purandara vittala)

## ಕನ್ನಡ ಸಾಹಿತ್ಯ

ಆಡಿದನೋ ರಂಗ ಅದ್ಭುತದಿಂದಲಿ ಕಾಳಿಂಗನ ಫಣೆಯಲಿ ||ಪ||

## Lyrics transliterated to english

ADidanO raMga adbhutadiMdali kaaLiMgana PaNeyali ||pa||

## Search Tags

ಆಡಿದನೋ ರಂಗ, aadidano ranga
`;

  const song = {
    id: "aadidano-ranga",
    title: "ಆಡಿದನೋ ರಂಗ ಅದ್ಭುತದಿಂದಲಿ",
    sourceFile: "aadidano ranga.md",
    kruti: "Sri Purandara Dasaru",
    "kruti-kn": "ಶ್ರೀ ಪುರಂದರ ದಾಸರು",
  };

  const { knMarkdown, enMarkdown, titleEn } = splitSongContent(source, song);

  assert.equal(titleEn, "Aadidano Ranga");
  assert.ok(knMarkdown.startsWith("# ಆಡಿದನೋ ರಂಗ ಅದ್ಭುತದಿಂದಲಿ"));
  assert.ok(knMarkdown.includes("ಸಾಹಿತ್ಯ : ಶ್ರೀ ಪುರಂದರ ದಾಸರು"));
  assert.ok(knMarkdown.includes("ಕಾಳಿಂಗನ ಫಣೆಯಲಿ"));
  assert.ok(!knMarkdown.includes("Lyrics transliterated to english"));
  assert.ok(!knMarkdown.includes("ADidanO"));
  assert.ok(!knMarkdown.includes("Search Tags"));

  assert.ok(enMarkdown.startsWith("# Aadidano Ranga"));
  assert.ok(enMarkdown.includes("Kruti: Sri Purandara Dasaru"));
  assert.ok(enMarkdown.includes("ADidanO raMga"));
  assert.ok(!enMarkdown.includes("ಕನ್ನಡ ಸಾಹಿತ್ಯ"));
  assert.ok(!enMarkdown.includes("ಆಡಿದನೋ ರಂಗ ಅದ್ಭುತದಿಂದಲಿ ಕಾಳಿಂಗನ"));
  assert.ok(!enMarkdown.includes("Search Tags"));
});

test("splitSongContent falls back gracefully when section headers are absent", () => {
  const source = "# Monolingual Title\n\nJust some song lyrics.";
  const song = { title: "Monolingual Title", sourceFile: "monolingual song.md" };
  const { knMarkdown, enMarkdown, titleEn } = splitSongContent(source, song);

  assert.equal(titleEn, "Monolingual Song");
  assert.equal(knMarkdown, source);
  assert.equal(enMarkdown, source);
});

test("assertSafeSourceFile rejects traversal and non-Markdown files", () => {
  assert.throws(() => assertSafeSourceFile("../secret.md"));
  assert.throws(() => assertSafeSourceFile("song.html"));
  assert.doesNotThrow(() => assertSafeSourceFile("song.md"));
});

test("parseMarkdownFrontmatter returns metadata and content separately", () => {
  const source = `---
id: song-id
title: Song title
sourceFile: song.md
searchTags:
  - first
  - second
---

# Song title

Lyrics`;
  const { metadata, body } = parseMarkdownFrontmatter(source, "song.md");

  assert.deepEqual(metadata.searchTags, ["first", "second"]);
  assert.equal(metadata.id, "song-id");
  assert.equal(body, "# Song title\n\nLyrics");
});

test("parseMarkdownFrontmatter rejects missing and invalid front matter", () => {
  assert.throws(
    () => parseMarkdownFrontmatter("# Song title", "song.md"),
    /must begin with YAML front matter/,
  );
  assert.throws(
    () => parseMarkdownFrontmatter("---\ntitle: [\n---\nBody", "song.md"),
    /Invalid YAML front matter/,
  );
});

test("validateSongs rejects duplicate ids", () => {
  const song = { id: "same", title: "Song", sourceFile: "song.md" };
  assert.throws(() => validateSongs([song, song], "test"), /duplicate id/);
});

test("normalizeSearchText removes punctuation and decomposes unicode consistently", () => {
  assert.equal(normalizeSearchText("Purandara, vittala."), "purandara vittala");
  assert.equal(normalizeSearchText("  ಶ್ರೀ   ಪುರಂದರ  "), normalizeSearchText("ಶ್ರೀ ಪುರಂದರ"));
});

test("buildSearchText produces deduplicated normalized search terms for both languages", () => {
  const song = {
    title: "ಆಡಿದನೋ ರಂಗ",
    sourceFile: "aadidano ranga.md",
    kruti: "Sri Purandara Dasaru",
    "kruti-kn": "ಶ್ರೀ ಪುರಂದರ ದಾಸರು",
    ankita: "Purandara vittala",
    "ankita-kn": "ಪುರಂದರ ವಿಠಲ",
    searchTags: [
      "Purandara dasaru",
      "Purandara vittala",
      "purandara dasara hadugalu",
      "ಆಡಿದನೋ ರಂಗ",
      "ಆಡಿದನೋ ರಂಗ",
    ],
  };
  const searchText = buildSearchText(song);
  assert.ok(searchText.includes("aadidano"));
  assert.ok(searchText.includes("purandara"));
  assert.ok(searchText.includes("vittala"));
  assert.ok(searchText.includes("hadugalu"));
  assert.ok(searchText.includes("ರಂಗ"));
  // Ensure words are unique
  const words = searchText.split(" ");
  assert.equal(words.length, new Set(words).size);
});