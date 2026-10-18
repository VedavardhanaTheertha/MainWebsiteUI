import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  bhaktiLocalePresentation, discoverLanguageContent, localizeBhaktiSong, resolveLocalizedValues,
} from "../language-content.mjs";

test("localized maps use the configured default, keep authored empty values and preserve arrays", () => {
  const codes = ["first", "default", "third"];
  assert.deepEqual(resolveLocalizedValues({ first: "", default: "Fallback", third: "Third" },
    codes, "default"), { first: "", default: "Fallback", third: "Third" });
  assert.deepEqual(resolveLocalizedValues({ default: ["Artist"] }, codes, "default", []),
    { first: ["Artist"], default: ["Artist"], third: ["Artist"] });
  assert.deepEqual(resolveLocalizedValues("Shared", codes, "third"),
    { first: "Shared", default: "Shared", third: "Shared" });
});

test("UI localization selects arbitrary active/default locales without selecting an unrelated locale", async () => {
  const exports = {};
  const source = await readFile(new URL("../../src/lib/localization.ts", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports, require: () => ({ defaultLang: "fallback" }) });
  assert.equal(exports.localizedText({ fallback: "Default", third: "Active" }, "third"), "Active");
  assert.equal(exports.localizedText({ fallback: "Default", third: "" }, "third"), "");
  assert.equal(exports.localizedText({ fallback: "Default", unrelated: "Wrong" }, "missing"), "Default");
  assert.equal(exports.localizedText({ unrelated: "Wrong" }, "missing"), "");
  assert.deepEqual(exports.localized({ fallback: ["Artist"] }, "missing"), ["Artist"]);
});

test("Bhakti presentation follows metadata and defaults instead of language codes", () => {
  const presentation = bhaktiLocalePresentation({
    source: { bhakti: { variant: "original", title_class: "original-title", reader_class: "original-reader" } },
    roman: { bhakti: { variant: "transliteration", title_class: "roman-title", reader_class: "roman-reader" } },
    third: {},
  }, "source");
  assert.equal(presentation.third.variant, "original");
  assert.equal(presentation.roman.reader_class, "roman-reader");
  const song = { title: "ಮೂಲ ಶೀರ್ಷಿಕೆ", kruti: "Composer", "kruti-kn": "ಕವಿ", ankita: "Signature", "ankita-kn": "ಅಂಕಿತ" };
  const generated = localizeBhaktiSong(song, "Transliterated title", presentation, {
    original: "<p>ಮೂಲ ಸಾಹಿತ್ಯ</p>", transliteration: "<p>Original lyrics transliterated</p>",
  });
  assert.equal(generated.localized.source.title, song.title);
  assert.equal(generated.localized.third.kruti, song["kruti-kn"]);
  assert.equal(generated.localized.roman.title, "Transliterated title");
  assert.equal(generated.localized.roman.ankita, song.ankita);
  assert.equal(generated.localizedHtml.source, "<p>ಮೂಲ ಸಾಹಿತ್ಯ</p>");
  assert.equal(generated.localizedHtml.third, generated.localizedHtml.source);
  assert.throws(() => bhaktiLocalePresentation({ source: {} }, "source"), /Default language/);
});

test("current language metadata preserves original-script and transliterated Bhakti presentation", () => {
  const { codes, defaultLanguage, metadata } = discoverLanguageContent(fileURLToPath(new URL("../..", import.meta.url)));
  const presentation = bhaktiLocalePresentation(metadata, defaultLanguage);
  assert.deepEqual(Object.keys(presentation).sort(), codes);
  assert.equal(presentation.en.variant, "transliteration");
  assert.equal(presentation.en.title_class, "font-sans font-semibold");
  assert.equal(presentation.kn.variant, "original");
  assert.equal(presentation.kn.reader_class, "font-kannada");
});
