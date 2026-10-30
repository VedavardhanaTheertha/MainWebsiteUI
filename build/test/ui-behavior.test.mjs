import { testUiSettings } from "./helpers/ui-settings.mjs";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { loadAuthoredLanguage } from "../authored-content.mjs";

const authoredCopy = loadAuthoredLanguage(fileURLToPath(new URL("../../", import.meta.url)), "en");

const announcementDefaults = {
  enabled: true, delayMs: 1800, pages: [], startsOn: null, endsOn: null, dismissal: "session",
};
const heroDefaults = { autoplay: true, intervalMs: 4500, fadeDurationMs: 900 };

async function mountComponent(file, options = {}) {
  let now = options.now ?? Date.parse("2026-10-17T12:00:00Z");
  let nextId = 0;
  let stateIndex = 0;
  let refIndex = 0;
  const state = [];
  const refs = [];
  const effects = [];
  const timers = new Map();
  const session = options.session ?? new Map();
  const local = options.local ?? new Map();
  const storage = (values) => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  });
  const browser = {
    matchMedia: () => ({ matches: options.reducedMotion ?? false }),
    sessionStorage: storage(session), localStorage: storage(local),
    addEventListener() {}, removeEventListener() {},
  };
  const compile = (source) => ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  }).outputText;
  const helpers = {};
  vm.runInNewContext(compile(await readFile(new URL("../../src/lib/ui-settings.ts", import.meta.url), "utf8")), { exports: helpers });
  const preferences = {};
  vm.runInNewContext(compile(await readFile(new URL("../../src/lib/browser-preferences.ts", import.meta.url), "utf8")), {
    exports: preferences, window: browser, console,
  });
  const jsx = (type, props, key) => ({ type, props, key });
  const exports = {};
  const addTimer = (callback, delay, interval = false) => {
    const id = ++nextId;
    timers.set(id, { callback, at: now + delay, interval: interval ? delay : 0 });
    return id;
  };
  vm.runInNewContext(compile(await readFile(new URL(file, import.meta.url), "utf8")), {
    exports,
    Date: class extends Date { static now() { return now; } },
    sessionStorage: storage(session),
    localStorage: storage(local),
    window: browser,
    document: { activeElement: null },
    setTimeout: (callback, delay) => addTimer(callback, delay),
    clearTimeout: (id) => timers.delete(id),
    setInterval: (callback, delay) => addTimer(callback, delay, true),
    clearInterval: (id) => timers.delete(id),
    require: (name) => {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (name === "react") return {
        useId: () => "navigation",
        useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
        useState: (initial) => {
          const index = stateIndex++;
          if (!(index in state)) state[index] = initial;
          return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
        },
        useRef: (initial) => {
          const index = refIndex++;
          if (!(index in refs)) refs[index] = { current: initial };
          return refs[index];
        },
        useEffect: (effect) => effects.push(effect),
      };
      if (name === "next/link" || name === "next/image") return { default: name, __esModule: true };
      if (name === "@/components/presentation/ContentImage") return { default: "content-image", __esModule: true };
      if (name === "next/navigation") return { usePathname: () => options.pathname ?? "/events" };
      if (name === "@/hooks/useQRModal") return { useQRModal: () => ({ openQR: () => options.onOpenQR?.() }) };
      if (name === "@/hooks/useDonateModal") return { openDonateModal: () => options.onDonate?.() };
      if (name === "@/hooks/useReducedMotion") return { useReducedMotion: () => options.reducedMotion ?? false };
      if (name === "@/hooks/useDialog") return { useDialogsOpen: () => options.dialogsOpen ?? false };
      if (name === "@/lib/browser-preferences") return preferences;
      if (name === "lucide-react") return { Pause: "pause", Play: "play" };
      if (name === "@/context/LanguageContext") return { useLang: () => ({
        lang: "test", contentMode: "real",
        setLang() {},
        languages: [{ code: "test", native_name: "Provided language", label: "PL" }],
        tr: {
          ...authoredCopy,
          nav: [{ key: "resources", label: "Resources", children: [{ key: "events", label: "Events", href: "/events" }] }],
          public_actions: { ...authoredCopy.public_actions, whatsapp_label: "WhatsApp" },
          announcement: { label: "notice", dismiss: "close", eyebrow: "open", title: "title", body: "body", cta: "go", href: "/events" },
          home: { hero_intro: { cta_label: "go" } },
        },
      }) };
      if (name === "@/gen/content") return {
        defaultContentMode: "real",
        siteConfig: { basePath: "" },
        navigationRoutes: { home: "/", panchanga: "/panchanga" },
        homeHero: { titles: { test: "title" }, href: "/events", images: ["/one.jpg", "/two.jpg"] },
      };
      if (name === "@/context/UiSettingsContext") return { useUiSettings: () => ({ ...testUiSettings, ...({
        heroSettings: options.hero ?? heroDefaults,
        interactionSettings: options.interaction ?? { dropdownCloseDelayMs: 120 },
      }), presentationSettings: { imageTreatment: false } }) };
      if (name === "@/gen/settings/ui-elements") return {
        heroSettings: options.hero ?? heroDefaults,
        interactionSettings: options.interaction ?? { dropdownCloseDelayMs: 120 },
      };
      if (name === "@/gen/settings/actions") return { actionDestinations: {
        headerWhatsApp: "https://whatsapp.com/channel/example",
        subscribe: "https://youtube.example.org/channel",
        volunteer: "https://volunteer.example.org/",
      } };
      if (name === "@/gen/settings/announcements") return { announcementSettings: options.announcement ?? announcementDefaults };
      if (name === "@/lib/ui-settings") return helpers;
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const render = () => {
    stateIndex = 0;
    refIndex = 0;
    const result = exports.default();
    return typeof result?.type === "function" ? result.type(result.props) : result;
  };
  render();
  const cleanup = effects.splice(0).map((effect) => effect()).filter(Boolean);
  return {
    render, session, local, state,
    advance: (milliseconds) => {
      const end = now + milliseconds;
      while (true) {
        const due = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!due || due[1].at > end) break;
        const [id, timer] = due;
        now = timer.at;
        if (timer.interval) timer.at += timer.interval;
        else timers.delete(id);
        timer.callback();
      }
      now = end;
    },
    cleanup: () => cleanup.forEach((callback) => callback()),
    timers,
  };
}

function findNode(node, predicate) {
  if (!node || typeof node !== "object") return undefined;
  if (predicate(node)) return node;
  const children = node.props?.children;
  for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
}

test("hero uses configured interval/fade and respects autoplay and reduced motion", async () => {
  const hero = await mountComponent("../../src/components/home/HeroCarousel.tsx", {
    hero: { autoplay: true, intervalMs: 100, fadeDurationMs: 42 },
  });

  assert.equal(hero.state[0], 0);
  assert.ok(findNode(hero.render(), (node) => node.props?.style?.transitionDuration === "42ms"));
  assert.equal(findNode(hero.render(), (node) => node.type === "content-image").props.style, undefined);
  assert.equal(findNode(hero.render(), (node) => node.props?.style?.transform), undefined);
  hero.advance(99);
  assert.equal(hero.state[0], 0);
  hero.advance(1);
  assert.equal(hero.state[0], 1);
  hero.cleanup();
  assert.equal(hero.timers.size, 0);
  for (const options of [{ hero: { ...heroDefaults, autoplay: false } }, { reducedMotion: true }]) {
    const disabled = await mountComponent("../../src/components/home/HeroCarousel.tsx", options);
    assert.equal(disabled.timers.size, 0);
  }
});

test("hero pause is a separate localized toggle and reduced motion disables its animation", async () => {
  const options = {};
  const hero = await mountComponent("../../src/components/home/HeroCarousel.tsx", options);
  let tree = hero.render();
  let toggle = findNode(tree, (node) => node.type === "button");
  assert.equal(toggle.props["aria-pressed"], false);
  assert.equal(toggle.props["aria-label"], authoredCopy.page_controls.pause_motion);
  const link = findNode(tree, (node) => node.type === "next/link");
  assert.equal(findNode(link, (node) => node.type === "button"), undefined);
  toggle.props.onClick();
  tree = hero.render();
  toggle = findNode(tree, (node) => node.type === "button");
  assert.equal(toggle.props["aria-pressed"], true);
  assert.equal(toggle.props["aria-label"], authoredCopy.page_controls.resume_motion);
  assert.ok(findNode(tree, (node) => node.props?.style?.transitionDuration === "0ms"));
  toggle.props.onClick();
  options.reducedMotion = true;
  tree = hero.render();
  assert.equal(findNode(tree, (node) => node.type === "button"), undefined);
  assert.ok(findNode(tree, (node) => node.props?.style?.transitionDuration === "0ms"));
  hero.cleanup();
});

test("desktop dropdown uses the configured close delay and cleans up pending timers", async () => {
  const header = await mountComponent("../../src/components/SiteHeader.tsx", {
    interaction: { dropdownCloseDelayMs: 75 },
  });
  const menuItem = findNode(header.render(), (node) => typeof node.props?.onPointerLeave === "function");
  const mouse = { pointerType: "mouse", currentTarget: { contains: () => false } };
  menuItem.props.onPointerEnter(mouse);
  assert.equal(header.state[0], "resources");
  menuItem.props.onPointerLeave(mouse);
  header.advance(74);
  assert.equal(header.state[0], "resources");
  header.advance(1);
  assert.equal(header.state[0], null);
  menuItem.props.onPointerLeave(mouse);
  menuItem.props.onPointerLeave(mouse);
  assert.equal(header.timers.size, 1);
  header.cleanup();
  assert.equal(header.timers.size, 0);
});

test("desktop shortcuts and actions are removed from header", async () => {
  const header = await mountComponent("../../src/components/SiteHeader.tsx", {});
  const shortcuts = findNode(header.render(), (node) => node.props?.["data-header-actions"]);
  assert.equal(shortcuts, undefined);
  header.cleanup();
});

test("announcement honors delay, page eligibility, and disabled state", async () => {
  const popup = await mountComponent("../../src/components/YajnaAnnouncement.tsx", {
    announcement: { ...announcementDefaults, delayMs: 100, pages: ["/events/"] },
  });
  popup.advance(99);
  assert.equal(popup.render(), null);
  popup.advance(1);
  assert.ok(popup.render());
  popup.cleanup();
  assert.equal(popup.timers.size, 0);
  for (const announcement of [
    { ...announcementDefaults, enabled: false },
    { ...announcementDefaults, pages: ["/sevas"] },
  ]) {
    const hidden = await mountComponent("../../src/components/YajnaAnnouncement.tsx", { announcement });
    hidden.advance(10000);
    assert.equal(hidden.render(), null);
  }
});

test("top bar renders Donate and Volunteer without a Subscribe button", async () => {
  let donations = 0;
  const options = { onDonate: () => donations++ };
  const bar = await mountComponent("../../src/components/TopBar.tsx", options);
  const subscribe = findNode(bar.render(), (node) => node.props?.["data-top-subscribe"]);
  assert.equal(subscribe, undefined);
  assert.ok(findNode(bar.render(), (node) => node.props?.href === "https://volunteer.example.org/"));
  findNode(bar.render(), (node) => node.type === "button" && node.props?.["aria-label"] === authoredCopy.public_actions.donate_label).props.onClick();
  assert.equal(donations, 1);
  bar.cleanup();
});

test("announcement starts and expires on already-open pages at UTC boundaries", async () => {
  const popup = await mountComponent("../../src/components/YajnaAnnouncement.tsx", {
    now: Date.parse("2026-10-16T23:59:59Z"),
    announcement: { ...announcementDefaults, delayMs: 10, startsOn: "2026-10-17", endsOn: "2026-10-17" },
  });
  popup.advance(1009);
  assert.equal(popup.render(), null);
  popup.advance(1);
  assert.ok(popup.render());
  popup.advance(86400000);
  assert.equal(popup.render(), null);
  popup.cleanup();
});

test("announcement dismissal uses only the configured persistence store", async () => {
  for (const dismissal of ["session", "persistent", "none"]) {
    const announcement = { ...announcementDefaults, delayMs: 0, dismissal };
    const popup = await mountComponent("../../src/components/YajnaAnnouncement.tsx", { announcement });
    popup.advance(0);
    findNode(popup.render(), (node) => node.type === "button").props.onClick();
    assert.equal(popup.render(), null);
    assert.equal(popup.session.size, dismissal === "session" ? 1 : 0);
    assert.equal(popup.local.size, dismissal === "persistent" ? 1 : 0);
    popup.cleanup();
    const next = await mountComponent("../../src/components/YajnaAnnouncement.tsx", {
      announcement, session: popup.session, local: popup.local,
    });
    next.advance(0);
    assert.equal(next.render() === null, dismissal !== "none");
    next.cleanup();
  }
});

test("announcements temporarily yield to dialogs without losing dismissal state", async () => {
  const options = { announcement: { ...announcementDefaults, delayMs: 0 }, dialogsOpen: false };
  const popup = await mountComponent("../../src/components/YajnaAnnouncement.tsx", options);
  popup.advance(0);
  assert.ok(popup.render());
  options.dialogsOpen = true;
  assert.equal(popup.render(), null);
  assert.equal(popup.session.size, 0, "opening a dialog must not persist a dismissal");
  options.dialogsOpen = false;
  assert.ok(popup.render());
  findNode(popup.render(), (node) => node.type === "button").props.onClick();
  options.dialogsOpen = true;
  assert.equal(popup.render(), null);
  options.dialogsOpen = false;
  assert.equal(popup.render(), null, "closing a dialog must not resurrect a dismissed announcement");
  popup.cleanup();
});

test("desktop disclosures open for keyboard/touch clicks without touch hover", async () => {
  const header = await mountComponent("../../src/components/SiteHeader.tsx");
  const group = findNode(header.render(), (node) => typeof node.props?.onPointerEnter === "function");
  group.props.onPointerEnter({ pointerType: "touch" });
  assert.equal(header.state[0], null);
  let toggle = findNode(header.render(), (node) => node.type === "button" && node.props?.["aria-controls"]);
  assert.equal(toggle.props["aria-expanded"], false);
  toggle.props.onClick();
  toggle = findNode(header.render(), (node) => node.type === "button" && node.props?.["aria-controls"]);
  assert.equal(toggle.props["aria-expanded"], true);
  const panel = findNode(header.render(), (node) => node.props?.id === toggle.props["aria-controls"]);
  assert.equal(panel.props.hidden, false);
  toggle.props.onClick();
  assert.equal(header.state[0], null);
  header.cleanup();
});
