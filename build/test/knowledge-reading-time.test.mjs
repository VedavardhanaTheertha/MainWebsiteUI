import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import { loadAuthoredLanguage } from "../authored-content.mjs";

function loadModule(relativePath, dependencies) {
  const compiled = ts.transpileModule(readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

const settings = { readingTimeSettings: { wordsPerMinute: 200 } };
const knowledge = loadModule("../../src/lib/knowledge.ts", {
  "@/gen/content": { defaultLang: "en" }, "@/gen/settings/ui-elements": settings,
});
const { knowledgeReadingTime, localizeArticle } = knowledge;
const article = (wordCount) => ({
  id: "story",
  title: "Title",
  summary: "",
  status: "",
  tags: [],
  html: `<p>${Array(wordCount).fill("word").join(" ")}</p>`,
});

test("story estimates use the existing 200-words-per-minute policy, rounding up with a one-minute floor", () => {
  assert.equal(knowledgeReadingTime(article(0)).minutes, 1);
  assert.equal(knowledgeReadingTime(article(199)).minutes, 1);
  assert.equal(knowledgeReadingTime(article(200)).minutes, 2);
  assert.equal(knowledgeReadingTime(article(400)).minutes, 3);
  assert.equal(knowledgeReadingTime(article(400)).estimated, true);
  assert.equal(knowledgeReadingTime({ title: "", html: "" }).minutes, 1);
});

test("explicit source readMinutes overrides derived estimates without being labeled estimated", () => {
  const supplied = { ...article(800), knowledge: { readMinutes: 2 } };
  assert.equal(knowledgeReadingTime(supplied).minutes, 2);
  assert.equal(knowledgeReadingTime(supplied).estimated, false);
  assert.equal(supplied.knowledge.readMinutes, 2);
});

test("story estimates use configured reading speed while explicit minutes still win", () => {
  settings.readingTimeSettings.wordsPerMinute = 100;
  try {
    assert.equal(knowledgeReadingTime(article(200)).minutes, 3);
    assert.equal(knowledgeReadingTime({ ...article(800), knowledge: { readMinutes: 2 } }).minutes, 2);
  } finally {
    settings.readingTimeSettings.wordsPerMinute = 200;
  }
});

test("estimates count visible localized title and body text, not markup, entities, comments, or embedded code", () => {
  const markup = `<p class="${Array(400).fill("attribute").join(" ")}">${Array(199).fill("word").join("&nbsp;")}</p>`;
  const hidden = `<script>${Array(400).fill("script").join(" ")}</script><style>${Array(400).fill("style").join(" ")}</style><!-- ${Array(400).fill("comment").join(" ")} -->`;
  assert.equal(knowledgeReadingTime({ title: "Title", html: `${markup}${hidden}` }).minutes, 1);
  assert.equal(knowledgeReadingTime({ title: "Two words", html: markup }).minutes, 2);
});

test("estimates recalculate from the selected localized article and keep combining-script words intact", () => {
  const bilingual = {
    ...article(0),
    title: { en: "Title", kn: "ಶೀರ್ಷಿಕೆ" },
    summary: { en: "", kn: "" },
    status: { en: "", kn: "" },
    html: { en: "<p>A short story.</p>", kn: `<p>${Array(400).fill("ಭಕ್ತಿ").join(" ")}</p>` },
  };
  assert.equal(knowledgeReadingTime(localizeArticle(bilingual, "en")).minutes, 1);
  assert.equal(knowledgeReadingTime(localizeArticle(bilingual, "kn")).minutes, 3);
  assert.equal(knowledgeReadingTime(localizeArticle(bilingual, "missing-language")).minutes, 1);
});

test("shared story renderer displays localized estimates without requiring metadata, and honors overrides", () => {
  let context;
  const { default: KnowledgeBody } = loadModule("../../src/components/library/KnowledgeBody.tsx", {
    react: React,
    "react/jsx-runtime": jsxRuntime,
    "@/context/LanguageContext": { useLang: () => context },
    "@/lib/knowledge": knowledge,
    "@/components/presentation/ContentImage": { ImageBackdrop: "image" },
  });
  for (const lang of ["en", "kn"]) {
    const copy = loadAuthoredLanguage(fileURLToPath(new URL("../../", import.meta.url)), lang);
    context = { lang, tr: copy };
    const estimated = renderToStaticMarkup(React.createElement(KnowledgeBody, { article: article(400), sectionId: "stories" }));
    assert.ok(estimated.includes(copy.library_browser.estimated_read_minutes.replace("{count}", "3")));
    const explicit = renderToStaticMarkup(React.createElement(KnowledgeBody, {
      article: { ...article(400), knowledge: { readMinutes: 2 } },
      sectionId: "stories",
    }));
    assert.ok(explicit.includes(copy.library_browser.read_minutes.replace("{count}", "2")));
    assert.ok(!explicit.includes(copy.library_browser.estimated_read_minutes.replace("{count}", "3")));
    const otherDomain = renderToStaticMarkup(React.createElement(KnowledgeBody, { article: article(400), sectionId: "articles" }));
    assert.ok(!otherDomain.includes(copy.library_browser.estimated_read_minutes.replace("{count}", "3")));
  }
});
