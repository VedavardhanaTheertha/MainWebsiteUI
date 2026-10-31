import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const jsx = (type, props) => ({ type, props });
const copy = { previous: "Previous fixture", next: "Next fixture" };

function nodes(tree, type) {
  if (!tree || typeof tree !== "object") return [];
  return [
    ...(tree.type === type ? [tree] : []),
    ...Array.from([tree.props?.children].flat(Infinity)).flatMap((child) => nodes(child, type)),
  ];
}

function renderPageCarousel(items) {
  const exports = {};
  const track = { current: null };
  const source = ts.transpileModule(read("src/components/home/PageCarousel.tsx"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (name) => {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return { useState: (initial) => [initial, () => {}] };
      if (name === "@/hooks/useAutoScrollRail") return { useAutoScrollRail: () => track };
      if (name === "next/link") return { default: "fixture-link" };
      if (name === "@/components/presentation/ContentImage") return { default: "fixture-image" };
      if (name === "@/components/RailMotionControl") return { default: "fixture-motion-control" };
      if (name === "@/components/RailNavigation") return { default: "fixture-rail-navigation" };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return exports.default({ items });
}

test("page carousel renders one navigation sibling outside its track and every link", () => {
  for (const count of [1, 3]) {
    const items = Array.from({ length: count }, (_, index) => ({
      id: `fixture-${index}`, url: `/fixture-${index}`, title: `Fixture ${index}`,
      image: "/fixture.webp", page_type: "Fixture type", description: "Fixture description",
    }));
    const tree = renderPageCarousel(items);
    const controls = nodes(tree, "fixture-rail-navigation");
    assert.equal(controls.length, 1);
    const track = nodes(tree, "div").find((node) => node.props.className?.includes("layout-carousel-track"));
    const siblings = Array.from(tree.props.children).flat(Infinity);
    assert.ok(siblings.includes(track));
    assert.ok(siblings.includes(controls[0]));
    assert.equal(nodes(track, "fixture-rail-navigation").length, 0);
    assert.equal(controls[0].props.scrollRef, track.props.ref);
    const links = nodes(tree, "fixture-link");
    assert.equal(links.length, count);
    for (const link of links) {
      assert.ok(link.props.className.split(" ").includes("collection-tile"));
      assert.ok(link.props.className.split(" ").includes("layout-info-tile"));
      const category = nodes(link, "p").find((node) => node.props.className?.split(" ").includes("layout-tile-category"));
      const title = nodes(link, "h2").find((node) => node.props.className?.split(" ").includes("layout-tile-title"));
      const summary = nodes(link, "p").find((node) => node.props.className?.split(" ").includes("layout-tile-summary"));
      assert.equal(category?.props.children, "Fixture type");
      assert.equal(title?.props.children, items[links.indexOf(link)].title);
      assert.equal(summary?.props.children, "Fixture description");
      assert.equal(nodes(link, "fixture-rail-navigation").length, 0);
      assert.equal(nodes(link, "button").length, 0);
    }
  }
  assert.equal(renderPageCarousel([]), null);
});

function navigation({ enabled = true, reducedMotion = false } = {}) {
  const source = ts.transpileModule(read("src/components/RailNavigation.tsx"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  const state = [];
  const refs = [];
  const effects = [];
  const frames = new Map();
  const observers = [];
  let cursor = 0;
  let refCursor = 0;
  let mounted = false;
  let frameId = 0;
  class Observer {
    observed = new Set();
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.observed.add(element); }
    disconnect() { this.observed.clear(); }
  }
  class Track extends EventTarget {
    clientWidth = 300;
    scrollWidth = 900;
    scrollLeft = 0;
    children = [new EventTarget(), new EventTarget()];
    scrollBy(options) { this.lastScroll = options; }
  }
  const track = new Track();
  const view = new EventTarget();
  const scrollRef = { current: track };
  vm.runInNewContext(source, {
    exports, Event, window: view, ResizeObserver: Observer, MutationObserver: Observer,
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    require: (name) => {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        useState: (initial) => {
          const slot = cursor++;
          if (!(slot in state)) state[slot] = initial;
          return [state[slot], (value) => { state[slot] = typeof value === "function" ? value(state[slot]) : value; }];
        },
        useRef: (initial) => refs[refCursor++] ?? (refs[refCursor - 1] = { current: initial }),
        useEffect: (effect) => { if (!mounted) effects.push(effect); },
      };
      if (name === "@/context/LanguageContext") return { useLang: () => ({ tr: { layout_experiments: copy } }) };
      if (name === "@/context/UiSettingsContext") return { useUiSettings: () => ({ layoutSettings: { carouselNavigation: enabled } }) };
      if (name === "@/hooks/useReducedMotion") return { useReducedMotion: () => reducedMotion };
      if (name === "lucide-react") return { ChevronLeft: "previous-icon", ChevronRight: "next-icon" };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const render = () => {
    cursor = refCursor = 0;
    return exports.default({ scrollRef });
  };
  const initial = render();
  const cleanups = effects.map((effect) => effect()).filter(Boolean);
  mounted = true;
  for (const callback of frames.values()) callback();
  frames.clear();
  return { initial, render, track, view, observers, cleanup: () => cleanups.forEach((cleanup) => cleanup()) };
}

test("rail navigation is default-off and independent of autoplay and reduced motion", () => {
  const off = navigation({ enabled: false });
  assert.equal(off.initial, null);
  assert.equal(off.observers.length, 0);
  for (const reducedMotion of [false, true]) {
    const fixture = navigation({ reducedMotion });
    const buttons = fixture.render().props.children;
    assert.deepEqual(Array.from(buttons, (button) => button.type), ["button", "button"]);
    assert.equal(buttons[0].props["aria-label"], copy.previous);
    assert.equal(buttons[1].props["aria-label"], copy.next);
    assert.equal(buttons[0].props.disabled, true);
    assert.equal(buttons[1].props.disabled, false);
    buttons[1].props.onClick();
    assert.equal(fixture.track.lastScroll.left, 255);
    assert.equal(fixture.track.lastScroll.behavior, reducedMotion ? "instant" : "smooth");
    fixture.cleanup();
  }
});

test("rail boundaries update for scroll, overflow, resized cards and loading content", () => {
  const fixture = navigation();
  const { track, render, observers } = fixture;
  assert.equal(observers[0].observed.size, 3);
  track.scrollLeft = 600;
  track.dispatchEvent(new Event("scroll"));
  assert.deepEqual(Array.from(render().props.children, (button) => button.props.disabled), [false, true]);
  render().props.children[0].props.onClick();
  assert.equal(track.lastScroll.left, -255);
  track.scrollWidth = 300;
  observers[0].callback();
  assert.deepEqual(Array.from(render().props.children, (button) => button.props.disabled), [true, true]);
  track.scrollWidth = 1200;
  track.scrollLeft = 0;
  track.dispatchEvent(new Event("load"));
  assert.deepEqual(Array.from(render().props.children, (button) => button.props.disabled), [true, false]);
  track.children.push(new EventTarget());
  observers[1].callback();
  assert.equal(observers[0].observed.size, 4);
  fixture.cleanup();
  assert.ok(observers.every((observer) => observer.observed.size === 0));
  const before = render().props.children[1].props.disabled;
  track.scrollWidth = 300;
  track.dispatchEvent(new Event("scroll"));
  track.dispatchEvent(new Event("load"));
  fixture.view.dispatchEvent(new Event("resize"));
  assert.equal(render().props.children[1].props.disabled, before, "listeners are removed");
});

test("focused navigation pauses rail motion until focus leaves the controls", () => {
  const fixture = navigation();
  const interactions = [];
  for (const name of ["rail-interaction-start", "rail-interaction-end"]) {
    fixture.track.addEventListener(name, () => interactions.push(name));
  }
  let tree = fixture.render();
  tree.props.onFocus();
  tree.props.children[1].props.onClick();
  assert.equal(interactions.includes("rail-interaction-end"), false);
  tree.props.onBlur({ currentTarget: { contains: () => true }, relatedTarget: {} });
  assert.equal(interactions.includes("rail-interaction-end"), false);
  tree = fixture.render();
  tree.props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: null });
  assert.equal(interactions.at(-1), "rail-interaction-end");
  fixture.cleanup();
});

test("homepage experiments preserve hero defaults and scope featured composition and mobile peeking", () => {
  const css = read("src/app/home-experiments.css");
  const hero = read("src/components/home/HeroCarousel.tsx");
  assert.match(hero, /home-hero-viewport relative h-\[462px\] lg:h-\[600px\]/);
  assert.doesNotMatch(css, /hero-text-overlay|data-image-backed-tiles|data-adaptive-hero/);
  for (const selector of css.matchAll(/([^{}]+)\{/g)) {
    if (!selector[1].trim().startsWith("@")) assert.match(selector[1], /:root\[data-(?:featured-tiles|section-headers|carousel-navigation)="on"\]/);
  }
  for (const selector of css.matchAll(/([^{}]*data-featured-tiles[^{}]*)\{/g)) {
    assert.match(selector[1], /\.home-featured-layout \.layout-tile-grid/);
  }
  assert.match(css, /@media \(max-width: 47\.999rem\)[\s\S]*\.layout-carousel-track/);
  assert.match(css, /\.layout-rail-navigation\s*\{\s*position: absolute;\s*inset: 0;[\s\S]*?align-items: center;\s*justify-content: space-between;/);
  assert.match(css, /\.layout-rail-navigation\s*\{[^}]*pointer-events: none;/);
  assert.match(css, /\.layout-rail-navigation button\s*\{[^}]*pointer-events: auto;/);
  assert.match(css, /:has\(> \.layout-rail-navigation\) > \.layout-rail-motion-control\s*\{\s*right: 0\.5rem;\s*top: calc\(50% \+ 3\.25rem\);/);
  assert.match(read("src/components/RailMotionControl.tsx"), /className=\{`layout-rail-motion-control absolute /);
  assert.doesNotMatch(css, /\border\s*:|grid-auto-flow:\s*dense/);
  const page = read("src/components/home/PageCarousel.tsx");
  assert.match(page, /RailMotionControl/);
  assert.match(page, /<RailNavigation scrollRef=\{track\}/);
  assert.match(page, /layout-carousel-track/);
});

test("new homepage section introductions read translated copy without invented collection links", () => {
  for (const [component, keys] of [
    ["SpotlightCarousel", ["spotlight_title", "spotlight_description"]],
    ["HomeFeatures", ["features_title", "features_description"]],
    ["BottomLinks", ["explore_description", "guidance_description"]],
  ]) {
    const source = read(`src/components/home/${component}.tsx`);
    assert.match(source, /layoutSettings\.sectionHeaders/);
    for (const key of keys) assert.ok(source.includes(`tr.layout_experiments.${key}`));
    assert.doesNotMatch(source, /href=|view_all/);
    assert.match(source, /layout-section-header/);
  }
});

test("section header rendering is opt-in and keeps configured shortcut order", () => {
  const home = {
    top_carousel: [{ id: "spotlight-first" }, { id: "spotlight-second" }],
    bottom_carousel: [{ id: "feature-first" }, { id: "feature-second" }],
    explore_carousel: [{ id: "explore-first" }, { id: "explore-second" }],
    remidies_carousel: [{ id: "guidance-first" }, { id: "guidance-second" }],
    explore_title: "Explore fixture", guidance_title: "Guidance fixture",
    explore_label: "Explore label fixture", guidance_label: "Guidance label fixture",
  };
  for (const sectionHeaders of [false, true]) {
    for (const component of ["HomeFeatures", "BottomLinks", "SpotlightCarousel"]) {
      const exports = {};
      const source = ts.transpileModule(read(`src/components/home/${component}.tsx`), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText;
      vm.runInNewContext(source, {
        exports,
        require: (name) => {
          if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
          if (name === "@/context/LanguageContext") return { useLang: () => ({ tr: { home, layout_experiments: {
            features_title: "Features fixture", features_description: "Feature introduction fixture",
            spotlight_title: "Spotlight fixture", spotlight_description: "Spotlight introduction fixture",
            explore_description: "Explore introduction fixture", guidance_description: "Guidance introduction fixture",
          } } }) };
          if (name === "@/context/UiSettingsContext") return { useUiSettings: () => ({ layoutSettings: { sectionHeaders } }) };
          if (name === "./HomePageGrid" || name === "./PageCarousel") return { default: "fixture-grid" };
          throw new Error(`Unexpected import: ${name}`);
        },
      });
      const tree = exports.default();
      const paragraphs = nodes(tree, "p").map((node) => node.props.children);
      assert.equal(paragraphs.some((text) => text?.includes("introduction fixture")), sectionHeaders);
      const configured = component === "HomeFeatures" ? [home.bottom_carousel]
        : component === "SpotlightCarousel" ? [home.top_carousel]
          : [home.explore_carousel, home.remidies_carousel];
      assert.deepEqual(nodes(tree, "fixture-grid").map((node) => node.props.items), configured);
      if (!sectionHeaders && component === "SpotlightCarousel") assert.equal(tree.type, "fixture-grid");
      if (sectionHeaders && component === "SpotlightCarousel") {
        assert.doesNotMatch(tree.props.className, /\blayout-(?:wide|section)\b/);
        const carousel = renderPageCarousel(nodes(tree, "fixture-grid")[0].props.items);
        const sections = [tree, ...nodes(carousel, "section")];
        assert.equal(sections.filter((node) => node.props.className?.split(" ").includes("layout-wide")).length, 1);
        assert.equal(sections.filter((node) => node.props.className?.split(" ").includes("layout-section")).length, 1);
        assert.match(read("src/app/home-experiments.css"), /data-section-headers="on"\]\[data-layout-profiles="on"\] \.home-spotlight > \.layout-section-header/);
      }
    }
  }
});
