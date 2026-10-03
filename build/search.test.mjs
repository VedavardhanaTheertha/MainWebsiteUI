import assert from "node:assert/strict";
import test from "node:test";
import MiniSearch from "minisearch";
import { withSearchDefaults } from "./search-config.mjs";

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
      searchText: "ಆಡಿದನೋ ರಂಗ aadidano ranga",
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
      searchText: "ಭಾಗ್ಯದ ಲಕ್ಷ್ಮೀ bhagyada lakshmi",
    },
  ];

  const miniSearch = new MiniSearch(withSearchDefaults({
    idField: "__search_id",
    fields: ["title", "titleKn", "titleEn", "kruti", "krutiKn", "ankita", "ankitaKn", "searchText"],
    extractField: (doc, field) => {
      const val = doc[field];
      return Array.isArray(val) ? val.join(" ") : String(val ?? "");
    },
    searchOptions: {
      boost: { title: 3, titleEn: 3, titleKn: 3, ankita: 2, ankitaKn: 2 },
    },
  }));

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

  // Infix match
  const resInfix = miniSearch.search("idano");
  assert.equal(resInfix.length, 1);
  assert.equal(songs[resInfix[0].id].id, "aadidano-ranga");

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

  const miniSearch = new MiniSearch(withSearchDefaults({
    idField: "__search_id",
    fields: ["name", "significance", "category"],
    searchOptions: {
      boost: { name: 2, category: 1.5, significance: 1 },
    },
  }));

  miniSearch.addAll(sevas);

  // Search by significance keyword
  const resSignificance = miniSearch.search("milk bath");
  assert.equal(resSignificance.length, 1);
  assert.equal(sevas[resSignificance[0].id].name, "Ksheerabhisheka");

  // Search by fuzzy name
  const resFuzzy = miniSearch.search("ksheer");
  assert.equal(resFuzzy.length, 1);
  assert.equal(sevas[resFuzzy[0].id].name, "Ksheerabhisheka");

  const resInfix = miniSearch.search("bhisheka");
  assert.equal(resInfix.length, 1);
  assert.equal(sevas[resInfix[0].id].name, "Ksheerabhisheka");
});

test("shared in-memory search defaults include infix and fuzzy matching", async () => {
  const { createSearchIndex, searchItems } = await import("../src/lib/search.ts");
  const media = [
    { title: "Temple Architecture", detail: "Traditional stone construction" },
    { title: "Daily Worship", detail: "Morning rituals" },
  ];
  const index = createSearchIndex(media, {
    fields: ["title", "detail"],
    boost: { title: 2, detail: 1 },
  });

  assert.deepEqual(searchItems(index, "chitec"), [media[0]]);
  assert.deepEqual(searchItems(index, "arhitecture"), [media[0]]);
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
    fields: ["title", "titleKn", "titleEn", "kruti", "krutiKn", "ankita", "ankitaKn", "searchText"],
    boost: { title: 3, titleKn: 3, titleEn: 3, ankita: 2, ankitaKn: 2 },
  });

  const rangaResults = searchItems(index, "ರಂಗ");
  assert.ok(rangaResults.length > 0);
  assert.ok(rangaResults.some((s) => s.id === "aadidano-ranga"));

  const transliteratedResults = searchItems(index, "aadidano");
  assert.ok(transliteratedResults.length > 0);
  assert.ok(transliteratedResults.some((s) => s.id === "aadidano-ranga"));

  const kannadaLyricResults = searchItems(index, "ಕಾಳಿಂಗನ");
  assert.ok(kannadaLyricResults.some((s) => s.id === "aadidano-ranga"));

  const transliteratedLyricResults = searchItems(index, "kaaLiMgana");
  assert.ok(transliteratedLyricResults.some((s) => s.id === "aadidano-ranga"));

  const infixLyricResults = searchItems(index, "LiMgana");
  assert.ok(infixLyricResults.some((s) => s.id === "aadidano-ranga"));

  const fuzzyLyricResults = searchItems(index, "kaaLiMgna");
  assert.ok(fuzzyLyricResults.some((s) => s.id === "aadidano-ranga"));
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

  const infixResults = searchItems(index, "bhisheka");
  assert.ok(infixResults.length > 0);

  const fuzzyResults = searchItems(index, "abhiseka");
  assert.ok(fuzzyResults.length > 0);
});

test("loadCompressedIndex decodes pre-built, gzip-compressed Events search index", async () => {
  const { compressedPastEventsSearchIndex } = await import("../src/gen/events/past-search-index.ts");
  const { loadCompressedIndex, searchItems } = await import("../src/lib/search.ts");
  const { pastEvents } = await import("../src/gen/events/past-data.ts");

  assert.ok(typeof compressedPastEventsSearchIndex === "string");
  assert.ok(compressedPastEventsSearchIndex.length > 0);

  const index = await loadCompressedIndex(compressedPastEventsSearchIndex, pastEvents, {
    fields: [
      "titleEn",
      "titleKn",
      "categoriesText",
      "locationEn",
      "locationKn",
      "performersText",
      "tagsText",
      "searchText",
    ],
    boost: {
      titleEn: 3,
      titleKn: 3,
      categoriesText: 2,
      performersText: 1.8,
      locationEn: 1.5,
      locationKn: 1.5,
      tagsText: 1.2,
      searchText: 1,
    },
  });

  const muhurthaResults = searchItems(index, "muhurtha");
  assert.ok(muhurthaResults.length > 0);

  const udupiResults = searchItems(index, "udupi");
  assert.ok(udupiResults.length > 0);

  const infixResults = searchItems(index, "hurtha");
  assert.ok(infixResults.length > 0);

  const fuzzyResults = searchItems(index, "muhurta");
  assert.ok(fuzzyResults.length > 0);
});
