import assert from "node:assert/strict";
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

test("live theme settings remain configurable and fixture tokens render exactly", () => {
  const fixture = JSON.parse(readFileSync(new URL("./fixtures/theme.json", import.meta.url), "utf8"));
  assert.deepEqual(parseThemeSettings(fixture), fixture);
  const css = renderThemeCss(fixture);
  for (const [name, value] of Object.entries(fixture.tokens)) assert.ok(css.includes(`${name}: ${value};`));
  assert.deepEqual(loadThemeSettings(rootDir), settings);
  const changed = structuredClone(settings);
  changed.tokens["--color-custom-fixture"] = "#abcdef";
  assert.doesNotThrow(() => parseThemeSettings(changed));
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
  for (const namespace of ["color", "spacing", "radius", "shadow"]) {
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

test("imported static theme generates utilities and metadata-driven font overrides", async () => {
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
  const css = compiler.build(["bg-saffron-600", "text-ink-800", "font-body", "font-display", "p-4", "rounded-lg", "shadow-md"]);
  for (const name of ["bg-saffron-600", "text-ink-800", "font-body", "font-display", "p-4", "rounded-lg", "shadow-md"]) {
    assert.ok(css.includes(`.${name} {`), `missing generated utility ${name}`);
  }
  for (const name of Object.keys(settings.tokens)) {
    assert.ok(css.includes(`${name}:`), `static theme must retain configured token ${name}`);
  }
  assert.match(css, /body \{[^}]*font-family: var\(--font-localized, var\(--font-body\)\);/);
  assert.match(css, /\.font-body \{\s*font-family: var\(--font-localized, var\(--font-body\)\);/);
  assert.match(css, /\.font-display \{\s*font-family: var\(--font-localized, var\(--font-display\)\);/);
  assert.match(css, /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6 \{\s*font-family: var\(--font-localized, var\(--font-display\)\);/);
});

test("both content lifecycle and deployment builds generate theme before compilation", () => {
  const pkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
  assert.equal(pkg.scripts["theme:build"], "node build/build-theme-settings.mjs");
  assert.equal(pkg.scripts["content:build"], "node build/generate.mjs");
  assert.equal(pkg.scripts.dev, "node build/dev.mjs");
  for (const file of ["dev.mjs", "build.mjs"]) {
    const source = readFileSync(path.join(rootDir, "build", file), "utf8");
    assert.ok(source.indexOf("generateContent(") < source.indexOf('["dev"') ||
      source.indexOf("generateContent(") < source.indexOf('["build"'));
  }
});
