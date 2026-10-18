import { testUiSettings } from "./helpers/ui-settings.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../../src/lib/knowledge.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
runInNewContext(compiled, {
  exports,
  require: (name) => {
    if (name === "@/context/UiSettingsContext") return { useUiSettings: () => ({ ...testUiSettings, ...({ readingTimeSettings: { wordsPerMinute: 200 } }) }) };
    if (name === "@/gen/settings/ui-elements") return { readingTimeSettings: { wordsPerMinute: 200 } };
    assert.equal(name, "@/gen/content");
    return { defaultLang: "en" };
  },
});
const { knowledgeText, localizeArticle, articleHref, relatedArticles } = exports;
const bilingual = { en: "Source text", kn: "ಮೂಲ ಪಠ್ಯ" };
const item = (id, tags = []) => ({
  id, title: bilingual, summary: bilingual, status: bilingual, html: bilingual,
  tags: tags.map((code) => ({ code, ...bilingual })),
});

test("localization honors selected language, then generated default, then available text", () => {
  assert.equal(knowledgeText(bilingual, "kn"), bilingual.kn);
  assert.equal(knowledgeText(bilingual, "new-language"), bilingual.en);
  assert.equal(knowledgeText({ custom: "Available" }, "unknown"), "Available");
  assert.equal(knowledgeText({}, "unknown"), "");
  const localized = localizeArticle({ ...item("entry", ["topic"]), knowledge: { readMinutes: 2 } }, "kn");
  assert.equal(localized.title, bilingual.kn);
  assert.equal(localized.html, bilingual.kn);
  assert.equal(localized.tags[0], bilingual.kn);
  assert.equal(localized.knowledge.readMinutes, 2);
});

test("article links use collection routes rather than an invented global slug space", () => {
  for (const route of ["/projects", "/library/mantra", "/history/articles"]) {
    assert.equal(articleHref({ route }, "entry"), `${route}/entry`);
  }
});

test("related reading preserves explicit source order and never includes the open article", () => {
  const article = { ...item("a"), knowledge: { related: ["c", "b"] } };
  const section = { items: [article, item("b"), item("c")] };
  assert.equal(relatedArticles(section, article).map(({ id }) => id).join(","), "c,b");
});

test("automatic related reading uses shared source tags, ranked deterministically, with a three-item bound", () => {
  const article = item("a", ["one", "two"]);
  const section = { items: [article, item("unrelated"), item("z", ["one"]), item("c", ["one"]), item("b", ["one", "two"]), item("d", ["two"])] };
  assert.equal(relatedArticles(section, article).map(({ id }) => id).join(","), "b,c,d");
  assert.equal(relatedArticles({ items: [article, item("unrelated")] }, article).length, 0);
});

test("sitemap includes every knowledge article and the canonical Connect route", () => {
  const sitemapSource = readFileSync(new URL("../../src/app/sitemap.ts", import.meta.url), "utf8");
  const sitemapCode = ts.transpileModule(sitemapSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const sitemapExports = {};
  runInNewContext(sitemapCode, {
    exports: sitemapExports,
    URL,
    require: (name) => {
      if (name === "@/gen/library/data") return {
        librarySections: [
          { route: "/library/mantra", items: [{ id: "chant" }] },
          { route: "/history/articles", items: [{ id: "reading" }] },
          { route: "/projects", items: [{ id: "work" }] },
        ],
      };
      assert.equal(name, "@/gen/content");
      return {
        defaultLang: "en",
        content: { en: { media: { albums: [] } } },
        routes: ["/connect", "/projects"],
        siteConfig: { productionUrl: "https://example.org" },
      };
    },
  });
  const urls = Array.from(sitemapExports.default(), ({ url }) => url);
  assert.equal(urls.some((url) => url === "https://example.org/contact"), false);
  assert.equal(urls.some((url) => url === "https://example.org/connect"), true);
  for (const route of ["/library/mantra/chant", "/history/articles/reading", "/projects/work"]) {
    assert.equal(urls.includes(`https://example.org${route}`), true);
  }
  assert.equal(urls.filter((url) => url === "https://example.org/projects").length, 1);
});
