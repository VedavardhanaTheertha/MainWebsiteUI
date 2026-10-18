import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(relativePath, dependencies = {}) {
  const source = readFileSync(new URL(`../../src/${relativePath}`, import.meta.url), "utf8");
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText, {
    exports,
    require: (id) => Object.hasOwn(dependencies, id) ? dependencies[id] : require(id),
  });
  return exports;
}

const tones = load("lib/category-tones.ts");
const cards = load("lib/collection-presentation.ts");
const CategoryBadge = load("components/presentation/CategoryBadge.tsx", {
  "@/lib/category-tones": tones,
}).default;
const EmptyState = load("components/presentation/CollectionEmptyState.tsx").default;

test("category families share semantic tones without raw palette values", () => {
  for (const [first, second] of [
    ["festival", "pooja"],
    ["concert", "parayana"],
    ["dance", "yakshagana"],
    ["annadaana", "special"],
  ]) {
    assert.equal(tones.categoryToneClassName(first), tones.categoryToneClassName(second));
  }
  for (const code of ["festival", "concert", "dance", "pravachana", "utsava", "annadaana"]) {
    assert.match(tones.categoryToneClassName(code), /bg-\[var\(--color-/);
    assert.doesNotMatch(tones.categoryToneClassName(code), /#/);
  }
  assert.match(tones.categoryToneClassName("pravachana"), /--color-plum-50/);
});

test("unknown and inherited category names receive the same explicit fallback", () => {
  for (const code of [undefined, "", "unknown", "toString", "__proto__", "constructor"]) {
    assert.equal(tones.categoryToneClassName(code), tones.categoryToneClassName("utsava"));
  }
});

test("featured and collection card heights remain distinct", () => {
  assert.match(cards.collectionCardClassName("featured"), /(?:^| )h-80(?: |$)/);
  assert.doesNotMatch(cards.collectionCardClassName("featured"), /h-\[360px\]/);
  assert.match(cards.collectionCardClassName("collection"), /h-\[360px\]/);
  assert.doesNotMatch(cards.collectionCardClassName("collection"), /(?:^| )h-80(?: |$)/);
  assert.match(cards.collectionCardClassName("featured"), /border-\[var\(--color-saffron-600\)\]/);
  assert.match(cards.collectionCardClassName("collection"), /border-\[var\(--color-line\)\]/);
});

test("card chrome preserves focus feedback and leaves rail widths to callers", () => {
  for (const variant of ["featured", "collection"]) {
    const classes = cards.collectionCardClassName(variant);
    assert.match(classes, /focus-visible:outline-2/);
    assert.match(classes, /min-w-0/);
    assert.doesNotMatch(classes, /(?:^| )(?:max-w-|w-\[)/);
  }
  assert.match(cards.collectionCardImageClassName, /h-40/);
  assert.match(cards.collectionCardImageClassName, /shrink-0/);
  assert.match(cards.collectionCardBodyClassName, /min-h-0/);
});

test("category badge renders provided content and the shared category tone", () => {
  const html = renderToStaticMarkup(createElement(CategoryBadge, { category: "Provided category", code: "parayana" }));
  assert.match(html, /Provided category/);
  assert.match(html, /--color-info-50/);
  assert.doesNotMatch(html, /Provided category.*Provided category/);
});

test("empty shell renders supplied rich content without adding display copy", () => {
  const children = [
    createElement("h3", { key: "title" }, "Provided title"),
    createElement("button", { key: "action", type: "button" }, "Provided action"),
  ];
  const shell = EmptyState({ children });
  assert.equal(shell.props.children, children);
  const html = renderToStaticMarkup(shell);
  assert.match(html, /role="status"/);
  assert.match(html, /<h3>Provided title<\/h3>/);
  assert.match(html, /<button type="button">Provided action<\/button>/);
});

test("homepage icons use five shrinkable columns with complete wrapping labels", () => {
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: `page-${index}`,
    url: `/page-${index}`,
    icon: "calendar",
    tone: "saffron",
    title: `Provided complete localized label ${index}`,
  }));
  const HomeTiles = load("components/home/HomeTiles.tsx", {
    "@/context/LanguageContext": { useLang: () => ({ tr: { home: { icon_carousel: items } } }) },
    "next/link": { default: ({ href, ...props }) => createElement("a", { href, ...props }) },
  }).default;
  const html = renderToStaticMarkup(createElement(HomeTiles));
  assert.match(html, /data-carousel="icon_carousel" class="grid grid-cols-5 /);
  assert.equal((html.match(/<a /g) ?? []).length, 5);
  assert.equal((html.match(/min-w-0 min-h-11/g) ?? []).length, 5);
  assert.equal((html.match(/\[overflow-wrap:anywhere\]/g) ?? []).length, 5);
  assert.match(html, /size-11 .*min-\[360px\]:size-12 sm:size-\[54px\]/);
  assert.doesNotMatch(html, /overflow-x-auto|min-w-24|truncate|line-clamp/);
  for (const { title, url } of items) {
    assert.ok(html.includes(title));
    assert.ok(html.includes(`href="${url}"`));
  }
});
