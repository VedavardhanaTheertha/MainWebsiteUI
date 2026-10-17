import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compile } from "tailwindcss";
import { loadThemeSettings, parseThemeSettings, renderThemeCss } from "../theme-settings.mjs";

const rootDir = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(import.meta.url);
const settings = loadThemeSettings();

test("all 77 original token names and exact values survive the settings migration", () => {
  const entries = Object.entries(settings.tokens).sort(([a], [b]) => a.localeCompare(b));
  assert.equal(entries.length, 77);
  // Fingerprinted from the original globals.css @theme before migration.
  assert.equal(createHash("sha256").update(JSON.stringify(entries)).digest("hex"),
    "75bd546983037e1449b1865db8915c6a2b3ce88c78d36ca80ce23135813842dc");
  assert.deepEqual(loadThemeSettings(rootDir), settings);
});

test("generated CSS is deterministic, static, and exactly matches the JSON authority", () => {
  const css = renderThemeCss(settings);
  assert.match(css, /@theme static \{/);
  const declarations = Object.fromEntries([...css.matchAll(/(--[\w-]+): ([^;]+);/g)]
    .map(([, name, value]) => [name, value]));
  assert.deepEqual(declarations, settings.tokens);
  assert.equal(css, renderThemeCss(settings));
  const changed = structuredClone(settings);
  changed.tokens["--color-saffron-600"] = "#123456";
  assert.match(renderThemeCss(changed), /--color-saffron-600: #123456;/);
});

test("root fields, token namespaces and malformed token values are rejected", () => {
  for (const value of [null, [], {}, { tokens: [] }, { ...settings, unexpected: true }]) {
    assert.throws(() => parseThemeSettings(value), /settings\/theme\.json/);
  }
  for (const [name, value] of [
    ["--unknown-token", "4px"], ["--color-BAD", "#123456"], ["--color-x;", "#123456"],
    ["--color-test", "#12"], ["--color-test", "red; color: blue"], ["--color-test", null],
    ["--color-test", 1], ["--color-test", " #fff"], ["--color-test", "url(https://example.com)"],
    ["--color-test", "rgba(256, 0, 0, 1)"], ["--color-test", "rgba(0, 0, 0, 1.1)"],
    ["--font-test", "var(--font-foo"], ["--font-test", "'broken"], ["--font-test", "serif,"],
    ["--font-test", "url(font.woff2)"], ["--spacing-test", "-1px"], ["--spacing-test", "4"],
    ["--spacing-test", "calc(1px + 2px)"], ["--radius-test", "NaNpx"],
    ["--shadow-test", "0 1px -2px #fff"], ["--shadow-test", "0 #fff"],
    ["--shadow-test", "0 0 1px rgba(0, 0, 0, 2)"], ["--shadow-test", "0 0 1px #fff}"],
  ]) {
    assert.throws(() => parseThemeSettings({ tokens: { ...settings.tokens, [name]: value } }),
      /settings\/theme\.json/, `${name}: ${value}`);
  }
  for (const namespace of ["color", "font", "spacing", "radius", "shadow"]) {
    assert.throws(() => parseThemeSettings({ tokens: Object.fromEntries(
      Object.entries(settings.tokens).filter(([name]) => !name.startsWith(`--${namespace}-`))
    ) }), /requires at least one/);
  }
});

test("references must resolve without cycles while next/font variables remain external", () => {
  for (const tokens of [
    { "--color-test": "var(--color-missing)" },
    { "--color-test": "var(--color-test)" },
    { "--color-test": "var(--color-other)", "--color-other": "var(--color-test)" },
    { "--font-test": "var(--font-test), serif" },
    { "--shadow-test": "0 0 1px var(--color-missing)" },
  ]) {
    assert.throws(() => parseThemeSettings({ tokens: { ...settings.tokens, ...tokens } }),
      /reference/);
  }
  assert.doesNotThrow(() => parseThemeSettings(settings));
});

test("imported static theme generates Tailwind utilities and retains language font overrides", async () => {
  const globals = path.join(rootDir, "src", "app", "globals.css");
  const source = readFileSync(globals, "utf8");
  assert.match(source, /@import "\.\.\/gen\/settings\/theme\.css";/);
  assert.doesNotMatch(source, /@theme|--(?:color|font|spacing|radius|shadow)-[\w-]+\s*:/);
  const compiler = await compile(source, {
    base: path.dirname(globals),
    loadStylesheet: async (id, base) => {
      const file = id === "tailwindcss" ? require.resolve("tailwindcss/index.css") : path.resolve(base, id);
      return {
        content: file === path.join(rootDir, "src", "gen", "settings", "theme.css") ?
          renderThemeCss(settings) : readFileSync(file, "utf8"),
        base: path.dirname(file),
        path: file,
      };
    },
  });
  const css = compiler.build(["bg-saffron-600", "text-ink-800", "font-display", "p-4", "rounded-lg", "shadow-md"]);
  for (const name of ["bg-saffron-600", "text-ink-800", "font-display", "p-4", "rounded-lg", "shadow-md"]) {
    assert.ok(css.includes(`.${name} {`), `missing generated utility ${name}`);
  }
  assert.match(css, /--font-sanskrit:/, "static must retain tokens even without utility candidates");
  assert.match(css, /html\[lang="kn"\] body \{\s*font-family: var\(--font-kannada\);/);
  assert.match(css, /\.bhakti-literature-content\[lang="en"\] h1 \{\s*font-family: var\(--font-display\);/);
  assert.match(css, /\.bhakti-literature-content\[lang="en"\] h2 \{\s*font-family: var\(--font-display\);/);
});

test("both content lifecycle and deployment builds generate theme before compilation", () => {
  const pkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
  assert.equal(pkg.scripts["theme:build"], "node build/build-theme-settings.mjs");
  assert.match(pkg.scripts["content:build"], /npm run theme:build/);
  for (const lifecycle of ["predev", "prebuild"]) {
    assert.match(pkg.scripts[lifecycle], /content:build/);
  }
  const build = readFileSync(path.join(rootDir, "build", "build.mjs"), "utf8");
  const theme = build.indexOf('"build-theme-settings.mjs"');
  assert.ok(theme > build.indexOf('"clean.mjs"'));
  assert.ok(theme < build.indexOf('"next", "dist", "bin", "next"'));
});
