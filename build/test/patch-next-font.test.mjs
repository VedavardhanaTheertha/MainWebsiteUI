import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { patchNextFont } from "../../scripts/patch-next-font.mjs";

test("patchNextFont patches unpatched next/font loader and handles already patched file", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "patch-next-font-test-"));
  try {
    // 1. Returns false when target file does not exist
    assert.equal(patchNextFont(tmpDir), false);

    const loaderDir = path.join(tmpDir, "node_modules/next/dist/compiled/@next/font/dist/google");
    fs.mkdirSync(loaderDir, { recursive: true });
    const loaderFile = path.join(loaderDir, "loader.js");

    const originalContent = `
      function load() {
        const ext = /\\.(woff|woff2|eot|ttf|otf)(?:\\?.*)?$/i.exec(googleFontFileUrl)[1];
        return ext;
      }
    `;
    fs.writeFileSync(loaderFile, originalContent, "utf8");

    // 2. Patches the file
    assert.equal(patchNextFont(tmpDir), true);
    const patchedContent = fs.readFileSync(loaderFile, "utf8");
    assert.ok(patchedContent.includes("extMatch ? extMatch[1] : \"woff2\""));
    assert.ok(!patchedContent.includes("exec(googleFontFileUrl)[1]"));

    // 3. Re-running on already patched file succeeds idempotently
    assert.equal(patchNextFont(tmpDir), true);
    assert.equal(fs.readFileSync(loaderFile, "utf8"), patchedContent);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

