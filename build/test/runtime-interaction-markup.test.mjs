import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { loadAuthoredLanguage } from "../authored-content.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const readSource = (file) => readFile(new URL(`../../src/${file}`, import.meta.url), "utf8");

function nodes(tree, predicate) {
  if (!tree || typeof tree !== "object") return [];
  return [
    ...(predicate(tree) ? [tree] : []),
    ...[tree.props?.children].flat(Infinity).flatMap((child) => nodes(child, predicate)),
  ];
}

test("donation material form has associated labels, visible focus, and only the email handoff", async () => {
  const tr = loadAuthoredLanguage(root, "en");
  const state = [];
  let cursor = 0;
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const source = ts.transpileModule(await readSource("components/DonateModal.tsx"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (name) => {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        useId: () => "donation-fixture",
        useState: (initial) => {
          const slot = cursor++;
          if (!(slot in state)) state[slot] = initial;
          return [state[slot], (value) => { state[slot] = typeof value === "function" ? value(state[slot]) : value; }];
        },
      };
      if (name === "@/context/LanguageContext") return { useLang: () => ({ tr }) };
      if (name === "@/hooks/useDonateModal") return { useDonateModal: () => ({ isOpen: true, closeDonateModal() {} }) };
      if (name === "@/hooks/useModalReset") return { useModalReset: () => () => {} };
      if (name === "@/hooks/useDialog") return { useDialog: () => ({ current: null }) };
      if (name === "@/components/PaymentQr") return { default: "payment-qr" };
      if (name === "@/gen/settings/actions") return { actionDestinations: {
        donationEmail: "mailto:donations@example.invalid",
      } };
      if (name === "@/lib/action-links") return {
        formatActionMessage: (template) => template,
        withActionParameters: (url) => url,
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const render = () => { cursor = 0; return exports.default(); };
  const buttonWithText = (tree, text) => nodes(tree, (node) =>
    node.type === "button" && nodes(node, (child) => child.props?.children === text).length > 0)[0];
  let tree = render();
  buttonWithText(tree, tr.ui.donate_material).props.onClick();
  tree = render();
  buttonWithText(tree, tr.editorial.donation.material_options[0].label).props.onClick();
  tree = render();
  const fields = nodes(tree, (node) => node.type === "input" || node.type === "textarea");
  const labels = nodes(tree, (node) => node.type === "label");
  assert.equal(fields.length, 3);
  assert.equal(new Set(fields.map((field) => field.props.id)).size, fields.length);
  for (const field of fields) {
    assert.ok(labels.some((label) => label.props.htmlFor === field.props.id));
    assert.match(field.props.className, /focus-visible:outline-2/);
  }
  assert.equal(fields.find((field) => field.props.type === "text").props.autoComplete, "name");
  assert.equal(fields.find((field) => field.props.type === "tel").props.autoComplete, "tel");
  const actions = nodes(tree, (node) => node.type === "a");
  assert.equal(actions.length, 1);
  assert.match(actions[0].props.href, /^mailto:/);
  assert.doesNotMatch(await readSource("components/DonateModal.tsx"), /donationWhatsApp|donation_whatsapp_label/);
});

test("compact and full navigation share the same 80rem breakpoint", async () => {
  const [desktop, compact, topBar] = await Promise.all([
    readSource("components/SiteHeader.tsx"),
    readSource("components/MobileHeader.tsx"),
    readSource("components/TopBar.tsx"),
  ]);
  assert.match(desktop, /hidden xl:block/);
  assert.match(compact, /xl:hidden/);
  assert.match(topBar, /hidden xl:block/);
  for (const source of [desktop, compact]) {
    assert.match(source, /min-width: 80rem/);
    assert.match(source, /aria-expanded/);
    assert.match(source, /aria-controls/);
  }
  assert.match(compact, /lockPageScroll\(\)/);
});

test("dialog panels constrain short viewports and the photo swipe region retains native pinch", async () => {
  const [donation, qr, event, viewer] = await Promise.all([
    readSource("components/DonateModal.tsx"),
    readSource("components/QRModal.tsx"),
    readSource("components/EventDetailModal.tsx"),
    readSource("components/media/MediaViewer.tsx"),
  ]);
  for (const panel of [donation, qr, event]) {
    assert.match(panel, /max-h-\[(?:calc\()?100dvh/);
    assert.match(panel, /overflow-y-auto/);
  }
  assert.match(event, /h-\[min\(12rem,30dvh\)\]/);
  assert.match(viewer, /touch-pan-y touch-pinch-zoom/);
});

test("language changes apply descriptor fonts and remove them for languages without overrides", async () => {
  let language = "fixture-a";
  const properties = new Map([["--font-localized", "previous-font"]]);
  const document = { documentElement: {
    lang: "",
    style: {
      setProperty: (name, value) => properties.set(name, value),
      removeProperty: (name) => properties.delete(name),
    },
  } };
  const exports = {};
  const compiled = ts.transpileModule(await readSource("context/LanguageContext.tsx"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports, document,
    require: (name) => {
      if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }) };
      if (name === "react") return {
        createContext: () => ({ Provider: "provider" }),
        useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
        useEffect: (effect) => effect(),
      };
      if (name === "@/lib/browser-preferences") return { createPreferenceStore: (_key, fallback) => ({
        subscribe() {}, setValue() {},
        getSnapshot: () => fallback === "fixture-a" ? language : fallback,
        getServerSnapshot: () => fallback,
      }) };
      if (name === "@/gen/content") return {
        defaultLang: "fixture-a", defaultContentMode: "real", isContentSwitchable: false,
        content: { "fixture-a": {}, "fixture-b": {} },
        languages: [
          { code: "fixture-a", font_family: "var(--fixture-font)" },
          { code: "fixture-b" },
        ],
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  exports.LanguageProvider({ children: null });
  assert.equal(document.documentElement.lang, "fixture-a");
  assert.equal(properties.get("--font-localized"), "var(--fixture-font)");
  language = "fixture-b";
  exports.LanguageProvider({ children: null });
  assert.equal(document.documentElement.lang, "fixture-b");
  assert.equal(properties.has("--font-localized"), false);
  const originalScript = JSON.parse(await readFile(new URL("../../content/languages/kn.json", import.meta.url), "utf8"));
  const defaultScript = JSON.parse(await readFile(new URL("../../content/languages/en.json", import.meta.url), "utf8"));
  assert.equal(originalScript._language.font_family, "var(--font-kannada)");
  assert.equal(defaultScript._language.font_family, undefined);
});

test("compact-header and desktop utility controls reserve at least 44px touch targets", async () => {
  for (const file of ["MobileHeader", "TopBar"]) {
    const source = ts.createSourceFile(file, await readSource(`components/${file}.tsx`), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const controls = [];
    const visit = (node) => {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        ["button", "a"].includes(node.tagName.getText(source))) {
        const className = node.attributes.properties.find((property) =>
          ts.isJsxAttribute(property) && property.name.getText(source) === "className");
        controls.push(className.initializer.getText(source));
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    const targeted = file === "MobileHeader" ? controls.slice(0, 2) : controls;
    assert.equal(targeted.length, file === "MobileHeader" ? 2 : 4);
    for (const className of targeted) {
      assert.match(className, /min-w-11/);
      assert.match(className, /min-h-11/);
    }
  }
});

test("dialog and announcement close icons retain 44px minimum touch targets", async () => {
  for (const file of ["DonateModal", "QRModal", "EventDetailModal", "YajnaAnnouncement"]) {
    const source = ts.createSourceFile(file, await readSource(`components/${file}.tsx`), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let closeClass;
    const visit = (node) => {
      if (ts.isJsxOpeningElement(node) && node.tagName.getText(source) === "button") {
        const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
        const label = attributes.find((property) => property.name.getText(source) === "aria-label");
        if (label && /\.(?:close|close_modal|dismiss)\b/.test(label.initializer.getText(source))) {
          closeClass = attributes.find((property) =>
            property.name.getText(source) === "className").initializer.getText(source);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    assert.ok(closeClass, `${file} has a labeled close control`);
    assert.match(closeClass, /min-w-11/);
    assert.match(closeClass, /min-h-11/);
  }
});
