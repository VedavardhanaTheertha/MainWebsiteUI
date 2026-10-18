import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = (file) => readFileSync(new URL(`../../src/${file}`, import.meta.url), "utf8");
const css = source("app/collection-experiments.css");
const files = {
  seva: source("components/SevasBrowser.tsx"),
  library: source("components/library/LibrarySectionBrowser.tsx"),
  albums: source("components/media/MediaAlbumsBrowser.tsx"),
};
function load(file, symbol, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(`${source(file)}\n${symbol ? `export { ${symbol} };` : ""}`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    exports,
    require: (id) => Object.hasOwn(dependencies, id) ? dependencies[id]
      : id.startsWith("@/") || id.startsWith(".") ? {} : require(id),
  });
  return exports;
}
const cards = load("lib/collection-presentation.ts");
const image = { default: ({ src, alt }) => createElement("img", { src, alt }) };
const link = { default: ({ href, ...props }) => createElement("a", { href, ...props }) };
const shared = {
  "@/lib/collection-presentation": cards,
  "@/components/presentation/ContentImage": image,
  "next/image": image,
  "next/link": link,
};

test("every experiment CSS rule is default-off and independently root-gated", () => {
  for (const rule of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    assert.match(rule[1].trim(), /^:root\[data-(?:layout-profiles|compact-collections|tile-information)="on"\]/);
  }
  assert.doesNotMatch(css, /data-(?:layout-profiles|compact-collections|tile-information)="off"/);
});

test("tile rounding is shared by collection cards and only the hero's bottom corners", () => {
  assert.match(cards.collectionCardClassName("collection"), /collection-tile/);
  assert.match(cards.collectionCardClassName("featured", true), /collection-tile/);
  assert.match(source("app/globals.css"), /\.collection-tile\s*\{\s*border-radius: var\(--tile-corner-radius, var\(--radius-xl\)\);/);
  assert.match(source("components/home/HeroCarousel.tsx"), /className="hero-rounded-frame /);
  assert.match(source("app/globals.css"), /\.hero-rounded-frame\s*\{\s*border-bottom-left-radius: var\(--tile-corner-radius, 22px\);\s*border-bottom-right-radius: var\(--tile-corner-radius, 22px\);/);
  for (const file of ["components/home/HeroCarousel.tsx", "components/home/HomeTiles.tsx", "components/media/MediaViewer.tsx"]) {
    assert.doesNotMatch(source(file), /collection-tile/);
  }
});

test("semantic profiles have explicit widths and leave dialogs alone", () => {
  for (const [name, width] of [["wide", 80], ["collection", 72], ["reading", 48]]) {
    assert.match(css, new RegExp(`\\.layout-${name}:not\\(:where\\(\\[role="dialog"\\] \\*, \\[aria-modal="true"\\] \\*\\)\\)\\s*\\{\\s*max-width: ${width}rem`));
  }
  assert.match(css, /padding-inline: clamp/);
  assert.match(css, /\.layout-section[^{}]+\{\s*padding-block: clamp/);
  assert.match(source("components/library/KnowledgeArticlePage.tsx"), /className="layout-reading layout-section /);
  assert.doesNotMatch(source("components/library/KnowledgeBody.tsx"), /layout-reading/);
});

test("only ordinary seva/library results opt into genuine compact thumbnail rows", () => {
  for (const file of [files.seva, files.library]) {
    assert.equal((file.match(/layout-compact-grid/g) ?? []).length, 1);
    assert.match(file, /layout-compact-card/);
    assert.match(file, /collectionPagination\.loadIncrement/);
  }
  for (const file of ["components/media/MediaAlbumsBrowser.tsx", "components/media/MediaAlbumView.tsx", "components/home/HomePageGrid.tsx", "components/SectionHub.tsx", "components/ImageListCards.tsx"]) {
    assert.doesNotMatch(source(file), /layout-compact-(?:grid|card)/);
  }
  assert.match(css, /grid-template-columns: clamp\(4\.5rem, 20vw, 7rem\) minmax\(0, 1fr\)/);
  assert.match(css, /height: auto;\s*min-height: 0;\s*padding: 0;\s*overflow: visible/);
  assert.match(css, /> \.visual-tile-art\s*\{\s*position: relative;\s*inset: auto;\s*z-index: auto/);
  assert.match(css, /data-compact-collections="on"\]\[data-image-backed-tiles="on"/);
  assert.match(css, /var\(--tile-overlay-opacity, 0\.4\)/);
  assert.doesNotMatch(css, /object-fit/);
  assert.match(css, /:root\[data-compact-collections="on"\]\[data-image-backed-tiles="on"\] \.layout-compact-grid > \.layout-compact-card > \.visual-tile-art \.content-image-foreground\s*\{\s*object-position: center;\s*\}/);
  assert.equal((css.match(/object-position:/g) ?? []).length, 1);
});

test("information hierarchy is opt-in, unclamped, and does not target event/fullscreen bodies", () => {
  for (const [name, order] of [["category", 0], ["title", 1], ["summary", 2], ["footer", 3], ["actions", 5]]) {
    assert.match(css, new RegExp(`\\.layout-tile-${name}\\s*\\{\\s*order: ${order}`));
  }
  for (const rule of css.matchAll(/:root\[data-tile-information="on"\]([^{}]+)\{/g)) {
    assert.match(rule[1], /\.layout-info-tile/);
  }
  assert.match(css, /-webkit-line-clamp: unset/);
  assert.doesNotMatch(css, /display:\s*none|visibility:\s*hidden/);
  assert.match(source("components/home/HomePageGrid.tsx"), /className="layout-tile-grid /);
  assert.doesNotMatch(source("components/home/HomePageGrid.tsx"), /layout-collection/);
});

test("rail navigation shares the original refs and retains pause controls", () => {
  for (const [file, refs] of [[files.seva, ["featured"]], [files.library, ["featured"]], [files.albums, ["top", "recent"]]]) {
    assert.equal((file.match(/layout-carousel-track/g) ?? []).length, refs.length);
    assert.equal((file.match(/<RailMotionControl /g) ?? []).length, refs.length);
    for (const ref of refs) {
      assert.ok(file.includes(`<RailNavigation scrollRef={${ref}ScrollRef} />`));
      assert.ok(file.includes(`ref={${ref}ScrollRef}`));
    }
  }
});

test("seva rows remain one accessible detail action with full metadata and unchanged booking", () => {
  const SevaCard = load("components/SevasBrowser.tsx", "SevaCard", {
    ...shared,
    "@/gen/content": { siteConfig: { basePath: "" } },
    "@/lib/localization": { localizedText: (value) => value },
  }).SevaCard;
  const html = renderToStaticMarkup(createElement(SevaCard, {
    seva: { image: "/provided.png", title: "Provided title", description: "Provided summary", deity: "Provided category", amount: 0 },
    lang: "en", anyAmount: "Provided price", onOpen: () => {},
  }));
  assert.equal((html.match(/<button /g) ?? []).length, 1);
  assert.doesNotMatch(html, /<a /);
  for (const value of ["Provided title", "Provided summary", "Provided category", "Provided price", "layout-compact-card", "layout-tile-footer"]) assert.ok(html.includes(value));
  assert.match(files.seva, /href=\{seva\.bookingUrl\}/);
});

test("library cards retain categories, summaries, reading time and detail interaction", () => {
  const ArticleTile = load("components/library/LibrarySectionBrowser.tsx", "ArticleTile", {
    ...shared,
    "@/context/LanguageContext": { useLang: () => ({ tr: { library_browser: { read_minutes: "Provided {count} minutes", detail_labels: {} } } }) },
    "@/context/UiSettingsContext": { useUiSettings: () => ({ readingTimeSettings: {} }) },
    "@/lib/knowledge": { knowledgeReadingTime: () => ({ minutes: 7, estimated: false }) },
  }).ArticleTile;
  const article = { image: "/provided.png", title: "Provided title", summary: "Provided summary", status: "Provided category" };
  const ordinary = renderToStaticMarkup(createElement(ArticleTile, { article, sectionId: "stories", onOpen: () => {} }));
  const featured = renderToStaticMarkup(createElement(ArticleTile, { article, sectionId: "stories", featured: true, onOpen: () => {} }));
  assert.match(ordinary, /layout-compact-card/);
  assert.doesNotMatch(featured, /layout-compact-card/);
  for (const html of [ordinary, featured]) {
    for (const value of ["Provided title", "Provided summary", "Provided category", "Provided 7 minutes", "layout-tile-reading-time"]) assert.ok(html.includes(value));
    assert.equal((html.match(/<button /g) ?? []).length, 1);
  }
});

test("album metadata stays within a single navigation link, never a compact row", () => {
  const AlbumTile = load("components/media/MediaAlbumsBrowser.tsx", "AlbumTile", {
    ...shared,
    "@/lib/media-utils": { mediaCounts: () => ({ photos: 2, videos: 1 }) },
  }).AlbumTile;
  const html = renderToStaticMarkup(createElement(AlbumTile, {
    album: { id: "provided", cover: "/provided.png", title: "Provided title", description: "Provided summary", date: "2026-10-18", event: "Provided event", items: [] },
    photoLabel: "Provided photos", videoLabel: "Provided videos", unknownDate: "Provided unknown",
  }));
  assert.equal((html.match(/<a /g) ?? []).length, 1);
  assert.match(html, /href="\/albums\/provided"/);
  assert.match(html, /<time dateTime="2026-10-18">2026-10-18<\/time>/);
  assert.match(html, /layout-tile-footer layout-tile-date/);
  assert.doesNotMatch(html, /layout-compact-card/);
});

test("the final homepage group omits temporary footnotes and their separator without changing other grids", () => {
  const Grid = load("components/home/HomePageGrid.tsx", "", shared).default;
  const items = [{ id: "provided", url: "/provided", image: "/provided.png", title: "Provided title", description: "Provided summary", page_type: "Provided category", footnote: "Provided footnote" }];
  const ordinary = renderToStaticMarkup(createElement(Grid, { items }));
  const final = renderToStaticMarkup(createElement(Grid, { items, showFootnotes: false }));
  assert.match(ordinary, /Provided footnote/);
  assert.match(ordinary, /layout-tile-footer[^"]*border-t/);
  assert.doesNotMatch(final, /Provided footnote|layout-tile-footer|border-t/);
  for (const value of ["Provided title", "Provided summary", "Provided category", 'href="/provided"']) assert.ok(final.includes(value));
  assert.match(source("components/home/BottomLinks.tsx"), /<HomePageGrid items=\{home\.remidies_carousel\} showFootnotes=\{false\} \/>/);
  assert.match(source("components/home/BottomLinks.tsx"), /<HomePageGrid items=\{home\.explore_carousel\} \/>/);
});
