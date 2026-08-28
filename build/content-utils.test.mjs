import test from "node:test";
import assert from "node:assert/strict";
import { assertSafeSourceFile, removeSearchTags, validateMetadata } from "./content-utils.mjs";

test("removeSearchTags omits the metadata-only Markdown section", () => {
  const source = "# Title\n\nVisible content\n\n## Search Tags\n\nnot, visible";
  assert.equal(removeSearchTags(source), "# Title\n\nVisible content");
});

test("assertSafeSourceFile rejects traversal and non-Markdown files", () => {
  assert.throws(() => assertSafeSourceFile("../secret.md"));
  assert.throws(() => assertSafeSourceFile("song.html"));
  assert.doesNotThrow(() => assertSafeSourceFile("song.md"));
});

test("validateMetadata rejects duplicate ids", () => {
  const song = { id: "same", title: "Song", sourceFile: "song.md" };
  assert.throws(() => validateMetadata({ songs: [song, song] }, "test"), /duplicate id/);
});