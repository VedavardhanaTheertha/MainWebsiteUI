import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const source = ts.transpileModule(read("src/hooks/useCenteredRail.ts"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup({ enabled = true, reducedMotion = false, desktop = false, count = 4, width = 360, display = "flex", overflowX = "auto" } = {}) {
  class Style {
    values = new Map();
    getPropertyValue(key) { return this.values.get(key) ?? ""; }
    setProperty(key, value) { this.values.set(key, value); }
    removeProperty(key) { this.values.delete(key); }
    number(key) { return Number.parseFloat(this.getPropertyValue(key)); }
  }
  class Element extends EventTarget {
    style = new Style();
    dataset = {};
    height = 400;
    get offsetHeight() { return this.height; }
    get offsetWidth() {
      return track.dataset.centeredRail ? track.style.number("--centered-card-width") : 280;
    }
    get offsetLeft() {
      const edge = track.dataset.centeredRail ? track.style.number("--centered-edge") : 16;
      return edge + track.children.indexOf(this) * (this.offsetWidth + 20);
    }
    getBoundingClientRect() { throw new Error("Transformed metrics must not be measured"); }
    scrollTo(options) {
      this.lastScroll = options;
      this.scrollLeft = options.left;
      this.dispatchEvent(new Event("scroll"));
    }
  }
  const track = new Element();
  track.clientWidth = width;
  track.scrollLeft = 0;
  track.display = display;
  track.overflowX = overflowX;
  track.children = Array.from({ length: count }, () => new Element());
  Object.defineProperty(track, "scrollWidth", { get() {
    const cardWidth = track.dataset.centeredRail ? track.style.number("--centered-card-width") : 280;
    const edge = track.dataset.centeredRail ? track.style.number("--centered-edge") : 16;
    return Math.max(track.clientWidth, edge * 2 + track.children.length * cardWidth + Math.max(0, track.children.length - 1) * 20);
  } });
  const frames = new Map();
  const timers = new Map();
  const observers = [];
  const view = new EventTarget();
  const fonts = new EventTarget();
  let nextFrame = 0;
  let nextTimer = 0;
  let cleanup;
  class Observer {
    observed = new Set();
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.observed.add(element); }
    disconnect() { this.observed.clear(); }
  }
  const exports = {};
  vm.runInNewContext(source, {
    exports, Event, HTMLElement: Element, window: Object.assign(view, { matchMedia: () => ({ matches: desktop }) }),
    document: { fonts }, getComputedStyle: () => ({ display: track.display, overflowX: track.overflowX, columnGap: "20px" }),
    ResizeObserver: Observer, MutationObserver: Observer,
    requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: (callback, delay) => { timers.set(++nextTimer, { callback, delay }); return nextTimer; },
    clearTimeout: (id) => timers.delete(id),
    require: (name) => {
      if (name === "react") return { useEffect: (effect) => { cleanup = effect(); } };
      if (name === "@/context/UiSettingsContext") return { useUiSettings: () => ({ layoutSettings: { centeredCarousel: enabled } }) };
      if (name === "@/hooks/useReducedMotion") return { useReducedMotion: () => reducedMotion };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const mount = () => exports.useCenteredRail({ current: track });
  mount();
  const flush = () => {
    const pending = Array.from(frames.values());
    frames.clear();
    pending.forEach((callback) => callback());
  };
  return {
    track, frames, timers, observers, view, fonts, flush,
    settle: () => {
      const pending = Array.from(timers.values());
      timers.clear();
      pending.forEach(({ callback }) => callback());
    },
    scales: () => track.children.map((card) => Number(card.style.getPropertyValue("--centered-scale"))),
    unmount: () => cleanup?.(),
    disable: () => { cleanup?.(); enabled = false; mount(); },
    setDesktop: (value) => { desktop = value; view.dispatchEvent(new Event("resize")); },
  };
}

test("centered rails are default-off and leave nonoverflow/static desktop grids unchanged", () => {
  const off = setup({ enabled: false });
  assert.equal(off.frames.size, 0);
  assert.equal(off.observers.length, 0);
  assert.equal(off.track.style.values.size, 0);
  for (const options of [{ count: 1 }, { count: 2, width: 1500 }, { display: "grid", desktop: true }, { overflowX: "visible" }]) {
    const fixture = setup(options);
    fixture.flush();
    assert.equal(fixture.track.dataset.centeredRail, undefined);
    assert.equal(fixture.track.style.values.size, 0);
    assert.ok(fixture.track.children.every((card) => card.style.values.size === 0));
    assert.equal(fixture.frames.size, 0);
    fixture.unmount();
  }
});

test("mobile uses centered cards with neighbor previews and true first/last centerable boundaries", () => {
  const fixture = setup();
  fixture.flush();
  const { track } = fixture;
  assert.equal(track.dataset.centeredRail, "active");
  assert.ok(track.style.number("--centered-card-width") <= 360 * 0.74);
  assert.ok(track.style.number("--centered-card-width") > 360 / 2);
  assert.ok(track.style.number("--centered-edge") > 20, "edge space exposes the neighboring tile");
  assert.deepEqual(fixture.scales(), [1, 0.85, 0.85, 0.85]);
  const first = track.children[0];
  assert.equal(first.offsetLeft + first.offsetWidth / 2, track.clientWidth / 2);
  track.scrollLeft = track.scrollWidth - track.clientWidth;
  track.dispatchEvent(new Event("scroll"));
  fixture.flush();
  assert.deepEqual(fixture.scales(), [0.85, 0.85, 0.85, 1]);
  const last = track.children.at(-1);
  assert.ok(Math.abs(last.offsetLeft + last.offsetWidth / 2 - track.scrollLeft - track.clientWidth / 2) < 0.001);
  fixture.unmount();
});

test("manual and automatic scroll events interpolate continuously with one batched frame and no own animation loop", () => {
  const fixture = setup();
  fixture.flush();
  const { track } = fixture;
  const stride = track.children[0].offsetWidth + 20;
  track.scrollLeft = stride / 2;
  for (let index = 0; index < 8; index++) track.dispatchEvent(new Event("scroll"));
  assert.equal(fixture.frames.size, 1);
  fixture.flush();
  assert.deepEqual(fixture.scales(), [0.925, 0.925, 0.85, 0.85]);
  assert.equal(fixture.frames.size, 0);
  track.scrollLeft = stride * 0.75;
  track.dispatchEvent(new Event("scroll"));
  fixture.flush();
  assert.deepEqual(fixture.scales(), [0.8875, 0.9625, 0.85, 0.85]);
  fixture.unmount();
});

test("manual scrolls settle on the nearest exact card center after an idle interval", () => {
  for (const desktop of [false, true]) {
    const fixture = setup({ desktop, width: desktop ? 1000 : 360 });
    fixture.flush();
    const { track } = fixture;
    const stride = track.children[0].offsetWidth + 20;
    const interactions = [];
    for (const name of ["rail-centering-start", "rail-centering-end"]) {
      track.addEventListener(name, () => interactions.push(name));
    }
    for (const [fraction, index] of [[0.4, 0], [0.6, 1], [1.6, 2], [2.8, 3]]) {
      track.scrollLeft = stride * fraction;
      track.dispatchEvent(new Event("scroll"));
      fixture.flush();
      assert.equal(track.scrollLeft, stride * fraction, "scrolling remains free until idle");
      assert.equal(fixture.timers.size, 1);
      assert.equal(Array.from(fixture.timers.values())[0].delay, 160);
      fixture.settle();
      assert.equal(track.lastScroll.behavior, "smooth");
      assert.ok(Math.abs(track.scrollLeft - stride * index) < 0.001);
      fixture.settle();
      assert.equal(fixture.timers.size, 0, "an already centered card does not start another snap");
      assert.deepEqual(interactions.splice(0), ["rail-centering-start", "rail-centering-end"]);
    }
    fixture.unmount();
  }
});

test("continued scrolling debounces centering and does not fight automatic slide frames", () => {
  const fixture = setup();
  fixture.flush();
  for (let index = 1; index <= 12; index++) {
    fixture.track.scrollLeft = index * 10;
    fixture.track.dispatchEvent(new Event("scroll"));
    assert.equal(fixture.timers.size, 1);
    assert.equal(fixture.track.lastScroll, undefined);
  }
  fixture.settle();
  assert.equal(fixture.track.lastScroll.behavior, "smooth");
  fixture.unmount();
});

test("pointer gestures defer settling until every pointer ends, including release outside the track", () => {
  for (const end of ["pointerup", "pointercancel", "blur"]) {
    const fixture = setup();
    fixture.flush();
    const pointer = (name, pointerId) => Object.assign(new Event(name), { pointerId });
    fixture.track.dispatchEvent(pointer("pointerdown", 1));
    fixture.track.dispatchEvent(pointer("pointerdown", 2));
    fixture.track.scrollLeft = 100;
    fixture.track.dispatchEvent(new Event("scroll"));
    fixture.settle();
    assert.equal(fixture.track.lastScroll, undefined);
    fixture.view.dispatchEvent(pointer("pointerup", 1));
    assert.equal(fixture.timers.size, 0);
    fixture.view.dispatchEvent(pointer(end, 2));
    assert.equal(fixture.timers.size, 1);
    fixture.settle();
    assert.equal(fixture.track.scrollLeft, 0);
    fixture.unmount();
  }
});

test("reduced motion centers manual scrolling immediately without a smooth animation", () => {
  const fixture = setup({ reducedMotion: true });
  fixture.flush();
  const stride = fixture.track.children[0].offsetWidth + 20;
  fixture.track.scrollLeft = stride * 0.7;
  fixture.track.dispatchEvent(new Event("scroll"));
  fixture.settle();
  assert.equal(fixture.track.lastScroll.behavior, "instant");
  assert.equal(fixture.track.scrollLeft, stride);
  fixture.unmount();
});

test("a new gesture cancels pending or active settling and resumes only after release", () => {
  const fixture = setup();
  fixture.flush();
  fixture.track.scrollLeft = 100;
  fixture.track.dispatchEvent(new Event("scroll"));
  fixture.track.dispatchEvent(Object.assign(new Event("pointerdown"), { pointerId: 1 }));
  assert.equal(fixture.timers.size, 0);
  fixture.view.dispatchEvent(Object.assign(new Event("pointerup"), { pointerId: 1 }));
  fixture.settle();
  fixture.track.dispatchEvent(Object.assign(new Event("pointerdown"), { pointerId: 2 }));
  assert.equal(fixture.track.lastScroll.behavior, "instant", "interrupts the owned smooth scroll");
  fixture.track.scrollLeft = 200;
  fixture.track.dispatchEvent(new Event("scroll"));
  fixture.settle();
  assert.equal(fixture.track.scrollLeft, 200, "does not pull against an active gesture");
  fixture.view.dispatchEvent(Object.assign(new Event("pointerup"), { pointerId: 2 }));
  fixture.settle();
  assert.equal(fixture.track.lastScroll.behavior, "smooth");
  fixture.unmount();
  assert.equal(fixture.timers.size, 0);
});

test("desktop scrolling rails show approximately three cards and resize back to untouched static grids", () => {
  const fixture = setup({ desktop: true, width: 1000 });
  fixture.flush();
  assert.equal(fixture.track.style.number("--centered-card-width"), 320);
  assert.equal(fixture.track.style.number("--centered-edge"), 340);
  fixture.track.display = "grid";
  fixture.view.dispatchEvent(new Event("resize"));
  fixture.flush();
  assert.equal(fixture.track.dataset.centeredRail, undefined);
  assert.equal(fixture.track.style.values.size, 0);
  fixture.track.display = "flex";
  fixture.track.clientWidth = 360;
  fixture.setDesktop(false);
  fixture.flush();
  assert.ok(fixture.track.style.number("--centered-card-width") <= 360 * 0.74);
  fixture.unmount();
});

test("narrow mobile tracks retain at least twenty pixels of each shrunken neighbor", () => {
  for (const width of [260, 283, 315, 360, 750]) {
    const fixture = setup({ width });
    fixture.flush();
    const { track } = fixture;
    const middle = track.children[1];
    track.scrollLeft = middle.offsetLeft + middle.offsetWidth / 2 - width / 2;
    track.dispatchEvent(new Event("scroll"));
    fixture.flush();
    const [left, , right] = track.children;
    const leftPreview = left.offsetLeft + left.offsetWidth / 2 +
      left.offsetWidth * fixture.scales()[0] / 2 - track.scrollLeft;
    const rightPreview = track.scrollLeft + width - (right.offsetLeft + right.offsetWidth / 2 -
      right.offsetWidth * fixture.scales()[2] / 2);
    assert.ok(leftPreview >= 19.99, `left preview at ${width}px is ${leftPreview}px`);
    assert.ok(rightPreview >= 19.99, `right preview at ${width}px is ${rightPreview}px`);
    fixture.unmount();
  }
});

test("loading, variable heights, mutation and font/resize changes refresh geometry without transformed feedback", () => {
  const fixture = setup();
  fixture.flush();
  const { track } = fixture;
  track.children[1].height = 1200;
  track.dispatchEvent(new Event("load"));
  fixture.flush();
  assert.equal(track.style.number("--centered-room"), 46);
  track.children[1].height = 1600;
  fixture.observers[0].callback();
  fixture.flush();
  assert.equal(track.style.number("--centered-room"), 56);
  const removed = track.children.pop();
  fixture.observers[1].callback();
  fixture.flush();
  assert.equal(removed.style.values.size, 0);
  assert.equal(fixture.observers[0].observed.size, track.children.length + 1);
  fixture.fonts.dispatchEvent(new Event("loadingdone"));
  assert.equal(fixture.frames.size, 1);
  fixture.flush();
  fixture.unmount();
});

test("reduced motion uses static nearest-card emphasis while manual movement remains available", () => {
  const fixture = setup({ reducedMotion: true });
  fixture.flush();
  const { track } = fixture;
  track.scrollLeft = (track.children[0].offsetWidth + 20) * 0.75;
  track.dispatchEvent(new Event("scroll"));
  fixture.flush();
  assert.deepEqual(fixture.scales(), [0.85, 1, 0.85, 0.85]);
  const css = read("src/app/carousel-emphasis.css");
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*transition: none/);
  assert.match(css, /> :focus-within\s*\{\s*scale: 1/);
  assert.doesNotMatch(css, /transition-property:[^;]*(?:scale|transform|all)/);
  fixture.unmount();
});

test("disable and unmount remove all owned styles, observers, pending frames and event listeners", () => {
  for (const action of ["disable", "unmount"]) {
    const fixture = setup();
    fixture.flush();
    fixture.track.dispatchEvent(new Event("scroll"));
    assert.equal(fixture.frames.size, 1);
    fixture[action]();
    assert.equal(fixture.frames.size, 0);
    assert.equal(fixture.track.dataset.centeredRail, undefined);
    assert.equal(fixture.track.style.values.size, 0);
    assert.ok(fixture.track.children.every((card) => card.style.values.size === 0));
    assert.ok(fixture.observers.every((observer) => observer.observed.size === 0));
    for (const name of ["scroll", "load"]) fixture.track.dispatchEvent(new Event(name));
    fixture.view.dispatchEvent(new Event("resize"));
    fixture.fonts.dispatchEvent(new Event("loadingdone"));
    assert.equal(fixture.frames.size, 0);
  }
});
