import { testUiSettings } from "./helpers/ui-settings.mjs";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("modal reset uses the configured delay and cancels stale resets on reopening/unmount", async () => {
  const source = await readFile(new URL("../../src/hooks/useModalReset.ts", import.meta.url), "utf8");
  const exports = {};
  const timer = { current: null };
  const effects = [];
  const queued = [];
  const timers = new Map();
  let effectIndex = 0;
  let now = 0;
  let nextId = 0;
  let resets = 0;
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, {
    exports,
    require: (name) => {
      if (name === "@/context/UiSettingsContext") return { useUiSettings: () => ({ ...testUiSettings, ...({ interactionSettings: { modalResetDelayMs: 750 } }) }) };
      if (name === "@/gen/settings/ui-elements") return { interactionSettings: { modalResetDelayMs: 750 } };
      assert.equal(name, "react");
      return {
        useRef: () => timer,
        useEffect: (effect, dependencies) => {
          const index = effectIndex++;
          const previous = effects[index];
          if (!previous || dependencies.some((value, key) => value !== previous.dependencies[key])) {
            queued.push(() => {
              previous?.cleanup?.();
              effects[index] = { dependencies, cleanup: effect() };
            });
          }
        },
      };
    },
    setTimeout: (callback, delay) => {
      timers.set(++nextId, { callback, at: now + delay });
      return nextId;
    },
    clearTimeout: (id) => timers.delete(id),
  });
  const render = (isOpen) => {
    effectIndex = 0;
    const schedule = exports.useModalReset(isOpen, () => { resets++; });
    queued.splice(0).forEach((effect) => effect());
    return schedule;
  };
  const advance = (duration) => {
    now += duration;
    for (const [id, pending] of timers) {
      if (pending.at <= now) {
        timers.delete(id);
        pending.callback();
      }
    }
  };
  render(true)();
  render(false);
  advance(749);
  assert.equal(resets, 0);
  advance(1);
  assert.equal(resets, 1);
  render(false)();
  render(true);
  advance(1000);
  assert.equal(resets, 1);
  render(true)();
  render(false);
  effects.forEach((effect) => effect.cleanup?.());
  advance(1000);
  assert.equal(resets, 1);
  assert.equal(timers.size, 0);
});
