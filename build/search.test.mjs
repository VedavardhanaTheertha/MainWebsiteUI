import assert from "node:assert/strict";
import test from "node:test";
import MiniSearch from "minisearch";

// Verify MiniSearch core behavior with multilingual text, fuzzy, and prefix
test("MiniSearch indexes and searches Kannada and English transliterated terms", () => {
  const songs = [
    {
      __search_id: 0,
      id: "aadidano-ranga",
      title: "ಆಡಿದನೋ ರಂಗ ಅದ್ಭುತದಿಂದಲಿ",
      titleKn: "ಆಡಿದನೋ ರಂಗ ಅದ್ಭುತದಿಂದಲಿ",
      titleEn: "Aadidano Ranga",
      kruti: "Sri Purandara Dasaru",
      krutiKn: "ಶ್ರೀ ಪುರಂದರ ದಾಸರು",
      ankita: "Purandara vittala",
      ankitaKn: "ಪುರಂದರ ವಿಠಲ",
      searchTags: ["ಆಡಿದನೋ ರಂಗ", "aadidano ranga"],
    },
    {
      __search_id: 1,
      id: "bhagyada-lakshmi-baramma",
      title: "ಭಾಗ್ಯದ ಲಕ್ಷ್ಮೀ ಬಾರಮ್ಮ",
      titleKn: "ಭಾಗ್ಯದ ಲಕ್ಷ್ಮೀ ಬಾರಮ್ಮ",
      titleEn: "Bhagyada Lakshmi Baramma",
      kruti: "Sri Purandara Dasaru",
      krutiKn: "ಶ್ರೀ ಪುರಂದರ ದಾಸರು",
      ankita: "Purandara vittala",
      ankitaKn: "ಪುರಂದರ ವಿಠಲ",
      searchTags: ["ಭಾಗ್ಯದ ಲಕ್ಷ್ಮೀ", "bhagyada lakshmi"],
    },
  ];

  const miniSearch = new MiniSearch({
    idField: "__search_id",
    fields: ["title", "titleKn", "titleEn", "kruti", "krutiKn", "ankita", "ankitaKn", "searchTags"],
    extractField: (doc, field) => {
      const val = doc[field];
      return Array.isArray(val) ? val.join(" ") : String(val ?? "");
    },
    searchOptions: {
      boost: { title: 3, titleEn: 3, titleKn: 3, ankita: 2, ankitaKn: 2 },
      prefix: true,
      fuzzy: (term) => (term.length > 3 ? 0.2 : false),
      combineWith: "AND",
    },
  });

  miniSearch.addAll(songs);

  // Exact Kannada query
  const resKn = miniSearch.search("ರಂಗ");
  assert.equal(resKn.length, 1);
  assert.equal(songs[resKn[0].id].id, "aadidano-ranga");

  // Transliterated English query
  const resEn = miniSearch.search("aadidano");
  assert.equal(resEn.length, 1);
  assert.equal(songs[resEn[0].id].id, "aadidano-ranga");

  // Prefix match
  const resPrefix = miniSearch.search("lakshm");
  assert.equal(resPrefix.length, 1);
  assert.equal(songs[resPrefix[0].id].id, "bhagyada-lakshmi-baramma");

  // Fuzzy match
  const resFuzzy = miniSearch.search("aadidno");
  assert.equal(resFuzzy.length, 1);
  assert.equal(songs[resFuzzy[0].id].id, "aadidano-ranga");

  // Composer matching both
  const resComposer = miniSearch.search("purandara");
  assert.equal(resComposer.length, 2);
});

test("MiniSearch handles seva search with category and significance", () => {
  const sevas = [
    {
      __search_id: 0,
      name: "Ksheerabhisheka",
      category: "Krishna Sannidhi",
      significance: "Special milk bath offered to Lord Krishna for peace and prosperity.",
    },
    {
      __search_id: 1,
      name: "Tulasi Archana",
      category: "Krishna Sannidhi",
      significance: "Offering sacred Tulasi leaves with Vishnu Sahasranama chanting.",
    },
  ];

  const miniSearch = new MiniSearch({
    idField: "__search_id",
    fields: ["name", "significance", "category"],
    searchOptions: {
      boost: { name: 2, category: 1.5, significance: 1 },
      prefix: true,
      fuzzy: (term) => (term.length > 3 ? 0.2 : false),
      combineWith: "AND",
    },
  });

  miniSearch.addAll(sevas);

  // Search by significance keyword
  const resSignificance = miniSearch.search("milk bath");
  assert.equal(resSignificance.length, 1);
  assert.equal(sevas[resSignificance[0].id].name, "Ksheerabhisheka");

  // Search by fuzzy name
  const resFuzzy = miniSearch.search("ksheer");
  assert.equal(resFuzzy.length, 1);
  assert.equal(sevas[resFuzzy[0].id].name, "Ksheerabhisheka");
});

test("loadCompressedIndex decodes pre-built, gzip-compressed search index and performs queries", async () => {
  const { compressedBhaktiSearchIndex } = await import("../src/gen/bhakti/search-index.ts");
  const { decompressSearchIndex, loadCompressedIndex, searchItems } = await import("../src/lib/search.ts");
  const bhaktiData = (await import("../src/gen/bhakti/index.json", { with: { type: "json" } })).default;

  assert.ok(typeof compressedBhaktiSearchIndex === "string");
  assert.ok(compressedBhaktiSearchIndex.length > 0);

  const jsonText = await decompressSearchIndex(compressedBhaktiSearchIndex);
  assert.ok(jsonText.startsWith("{"));

  const index = await loadCompressedIndex(compressedBhaktiSearchIndex, bhaktiData.items, {
    fields: ["title", "titleKn", "titleEn", "kruti", "krutiKn", "ankita", "ankitaKn", "searchTags", "searchText"],
    boost: { title: 3, titleKn: 3, titleEn: 3, ankita: 2, ankitaKn: 2 },
  });

  const rangaResults = searchItems(index, "ರಂಗ");
  assert.ok(rangaResults.length > 0);
  assert.ok(rangaResults.some((s) => s.id === "aadidano-ranga"));

  const transliteratedResults = searchItems(index, "aadidano");
  assert.ok(transliteratedResults.length > 0);
  assert.ok(transliteratedResults.some((s) => s.id === "aadidano-ranga"));
});

test("loadCompressedIndex decodes pre-built, gzip-compressed Sevas search index", async () => {
  const { compressedSevasSearchIndex } = await import("../src/gen/sevas/search-index.ts");
  const { loadCompressedIndex, searchItems } = await import("../src/lib/search.ts");
  const { sevas } = await import("../src/data/sevas.ts");

  assert.ok(typeof compressedSevasSearchIndex === "string");
  assert.ok(compressedSevasSearchIndex.length > 0);

  const index = await loadCompressedIndex(compressedSevasSearchIndex, sevas, {
    fields: ["name", "significance", "category"],
    boost: { name: 2, category: 1.5, significance: 1 },
  });

  const abhishekResults = searchItems(index, "abhisheka");
  assert.ok(abhishekResults.length > 0);

  const milkBathResults = searchItems(index, "milk bath");
  assert.ok(milkBathResults.length > 0);
});

