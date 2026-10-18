import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { appendDeveloperNavigation, developerOptionsForEnvironment, headerActionsStorageKey, imageTreatmentStorageKey, pageExtensionsForEnvironment, topSubscribeStorageKey, uiSettingsStorageKey, validateDeveloperOptionsOutput } from "../developer-options.mjs";
import { isPreservedContentField } from "../content-values.mjs";
import * as schema from "../ui-settings-schema.mjs";
import { loadUiElements } from "../ui-settings.mjs";

const source = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const jsx = (type, props, key) => ({ type, props, key });
const runtime = { jsx, jsxs: jsx };
const copy = JSON.parse(source("content/languages/en.json"));
const require = createRequire(import.meta.url);
const uiDefaults = loadUiElements();

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
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!node || typeof node !== "object") return [];
  if (typeof node.type === "function") return nodes(node.type(node.props));
  return [node, ...[node.props?.children].flat().flatMap(nodes)];
}

test("developer controls are local/dev-only and presentation defaults belong only to UI settings", () => {
  for (const environment of ["local", "dev", "prod", "unknown"]) {
    const options = developerOptionsForEnvironment(environment);
    assert.equal(options.enabled, ["local", "dev"].includes(environment));
    assert.equal(Object.hasOwn(options, "defaultImageTreatment"), false);
    assert.equal(options.imageStorageKey, imageTreatmentStorageKey);
    assert.equal(Object.hasOwn(options, "defaultHeaderActions"), false);
    assert.equal(options.headerActionsStorageKey, headerActionsStorageKey);
    assert.equal(Object.hasOwn(options, "defaultTopSubscribe"), false);
    assert.equal(options.topSubscribeStorageKey, topSubscribeStorageKey);
    assert.equal(options.uiSettingsStorageKey, uiSettingsStorageKey);
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

function preferencesFixture({ denied = false } = {}) {
  const stored = new Map();
  const warnings = [];
  const { createPreferenceStore } = load("lib/browser-preferences.ts", {}, {
    window: {
      get localStorage() {
        if (denied) throw new Error("Provided storage denial");
        return { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) };
      },
    },
    console: { warn: (...args) => warnings.push(args) },
  });
  const preferences = load("lib/ui-settings-preferences.ts", {
    "@/gen/content": { developerOptions: developerOptionsForEnvironment("prod") },
    "@/gen/settings/ui-elements": { uiElementDefaults: uiDefaults },
    "@/lib/browser-preferences": { createPreferenceStore },
    "../../build/ui-settings-schema.mjs": schema,
  }, { console: { warn: (...args) => warnings.push(args) } });
  let server = false;
  let state;
  const context = load("context/UiSettingsContext.tsx", {
    react: {
      createContext: () => ({ Provider: "provider" }),
      useContext: () => state,
      useMemo: (make) => make(),
      useSyncExternalStore: (_subscribe, snapshot, serverSnapshot) => server ? serverSnapshot() : snapshot(),
    },
    "@/gen/settings/ui-elements": { uiElementDefaults: uiDefaults },
    "@/lib/ui-settings-preferences": preferences,
    "../../build/ui-settings-schema.mjs": schema,
  });
  return { stored, warnings, preferences, context,
    render(ssr = false) {
      server = ssr;
      const tree = context.UiSettingsProvider({ children: null });
      state = tree.props.value;
      return { ...state, key: tree.key };
    },
  };
}

test("every UI setting has a typed editor definition and localized labels", () => {
  const actual = Object.entries(uiDefaults).flatMap(([group, fields]) => Object.keys(fields).map((key) => `${group}.${key}`));
  const defined = schema.uiFieldDefinitions.map(({ group, key }) => `${group}.${key}`);
  assert.equal(defined.length, 30);
  assert.deepEqual(defined.toSorted(), actual.toSorted());
  assert.equal(new Set(defined).size, defined.length);
  for (const language of ["en", "kn"]) {
    const labels = JSON.parse(source(`content/languages/${language}.json`)).developer_options;
    for (const field of schema.uiFieldDefinitions) {
      assert.ok(labels.groups[field.group]);
      assert.ok(labels.fields[`${field.group}.${field.key}`].label);
      if (field.kind === "choice") for (const value of field.options) assert.ok(labels.choices[value]);
    }
  }
});

test("runtime UI settings persist all field types, remount initial-state consumers, and preserve server defaults", () => {
  const fixture = preferencesFixture();
  const defaults = fixture.render();
  const custom = structuredClone(uiDefaults);
  custom.collections = { initialVisible: 3, loadIncrement: 2 };
  custom.hero = { autoplay: false, intervalMs: 12000, fadeDurationMs: 0 };
  custom.bhaktiReader = { minSize: 90, initialSize: 110, maxSize: 170, step: 10 };
  custom.browserDefaults.lineageView = "timeline";
  custom.presentation = { imageTreatment: true, headerActions: true, topSubscribe: true };
  assert.equal(fixture.preferences.applyUiSettings(custom), true);
  assert.equal(fixture.stored.get(uiSettingsStorageKey), JSON.stringify(schema.validateUiElements(custom)));
  assert.equal(fixture.render().settings.collectionPagination.initialVisible, 3);
  assert.equal(fixture.render().settings.heroSettings.autoplay, false);
  assert.equal(fixture.render().settings.browserDefaults.lineageView, "timeline");
  assert.equal(fixture.render().settings.bhaktiReaderSettings.initialSize, 110);
  assert.notEqual(fixture.render().key, defaults.key);
  assert.equal(fixture.render(true).key, defaults.key);
  assert.equal(fixture.render(true).settings.presentationSettings.imageTreatment, uiDefaults.presentation.imageTreatment);
  fixture.render().reset();
  assert.equal(fixture.render().key, defaults.key);
});

test("legacy production flags override file values, and applying settings clears their precedence", () => {
  const fixture = preferencesFixture();
  for (const [key, setting] of [
    [imageTreatmentStorageKey, "imageTreatment"], [headerActionsStorageKey, "headerActions"], [topSubscribeStorageKey, "topSubscribe"],
  ]) {
    fixture.stored.set(key, "on");
    assert.equal(fixture.render().settings.presentationSettings[setting], true);
    assert.equal(fixture.render(true).settings.presentationSettings[setting], uiDefaults.presentation[setting]);
    fixture.stored.set(key, "off");
    assert.equal(fixture.render().settings.presentationSettings[setting], false);
    fixture.stored.delete(key);
  }
  fixture.stored.set(imageTreatmentStorageKey, "on");
  fixture.preferences.applyUiSettings(uiDefaults);
  assert.equal(fixture.render().settings.presentationSettings.imageTreatment, uiDefaults.presentation.imageTreatment);
  const image = load("hooks/useImageTreatment.ts", {
    "@/context/UiSettingsContext": fixture.context, "@/lib/ui-settings-preferences": fixture.preferences,
  }).useImageTreatment;
  fixture.render();
  image().setImageTreatmentEnabled(true);
  fixture.render();
  assert.equal(image().imageTreatmentEnabled, true);
});

test("invalid saved settings are rejected explicitly without enabling copy overrides", () => {
  const fixture = preferencesFixture();
  for (const invalid of ["{", "null", JSON.stringify({ ...uiDefaults, local_preview: true })]) {
    fixture.stored.set(uiSettingsStorageKey, invalid);
    assert.equal(fixture.render().key, JSON.stringify(uiDefaults));
    fixture.render();
  }
  assert.equal(fixture.warnings.length, 3);
  assert.throws(() => fixture.preferences.applyUiSettings({ ...uiDefaults, contentMode: "placeholder" }), schema.UiSettingsError);
});

test("denied browser storage retains UI choices in memory and reports non-persistence", () => {
  const fixture = preferencesFixture({ denied: true });
  fixture.render();
  const custom = structuredClone(uiDefaults);
  custom.collections.initialVisible = 2;
  assert.equal(fixture.preferences.applyUiSettings(custom), false);
  assert.equal(fixture.render().settings.collectionPagination.initialVisible, 2);
  assert.equal(fixture.render().persistent, false);
  assert.equal(fixture.warnings.length, 4);
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

function pageFixture(defaultMode = "real", persistent = true) {
    let mode = defaultMode, cursor = 0, reloads = 0, resets = 0;
    let applied;
    const slots = [];
    const language = {
      useLang: () => ({ tr: copy, contentMode: mode, setContentMode: (value) => { mode = value; } }),
    };
    const LocalContentToggle = load("components/LocalContentToggle.tsx", {
      react: { useId: () => "provided-copy-description" },
      "@/gen/content": { isContentSwitchable: true }, "@/context/LanguageContext": language,
    });
    const Page = load("components/DeveloperOptionsPage.tsx", {
      react: {
        useId: () => "provided-description",
        useState(initial) {
          const slot = cursor++;
          if (!(slot in slots)) slots[slot] = typeof initial === "function" ? initial() : initial;
          return [slots[slot], (value) => { slots[slot] = typeof value === "function" ? value(slots[slot]) : value; }];
        },
      },
      "@/context/LanguageContext": language,
      "@/gen/content": { defaultContentMode: defaultMode, developerOptions: developerOptionsForEnvironment("local") },
      "@/gen/settings/ui-elements": { uiFields: schema.uiFieldDefinitions },
      "@/context/UiSettingsContext": { useUiSettingsEditor: () => ({
        values: uiDefaults, persistent: true,
        apply: (value) => { applied = value; return persistent; },
        reset: () => { resets++; return persistent; },
      }) },
      "../../build/ui-settings-schema.mjs": schema,
      "@/components/LocalContentToggle": LocalContentToggle,
    }, { window: { location: { reload: () => reloads++ } }, console: { warn() {} } }).default;
    const controls = () => { cursor = 0; return nodes(Page()); };
    return {
      controls, field: (name) => controls().find((node) => node.props.name === name),
      copyCheckbox: () => controls().find((node) => node.props["data-developer-option"] === "placeholder-copy"),
      submit: () => controls().find((node) => node.type === "form").props.onSubmit({ preventDefault() {} }),
      reset: () => controls().find((node) => node.type === "button" && node.props.children === copy.developer_options.reset).props.onClick(),
      get applied() { return applied; }, get mode() { return mode; }, get reloads() { return reloads; }, get resets() { return resets; },
    };
}

test("the editor covers every setting, keeps edits as drafts and applies typed values only on submit", () => {
  const page = pageFixture();
  assert.equal(page.controls().filter((node) => node.props.name).length, 30);
  page.field("collections.initialVisible").props.onChange({ target: { value: "3", valueAsNumber: 3 } });
  page.field("browserDefaults.lineageView").props.onChange({ target: { value: "timeline" } });
  page.field("presentation.headerActions").props.onChange({ target: { checked: true } });
  assert.equal(page.applied, undefined);
  assert.equal(page.reloads, 0);
  page.submit();
  assert.equal(page.applied.collections.initialVisible, 3);
  assert.equal(page.applied.browserDefaults.lineageView, "timeline");
  assert.equal(page.applied.presentation.headerActions, true);
  assert.equal(page.reloads, 1);
});

test("copy remains an immediate checkbox with environment defaults, independent of UI drafts", () => {
  for (const defaultMode of ["real", "placeholder"]) {
    const page = pageFixture(defaultMode);
    const { copyCheckbox } = page;
    assert.equal(copyCheckbox().props.checked, defaultMode === "placeholder");
    assert.equal(copyCheckbox().props["aria-describedby"], "provided-copy-description");
    copyCheckbox().props.onChange({ target: { checked: true } });
    assert.equal(page.mode, "placeholder");
    assert.equal(copyCheckbox().props.checked, true);
    copyCheckbox().props.onChange({ target: { checked: false } });
    assert.equal(page.mode, "real");
    assert.equal(copyCheckbox().props.checked, false);
    assert.equal(page.applied, undefined);
    page.reset();
    assert.equal(page.resets, 1);
    assert.equal(page.mode, defaultMode);
    assert.equal(page.reloads, 1);
    assert.equal(copyCheckbox().props.checked, defaultMode === "placeholder");
  }
});

test("invalid cross-field values show localized feedback without saving or reloading", () => {
  const page = pageFixture();
  page.field("bhaktiReader.maxSize").props.onChange({ target: { value: "90", valueAsNumber: 90 } });
  page.submit();
  assert.equal(page.applied, undefined);
  assert.equal(page.reloads, 0);
  assert.equal(page.controls().find((node) => node.props.role === "alert").props.children, copy.developer_options.invalid_settings);
});

test("non-persistent edits are applied in memory without a reload that would lose them", () => {
  const page = pageFixture("real", false);
  page.submit();
  assert.ok(page.applied);
  assert.equal(page.reloads, 0);
  assert.equal(page.controls().find((node) => node.props.role === "status").props.children, copy.developer_options.storage_warning);
});

test("real-only builds do not render the copy checkbox", () => {
  const Toggle = load("components/LocalContentToggle.tsx", {
    react: { useId: () => "provided-copy-description" },
    "@/gen/content": { isContentSwitchable: false },
    "@/context/LanguageContext": { useLang: () => ({}) },
  }).default;
  assert.equal(Toggle(), null);
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

function standaloneHero(storedValue, denied = false, uiValue = null, reduced = true) {
  const generator = source("scripts/generate-content.mjs");
  const start = generator.indexOf("function writeHeroImages(");
  const end = generator.indexOf("// ── Build", start);
  assert.ok(start >= 0 && end > start);
  let html;
  const writeHero = vm.runInNewContext(`${generator.slice(start, end)}\nwriteHeroImages;`, {
    rootDir: ".", path, imageTreatmentStorageKey, uiSettingsStorageKey, loadUiElements, readFileSync,
    escapeHtml: (value) => value, resolveHeroHref: (value) => value,
    heroSettings: { fadeDurationMs: 100, autoplay: false, intervalMs: 1000 },
    mkdirSync() {}, writeFileSync: (_file, value) => { html = value; },
  });
  writeHero({ title_en: "Provided title", title_kn: "Provided title", href: "/", images: ["/provided.png"] }, {}, "en", "");
  const dataset = {};
  const styles = new Map();
  const listeners = new Map();
  const warnings = [];
  const elements = new Map([
    [".hero", { dataset: { titleEn: "Provided title", ctaEn: "Provided action" } }],
    [".hero-title", {}], [".hero-cta", {}],
  ]);
  let stored = storedValue;
  let storedUi = uiValue;
  let interval;
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    document: {
      documentElement: { dataset, style: { setProperty: (key, value) => styles.set(key, value) } },
      querySelector: (selector) => elements.get(selector),
      querySelectorAll: () => Array.from({ length: 2 }, () => ({ classList: { add() {}, remove() {} }, setAttribute() {} })),
    },
    location: { search: "" }, URLSearchParams,
    localStorage: { getItem: (key) => {
      if (denied) throw new Error("Provided storage denial");
      return key === imageTreatmentStorageKey ? stored : key === uiSettingsStorageKey ? storedUi : null;
    } },
    console: { warn: (...args) => warnings.push(args) },
    window: {
      addEventListener: (name, fn) => listeners.set(name, fn), matchMedia: () => ({ matches: reduced }),
      setInterval: (_callback, delay) => { interval = delay; return 1; },
      clearInterval: () => { interval = undefined; },
    },
  });
  return { dataset, warnings, styles, get interval() { return interval; },
    changeSettings(value) {
      storedUi = value;
      listeners.get("storage")({ key: uiSettingsStorageKey });
    },
    change(value, key = imageTreatmentStorageKey) {
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

test("the standalone hero applies validated UI overrides for fitting, fades, interval and autoplay", () => {
  const custom = structuredClone(uiDefaults);
  custom.presentation.imageTreatment = true;
  custom.hero = { autoplay: true, intervalMs: 1234, fadeDurationMs: 42 };
  const hero = standaloneHero(null, false, JSON.stringify(custom), false);
  assert.equal(hero.dataset.imageTreatment, "on");
  assert.equal(hero.styles.get("--hero-fade-duration"), "42ms");
  assert.equal(hero.interval, 1234);
  custom.hero.autoplay = false;
  hero.changeSettings(JSON.stringify(custom));
  assert.equal(hero.interval, undefined);
  hero.changeSettings("{");
  assert.equal(hero.dataset.imageTreatment, uiDefaults.presentation.imageTreatment ? "on" : "off");
  assert.equal(hero.warnings.length, 1);
});

test("the standalone hero defaults safely and reports denied storage only once", () => {
  const hero = standaloneHero("on", true);
  assert.equal(hero.dataset.imageTreatment, "off");
  assert.equal(hero.warnings.length, 1);
  assert.match(hero.warnings[0][0], /preferences.*localStorage unavailable/);
});
