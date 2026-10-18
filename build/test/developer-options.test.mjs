import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { appendDeveloperNavigation, developerOptionsForEnvironment, imageTreatmentStorageKey, pageExtensionsForEnvironment, validateDeveloperOptionsOutput } from "../developer-options.mjs";
import { isPreservedContentField } from "../content-values.mjs";

const source = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const jsx = (type, props) => ({ type, props });
const runtime = { jsx, jsxs: jsx };
const copy = JSON.parse(source("content/languages/en.json"));
const require = createRequire(import.meta.url);

function load(file, imports = {}, globals = {}) {
  const exports = {};
  const compiled = ts.transpileModule(source(`src/${file}`), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports, console, ...globals,
    require(name) {
      if (name === "react/jsx-runtime") return runtime;
      assert.ok(name in imports, `Unexpected import ${name}`);
      return imports[name];
    },
  });
  return exports;
}

function nodes(node) {
  if (!node || typeof node !== "object") return [];
  if (typeof node.type === "function") return nodes(node.type(node.props));
  return [node, ...[node.props?.children].flat().flatMap(nodes)];
}

test("developer controls are local/dev-only and all environments default the image effect off", () => {
  for (const environment of ["local", "dev", "prod", "unknown"]) {
    const options = developerOptionsForEnvironment(environment);
    assert.equal(options.enabled, ["local", "dev"].includes(environment));
    assert.equal(options.defaultImageTreatment, "off");
    assert.equal(options.imageStorageKey, imageTreatmentStorageKey);
  }
});

test("export verification requires preview-only developer HTML and confines copy controls to that page", () => {
  const publicRoutes = new Set(["/", "/events"]);
  const previewRoutes = new Set([...publicRoutes, "/developer-options"]);
  assert.deepEqual(validateDeveloperOptionsOutput("dev", previewRoutes, ["/developer-options"], true), []);
  assert.deepEqual(validateDeveloperOptionsOutput("local", previewRoutes, ["/developer-options"], true), []);
  assert.deepEqual(validateDeveloperOptionsOutput("prod", publicRoutes, [], false), []);
  assert.deepEqual(validateDeveloperOptionsOutput("local", previewRoutes, [], false), []);
  for (const result of [
    validateDeveloperOptionsOutput("prod", previewRoutes, [], false),
    validateDeveloperOptionsOutput("dev", publicRoutes, [], true),
    validateDeveloperOptionsOutput("local", previewRoutes, ["/", "/developer-options"], true),
    validateDeveloperOptionsOutput("local", previewRoutes, [null], true),
    validateDeveloperOptionsOutput("prod", publicRoutes, ["/developer-options"], false),
  ]) assert.ok(result.length > 0);
});

test("developer navigation is last, localized and readable in both copy variants without changing configured entries", () => {
  for (const language of ["en", "kn"]) {
    const localized = JSON.parse(source(`content/languages/${language}.json`)).developer_options;
    for (const label of ["Provided public label", "Sample navigation"]) {
      const content = { nav: [{ key: "public", href: "/", label }], developer_options: localized };
      const result = appendDeveloperNavigation(content, developerOptionsForEnvironment("dev"));
      assert.equal(result.nav.length, 2);
      assert.equal(result.nav[0], content.nav[0]);
      assert.equal(result.nav.at(-1).label, localized.menu_label);
      assert.equal(result.nav.at(-1).href, "/developer-options");
      assert.equal(content.nav.length, 1);
      assert.equal(appendDeveloperNavigation(content, developerOptionsForEnvironment("prod")), content);
    }
  }
  assert.equal(isPreservedContentField("developer_options", ""), true);
  assert.throws(() => appendDeveloperNavigation({ nav: [] }, developerOptionsForEnvironment("local")), /localized label/);
  const duplicate = { nav: [{ href: "/developer-options" }], developer_options: copy.developer_options };
  assert.throws(() => appendDeveloperNavigation(duplicate, developerOptionsForEnvironment("dev")), /generated/);
});

test("Next recognizes the preview-only page extension only in local/dev while preserving normal routes", () => {
  const { createValidFileMatcher } = require("next/dist/server/lib/find-page-file");
  for (const environment of ["local", "dev", "prod", "unknown"]) {
    const matcher = createValidFileMatcher(pageExtensionsForEnvironment(environment), "src\\app");
    assert.equal(matcher.isAppRouterPage("developer-options\\page.preview.tsx"), developerOptionsForEnvironment(environment).enabled);
    assert.equal(matcher.isAppRouterPage("story\\page.tsx"), true);
    assert.equal(matcher.isAppRouterPage("events\\route.ts"), true);
  }
});

test("the developer page has localized noindex metadata and a defensive production guard", () => {
  const notFound = new Error("Provided not-found signal");
  for (const environment of ["local", "dev", "prod"]) {
    const page = load("app/developer-options/page.preview.tsx", {
      "next/navigation": { notFound: () => { throw notFound; } },
      "@/components/DeveloperOptionsPage": { default: "developer-controls" },
      "@/gen/content": {
        content: { fixture: copy }, defaultLang: "fixture",
        developerOptions: developerOptionsForEnvironment(environment),
      },
    });
    assert.equal(page.metadata.title, copy.developer_options.title);
    assert.equal(page.metadata.robots.index, false);
    assert.equal(page.metadata.robots.follow, false);
    if (environment === "prod") {
      assert.throws(() => page.default(), (error) => error === notFound);
    } else {
      assert.equal(page.default().type, "developer-controls");
    }
  }
});

test("the image hook uses a safe server default, persists browser choices, and follows storage and clear events", () => {
  const stored = new Map();
  const listeners = new Map();
  const { createPreferenceStore } = load("lib/browser-preferences.ts", {}, {
    window: {
      localStorage: { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) },
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name) => listeners.delete(name),
    },
  });
  let server = false;
  let updates = 0;
  const unsubscribers = [];
  const { useImageTreatment } = load("hooks/useImageTreatment.ts", {
    react: { useSyncExternalStore: (subscribe, snapshot, serverSnapshot) => {
      if (!unsubscribers.length) unsubscribers.push(subscribe(() => updates++));
      return server ? serverSnapshot() : snapshot();
    } },
    "@/lib/browser-preferences": { createPreferenceStore },
    "@/gen/content": { developerOptions: developerOptionsForEnvironment("prod") },
  });
  assert.equal(useImageTreatment().imageTreatmentEnabled, false);
  useImageTreatment().setImageTreatmentEnabled(true);
  assert.equal(stored.get(imageTreatmentStorageKey), "on");
  assert.equal(useImageTreatment().imageTreatmentEnabled, true);
  assert.equal(updates, 1);
  server = true;
  assert.equal(useImageTreatment().imageTreatmentEnabled, false);
  server = false;
  stored.set(imageTreatmentStorageKey, "invalid");
  listeners.get("storage")({ key: imageTreatmentStorageKey });
  assert.equal(useImageTreatment().imageTreatmentEnabled, false);
  stored.set(imageTreatmentStorageKey, "on");
  listeners.get("storage")({ key: imageTreatmentStorageKey });
  assert.equal(useImageTreatment().imageTreatmentEnabled, true);
  stored.clear();
  listeners.get("storage")({ key: null });
  assert.equal(useImageTreatment().imageTreatmentEnabled, false);
  useImageTreatment().setImageTreatmentEnabled(false);
  assert.equal(stored.get(imageTreatmentStorageKey), "off");
  unsubscribers.forEach((unsubscribe) => unsubscribe());
  assert.equal(listeners.size, 0);
});

test("the root preference applier gates images without mounting a global copy toolbar", () => {
  let enabled = false;
  const document = { documentElement: { dataset: {} } };
  const Preferences = load("components/DeveloperPreferences.tsx", {
    react: { useEffect: (effect) => effect() },
    "@/hooks/useImageTreatment": { useImageTreatment: () => ({ imageTreatmentEnabled: enabled }) },
  }, { document }).default;
  assert.equal(Preferences(), null);
  assert.equal(document.documentElement.dataset.imageTreatment, "off");
  enabled = true;
  Preferences();
  assert.equal(document.documentElement.dataset.imageTreatment, "on");
  const layout = source("src/app/layout.tsx");
  assert.match(layout, /<DeveloperPreferences \/>/);
  assert.doesNotMatch(layout, /LocalContentToggle/);
});

test("developer controls toggle images, select copy and reset only developer preferences", () => {
  for (const defaultMode of ["real", "placeholder"]) {
    let image = false;
    let mode = defaultMode;
    const language = {
      useLang: () => ({ tr: copy, contentMode: mode, setContentMode: (value) => { mode = value; } }),
    };
    const LocalContentToggle = load("components/LocalContentToggle.tsx", {
      "@/gen/content": { isContentSwitchable: true }, "@/context/LanguageContext": language,
    });
    const Page = load("components/DeveloperOptionsPage.tsx", {
      react: { useId: () => "provided-description" },
      "@/context/LanguageContext": language,
      "@/gen/content": { defaultContentMode: defaultMode, developerOptions: developerOptionsForEnvironment("local") },
      "@/hooks/useImageTreatment": {
        useImageTreatment: () => ({
          imageTreatmentEnabled: image, setImageTreatmentEnabled: (value) => { image = value; },
        }),
      },
      "@/components/LocalContentToggle": LocalContentToggle,
    }).default;
    const controls = () => nodes(Page());
    const checkbox = () => controls().find((node) => node.type === "input");
    const button = (label) => controls().find((node) => node.type === "button" && node.props.children === label);
    assert.equal(checkbox().props.checked, false);
    assert.equal(checkbox().props["aria-describedby"], "provided-description");
    checkbox().props.onChange({ target: { checked: true } });
    assert.equal(checkbox().props.checked, true);
    button(copy.local_preview.placeholder).props.onClick();
    assert.equal(mode, "placeholder");
    assert.equal(button(copy.local_preview.placeholder).props["aria-pressed"], true);
    button(copy.local_preview.real).props.onClick();
    assert.equal(mode, "real");
    button(copy.developer_options.reset).props.onClick();
    assert.equal(mode, defaultMode);
    assert.equal(checkbox().props.checked, false);
  }
});

test("production copy ignores a browser placeholder preference and refuses copy switching", () => {
  let writes = 0;
  const Provider = load("context/LanguageContext.tsx", {
    react: {
      createContext: () => ({ Provider: "provider" }),
      useEffect() {},
      useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
    },
    "@/lib/browser-preferences": {
      createPreferenceStore: (key, fallback) => ({
        getSnapshot: () => key === "site-content-mode" ? "placeholder" : fallback,
        getServerSnapshot: () => fallback,
        subscribe() {},
        setValue: () => writes++,
      }),
    },
    "@/gen/content": {
      defaultLang: "fixture", languages: [{ code: "fixture" }],
      defaultContentMode: "real", isContentSwitchable: false,
      content: { fixture: copy }, alternateContent: null,
    },
  }).LanguageProvider;
  const context = Provider({ children: null }).props.value;
  assert.equal(context.contentMode, "real");
  assert.equal(context.tr, copy);
  context.setContentMode("placeholder");
  assert.equal(writes, 0);
});

function standaloneHero(storedValue, denied = false) {
  const generator = source("scripts/generate-content.mjs");
  const start = generator.indexOf("function writeHeroImages(");
  const end = generator.indexOf("// ── Build", start);
  assert.ok(start >= 0 && end > start);
  let html;
  const writeHero = vm.runInNewContext(`${generator.slice(start, end)}\nwriteHeroImages;`, {
    rootDir: ".", path, imageTreatmentStorageKey,
    escapeHtml: (value) => value, resolveHeroHref: (value) => value,
    heroSettings: { fadeDurationMs: 100, autoplay: false, intervalMs: 1000 },
    mkdirSync() {}, writeFileSync: (_file, value) => { html = value; },
  });
  writeHero({ title_en: "Provided title", title_kn: "Provided title", href: "/", images: ["/provided.png"] }, {}, "en", "");
  const dataset = {};
  const listeners = new Map();
  const warnings = [];
  const elements = new Map([
    [".hero", { dataset: { titleEn: "Provided title", ctaEn: "Provided action" } }],
    [".hero-title", {}], [".hero-cta", {}],
  ]);
  let stored = storedValue;
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    document: { documentElement: { dataset }, querySelector: (selector) => elements.get(selector) },
    location: { search: "" }, URLSearchParams,
    localStorage: { getItem: (key) => {
      if (denied) throw new Error("Provided storage denial");
      return key === imageTreatmentStorageKey ? stored : null;
    } },
    console: { warn: (...args) => warnings.push(args) },
    window: { addEventListener: (name, fn) => listeners.set(name, fn), matchMedia: () => ({ matches: true }) },
  });
  return { dataset, warnings, change(value, key = imageTreatmentStorageKey) {
    stored = value;
    listeners.get("storage")({ key });
  } };
}

test("the standalone hero honors default, stored, cross-document and cleared image choices", () => {
  for (const value of [null, "invalid", "off", "on"]) {
    const hero = standaloneHero(value);
    assert.equal(hero.dataset.imageTreatment, value === "on" ? "on" : "off");
    hero.change("on");
    assert.equal(hero.dataset.imageTreatment, "on");
    hero.change(null, null);
    assert.equal(hero.dataset.imageTreatment, "off");
  }
});

test("the standalone hero defaults safely and reports denied storage only once", () => {
  const hero = standaloneHero("on", true);
  assert.equal(hero.dataset.imageTreatment, "off");
  assert.equal(hero.warnings.length, 1);
  assert.match(hero.warnings[0][0], /preferences.*localStorage unavailable/);
});
