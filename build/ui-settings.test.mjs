import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const defaults = {
  collections: { initialVisible: 6, loadIncrement: 9 },
  autoScroll: { pixelsPerSecond: 36, returnDurationMs: 2200 },
};

test("UI settings generation preserves pagination and exports custom scroll settings", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ui-settings-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "build"));
  await mkdir(path.join(root, "settings"));
  const script = path.join(root, "build", "build-ui-settings.mjs");
  await copyFile(new URL("./build-ui-settings.mjs", import.meta.url), script);
  const source = path.join(root, "settings", "ui_elements.json");
  const run = (settings) => {
    return writeFile(source, JSON.stringify(settings)).then(() =>
      spawnSync(process.execPath, [script], { encoding: "utf8" }),
    );
  };

  const custom = { ...defaults, autoScroll: { pixelsPerSecond: 12.5, returnDurationMs: 900 } };
  assert.equal((await run(custom)).status, 0);
  const generated = await readFile(path.join(root, "src", "gen", "settings", "ui-elements.ts"), "utf8");
  assert.match(generated, /collectionPagination = \{"initialVisible":6,"loadIncrement":9\} as const/);
  assert.match(generated, /railAutoScroll = \{"pixelsPerSecond":12.5,"returnDurationMs":900\} as const/);

  for (const value of [0, -1, "36", null]) {
    const result = await run({ ...defaults, autoScroll: { ...defaults.autoScroll, pixelsPerSecond: value } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /autoScroll.pixelsPerSecond must be a positive finite number/);
  }
  for (const field of ["initialVisible", "loadIncrement", "returnDurationMs"]) {
    const section = field === "returnDurationMs" ? "autoScroll" : "collections";
    const result = await run({ ...defaults, [section]: { ...defaults[section], [field]: 1.5 } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, new RegExp(`${section}.${field} must be a positive integer`));
  }
  for (const section of ["collections", "autoScroll"]) {
    const result = await run({ ...defaults, [section]: [] });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, new RegExp(`must define an? ${section} object`));
  }
});

async function createRail(config = defaults.autoScroll, itemCount = 3) {
  const source = await readFile(new URL("../src/hooks/useAutoScrollRail.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const listeners = new Map();
  let scrollLeft = 0;
  const el = {
    get scrollLeft() { return scrollLeft; },
    set scrollLeft(value) { scrollLeft = Math.round(value * 4 / 5) * 5 / 4; },
    scrollWidth: 10000, clientWidth: 300,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  let frame;
  let resume;
  let cleanup;
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => {
      if (name === "react") {
        return {
          useRef: () => ({ current: el }),
          useEffect: (effect) => { cleanup = effect(); },
        };
      }
      assert.equal(name, "@/gen/settings/ui-elements");
      return { railAutoScroll: config };
    },
    requestAnimationFrame: (callback) => { frame = callback; return 1; },
    cancelAnimationFrame: () => { frame = undefined; },
    setTimeout: (callback) => { resume = callback; return 1; },
    clearTimeout: () => { resume = undefined; },
  });
  exports.useAutoScrollRail(itemCount);
  return { el, listeners, tick: (time) => frame(time), resume: () => resume(), cleanup, hasFrame: () => !!frame };
}

test("row speed is configurable and independent of refresh rate, including slow speeds", async () => {
  for (const pixelsPerSecond of [0.5, 36, 72]) {
    for (const fps of [30, 60, 120]) {
      const rail = await createRail({ ...defaults.autoScroll, pixelsPerSecond });
      for (let frame = 0; frame <= fps * 2; frame++) rail.tick(frame * 1000 / fps);
      assert.ok(Math.abs(rail.el.scrollLeft - pixelsPerSecond * 2) <= 1);
      rail.cleanup();
      assert.equal(rail.hasFrame(), false);
      assert.equal(rail.listeners.size, 0);
    }
  }
});

test("rows retain interaction pauses and honor configured return duration", async () => {
  const rail = await createRail({ pixelsPerSecond: 100, returnDurationMs: 400 });
  rail.el.scrollWidth = 310;
  rail.tick(0);
  rail.tick(100);
  assert.equal(rail.el.scrollLeft, 10);
  rail.tick(200);
  rail.tick(400);
  assert.equal(rail.el.scrollLeft, 5);
  rail.tick(600);
  assert.equal(rail.el.scrollLeft, 0);
  rail.listeners.get("touchstart")();
  rail.tick(700);
  assert.equal(rail.el.scrollLeft, 0);
  rail.listeners.get("touchend")();
  rail.resume();
  rail.tick(800);
  assert.equal(rail.el.scrollLeft, 10);
  rail.cleanup();
});

test("rows with one item do not animate", async () => {
  const rail = await createRail(defaults.autoScroll, 1);
  assert.equal(rail.hasFrame(), false);
  assert.equal(rail.listeners.size, 0);
});
