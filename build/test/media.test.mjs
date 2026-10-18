import { testUiSettings } from "./helpers/ui-settings.mjs";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import { loadAuthoredLanguage } from "../authored-content.mjs";
import { validateMedia } from "../media-schema.mjs";

const compile = (source) => ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  },
}).outputText;
const source = (file) => readFile(new URL(`../../${file}`, import.meta.url), "utf8");
const utils = {};
vm.runInNewContext(compile(await source("src/lib/media-utils.ts")), { exports: utils, URL });
const collectionPresentation = {};
vm.runInNewContext(compile(await source("src/lib/collection-presentation.ts")), { exports: collectionPresentation });
const rootDir = fileURLToPath(new URL("../../", import.meta.url));
const copy = loadAuthoredLanguage(rootDir, "en");
const defaults = { from: "", to: "", event: "", type: "", sort: "newest" };
const album = (id, date, event, types = ["photo"]) => ({
  id, date, event, title: id, description: id, cover: "/cover.jpg", tags: [],
  items: types.map((type) => ({ type, title: type, detail: type, image: "/image.jpg" })),
});
const ids = (albums, filters = {}) => Array.from(
  utils.filterMediaAlbums(albums, { ...defaults, ...filters }), (item) => item.id,
);

test("media filters compose date range, event and type; date sorts are stable with undated last", () => {
  const albums = [
    album("unknown"), album("old", "2025-01-01", "A", ["video"]),
    album("new", "2026-10-17", "A", ["photo", "video"]),
    album("equal", "2026-10-17", "B"), album("bad", "2026-02-30"),
  ];
  const before = JSON.stringify(albums);
  assert.deepEqual(ids(albums), ["new", "equal", "old", "unknown", "bad"]);
  assert.deepEqual(ids(albums, { sort: "oldest" }), ["old", "new", "equal", "unknown", "bad"]);
  assert.deepEqual(ids(albums, { from: "2026-10-17", to: "2026-10-17", event: "A", type: "video" }), ["new"]);
  assert.deepEqual(ids(albums, { from: "2026-10-18", to: "2026-10-17" }), []);
  assert.deepEqual(ids(albums, { type: "video" }), ["new", "old"]);
  assert.equal(JSON.stringify(albums), before);
  assert.equal(utils.mediaDate("2024-02-29"), Date.parse("2024-02-29T00:00:00Z"));
  assert.equal(utils.mediaDate("2025-02-29"), null);
  assert.equal(utils.mediaDate("June 2026"), null);
  assert.equal(JSON.stringify(utils.mediaCounts(albums[2].items)), '{"photos":1,"videos":1}');
  assert.equal(utils.mediaItemId({}, 2), "item-3");
  assert.equal(utils.mediaItemId({ id: "stable" }, 2), "stable");
});

test("safe playback URLs reject executable, protocol-relative and credentialed links", () => {
  for (const value of ["javascript:alert(1)", "http://example.org/v.mp4", "//example.org/v.mp4", "/\\evil", "https://u:p@example.org/v", " https://example.org/v", "https://example.org/a b"]) {
    assert.equal(utils.safeMediaUrl(value), undefined, value);
  }
  assert.equal(utils.safeMediaUrl("/media/video.mp4"), "/media/video.mp4");
  assert.equal(utils.safeMediaUrl("/media/video.mp4", true), undefined);
  assert.equal(utils.safeMediaUrl("https://example.org/watch?v=1", true), "https://example.org/watch?v=1");
});

test("all discovered language media catalogs validate without requiring invented metadata", async () => {
  const directory = new URL("../../content/languages/", import.meta.url);
  for (const name of (await readdir(directory)).filter((name) => name.endsWith(".json"))) {
    const content = loadAuthoredLanguage(rootDir, name.slice(0, -5));
    validateMedia(content.media, name);
  }
  const media = { albums: [album("parent")] };
  media.albums[0].date = "2024-02-29";
  media.albums[0].items = [
    { id: "photo", type: "photo", title: "Photo", detail: "Caption", image: "/photo.jpg", fullImage: "/original.jpg", caption: "Supplied caption", albumId: "parent" },
    { type: "video", title: "Video", detail: "Detail", image: "/poster.jpg", videoUrl: "/video.mp4", externalUrl: "https://example.org/watch", recordedAt: "2026-10-17", language: "Supplied language" },
  ];
  validateMedia(media);
  const check = (edit, message) => {
    const changed = structuredClone(media);
    edit(changed);
    assert.throws(() => validateMedia(changed), message);
  };
  check((value) => { value.albums[0].date = "2026-02-30"; }, /real ISO/);
  check((value) => { value.albums[0].items[1].recordedAt = "2026"; }, /real ISO/);
  check((value) => { value.albums[0].items[1].videoUrl = "javascript:alert(1)"; }, /videoUrl/);
  check((value) => { value.albums[0].items[1].externalUrl = "/watch"; }, /externalUrl/);
  check((value) => { value.albums[0].items[1].duration = "10:75"; }, /duration must use/);
  check((value) => { value.albums[0].items[0].albumId = "missing"; }, /unknown albumId/);
  check((value) => { value.albums[0].items[0].fullImage = "http://example.org/image"; }, /fullImage/);
  check((value) => { value.albums[0].items.push({ ...value.albums[0].items[0] }); }, /duplicate item id/);
  check((value) => { value.albums[0].items[0].id = "item-3"; value.albums[0].items.push({ ...value.albums[0].items[0], id: undefined }); }, /duplicate item id/);
  check((value) => { value.albums[0].items[0].externalUrl = "https://example.org"; }, /photo records/);
});

const jsx = (type, props, key) => ({ type, props: props ?? {}, key });
function nodes(tree, predicate, result = []) {
  if (!tree || typeof tree !== "object") return result;
  if (predicate(tree)) result.push(tree);
  for (const child of [tree.props?.children, tree.props?.search, tree.props?.heading].flat(Infinity)) nodes(child, predicate, result);
  return result;
}
async function component(file, additional = {}) {
  const exports = {};
  let stateIndex = 0;
  const state = [];
  const react = {
    useId: () => "viewer-title", useRef: () => ({ current: null }),
    useMemo: (calculate) => calculate(), useCallback: (callback) => callback,
    useDeferredValue: (value) => value,
    useState: (initial) => {
      const index = stateIndex++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
  };
  const dependencies = {
    "react/jsx-runtime": { jsx, jsxs: jsx }, react,
    "next/image": "image", "next/link": "link", "lucide-react": {},
    "@/components/presentation/ContentImage": "image",
    "@/context/LanguageContext": { useLang: () => ({ tr: copy }) },
    "@/hooks/useDialog": { useDialog: (open, close) => { dependencies.dialog = { open, close }; return { current: null }; } },
    "@/lib/media-utils": utils,
    "@/lib/collection-presentation": collectionPresentation,
    "@/components/presentation/CollectionEmptyState": "collection-empty-state",
    "@/hooks/useMiniSearch": { useMiniSearch: (items, query) => items.filter((item) => item.title.includes(query)) },
    "@/lib/search": { getSearchProfile: () => ({}) },
    "@/context/UiSettingsContext": { useUiSettings: () => ({ ...testUiSettings, ...({
      collectionPagination: { initialVisible: 2, loadIncrement: 2 },
      browserDefaults: { albumsSort: "newest" },
      mediaViewerSettings: { swipeThresholdPx: 50, videoControlExclusionPx: 56, wrap: true },
    }) }) },
    "@/gen/settings/ui-elements": {
      collectionPagination: { initialVisible: 2, loadIncrement: 2 },
      browserDefaults: { albumsSort: "newest" },
      mediaViewerSettings: { swipeThresholdPx: 50, videoControlExclusionPx: 56, wrap: true },
    },
    ...additional,
  };
  vm.runInNewContext(compile(await source(file)), {
    exports, URL, console,
    require: (name) => { if (name in dependencies) return dependencies[name]; throw new Error(`Unexpected import: ${name}`); },
  });
  return {
    dependencies, exports,
    render: (name, props) => { stateIndex = 0; return exports[name](props); },
  };
}

test("viewer delegates dialog lifecycle and supports arrow, swipe, captions, position and share links", async () => {
  const mounted = await component("src/components/media/MediaViewer.tsx");
  const items = mounted.exports.albumViewerItems([
    { title: "First", detail: "Detail", image: "/1.jpg", type: "photo", caption: "Caption" },
    { id: "second", title: "Second", detail: "Detail", image: "/2.jpg", type: "video" },
  ]);
  const moves = [];
  const close = () => {};
  const tree = mounted.render("default", { items, itemId: "item-1", onClose: close, onMove: (id) => moves.push(id) });
  assert.equal(mounted.dependencies.dialog.open, true);
  assert.equal(mounted.dependencies.dialog.close, close);
  const dialog = nodes(tree, (node) => node.props.role === "dialog")[0];
  let prevented = false;
  dialog.props.onKeyDown({ key: "ArrowRight", target: { closest: () => null }, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.deepEqual(moves, ["second"]);
  dialog.props.onKeyDown({ key: "ArrowLeft", target: { closest: () => ({}) }, preventDefault: () => assert.fail("must not intercept video controls") });
  dialog.props.onKeyDown({ key: "ArrowLeft", altKey: true, target: { closest: () => null }, preventDefault: () => assert.fail("must not intercept browser navigation") });
  assert.deepEqual(moves, ["second"]);
  const touch = nodes(tree, (node) => node.props.onTouchStart)[0];
  const previous = nodes(touch, (node) => node.props["aria-label"] === copy.media.previous_item);
  const next = nodes(touch, (node) => node.props["aria-label"] === copy.media.next_item);
  assert.equal(previous.length, 1);
  assert.equal(next.length, 1);
  assert.match(previous[0].props.className, /absolute left-1 top-1\/2/);
  assert.match(next[0].props.className, /absolute right-1 top-1\/2/);
  touch.props.onTouchStart({ target: { closest: () => null }, touches: [{ clientX: 150, clientY: 30 }] });
  touch.props.onTouchEnd({ changedTouches: [{ clientX: 50, clientY: 35 }] });
  assert.deepEqual(moves, ["second", "second"]);
  for (const [x, y] of [[145, 120], [100, 120]]) {
    touch.props.onTouchStart({ target: { closest: () => null }, touches: [{ clientX: 150, clientY: 30 }] });
    touch.props.onTouchEnd({ changedTouches: [{ clientX: x, clientY: y }] });
  }
  assert.deepEqual(moves, ["second", "second"], "short and vertical gestures must not navigate");
  touch.props.onTouchStart({ target: { closest: () => null }, touches: [{ clientX: 150, clientY: 30 }] });
  touch.props.onTouchCancel();
  touch.props.onTouchEnd({ changedTouches: [{ clientX: 50, clientY: 30 }] });
  assert.deepEqual(moves, ["second", "second"], "cancelled gestures must not navigate");
  previous[0].props.onClick();
  next[0].props.onClick();
  assert.deepEqual(moves.slice(-2), ["second", "second"], "navigation wraps in both directions");
  const video = { getBoundingClientRect: () => ({ bottom: 300 }) };
  const target = { closest: (selector) => selector === "video" ? video : null };
  touch.props.onTouchStart({ target, touches: [{ clientX: 150, clientY: 270 }] });
  touch.props.onTouchEnd({ changedTouches: [{ clientX: 50, clientY: 270 }] });
  assert.equal(moves.length, 4, "native video controls must not trigger item navigation");
  touch.props.onTouchStart({ target, touches: [{ clientX: 150, clientY: 100 }] });
  touch.props.onTouchEnd({ changedTouches: [{ clientX: 50, clientY: 100 }] });
  assert.equal(moves.length, 5, "swiping the video body can navigate");
  const single = mounted.render("default", { items: [items[0]], itemId: "item-1", onClose: close, onMove: () => assert.fail() });
  assert.ok(nodes(single, (node) => node.props["aria-label"] === copy.media.next_item || node.props["aria-label"] === copy.media.previous_item).every((button) => button.props.disabled));
  const position = nodes(tree, (node) => node.props["aria-live"] === "polite")[0];
  assert.equal(position.props.children, copy.media.position_template.replace("{current}", "1").replace("{total}", "2"));
  assert.ok(nodes(tree, (node) => node.type === "a" && node.props.href === "#item=item-1").length);
  assert.ok(nodes(tree, (node) => node.props.href === "/albums").length);
  assert.equal(mounted.render("default", { items, itemId: null, onClose: close, onMove: () => {} }), null);
  const invalid = mounted.render("default", { items, itemId: "missing", onClose: close, onMove: () => {} });
  assert.ok(nodes(invalid, (node) => node.type === "h2" && node.props.children === copy.media.item_not_found).length);
  const metadata = mounted.render("MediaMetadata", { item: { caption: "Caption", detail: "Detail", duration: "01:20", recordedAt: "2026-10-17", language: "Supplied", albumId: "parent" } });
  assert.ok(nodes(metadata, (node) => node.type === "p" && node.props.children === "Caption").length);
  assert.ok(nodes(metadata, (node) => node.props.href === "/albums/parent").length);
  assert.ok(nodes(metadata, (node) => node.type === "time" && node.props.dateTime === "2026-10-17").length);
});

test("configured viewer boundaries apply equally to arrows, keyboard and swipe", async () => {
  const mounted = await component("src/components/media/MediaViewer.tsx", {
    "@/context/UiSettingsContext": { useUiSettings: () => ({ ...testUiSettings, ...({
      mediaViewerSettings: { swipeThresholdPx: 80, videoControlExclusionPx: 100, wrap: false },
    }) }) },
    "@/gen/settings/ui-elements": {
      mediaViewerSettings: { swipeThresholdPx: 80, videoControlExclusionPx: 100, wrap: false },
    },
  });
  const items = mounted.exports.albumViewerItems([
    { id: "first", type: "photo", title: "First", image: "/1.jpg" },
    { id: "last", type: "video", title: "Last", image: "/2.jpg" },
  ]);
  const moves = [];
  const props = { items, onClose: () => {}, onMove: (id) => moves.push(id) };
  for (const [itemId, blocked, allowed] of [["first", -1, 1], ["last", 1, -1]]) {
    const tree = mounted.render("default", { ...props, itemId });
    const previous = nodes(tree, (node) => node.props["aria-label"] === copy.media.previous_item)[0];
    const next = nodes(tree, (node) => node.props["aria-label"] === copy.media.next_item)[0];
    assert.equal(previous.props.disabled, blocked === -1);
    assert.equal(next.props.disabled, blocked === 1);
    const dialog = nodes(tree, (node) => node.props.role === "dialog")[0];
    const touch = nodes(tree, (node) => node.props.onTouchStart)[0];
    const before = moves.length;
    dialog.props.onKeyDown({ key: blocked < 0 ? "ArrowLeft" : "ArrowRight", target: { closest: () => null }, preventDefault() {} });
    touch.props.onTouchStart({ target: { closest: () => null }, touches: [{ clientX: 150, clientY: 30 }] });
    touch.props.onTouchEnd({ changedTouches: [{ clientX: 150 - blocked * 100, clientY: 30 }] });
    assert.equal(moves.length, before, "end boundary cannot wrap through keyboard or swipe");
    touch.props.onTouchStart({ target: { closest: () => null }, touches: [{ clientX: 150, clientY: 30 }] });
    touch.props.onTouchEnd({ changedTouches: [{ clientX: 150 - allowed * 70, clientY: 30 }] });
    assert.equal(moves.length, before, "configured swipe threshold rejects a 70px gesture");
    touch.props.onTouchStart({
      target: { closest: (selector) => selector === "video" ? { getBoundingClientRect: () => ({ bottom: 300 }) } : null },
      touches: [{ clientX: 150, clientY: 220 }],
    });
    touch.props.onTouchEnd({ changedTouches: [{ clientX: 150 - allowed * 100, clientY: 220 }] });
    assert.equal(moves.length, before, "configured native video strip is excluded");
    (allowed < 0 ? previous : next).props.onClick();
    assert.equal(moves.at(-1), itemId === "first" ? "last" : "first");
  }
});

test("playback renders real players and external destinations only when supplied; originals and errors are honest", async () => {
  for (const [urls, kind] of [
    [{}, "unavailable"],
    [{ videoUrl: "/actual.mp4" }, "player"],
    [{ externalUrl: "https://example.org/watch?v=approved" }, "external"],
    [{ videoUrl: "javascript:alert(1)" }, "unavailable"],
  ]) {
    const mounted = await component("src/components/media/MediaViewer.tsx");
    const props = { item: { title: "Title", image: "/poster.jpg", type: "video", ...urls } };
    let tree = mounted.render("MediaPlayback", props);
    const videos = nodes(tree, (node) => node.type === "video");
    const links = nodes(tree, (node) => node.type === "a");
    assert.equal(videos.length, kind === "player" ? 1 : 0);
    assert.equal(links.length, kind === "external" ? 1 : 0);
    if (kind === "unavailable") assert.ok(nodes(tree, (node) => node.props.children === copy.media.playback_unavailable).length);
    if (kind === "player") {
      assert.equal(videos[0].props.controls, true);
      assert.equal(nodes(tree, (node) => node.type === "source")[0].props.src, "/actual.mp4");
      videos[0].props.onError();
      tree = mounted.render("MediaPlayback", props);
      assert.ok(nodes(tree, (node) => node.props.children === copy.media.media_error).length);
    }
  }
  const mounted = await component("src/components/media/MediaViewer.tsx");
  const props = { item: { type: "photo", image: "/thumbnail.jpg", fullImage: "/original.jpg", caption: "Alt", title: "Title" } };
  const tree = mounted.render("MediaPlayback", props);
  const image = nodes(tree, (node) => node.type === "image")[0];
  assert.equal(image.props.src, "/original.jpg");
  assert.equal(image.props.alt, "Alt");
  image.props.onError();
  assert.equal(mounted.render("MediaPlayback", props).props.children, copy.media.media_error);
});

test("album controls filter real metadata, reset results, and pause each featured rail independently", async () => {
  const catalogs = [
    album("old", "2025-01-01", "Festival", ["video"]),
    album("new", "2026-10-17", "Worship"), album("unknown"),
  ];
  const localized = { ...copy, media: { ...copy.media, albums: catalogs } };
  const calls = [];
  const mounted = await component("src/components/media/MediaAlbumsBrowser.tsx", {
    "@/context/LanguageContext": { useLang: () => ({ tr: localized }) },
    "@/gen/media/albums": { topAlbumIds: ["old", "unknown"], recentAlbumIds: ["new", "unknown"] },
    "@/hooks/useAutoScrollRail": { useAutoScrollRail: (count, paused) => { calls.push({ count, paused }); return { current: null }; } },
    "@/components/RailMotionControl": "rail",
    "@/components/AdvancedFilters": "filters",
  });
  const render = () => mounted.render("default", {});
  let tree = render();
  const controls = nodes(tree, (node) => node.type === "select");
  const type = controls.find((node) => nodes(node, (option) => option.type === "option" && option.props.value === "video").length);
  type.props.onChange({ target: { value: "video" } });
  tree = render();
  const allSection = nodes(tree, (node) => node.props["aria-labelledby"] === "all-albums-heading")[0];
  const tiles = nodes(allSection, (node) => node.props.album);
  assert.deepEqual(tiles.map((node) => node.props.album.id), ["old"]);
  const date = nodes(tree, (node) => node.type === "input" && node.props.type === "date")[0];
  date.props.onChange({ target: { value: "2026-01-01" } });
  tree = render();
  assert.ok(nodes(tree, (node) => node.type === "collection-empty-state" && node.props.children === copy.media.no_results).length);
  const clear = nodes(tree, (node) => node.type === "button" && node.props.children === copy.media.clear_filters)[0];
  clear.props.onClick();
  tree = render();
  const rails = nodes(tree, (node) => node.type === "rail");
  assert.equal(rails.length, 2);
  rails[0].props.onToggle();
  render();
  assert.deepEqual(calls.slice(-2), [{ count: 2, paused: true }, { count: 2, paused: false }]);
});

test("photo tiles use a full-tile iconless action without a visible view-photo button", async () => {
  const mounted = await component("src/components/media/MediaViewer.tsx");
  let opened = false;
  const item = { type: "photo", title: "Photo title", image: "/photo.jpg" };
  const tree = mounted.render("MediaTileAction", { item, onOpen: () => { opened = true; } });
  assert.equal(tree.type, "button");
  assert.equal(tree.props["aria-label"], `${copy.media.open_photo}: Photo title`);
  assert.equal(tree.props.children, undefined);
  assert.match(tree.props.className, /absolute inset-0/);
  tree.props.onClick();
  assert.equal(opened, true);
  const metadata = mounted.render("MediaMetadata", { item: { ...item, albumId: "parent" } });
  const parentLink = nodes(metadata, (node) => node.props.href === "/albums/parent")[0];
  assert.match(parentLink.props.className, /relative z-20/, "parent-album links remain above the tile action");
  const unavailable = mounted.render("MediaTileAction", { item: { ...item, type: "video" }, onOpen: () => assert.fail() });
  assert.equal(unavailable.type, "p");
  assert.equal(unavailable.props.children, copy.media.playback_unavailable);
  const playable = mounted.render("MediaTileAction", { item: { ...item, type: "video", videoUrl: "/actual.mp4" }, onOpen: () => {} });
  assert.equal(playable.type, "button");
  assert.equal(playable.props.children, undefined);
  assert.equal(playable.props["aria-label"], `${copy.media.open_video}: Photo title`);
});

test("album configured sort is used initially, in active-filter detection, and after clearing", async () => {
  const mounted = await component("src/components/media/MediaAlbumsBrowser.tsx", {
    "@/context/UiSettingsContext": { useUiSettings: () => ({ ...testUiSettings, ...({
      collectionPagination: { initialVisible: 2, loadIncrement: 2 },
      browserDefaults: { albumsSort: "oldest" },
    }) }) },
    "@/gen/settings/ui-elements": {
      collectionPagination: { initialVisible: 2, loadIncrement: 2 },
      browserDefaults: { albumsSort: "oldest" },
    },
    "@/context/LanguageContext": { useLang: () => ({ tr: { ...copy, media: { ...copy.media, albums: [
      album("new", "2026-01-01"), album("old", "2025-01-01"),
    ] } } }) },
    "@/gen/media/albums": { topAlbumIds: [], recentAlbumIds: [] },
    "@/hooks/useAutoScrollRail": { useAutoScrollRail: () => ({ current: null }) },
    "@/components/RailMotionControl": "rail",
    "@/components/AdvancedFilters": "filters",
  });
  const render = () => mounted.render("default", {});
  let tree = render();
  const sort = () => nodes(tree, (node) => node.type === "select" && nodes(node, (option) =>
    option.type === "option" && option.props.value === "newest").length)[0];
  assert.equal(sort().props.value, "oldest");
  assert.equal(nodes(tree, (node) => node.type === "filters")[0].props.active, false);
  sort().props.onChange({ target: { value: "newest" } });
  tree = render();
  assert.equal(nodes(tree, (node) => node.type === "filters")[0].props.active, true);
  sort().props.onChange({ target: { value: "invalid" } });
  tree = render();
  assert.equal(sort().props.value, "newest");
  nodes(tree, (node) => node.type === "button" && node.props.children === copy.media.clear_filters)[0].props.onClick();
  tree = render();
  assert.equal(sort().props.value, "oldest");
  assert.equal(nodes(tree, (node) => node.type === "filters")[0].props.active, false);
  const section = nodes(tree, (node) => node.props["aria-labelledby"] === "all-albums-heading")[0];
  assert.deepEqual(nodes(section, (node) => node.props.album).map((node) => node.props.album.id), ["old", "new"]);
});

test("item hashes open direct links, preserve other URL state and update on browser history", async () => {
  let current = new URL("https://example.org/albums/demo?keep=1#context=all&item=second");
  const history = [current.href];
  let position = 0;
  let notifications = 0;
  let subscribed = false;
  const listeners = new Map();
  const window = {
    location: { get hash() { return current.hash; }, get href() { return current.href; } },
    addEventListener: (name, callback) => { listeners.set(name, callback); },
    removeEventListener: (name) => { listeners.delete(name); },
    dispatchEvent: (event) => { listeners.get(event.type)?.(); },
    history: {
      pushState: (_, __, url) => { current = new URL(url); history.splice(++position); history.push(current.href); },
      replaceState: (_, __, url) => { current = new URL(url); history[position] = current.href; },
      back: () => { if (position > 0) current = new URL(history[--position]); window.dispatchEvent({ type: "popstate" }); },
    },
  };
  const exports = {};
  vm.runInNewContext(compile(await source("src/components/media/useMediaViewer.ts")), {
    exports, window, URL, URLSearchParams,
    HashChangeEvent: class { constructor(type) { this.type = type; } },
    require: (name) => {
      assert.equal(name, "react");
      return {
        useCallback: (callback) => callback,
        useSyncExternalStore: (subscribe, snapshot, serverSnapshot) => {
          assert.equal(serverSnapshot(), "");
          if (!subscribed) { subscribe(() => { notifications++; }); subscribed = true; }
          return snapshot();
        },
      };
    },
  });
  assert.equal(exports.useMediaViewer().itemId, "second");
  exports.useMediaViewer().open("item-1");
  assert.equal(history.length, 2);
  assert.equal(exports.useMediaViewer().itemId, "item-1");
  exports.useMediaViewer().move("second");
  assert.equal(history.length, 2);
  assert.equal(current.searchParams.get("keep"), "1");
  assert.equal(new URLSearchParams(current.hash.slice(1)).get("context"), "all");
  exports.useMediaViewer().close();
  assert.equal(exports.useMediaViewer().itemId, null);
  window.history.back();
  assert.equal(exports.useMediaViewer().itemId, "second");
  assert.equal(notifications, 4);
});

test("retired standalone media routes have no page files or configured links; Albums remains", async () => {
  const retiredRoutes = new Set(["/media/photos", "/media/videos"]);
  for (const route of retiredRoutes) {
    await assert.rejects(source(`src/app${route}/page.tsx`), { code: "ENOENT" });
  }
  function checkLinks(value) {
    if (!value || typeof value !== "object") return;
    if (typeof value.href === "string") {
      assert.equal(retiredRoutes.has(value.href.split(/[?#]/)[0]), false, `Retired destination: ${value.href}`);
    }
    for (const child of Object.values(value)) checkLinks(child);
  }
  for (const file of ["settings/home.json", "settings/navigation.json"]) {
    checkLinks(JSON.parse(await source(file)));
  }
  assert.match(await source("src/app/albums/page.tsx"), /export default function AlbumsPage/);
});
