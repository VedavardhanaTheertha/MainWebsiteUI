import { testUiSettings } from "./helpers/ui-settings.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadSource(file, imports = {}, globals = {}) {
  const exports = {};
  const compiled = ts.transpileModule(readFileSync(new URL(`../../src/${file}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports, console, ...globals,
    require(name) {
      assert.ok(name in imports, `Unexpected import ${name}`);
      return imports[name];
    },
  });
  return exports;
}

function hooks() {
  const slots = [];
  const pending = [];
  let cursor = 0;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useState(initial) {
      const index = cursor++;
      slots[index] ??= { value: initial };
      return [slots[index].value, (next) => {
        slots[index].value = typeof next === "function" ? next(slots[index].value) : next;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ??= { current: initial };
    },
    useMemo(make, dependencies) {
      const index = cursor++;
      if (!same(slots[index]?.dependencies, dependencies)) {
        slots[index] = { value: make(), dependencies };
      }
      return slots[index].value;
    },
    useCallback(callback, dependencies) { return react.useMemo(() => callback, dependencies); },
    useEffect(effect, dependencies) {
      const index = cursor++;
      if (!same(slots[index]?.dependencies, dependencies)) {
        const previous = slots[index];
        pending.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, cleanup: effect() };
        });
      }
    },
  };
  return {
    react,
    render(callback) {
      cursor = 0;
      const result = callback();
      pending.splice(0).forEach((effect) => effect());
      return result;
    },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

test("preferences survive denied reads/writes in memory and report the failure once", () => {
  const messages = [];
  const listeners = new Map();
  const window = {
    get localStorage() { throw new Error("storage denied"); },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  const { createPreferenceStore } = loadSource("lib/browser-preferences.ts", {}, {
    window, console: { warn: (...args) => messages.push(args) },
  });
  const store = createPreferenceStore("fixture", "default", (value) => value === "chosen");
  let changes = 0;
  const unsubscribe = store.subscribe(() => changes++);
  assert.equal(store.getSnapshot(), "default");
  store.setValue("chosen");
  assert.equal(store.getSnapshot(), "chosen");
  assert.equal(store.getServerSnapshot(), "default");
  assert.equal(changes, 1);
  assert.equal(messages.length, 1);
  assert.match(messages[0][0], /in-memory preference/);
  unsubscribe();
  assert.equal(listeners.size, 0);
});

test("preferences validate saved values, follow cross-tab changes, and retain a failed write", () => {
  let stored = "invalid";
  let failWrite = false;
  const listeners = new Map();
  const warnings = [];
  const { createPreferenceStore } = loadSource("lib/browser-preferences.ts", {}, {
    window: {
      localStorage: {
        getItem: () => stored,
        setItem: (_key, value) => { if (failWrite) throw new Error("quota"); stored = value; },
      },
      addEventListener: (name, fn) => listeners.set(name, fn),
      removeEventListener: (name) => listeners.delete(name),
    },
    console: { warn: (...args) => warnings.push(args) },
  });
  const store = createPreferenceStore("fixture", "default", (value) => value === "chosen");
  assert.equal(store.getSnapshot(), "default");
  let changes = 0;
  const unsubscribe = store.subscribe(() => changes++);
  stored = "chosen";
  listeners.get("storage")({ key: "fixture" });
  assert.equal(store.getSnapshot(), "chosen");
  assert.equal(changes, 1);
  failWrite = true;
  store.setValue("default");
  assert.equal(store.getSnapshot(), "default");
  assert.equal(warnings.length, 1);
  unsubscribe();
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

function searchFixture() {
  const lifecycle = hooks();
  const requests = [];
  const loader = () => {
    const request = deferred();
    requests.push(request);
    return request.promise;
  };
  const config = { fields: ["title"] };
  const { useLazyMiniSearch } = loadSource("hooks/useMiniSearch.ts", {
    react: lifecycle.react,
    "@/context/UiSettingsContext": { useUiSettings: () => ({ ...testUiSettings, ...({ interactionSettings: { searchPreloadDelayMs: 100 } }) }) },
    "@/gen/settings/ui-elements": { interactionSettings: { searchPreloadDelayMs: 100 } },
    "@/lib/search": {
      createSearchIndex: (items) => ({ items }),
      loadCompressedIndex: async (_raw, items) => ({ items }),
      searchItems: (index, query) => index.items.filter((item) => item.title.includes(query)),
    },
  }, {
    window: { requestIdleCallback: () => 1, cancelIdleCallback() {} },
    console: { error() {} },
  });
  return {
    requests, lifecycle,
    render: (items, query = "match") => lifecycle.render(() => useLazyMiniSearch(items, query, loader, config)),
  };
}

test("lazy search immediately uses the new catalog and ignores an older in-flight completion", async () => {
  const f = searchFixture();
  const old = [{ title: "old match" }];
  const current = [{ title: "current match" }];
  f.render(old);
  const changed = f.render(current);
  assert.equal(changed.results[0], current[0]);
  assert.equal(f.requests.length, 2);
  f.requests[0].resolve("old-index");
  await flush();
  assert.equal(f.render(current).isLoaded, false);
  f.requests[1].resolve("current-index");
  await flush();
  const loaded = f.render(current);
  assert.equal(loaded.isLoaded, true);
  assert.equal(loaded.results[0], current[0]);
  f.lifecycle.unmount();
});

test("loaded lazy search invalidates on catalog replacement and retains fallback on failure", async () => {
  const f = searchFixture();
  const old = [{ title: "old match" }];
  const current = [{ title: "current match" }];
  f.render(old);
  f.requests[0].resolve("index");
  await flush();
  assert.equal(f.render(old).isLoaded, true);
  assert.equal(f.render(current).results[0], current[0]);
  f.requests[1].reject(new Error("network"));
  await flush();
  assert.equal(f.render(current).isLoaded, true);
  assert.equal(f.render(current).results[0], current[0]);
  f.lifecycle.unmount();
});

test("dialog state publishes nested lifecycle changes and shares scroll locks with navigation", () => {
  const document = {
    body: { style: { overflow: "auto" } }, activeElement: null,
    addEventListener() {}, removeEventListener() {},
  };
  class Element {
    isConnected = true;
    querySelectorAll() { return []; }
    getAttribute() { return null; }
    removeAttribute() {}
    contains(target) { return target === this; }
    focus() { document.activeElement = this; }
  }
  let effects = [];
  let refIndex = 0;
  let notifications = 0;
  const subscribers = new Set();
  const api = loadSource("hooks/useDialog.ts", {
    react: {
      useRef: (value) => ({ current: refIndex++ === 0 ? new Element() : value }),
      useEffect: (fn) => effects.push(fn),
      useSyncExternalStore: (subscribe, snapshot) => {
        if (!subscribers.size) subscribers.add(subscribe(() => notifications++));
        return snapshot();
      },
    },
  }, { document, HTMLElement: Element, Node: Element });
  const mount = () => {
    effects = []; refIndex = 0;
    api.useDialog(true, () => {});
    const cleanup = effects.map((fn) => fn()).filter(Boolean);
    return () => cleanup.forEach((fn) => fn());
  };
  assert.equal(api.useDialogsOpen(), false);
  const unlockMenu = api.lockPageScroll();
  const closeFirst = mount();
  const closeSecond = mount();
  assert.equal(api.useDialogsOpen(), true);
  closeSecond();
  assert.equal(api.useDialogsOpen(), true);
  closeFirst();
  assert.equal(api.useDialogsOpen(), false);
  assert.equal(document.body.style.overflow, "hidden", "the navigation still owns its lock");
  unlockMenu();
  unlockMenu();
  assert.equal(document.body.style.overflow, "auto");
  assert.equal(notifications, 4);
  subscribers.forEach((unsubscribe) => unsubscribe());
});

test("reduced-motion subscription reads live preferences and removes its listener", () => {
  const media = {
    matches: false,
    addEventListener(name, fn) { assert.equal(name, "change"); this.listener = fn; },
    removeEventListener(name, fn) { assert.equal(name, "change"); assert.equal(fn, this.listener); this.listener = null; },
  };
  let subscription;
  const { useReducedMotion } = loadSource("hooks/useReducedMotion.ts", {
    react: { useSyncExternalStore: (subscribe, snapshot, server) => {
      subscription = { subscribe, snapshot, server };
      return snapshot();
    } },
  }, { window: { matchMedia: () => media } });
  assert.equal(useReducedMotion(), false);
  let notified = 0;
  const unsubscribe = subscription.subscribe(() => notified++);
  media.matches = true;
  media.listener();
  assert.equal(subscription.snapshot(), true);
  assert.equal(subscription.server(), false);
  assert.equal(notified, 1);
  unsubscribe();
  assert.equal(media.listener, null);
});

test("rail frames stop when idle, hidden, focused or reduced, and canceled touches resume", () => {
  const lifecycle = hooks();
  const frames = new Map();
  const timers = new Map();
  const handlers = new Map();
  const pageHandlers = new Map();
  let nextId = 0;
  let reduced = false;
  let dialog = false;
  let resize;
  let intersection;
  const el = {
    clientWidth: 300, scrollWidth: 1200, scrollLeft: 0,
    contains: () => false,
    addEventListener: (name, fn) => handlers.set(name, fn),
    removeEventListener: (name) => handlers.delete(name),
  };
  const document = {
    hidden: false, activeElement: null,
    addEventListener: (name, fn) => pageHandlers.set(name, fn),
    removeEventListener: (name) => pageHandlers.delete(name),
  };
  const react = { ...lifecycle.react, useRef: () => ({ current: el }) };
  const { useAutoScrollRail } = loadSource("hooks/useAutoScrollRail.ts", {
    react,
    "@/hooks/useReducedMotion": { useReducedMotion: () => reduced },
    "@/hooks/useDialog": { useDialogsOpen: () => dialog },
    "@/context/UiSettingsContext": { useUiSettings: () => ({ ...testUiSettings, ...({ railAutoScroll: {
      enabled: true, pixelsPerSecond: 100, returnDurationMs: 500, resumeDelayMs: 100,
    } }) }) },
    "@/gen/settings/ui-elements": { railAutoScroll: {
      enabled: true, pixelsPerSecond: 100, returnDurationMs: 500, resumeDelayMs: 100,
    } },
  }, {
    document, Node: class {},
    window: { addEventListener() {}, removeEventListener() {} },
    ResizeObserver: class { constructor(fn) { resize = fn; } observe() {} disconnect() {} },
    IntersectionObserver: class { constructor(fn) { intersection = fn; } observe() {} disconnect() {} },
    requestAnimationFrame(fn) { frames.set(++nextId, fn); return nextId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout(fn) { timers.set(++nextId, fn); return nextId; },
    clearTimeout: (id) => timers.delete(id),
  });
  const render = () => lifecycle.render(() => useAutoScrollRail(3, false));
  const frame = (timestamp) => {
    const queued = [...frames.values()];
    frames.clear();
    queued.forEach((fn) => fn(timestamp));
  };
  render();
  frame(0); frame(100);
  assert.equal(el.scrollLeft, 10);
  handlers.get("touchstart")();
  assert.equal(frames.size, 0);
  handlers.get("touchcancel")();
  const resumes = [...timers.values()];
  timers.clear();
  resumes.forEach((fn) => fn());
  assert.equal(frames.size, 1);
  intersection([{ isIntersecting: false }]);
  assert.equal(frames.size, 0);
  intersection([{ isIntersecting: true }]);
  assert.equal(frames.size, 1);
  document.hidden = true;
  pageHandlers.get("visibilitychange")();
  assert.equal(frames.size, 0);
  document.hidden = false;
  pageHandlers.get("visibilitychange")();
  handlers.get("focusin")();
  assert.equal(frames.size, 0);
  handlers.get("focusout")({ relatedTarget: null });
  assert.equal(frames.size, 1);
  el.scrollWidth = el.clientWidth;
  resize();
  assert.equal(frames.size, 0);
  el.scrollWidth = 1200;
  resize();
  reduced = true;
  render();
  assert.equal(frames.size, 0);
  reduced = false;
  render();
  assert.equal(frames.size, 1);
  dialog = true;
  render();
  assert.equal(frames.size, 0);
  lifecycle.unmount();
  assert.equal(handlers.size, 0);
  assert.equal(pageHandlers.size, 0);
});

for (const transition of ["media", "window", "layout"]) {
test(`compact navigation releases its scroll lock on desktop ${transition} transitions`, () => {
  const lifecycle = hooks();
  const mediaListeners = new Set();
  const windowListeners = new Set();
  const pointerListeners = new Set();
  let observeViewport;
  let observerDisconnected = false;
  let desktopViewport = false;
  const document = {
    documentElement: {},
    body: { style: { overflow: "auto" } },
    addEventListener: (_name, callback) => pointerListeners.add(callback),
    removeEventListener: (_name, callback) => pointerListeners.delete(callback),
  };
  const media = {
    matches: false,
    addEventListener: (_name, callback) => mediaListeners.add(callback),
    removeEventListener: (_name, callback) => mediaListeners.delete(callback),
  };
  const dialogApi = loadSource("hooks/useDialog.ts", { react: lifecycle.react }, { document });
  const jsx = (type, props) => ({ type, props });
  const { default: MobileHeader } = loadSource("components/MobileHeader.tsx", {
    react: { ...lifecycle.react, useId: () => "compact-navigation" },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": { default: "link", __esModule: true },
    "next/image": { default: "image", __esModule: true },
    "next/navigation": { usePathname: () => "/" },
    "lucide-react": { Menu: "menu-icon", X: "close-icon", ChevronDown: "chevron" },
    "@/hooks/useDialog": dialogApi,
    "@/gen/content": { navigationRoutes: { home: "/" }, siteConfig: { basePath: "" } },
    "@/context/LanguageContext": { useLang: () => ({
      lang: "fixture", setLang() {},
      languages: [{ code: "fixture", name: "Fixture", short_label: "F" }],
      tr: { nav: [], logo_alt: "Logo", editorial: { site_chrome: { chant: "Chant" } }, ui: {
        switch_language: "Switch to {language}", open_menu: "Open menu", close_menu: "Close menu",
        mobile_navigation: "Navigation",
      } },
    }) },
  }, {
    document,
    window: {
      matchMedia: (query) => {
        assert.equal(query, "(min-width: 80rem)");
        return desktopViewport ? { ...media, matches: true } : media;
      },
      addEventListener: (name, callback) => {
        assert.equal(name, "resize");
        windowListeners.add(callback);
      },
      removeEventListener: (_name, callback) => windowListeners.delete(callback),
    },
    ResizeObserver: class {
      constructor(callback) { observeViewport = callback; }
      observe(target) { assert.equal(target, document.documentElement); }
      disconnect() { observerDisconnected = true; }
    },
  });
  const findToggle = (tree) => {
    if (!tree || typeof tree !== "object") return;
    if (tree.props?.["aria-controls"] === "mobile-nav") return tree;
    for (const child of [tree.props?.children].flat(Infinity)) {
      const found = findToggle(child);
      if (found) return found;
    }
  };
  const render = () => lifecycle.render(MobileHeader);
  let tree = render();
  findToggle(tree).props.onClick();
  tree = render();
  assert.equal(findToggle(tree).props["aria-expanded"], true);
  assert.equal(document.body.style.overflow, "hidden");
  assert.equal(mediaListeners.size, 1);
  assert.equal(windowListeners.size, 1);
  desktopViewport = true;
  if (transition === "media") {
    media.matches = true;
    [...mediaListeners].forEach((callback) => callback());
  }
  else if (transition === "window") [...windowListeners].forEach((callback) => callback());
  else observeViewport();
  tree = render();
  assert.equal(findToggle(tree).props["aria-expanded"], false);
  assert.equal(findToggle(tree).props["aria-label"], "Open menu");
  assert.equal(document.body.style.overflow, "auto");
  assert.equal(mediaListeners.size, 0);
  assert.equal(windowListeners.size, 0);
  assert.equal(observerDisconnected, true);
  assert.equal(pointerListeners.size, 0);
  desktopViewport = false;
  media.matches = false;
  tree = render();
  assert.equal(findToggle(tree).props["aria-expanded"], false, "returning to compact layout must not reopen the menu");
  assert.equal(document.body.style.overflow, "auto");
  lifecycle.unmount();
});
}
