import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadRoute(path, dictionary) {
  const source = readFileSync(new URL(`../../src/app/${path}/page.tsx`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  runInNewContext(code, {
    exports,
    require(name) {
      if (name === "@/gen/content") return { defaultLang: "test", content: { test: dictionary } };
      if (name === "next/navigation") return { notFound() { throw new Error("not found"); } };
      if (name === "react/jsx-runtime") return { jsx: (component, props) => ({ component, props }) };
      assert.match(name, /^@\/components\//);
      return { default: () => null };
    },
  });
  return exports;
}

test("Learn and Panchanga metadata use their own canonical copy", () => {
  const dictionary = {
    pages: {
      learn: { title: "Learning title", intro: "Learning introduction" },
      local_copy: { panchanga_title: "Calendar title", panchanga_notice: "Calendar limitation" },
    },
  };
  const learning = loadRoute("learn", dictionary);
  assert.equal(learning.metadata.title, dictionary.pages.learn.title);
  assert.equal(learning.metadata.description, dictionary.pages.learn.intro);
  const calendar = loadRoute("panchanga", dictionary);
  assert.equal(calendar.metadata.title, dictionary.pages.local_copy.panchanga_title);
  assert.equal(calendar.metadata.description, dictionary.pages.local_copy.panchanga_notice);
});

test("Learn subject metadata is specific, falls back to its summary and rejects unknown IDs", async () => {
  const dictionary = {
    learn: [
      { id: "one", title: "First subject", description: "Full description", sub: "Summary" },
      { id: "two", title: "Second subject", sub: "Second summary" },
    ],
  };
  const route = loadRoute("learn/[id]", dictionary);
  const first = await route.generateMetadata({ params: Promise.resolve({ id: "one" }) });
  const second = await route.generateMetadata({ params: Promise.resolve({ id: "two" }) });
  assert.equal(first.title, "First subject");
  assert.equal(first.description, "Full description");
  assert.equal(second.title, "Second subject");
  assert.equal(second.description, "Second summary");
  await assert.rejects(route.generateMetadata({ params: Promise.resolve({ id: "missing" }) }), /not found/);
  assert.equal(route.dynamicParams, false);
  assert.equal(route.generateStaticParams().map(({ id }) => id).join(","), "one,two");
});
