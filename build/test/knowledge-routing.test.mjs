import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadModule(relativePath, dependencies) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
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

const sections = [
  { id: "mantra", route: "/library/mantra", items: [{ id: "first-chant" }, { id: "second-chant" }] },
  { id: "jnana", route: "/library/jnana", items: [{ id: "first-term" }] },
  { id: "articles", route: "/library/articles", items: [{ id: "first-article" }, { id: "second-article" }] },
  { id: "pilgrim", route: "/library/pilgrim-guide", items: [{ id: "first-guide" }] },
  { id: "projects", route: "/projects", items: [{ id: "first-project" }] },
];
const routing = loadModule("../../src/lib/knowledge-routing.ts", {
  "next/navigation": { notFound: () => { throw new Error("Not found"); } },
  "@/gen/library/data": { librarySections: sections },
  "@/gen/content": { defaultLang: "en" },
  "./knowledge": {
    articleHref: (section, id) => `${section.route}#${id}`,
    localizeArticle: (article) => ({ title: article.id, summary: article.id }),
  },
});

test("findKnowledgeArticle resolves valid section and article or throws notFound", () => {
  const found = routing.findKnowledgeArticle("/library/mantra", "first-chant");
  assert.equal(found.article.id, "first-chant");
  assert.equal(found.section.id, "mantra");
  assert.throws(() => routing.findKnowledgeArticle("/library/mantra", "unknown"), /Not found/);
});

test("knowledgeArticleMetadata builds metadata with anchor canonical", () => {
  const meta = routing.knowledgeArticleMetadata("/library/mantra", "first-chant");
  assert.equal(meta.title, "first-chant");
  assert.equal(meta.alternates.canonical, "/library/mantra#first-chant");
});
