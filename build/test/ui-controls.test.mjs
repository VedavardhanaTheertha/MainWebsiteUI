import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import { loadAuthoredLanguage } from "../authored-content.mjs";

const rootDir = fileURLToPath(new URL("../../", import.meta.url));
const collectionPresentation = {};
vm.runInNewContext(ts.transpileModule(await readFile(
  new URL("../../src/lib/collection-presentation.ts", import.meta.url), "utf8",
), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, {
  exports: collectionPresentation,
});

function nodes(tree, predicate) {
  if (!tree || typeof tree !== "object") return [];
  return [...(predicate(tree) ? [tree] : []), ...[tree.props?.children].flat(Infinity).flatMap((child) => nodes(child, predicate))];
}

async function mount(name, enabled = true, additional = {}) {
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const state = [];
  let index = 0;
  vm.runInNewContext(ts.transpileModule(await readFile(
    new URL(`../../src/components/${name}.tsx`, import.meta.url), "utf8",
  ), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports,
    require: (dependency) => {
      if (dependency in additional) return additional[dependency];
      if (dependency === "@/lib/collection-presentation") return collectionPresentation;
      if (dependency === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (dependency === "react") return {
        useId: () => "filter-panel",
        useMemo: (calculate) => calculate(),
        useEffect: () => {},
        useRef: () => ({ current: null }),
        useState: (initial) => {
          const slot = index++;
          if (!(slot in state)) state[slot] = initial;
          return [state[slot], (value) => { state[slot] = typeof value === "function" ? value(state[slot]) : value; }];
        },
      };
      if (dependency === "lucide-react") return { Pause: "pause", Play: "play", SlidersHorizontal: "filters", GitBranch: "timeline", List: "list" };
      if (dependency === "next/link" || dependency === "next/image") return { default: dependency === "next/link" ? "link" : "image" };
      if (dependency === "@/hooks/useReducedMotion") return { useReducedMotion: () => false };
      if (dependency === "@/hooks/useDialog") return { useDialogsOpen: () => false };
      if (dependency === "@/gen/settings/ui-elements") return {
        railAutoScroll: { enabled }, browserDefaults: { advancedFiltersOpen: false, lineageView: "list" },
      };
      if (dependency === "@/context/LanguageContext") return { useLang: () => ({ tr: { page_controls: {
        open_filters: "Open filters", close_filters: "Close filters", pause_motion: "Pause", resume_motion: "Resume",
      } } }) };
      throw new Error(`Unexpected dependency: ${dependency}`);
    },
  });

  return (props) => { index = 0; return exports.default(props); };
}

test("homepage hero and feature tiles are single links with no separate CTA buttons", async () => {
    const tr = loadAuthoredLanguage(rootDir, "en");
    const language = { useLang: () => ({ lang: "fixture", tr, contentMode: "real" }) };
    const features = await mount("home/HomePageGrid");
    const tree = features({ items: tr.home.bottom_carousel });
    const links = nodes(tree, (node) => node.type === "link");
    assert.deepEqual(links.map((link) => link.props.href), tr.home.bottom_carousel.map((item) => item.url));
    assert.ok(links.every((link) => nodes(link, (node) => node.type === "image").length === 1));
    assert.ok(links.every((link) => nodes(link, (node) => node.type === "link").length === 1), "no nested CTA links");
    const buttons = nodes(tree, (node) => node.type === "button");
    assert.equal(buttons.length, 0, "event-style cards are single links without buttons");
    assert.match(tree.props.className, /grid gap-5 sm:grid-cols-2 lg:grid-cols-3/);
    assert.ok(links.every((link) => link.props.className.includes("h-[360px]")));
    assert.ok(links.every((link) => nodes(link, (node) => node.props?.className?.includes("relative h-40")).length === 1));
    const hero = await mount("home/HeroCarousel", true, {
      "@/context/LanguageContext": language,
      "@/gen/content": { defaultContentMode: "real", homeHero: { titles: { fixture: "Hero" }, href: "/about", images: ["/hero.jpg"] } },
      "@/gen/settings/ui-elements": { heroSettings: { autoplay: false } },
    });
    const banner = nodes(hero(), (node) => node.type === "link")[0];
    assert.equal(banner.type, "link");
    assert.equal(banner.props.href, "/about");
    assert.equal(nodes(banner, (node) => node.type === "link").length, 1);
    assert.equal(nodes(banner, (node) => node.type === "h1").length, 1);
  });

  test("learning tiles stretch their title link without trapping independent enrollment links", async () => {
    const tr = loadAuthoredLanguage(rootDir, "en");
    tr.learn[0].enrollmentUrl = "/approved-registration";
    const render = await mount("ImageListCards", true, {
      "@/context/LanguageContext": { useLang: () => ({ tr }) },
      "@/lib/learn": {
        approvedLearningUrl: (url) => url ?? null,
        learningDestination: (item) => item.id ? `/learn/${item.id}` : null,
      },
    });
    const tree = render({ contentKey: "learn" });
    const articles = nodes(tree, (node) => node.type === "article");
    for (const [index, tile] of articles.entries()) {
      const links = nodes(tile, (node) => node.type === "link");
      assert.equal(links.length, 1);
      assert.equal(links[0].props.children, tr.learn[index].title);
      assert.match(links[0].props.className, /after:absolute after:inset-0/);
      assert.equal(nodes(tile, (node) => node.props?.children === tr.pages.learn.details).length, 0);
    }
    const enroll = nodes(articles[0], (node) => node.type === "a")[0];
    assert.equal(enroll.props.href, "/approved-registration");
    assert.match(enroll.props.className, /relative z-10/);
    assert.equal(nodes(enroll, (node) => node.type === "link").length, 0);
  });
test("homepage top rail shares Upcoming Events motion, has a pause toggle and preserves image/text overlays", async () => {
  const tr = loadAuthoredLanguage(rootDir, "en");
  const calls = [];
  const ref = { current: null };
  const render = await mount("home/PageCarousel", true, {
    "@/hooks/useAutoScrollRail": { useAutoScrollRail: (count, paused) => { calls.push({ count, paused }); return ref; } },
    "@/components/RailMotionControl": { default: "motion-control" },
  });
  let tree = render({ items: tr.home.top_carousel });
  assert.deepEqual(calls, [{ count: 6, paused: false }]);
  const cards = nodes(tree, (node) => node.type === "link");
  assert.ok(cards.every((card) => card.props.className.includes("h-80 w-[82vw] max-w-[320px]")));
  assert.ok(cards.every((card) => card.props.className.includes("lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none")));
  assert.ok(cards.every((card) => nodes(card, (node) => node.props?.className === "absolute inset-0").length === 1), "top images remain full-card backgrounds");
  assert.ok(cards.every((card) => nodes(card, (node) => node.props?.className?.includes("absolute inset-x-0 bottom-0")).length === 1), "top text remains a bottom overlay");
  const track = nodes(tree, (node) => node.props?.ref === ref)[0];
  assert.equal(track.props.style.scrollSnapType, undefined, "continuous scrolling must not fight snap points");
  let control = nodes(tree, (node) => node.type === "motion-control")[0];
  assert.equal(control.props.className, "", "pause control remains available on desktop");
  control.props.onToggle();
  tree = render({ items: tr.home.top_carousel });
  assert.deepEqual(calls.at(-1), { count: 6, paused: true });
  control = nodes(tree, (node) => node.type === "motion-control")[0];
  assert.equal(control.props.paused, true);
  control.props.onToggle();
  render({ items: tr.home.top_carousel });
  assert.deepEqual(calls.at(-1), { count: 6, paused: false });
});

test("bottom, explore and remedies sections share the event-style grid and preserve configured counts", async () => {
  const tr = loadAuthoredLanguage(rootDir, "en");
  const dependencies = {
    "@/context/LanguageContext": { useLang: () => ({ tr }) },
    "./HomePageGrid": { default: "page-grid" },
  };
  const bottom = await mount("home/HomeFeatures", true, dependencies);
  assert.equal(nodes(bottom(), (node) => node.type === "page-grid")[0].props.items, tr.home.bottom_carousel);
  const links = await mount("home/BottomLinks", true, dependencies);
  const grids = nodes(links(), (node) => node.type === "page-grid");
  assert.equal(grids.length, 2);
  assert.equal(grids[0].props.items, tr.home.explore_carousel);
  assert.equal(grids[0].props.items.length, 3);
  assert.equal(grids[1].props.items, tr.home.remidies_carousel);
  assert.equal(grids[1].props.items.length, 3);
});

test("advanced filters are initially collapsed, icon-only, and reopen without unmounting their controls", async () => {
  const render = await mount("AdvancedFilters");
  const children = { type: "input", props: { value: "retained" } };
  const search = { type: "input", props: { type: "search" } };
  let tree = render({ children, search, active: true });
  let [, panel] = tree.props.children;
  let button = nodes(tree, (node) => node.type === "button")[0];
  const toolbar = nodes(tree, (node) => node.props?.className?.includes("flex min-w-0 items-end"))[0];
  assert.equal(toolbar.props.children[0].props.children, search, "search and toggle share one non-wrapping row");
  assert.equal(button.props["aria-expanded"], false);
  assert.equal(button.props["aria-label"], "Open filters");
  assert.equal(button.props["aria-controls"], panel.props.id);
  assert.equal(panel.props.hidden, true);
  assert.equal(panel.props.children, children);
  assert.ok(button.props.children.filter(Boolean).every((child) => typeof child !== "string"));
  button.props.onClick();
  tree = render({ children, search, active: true });
  [, panel] = tree.props.children;
  button = nodes(tree, (node) => node.type === "button")[0];
  assert.equal(button.props["aria-expanded"], true);
  assert.equal(button.props["aria-label"], "Close filters");
  assert.equal(panel.props.hidden, false);
  button.props.onClick();
  tree = render({ children, search });
  assert.equal(tree.props.children[1].props.hidden, true);
  assert.equal(tree.props.children[1].props.children, children);
});

test("lineage uses one icon to switch timeline/list while preserving its search", async () => {
  const copy = loadAuthoredLanguage(rootDir, "en");
  const labels = copy.pages.parampara;
  const render = await mount("ParamparaBrowser", true, {
    "next/image": "image", "next/link": "link",
    "@/context/LanguageContext": { useLang: () => ({ lang: "fixture", tr: copy, contentMode: "real" }) },
    "@/gen/content": { defaultContentMode: "real", defaultLang: "fixture" },
    "@/gen/parampara/data": { paramparaByLanguage: { fixture: [
      { id: "teacher", name: "Teacher", officialPosition: 1, summary: "Summary" },
    ] } },
    "@/hooks/useDialog": { useDialog: () => ({ current: null }) },
    "@/hooks/useMiniSearch": { useMiniSearch: (items, query) => items.filter((item) => item.name.includes(query)) },
  });

  let tree = render();
  const input = nodes(tree, (node) => node.type === "input")[0];
  input.props.onChange({ target: { value: "Teacher" } });
  let toggle = nodes(tree, (node) => node.props?.["aria-label"] === labels.show_timeline)[0];
  assert.equal(toggle.props.children.type, "timeline");
  toggle.props.onClick();
  tree = render();
  toggle = nodes(tree, (node) => node.props?.["aria-label"] === labels.show_list)[0];
  assert.equal(toggle.props.children.type, "list");
  assert.match(nodes(tree, (node) => node.type === "ol")[0].props.className, /border-l-2/);
  assert.equal(nodes(tree, (node) => node.type === "input")[0].props.value, "Teacher");
  toggle.props.onClick();
  tree = render();
  assert.match(nodes(tree, (node) => node.type === "ol")[0].props.className, /grid/);
  assert.equal(nodes(tree, (node) => node.type === "input")[0].props.value, "Teacher");
});

test("advanced filter initial openness follows settings and remains user-toggleable", async () => {
  const render = await mount("AdvancedFilters", true, {
    "@/gen/settings/ui-elements": { browserDefaults: { advancedFiltersOpen: true } },
  });
  const props = { children: "controls", search: "search" };
  let tree = render(props);
  assert.equal(nodes(tree, (node) => node.type === "button")[0].props["aria-expanded"], true);
  nodes(tree, (node) => node.type === "button")[0].props.onClick();
  tree = render(props);
  assert.equal(nodes(tree, (node) => node.type === "button")[0].props["aria-expanded"], false);
});

test("Bhakti reader range uses configured initial size and bounds", async () => {
  const tr = { library: { bhakti: { page: { showing_template: "{shown} / {total}" } } }, bhakti_controls: {} };
  const render = await mount("library/BhaktiBrowser", true, {
    react: {
      useEffect: () => {}, useMemo: (calculate) => calculate(), useCallback: (callback) => callback,
      useDeferredValue: (value) => value, useRef: (current) => ({ current }),
      useState: (value) => [value === null ? "song" : value, () => {}],
    },
    "@/context/LanguageContext": { useLang: () => ({ lang: "fixture", tr }) },
    "@/gen/settings/ui-elements": {
      collectionPagination: { initialVisible: 6 },
      bhaktiReaderSettings: { initialSize: 110, minSize: 90, maxSize: 170, step: 10 },
    },
    "@/hooks/useMiniSearch": { useLazyMiniSearch: (items) => ({ results: items, ensureLoaded() {} }) },
    "@/lib/search": { getSearchProfile: () => ({}) },
    "@/gen/bhakti/loaders": { bhaktiContentLoaders: {}, bhaktiPresentation: {} },
    "@/lib/localization": {
      localized: (value, lang) => value?.[lang],
      localizedText: (value, lang) => value?.[lang] ?? "",
    },
    "@/lib/reader-utils": { matchesBhaktiFilter: () => true },
    "./bhakti-print.css": {},
    "@/components/AdvancedFilters": "filters",
  });
  const tree = render({ items: [{ id: "song", title: "Song", kruti: "", ankita: "", html: "<p>Body</p>" }] });
  const range = nodes(tree, (node) => node.type === "input" && node.props.type === "range")[0];
  assert.equal(range.props.value, 110);
  assert.equal(range.props.min, 90);
  assert.equal(range.props.max, 170);
  assert.equal(range.props.step, 10);
});

test("rail control is an accessible right-edge pause/play icon and honors the disabled setting", async () => {
  const render = await mount("RailMotionControl");
  let toggled = false;
  const button = render({ paused: false, onToggle: () => { toggled = true; } });
  assert.equal(button.props["aria-label"], "Pause");
  assert.equal(button.props["aria-pressed"], false);
  assert.equal(button.props.children.type, "pause");
  assert.match(button.props.className, /absolute right-1 top-1\/2/);
  assert.match(button.props.className, /size-11/);
  button.props.onClick();
  assert.equal(toggled, true);
  const resumed = render({ paused: true, className: "lg:hidden" });
  assert.equal(resumed.props["aria-label"], "Resume");
  assert.equal(resumed.props.children.type, "play");
  assert.match(resumed.props.className, /lg:hidden/);
  assert.doesNotMatch(resumed.props.className, /md:hidden/);
  const disabled = await mount("RailMotionControl", false);
  assert.equal(disabled({ paused: false }), null);
});
