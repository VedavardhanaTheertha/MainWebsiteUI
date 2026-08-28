import test from "node:test";
import assert from "node:assert/strict";
import { describeContentMode } from "./environment-utils.mjs";

test("switchable content includes both variants and defaults to real", () => {
  assert.deepEqual(describeContentMode("switchable"), {
    contentMode: "switchable",
    defaultVariant: "real",
    includesReal: true,
    includesPlaceholder: true,
    switchable: true,
  });
});

test("single-mode environments include only their selected content", () => {
  assert.equal(describeContentMode("placeholder").includesReal, false);
  assert.equal(describeContentMode("real").includesPlaceholder, false);
});

test("unknown content modes fail closed", () => {
  assert.throws(() => describeContentMode("mixed"), /Unsupported content_mode/);
});