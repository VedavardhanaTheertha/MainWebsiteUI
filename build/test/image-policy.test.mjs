import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const configSource = readFileSync(new URL("../../next.config.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(configSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const policy = JSON.parse(readFileSync(new URL("../../settings/image_policy.json", import.meta.url), "utf8"));

function loadConfig(value = policy, { raw = false } = {}) {
  const exports = {};
  const localRequire = (id) => id === "node:fs" ? {
    readFileSync: (file, encoding) => String(file).endsWith("image_policy.json") ?
      (raw ? value : JSON.stringify(value)) : readFileSync(file, encoding),
  } : require(id);
  new Function("require", "exports", "process", compiled)(localRequire, exports, {
    ...process, env: { ...process.env, SITE_ENV: "dev" },
  });
  return exports.default;
}

test("root Next loader preserves existing and live-homepage image hosts and YAML environment", () => {
  const config = loadConfig();
  assert.deepEqual(config.images, {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "vedavardhanatheertha.github.io", pathname: "/**" },
      { protocol: "https", hostname: "shiroormatha.org", pathname: "/**" },
      { protocol: "https", hostname: "www.shiroormatha.org", pathname: "/**" },
      { protocol: "https", hostname: "pub-*.r2.dev", pathname: "/**" },
    ],
  });
  assert.match(configSource, /"config", "site\.yml"/);
  assert.equal(config.output, "export");
  assert.equal(config.env.SITE_ENV, "dev");
  assert.doesNotMatch(configSource, /vedavardhanatheertha\.github\.io|shiroormatha\.org|WebsiteTestMedia/);
});

test("JSON alone controls the image policy without default copies in code", () => {
  assert.deepEqual(loadConfig({ unoptimized: false, remotePatterns: [] }).images, {
    unoptimized: false, remotePatterns: [],
  });
  const changed = {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**.example.com", pathname: "/images/*/full/**" }],
  };
  assert.deepEqual(loadConfig(changed).images, changed);
});

test("public R2 wildcard is accepted by the loader and Next's actual remote-image matcher", () => {
    const { matchRemotePattern } = require("next/dist/shared/lib/match-remote-pattern");
    const pattern = loadConfig().images.remotePatterns.find(({ hostname }) => hostname === "pub-*.r2.dev");
    assert.ok(pattern);
    for (const hostname of [
      "pub-93b6a521943a4df0aa899a838fdad684.r2.dev",
      "pub-40778d02c0624406be0340bf0ee4b2b4.r2.dev",
      "pub-new-account.r2.dev",
    ]) {
      assert.equal(matchRemotePattern(pattern, new URL(`https://${hostname}/images/photo.jpg`)), true);
    }
    for (const url of [
      "https://r2.dev/photo.jpg", "https://private.r2.dev/photo.jpg",
      "https://other-pub-account.r2.dev/photo.jpg", "https://pub-account.example.com/photo.jpg",
      "https://pub-account.r2.dev.example.com/photo.jpg", "http://pub-account.r2.dev/photo.jpg",
    ]) {
      assert.equal(matchRemotePattern(pattern, new URL(url)), false, url);
    }
});

test("malformed policy roots, fields, booleans and patterns fail at Next config load", () => {
  for (const value of [
    null, [], {}, { ...policy, unknown: true }, { ...policy, unoptimized: "true" },
    { ...policy, remotePatterns: {} }, { ...policy, remotePatterns: [null] },
    { ...policy, remotePatterns: [policy.remotePatterns[0], policy.remotePatterns[0]] },
  ]) {
    assert.throws(() => loadConfig(value), /settings\/image_policy\.json/);
  }
  for (const patch of [
    { extra: true }, { protocol: "ftp" }, { protocol: "https:" }, { protocol: null },
    { hostname: "" }, { hostname: "https://example.com" }, { hostname: "example.com:443" },
    { hostname: "bad host" }, { hostname: "-example.com" }, { hostname: "***.example.com" },
    { hostname: "pub-**.r2.dev" }, { hostname: "pub-*.r2.*" }, { hostname: "pub-*.r2.dev/path" },
    { pathname: "images/**" }, { pathname: "/images\\file" }, { pathname: "/images?size=1" },
    { pathname: "/images#fragment" }, { pathname: "/../images" }, { pathname: "/%xx" },
    { pathname: "/images/**/extra" }, { pathname: "/images/partial*" }, { pathname: null },
  ]) {
    assert.throws(() => loadConfig({
      ...policy, remotePatterns: [{ ...policy.remotePatterns[0], ...patch }],
    }), /settings\/image_policy\.json/, JSON.stringify(patch));
  }
  assert.throws(() => loadConfig("{", { raw: true }), SyntaxError);
});
