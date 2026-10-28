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

    // 2. Patches stock Next.js 16.3.8 pattern
    const stockContent = `
      function load() {
        const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];
        return ext;
      }
    `;
    fs.writeFileSync(loaderFile, stockContent, "utf8");

    assert.equal(patchNextFont(tmpDir), true);
    const patchedStock = fs.readFileSync(loaderFile, "utf8");
    assert.ok(patchedStock.includes("extMatch ? extMatch[1] : \"woff2\""));
    assert.ok(!patchedStock.includes("exec(googleFontFileUrl)[1]"));

    // 3. Re-running on already patched file succeeds idempotently
    assert.equal(patchNextFont(tmpDir), true);
    assert.equal(fs.readFileSync(loaderFile, "utf8"), patchedStock);

    // 4. Also patches alternative pattern
    const altContent = `
      function load() {
        const ext = /\\.(woff|woff2|eot|ttf|otf)(?:\\?.*)?$/i.exec(googleFontFileUrl)[1];
        return ext;
      }
    `;
    fs.writeFileSync(loaderFile, altContent, "utf8");

    assert.equal(patchNextFont(tmpDir), true);
    const patchedAlt = fs.readFileSync(loaderFile, "utf8");
    assert.ok(patchedAlt.includes("extMatch ? extMatch[1] : \"woff2\""));
    assert.ok(!patchedAlt.includes("exec(googleFontFileUrl)[1]"));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

