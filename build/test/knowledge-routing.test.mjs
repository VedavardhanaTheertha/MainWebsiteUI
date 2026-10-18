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
  { id: "articles", route: "/history/articles", items: [{ id: "first-article" }, { id: "second-article" }] },
  { id: "pilgrim", route: "/history/pilgrim-guide", items: [{ id: "first-guide" }] },
  { id: "projects", route: "/projects", items: [{ id: "first-project" }] },
];
const routing = loadModule("../../src/lib/knowledge-routing.ts", {
  "next/navigation": { notFound: () => { throw new Error("Not found"); } },
  "@/gen/library/data": { librarySections: sections },
  "@/gen/content": {},
  "./knowledge": {},
});

for (const prefix of ["library", "history"]) {
  test(`${prefix} article pages generate both dynamic segments without inherited layout params`, () => {
    const page = loadModule(`../../src/app/${prefix}/[section]/[article]/page.tsx`, {
      "@/lib/knowledge-routing": routing,
      "@/components/library/KnowledgeArticlePage": {},
      "react/jsx-runtime": {},
    });
    const expected = sections
      .filter(({ route }) => route.startsWith(`/${prefix}/`))
      .flatMap(({ route, items }) => items.map(({ id }) => ({
        section: route.slice(prefix.length + 2),
        article: id,
      })));
    // A sibling collection page is not an ancestor layout, so Next passes no section.
    const actual = page.generateStaticParams({ params: {} });
    assert.ok(actual.length > 0, "Static export must not receive an empty article parameter list.");
    assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    assert.equal(JSON.stringify(page.generateStaticParams()), JSON.stringify(expected));
    assert.equal(page.dynamicParams, false);
    assert.equal(new Set(actual.map(({ section, article }) => `${section}/${article}`)).size, actual.length);
  });
}
