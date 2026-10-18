import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { testUiSettings } from "./helpers/ui-settings.mjs";

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
    require: (id) => id === "@/context/UiSettingsContext" ? { useUiSettings: () => testUiSettings } :
      Object.hasOwn(dependencies, id) ? dependencies[id] : require(id),
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

const imagePresentation = load("components/presentation/ContentImage.tsx", {
  "next/image": {
    default: (props) => createElement("img", {
      src: props.src,
      alt: props.alt,
      sizes: props.sizes,
      loading: props.loading,
      className: props.className,
      "aria-hidden": props["aria-hidden"],
      "data-image-layer": props["data-image-layer"],
    }),
  },
});

function imageLayers(props) {
  const frame = imagePresentation.default(props);
  const [backdrop, foreground] = frame.props.children;
  return { frame, background: backdrop.type(backdrop.props), foreground };
}

test("content images render a complete sharp foreground and a decorative copy of the same source", () => {
  const props = { src: "/provided-poster.png", alt: "Provided poster description", sizes: "320px" };
  const { frame, background, foreground } = imageLayers(props);
  assert.equal(frame.props["data-content-image"], "frame");
  for (const image of [background, foreground]) {
    assert.equal(image.props.src, props.src);
    assert.equal(image.props.sizes, props.sizes);
    assert.equal(image.props.fill, true);
  }
  assert.equal(background.props.alt, "");
  assert.equal(background.props["aria-hidden"], "true");
  assert.equal(background.props.draggable, false);
  assert.equal(foreground.props.alt, props.alt);
  assert.equal(foreground.props["aria-hidden"], undefined);
  assert.equal(foreground.props.className, "content-image-foreground");
  assert.equal(foreground.props.style, undefined);
  const html = renderToStaticMarkup(frame);
  assert.equal((html.match(/<img /g) ?? []).length, 2);
  assert.equal((html.match(/alt="Provided poster description"/g) ?? []).length, 1);
});

test("image request options match while priority and error callbacks stay on the foreground", () => {
  const loader = ({ src }) => src;
  const onError = () => {};
  const onLoad = () => {};
  const props = {
    src: "/provided.png", overrideSrc: "/provided-original.png", alt: "",
    sizes: "80px", quality: 75, unoptimized: true, loader,
    loading: "eager", priority: true, fetchPriority: "high",
    crossOrigin: "anonymous", referrerPolicy: "no-referrer", onError, onLoad,
  };
  const { background, foreground } = imageLayers(props);
  for (const key of ["src", "overrideSrc", "sizes", "quality", "unoptimized", "loader", "loading", "crossOrigin", "referrerPolicy"]) {
    assert.equal(background.props[key], foreground.props[key], key);
  }
  for (const key of ["priority", "fetchPriority", "onError", "onLoad"]) {
    assert.equal(background.props[key], undefined, key);
    assert.equal(foreground.props[key], props[key], key);
  }
  assert.equal(imageLayers({ src: "/lazy.png", alt: "" }).background.props.loading, "lazy");
});

test("images default to cover; the opt-in treatment contains artwork and reveals only a blurred decorative layer", () => {
  const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");
  const foreground = css.match(/\.content-image-foreground\s*\{([^}]+)\}/)?.[1];
  const background = css.match(/\.content-image-backdrop\s*\{([^}]+)\}/)?.[1];
  assert.ok(foreground);
  assert.match(foreground, /object-fit:\s*cover/);
  assert.match(foreground, /padding:\s*0/);
  assert.match(background, /display:\s*none/);
  assert.match(css, /:root\[data-image-treatment="on"\] \.content-image-backdrop\s*\{[^}]*display:\s*block/);
  assert.match(css, /:root\[data-image-treatment="on"\] \.content-image-foreground\s*\{[^}]*object-fit:\s*contain/);
  assert.match(css, /:root\[data-image-treatment="on"\] \.content-image-frame > \.content-image-foreground\s*\{[^}]*padding:\s*8px/);
  assert.doesNotMatch(foreground, /filter|transform|transition/);
  assert.match(background, /object-fit:\s*cover/);
  assert.match(background, /blur\(14px\)/);
  assert.match(background, /brightness\(0\.65\)/);
  assert.match(background, /scale\(1\.12\)/);
  assert.doesNotMatch(background, /animation|transition/);
  assert.match(css, /\.content-image-artwork\s*\{[^}]*position:\s*relative/s);
});

test("content image surfaces share the treatment while viewer, logos, QR and platform icons keep their renderers", () => {
  const exceptions = new Set([
    "components/presentation/ContentImage.tsx",
    "components/ConnectBrowser.tsx",
    "components/MobileHeader.tsx",
    "components/PaymentQr.tsx",
    "components/SevasBrowser.tsx",
    "components/SiteFooter.tsx",
    "components/SiteHeader.tsx",
    "components/media/MediaViewer.tsx",
  ]);
  function inspect(relative = "") {
    for (const entry of readdirSync(new URL(`../../src/${relative}`, import.meta.url), { withFileTypes: true })) {
      const name = `${relative}${entry.name}`;
      if (entry.isDirectory()) {
        if (name !== "gen") inspect(`${name}/`);
      } else if (name.endsWith(".tsx")) {
        const source = readFileSync(new URL(`../../src/${name}`, import.meta.url), "utf8");
        if (/from "next\/image"/.test(source)) assert.ok(exceptions.has(name), name);
        assert.doesNotMatch(source, /className="object-cover/, name);
      }
    }
  }
  inspect();
  const viewer = readFileSync(new URL("../../src/components/media/MediaViewer.tsx", import.meta.url), "utf8");
  assert.match(viewer, /className="object-contain"/);
  assert.doesNotMatch(viewer, /ContentImage|ImageBackdrop/);
});

test("natural illustrations preserve annotation coordinates relative to the sharp artwork", () => {
  const KnowledgeBody = load("components/library/KnowledgeBody.tsx", {
    "@/context/LanguageContext": { useLang: () => ({
      lang: "fixture",
      tr: { library_browser: { detail_labels: { illustration: "Provided illustration" } } },
    }) },
    "@/lib/knowledge": { knowledgeText: (value) => value.fixture },
    "@/components/presentation/ContentImage": imagePresentation,
  }).default;
  const html = renderToStaticMarkup(createElement(KnowledgeBody, {
    sectionId: "articles",
    article: {
      html: "", tags: [],
      knowledge: {
        illustration: {
          src: "https://illustration.example.org/provided.png",
          alt: { fixture: "Provided illustration description" },
          annotations: [{
            x: 25, y: 75,
            label: { fixture: "Provided annotation" },
            explanation: { fixture: "Provided explanation" },
          }],
        },
      },
    },
  }));
  assert.match(html, /data-content-image="natural"/);
  assert.match(html, /class="content-image-frame rounded-\[inherit\]"/);
  assert.match(html, /class="content-image-artwork"><img[^>]+class="content-image-foreground"/);
  assert.match(html, /style="left:25%;top:75%"/);
  assert.equal((html.match(/alt="Provided illustration description"/g) ?? []).length, 1);
  assert.match(html, /Provided annotation/);
  assert.match(html, /Provided explanation/);
  const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(css.match(/\.content-image-natural\s*\{([^}]+)\}/)?.[1] ?? "", /overflow:\s*hidden/);
});

test("standalone hero keeps complete foreground images and captions outside the artwork", () => {
  const source = readFileSync(new URL("../../scripts/generate-content.mjs", import.meta.url), "utf8");
  assert.match(source, /class="hero-backdrop"[^>]*alt="" aria-hidden="true" loading="lazy"/);
  assert.match(source, /class="hero-foreground"/);
  assert.match(source, /\.hero-foreground \{ object-fit: cover; padding: 0; \}/);
  assert.match(source, /:root\[data-image-treatment="on"\] \.hero-foreground \{ object-fit: contain; padding: 8px; \}/);
  assert.match(source, /\.hero-content \{ position: relative;/);
  assert.doesNotMatch(source, /class="hero-overlay"|\.hero-image\.is-active img/);
});
