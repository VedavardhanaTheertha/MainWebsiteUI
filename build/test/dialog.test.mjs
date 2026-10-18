import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

async function fixture() {
  const listeners = new Map();
  const document = {
    body: { style: { overflow: "auto" } },
    addEventListener: (name, callback) => {
      const set = listeners.get(name) ?? new Set();
      set.add(callback);
      listeners.set(name, set);
    },
    removeEventListener: (name, callback) => listeners.get(name)?.delete(callback),
  };
  class Element {
    constructor(children = []) {
      this.children = children;
      this.isConnected = true;
      this.attrs = new Map();
    }
    querySelectorAll() { return this.children; }
    contains(target) { return target === this || this.children.includes(target); }
    getClientRects() { return [1]; }
    closest() { return null; }
    focus() { document.activeElement = this; }
    getAttribute(name) { return this.attrs.get(name) ?? null; }
    setAttribute(name, value) { this.attrs.set(name, value); }
    removeAttribute(name) { this.attrs.delete(name); }
    set tabIndex(value) { this.attrs.set("tabindex", String(value)); }
  }
  const exports = {};
  let effects = [];
  let currentDialog;
  let refIndex = 0;
  const compiled = ts.transpileModule(await readFile(
    new URL("../../src/hooks/useDialog.ts", import.meta.url), "utf8",
  ), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, {
    exports, document, HTMLElement: Element, Node: Element,
    require: () => ({
      useRef: (value) => ({ current: refIndex++ === 0 ? currentDialog : value }),
      useEffect: (callback) => effects.push(callback),
    }),
  });
  return {
    document, Element,
    mount: (open, onClose) => {
      currentDialog = new Element([new Element(), new Element()]);
      effects = [];
      refIndex = 0;
      const ref = exports.useDialog(open, onClose);
      const cleanups = effects.map((effect) => effect()).filter(Boolean);
      return { ref, cleanup: () => cleanups.forEach((cleanup) => cleanup()) };
    },
    key: (key, shiftKey = false) => {
      const event = { key, shiftKey, prevented: false, preventDefault() { this.prevented = true; }, stopPropagation() {} };
      for (const callback of listeners.get("keydown") ?? []) callback(event);
      return event;
    },
    focusOutside: (target) => {
      document.activeElement = target;
      for (const callback of listeners.get("focusin") ?? []) callback({ target });
    },
  };
}

test("dialog traps focus, closes on Escape, restores focus and preserves body overflow", async () => {
  const f = await fixture();
  const opener = new f.Element();
  opener.focus();
  let closed = 0;
  const dialog = f.mount(true, () => closed++);
  const [first, last] = dialog.ref.current.children;
  assert.equal(f.document.activeElement, first);
  assert.equal(f.document.body.style.overflow, "hidden");
  assert.equal(f.key("Tab", true).prevented, true);
  assert.equal(f.document.activeElement, last);
  f.key("Tab");
  assert.equal(f.document.activeElement, first);
  f.focusOutside(opener);
  assert.equal(f.document.activeElement, first);
  f.key("Escape");
  assert.equal(closed, 1);
  dialog.cleanup();
  assert.equal(f.document.activeElement, opener);
  assert.equal(f.document.body.style.overflow, "auto");
  assert.equal(dialog.ref.current.getAttribute("tabindex"), null);
});

test("nested dialogs close only the top and keep scrolling locked until the last closes", async () => {
  const f = await fixture();
  let firstClosed = 0;
  let secondClosed = 0;
  const first = f.mount(true, () => firstClosed++);
  const second = f.mount(true, () => secondClosed++);
  f.key("Escape");
  assert.equal(firstClosed, 0);
  assert.equal(secondClosed, 1);
  second.cleanup();
  assert.equal(f.document.body.style.overflow, "hidden");
  assert.equal(f.document.activeElement, first.ref.current.children[0]);
  first.cleanup();
  assert.equal(f.document.body.style.overflow, "auto");
});

test("inactive dialog leaves focus and page scrolling unchanged", async () => {
  const f = await fixture();
  const opener = new f.Element();
  opener.focus();
  f.mount(false, () => assert.fail("inactive dialog must not close"));
  f.key("Escape");
  assert.equal(f.document.activeElement, opener);
  assert.equal(f.document.body.style.overflow, "auto");
});
