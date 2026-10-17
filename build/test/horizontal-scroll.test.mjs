import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../../src/lib/horizontal-scroll.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function setup() {
  class Element extends EventTarget {
    parentElement = null;
    scrollWidth = 1200;
    clientWidth = 300;
    scrollLeft = 100;
    overflowX = "auto";
    dataset = {};
    interactive = false;
    tagName = "A";
    closest(selector) { return this.interactive || (this.tagName === "BUTTON" && selector.includes("button")) ? this : null; }
    contains(target) {
      for (let node = target; node; node = node.parentElement) if (node === this) return true;
      return false;
    }
  }
  const listeners = new Map();
  const view = new EventTarget();
  const root = {
    documentElement: new Element(), defaultView: view,
    getSelection: () => ({ removeAllRanges() {} }),
    querySelectorAll: () => [rail, link],
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, Event, Element, HTMLElement: Element, Node: Element,
    getComputedStyle: (element) => ({ overflowX: element.overflowX }),
  });
  const cleanup = exports.enableHorizontalMouseScroll(root);
  const rail = new Element();
  const link = new Element();
  link.scrollWidth = link.clientWidth;
  link.parentElement = rail;
  const interactions = [];
  for (const name of ["rail-interaction-start", "rail-interaction-end"]) rail.addEventListener(name, () => interactions.push(name));
  function emit(name, overrides = {}) {
    let prevented = false;
    let stopped = false;
    listeners.get(name)({
      target: link, pointerType: "mouse", button: 0, buttons: 1, pointerId: 7, clientX: 200, clientY: 50,
      detail: 1, preventDefault: () => { prevented = true; }, stopImmediatePropagation: () => { stopped = true; },
      ...overrides,
    });
    return { prevented, stopped };
  }
  return { rail, link, root, view, interactions, emit, cleanup, listeners };
}

test("desktop mouse dragging scrolls any overflowing row and blocks only the drag's click", () => {
  const { rail, emit, cleanup, listeners, interactions } = setup();
  emit("pointerover");
  assert.equal(rail.dataset.mouseScroll, "ready");
  emit("pointerdown");
  assert.equal(emit("dragstart").prevented, true, "native image/link dragging must not take over");
  assert.equal(emit("pointermove", { clientX: 120 }).prevented, true);
  assert.equal(rail.scrollLeft, 180);
  assert.equal(rail.dataset.mouseScroll, "dragging");
  emit("pointerup", { target: null });
  assert.equal(rail.dataset.mouseScroll, "ready", "release outside the row ends dragging");
  assert.deepEqual(interactions, ["rail-interaction-start", "rail-interaction-end"]);
  assert.deepEqual(emit("click"), { prevented: true, stopped: true });
  emit("pointerdown");
  emit("pointerup");
  assert.equal(emit("click").prevented, false, "the next deliberate click opens the card");
  cleanup();
  assert.equal(listeners.size, 0);
  assert.equal(rail.dataset.mouseScroll, undefined);
});

test("small movement, touch, vertical gestures, form controls and modified clicks retain native behavior", () => {
  for (const overrides of [
    { pointerType: "touch" }, { pointerType: "pen" }, { button: 2 },
    { ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true },
  ]) {
    const { rail, emit, cleanup } = setup();
    emit("pointerdown", overrides);
    assert.equal(emit("pointermove", { clientX: 100 }).prevented, false);
    assert.equal(rail.scrollLeft, 100);
    cleanup();
  }
  const { rail, link, emit, cleanup } = setup();
  emit("pointerdown");
  emit("pointermove", { clientX: 198 });
  emit("pointerup");
  assert.equal(emit("click").prevented, false);
  emit("pointerdown");
  emit("pointermove", { clientX: 198, clientY: 100 });
  assert.equal(rail.scrollLeft, 100);
  assert.equal(emit("click").prevented, false);
  link.interactive = true;
  emit("pointerdown");
  emit("pointermove", { clientX: 100 });
  assert.equal(rail.scrollLeft, 100);
  cleanup();
});

test("non-overflowing desktop grids are untouched and nested/dynamically added rows work", () => {
  const { rail, link, emit, cleanup } = setup();
  rail.scrollWidth = rail.clientWidth;
  emit("pointerdown");
  emit("pointermove", { clientX: 100 });
  assert.equal(rail.scrollLeft, 100);
  rail.scrollWidth = 1200;
  link.scrollWidth = link.clientWidth;
  emit("pointerdown");
  emit("pointermove", { clientX: 100, pointerId: 8 });
  assert.equal(rail.scrollLeft, 100, "other pointers do not control the active gesture");
  emit("pointermove", { clientX: 100 });
  assert.equal(rail.scrollLeft, 200);
  emit("pointercancel");
  assert.equal(rail.dataset.mouseScroll, "ready");
  assert.equal(emit("click", { detail: 0 }).prevented, false, "keyboard activation remains intact");
  cleanup();
});

test("button-based cards and tab strips can be dragged without activating their buttons", () => {
  const { rail, link, emit, cleanup } = setup();
  link.tagName = "BUTTON";
  emit("pointerdown");
  emit("pointermove", { clientX: 100 });
  emit("pointerup");
  assert.equal(rail.scrollLeft, 200);
  assert.equal(emit("click").prevented, true);
  emit("pointerdown");
  emit("pointerup");
  assert.equal(emit("click").prevented, false);
  cleanup();
});

test("window blur and lost mouse buttons end dragging without leaving stale state", () => {
  const { rail, view, emit, cleanup, interactions } = setup();
  emit("pointerdown");
  emit("pointermove", { clientX: 100 });
  view.dispatchEvent(new Event("blur"));
  assert.equal(rail.dataset.mouseScroll, "ready");
  assert.equal(interactions.at(-1), "rail-interaction-end");
  emit("pointerdown");
  emit("pointermove", { clientX: 100 });
  emit("pointermove", { clientX: 50, buttons: 0 });
  assert.equal(rail.dataset.mouseScroll, "ready");
  cleanup();
});
