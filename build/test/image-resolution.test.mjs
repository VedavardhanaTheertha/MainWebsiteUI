import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { resolveImageUrl } from "../image-resolution.mjs";

test("image aliases preserve media-directory prefixes and absolute HTTPS targets", () => {
  assert.equal(resolveImageUrl("/chakra.png", "https://media.example/images"), "https://media.example/images/chakra.png");
  assert.equal(resolveImageUrl("chakra.png", "https://media.example/images/"), "https://media.example/images/chakra.png");
  assert.equal(resolveImageUrl("https://assets.example/photo.jpg", "https://media.example/images"), "https://assets.example/photo.jpg");
  assert.equal(resolveImageUrl("/local.png"), "/local.png");
});

test("image aliases reject malformed, unsafe and non-HTTPS targets", () => {
  for (const target of ["", "//evil.example/a.jpg", "http://example.com/a.jpg", "data:image/png;base64,a", "javascript:alert(1)", "/../secret", "/%2e%2e/secret", "/a\\b", "https://name:secret@example.com/a.jpg", "https://example.com bad"]) {
    assert.throws(() => resolveImageUrl(target, "https://media.example/images"), /image|URL|HTTPS/i);
  }
  for (const base of ["http://media.example", "https://media.example/?x=1", "https://name:secret@media.example"]) {
    assert.throws(() => resolveImageUrl("/a.jpg", base), /image base URL/);
  }
});

test("every configured image resolves to its exact media target in both environments", () => {
  for (const environment of ["dev", "prod"]) {
    const config = JSON.parse(readFileSync(new URL(`../../settings/${environment}/images.json`, import.meta.url), "utf8"));
    for (const target of Object.values(config.paths)) {
      const resolved = resolveImageUrl(target, config.baseUrl);
      assert.equal(resolved, target.startsWith("https://") ? target : `${config.baseUrl}${target}`);
      assert.equal(new URL(resolved).protocol, "https:");
      assert.doesNotMatch(resolved, /https?:\/\/.*https?:\/\//);
    }
  }
});

test("runtime image exports use exact resolved targets, not concatenated absolute URLs", () => {
  const compiled = ts.transpileModule(readFileSync(new URL("../../src/lib/images.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const configs = Object.fromEntries(["dev", "prod"].map((environment) => [
    environment, JSON.parse(readFileSync(new URL(`../../settings/${environment}/images.json`, import.meta.url), "utf8")),
  ]));
  for (const environment of ["dev", "prod"]) {
    const exports = {};
    vm.runInNewContext(compiled, {
      exports,
      process: { env: { SITE_ENV: environment } },
      require: (name) => {
        if (name === "../../build/image-resolution.mjs") return { resolveImageUrl };
        const key = name.includes("/prod/") ? "prod" : "dev";
        return configs[key];
      },
    });
    for (const [key, target] of Object.entries(configs[environment].paths)) {
      assert.equal(exports.imagePaths[key], target.startsWith("https://") ? target : `${configs[environment].baseUrl}${target}`);
    }
  }
});
