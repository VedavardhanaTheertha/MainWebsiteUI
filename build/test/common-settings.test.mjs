import assert from "node:assert/strict";
import test from "node:test";
import {
  parseCommonSettings,
  parseFontFamilySettings,
  parseFontSizeSettings,
  parseFontSettings,
  resolveCommonSettings,
  loadCommonSettings,
} from "../common-settings.mjs";

test("parseCommonSettings accepts valid configuration and assigns defaults", () => {
  const minimal = parseCommonSettings({
    background: { backgroundImage: "@chakra" },
  });
  assert.equal(minimal.background.backgroundImage, "@chakra");
  assert.equal(minimal.background.opacity, 0.12);
  assert.equal(minimal.background.size, "cover");
  assert.equal(minimal.background.repeat, "no-repeat");
  assert.equal(minimal.background.position, "center");
  assert.ok(minimal.fontFamily.display.includes("var(--font-marcellus)"));
  assert.ok(minimal.fontFamily.body.includes("var(--font-montserrat)"));
  assert.equal(minimal.fontSize.micro, "12px");
  assert.equal(minimal.fontSize.caption, "13px");
  assert.equal(minimal.fontSize.ui, "14px");
  assert.equal(minimal.fontSize.nav, "15px");
  assert.equal(minimal.fontSize.body, "16px");

  const custom = parseCommonSettings({
    background: {
      backgroundImage: "@image.chakra",
      opacity: 0.25,
      size: "contain",
      repeat: "repeat",
      position: "top left",
    },
    fontFamily: {
      display: "serif",
      body: "sans-serif",
      sanskrit: "serif",
      kannada: "sans-serif",
      mono: "monospace",
    },
    fontSize: {
      micro: "11px",
      caption: "12px",
      ui: "13px",
      nav: "14px",
      body: "15px",
      badge: "11px",
      formLabel: "12px",
      formInput: "15px",
      actionButton: "13px",
      meta: "12px",
    },
  });
  assert.equal(custom.background.backgroundImage, "@image.chakra");
  assert.equal(custom.background.opacity, 0.25);
  assert.equal(custom.background.size, "contain");
  assert.equal(custom.background.repeat, "repeat");
  assert.equal(custom.background.position, "top left");
  assert.equal(custom.fontFamily.display, "serif");
  assert.equal(custom.fontFamily.body, "sans-serif");
  assert.equal(custom.fontSize.micro, "11px");
  assert.equal(custom.fontSize.caption, "12px");
  assert.equal(custom.fontSize.ui, "13px");
  assert.equal(custom.fontSize.nav, "14px");
  assert.equal(custom.fontSize.body, "15px");
  assert.equal(custom.fontSize.badge, "11px");
  assert.equal(custom.fontSize.formLabel, "12px");
  assert.equal(custom.fontSize.formInput, "15px");
  assert.equal(custom.fontSize.actionButton, "13px");
  assert.equal(custom.fontSize.meta, "12px");
});

test("parseFontFamilySettings validates font family values and fallbacks", () => {
  const empty = parseFontFamilySettings();
  assert.ok(empty.display.includes("var(--font-marcellus)"));
  assert.ok(empty.body.includes("var(--font-montserrat)"));
  assert.ok(empty.sanskrit.includes("var(--font-noto-devanagari)"));
  assert.ok(empty.kannada.includes("var(--font-noto-kannada)"));
  assert.ok(empty.mono.includes("ui-monospace"));

  const partial = parseFontFamilySettings({ display: "Georgia, serif" });
  assert.equal(partial.display, "Georgia, serif");
  assert.ok(partial.body.includes("var(--font-montserrat)"));

  for (const invalid of ["", "   ", "var(--broken", "invalid; font: bad", null, 123]) {
    assert.throws(
      () => parseFontFamilySettings({ display: invalid }),
      /must be a valid CSS font-family string/,
    );
  }
});

test("parseFontSizeSettings validates CSS length units and fallbacks", () => {
  const empty = parseFontSizeSettings();
  assert.equal(empty.micro, "12px");
  assert.equal(empty.caption, "13px");
  assert.equal(empty.ui, "14px");
  assert.equal(empty.nav, "15px");
  assert.equal(empty.body, "16px");

  const partial = parseFontSizeSettings({ micro: "0.75rem", nav: "1rem" });
  assert.equal(partial.micro, "0.75rem");
  assert.equal(partial.nav, "1rem");
  assert.equal(partial.caption, "13px");

  for (const invalid of ["12", "large", "", null, 14, "12 pt"]) {
    assert.throws(
      () => parseFontSizeSettings({ micro: invalid }),
      /must be a valid CSS font size/,
    );
  }
});

test("parseCommonSettings rejects invalid values", () => {
  for (const invalid of [null, undefined, 42, "string", []]) {
    assert.throws(() => parseCommonSettings(invalid), /must define a common settings object/);
  }
  for (const bg of ["", "   ", null, undefined, 123]) {
    assert.throws(() => parseCommonSettings({ background: { backgroundImage: bg } }), /background\.backgroundImage must be a non-empty string/);
  }
  for (const opacity of [-0.1, 1.1, NaN, "0.5", null]) {
    assert.throws(() => parseCommonSettings({ background: { backgroundImage: "@chakra", opacity } }), /background\.opacity must be a number between 0 and 1/);
  }
  for (const size of ["", "   ", null, 123]) {
    assert.throws(() => parseCommonSettings({ background: { backgroundImage: "@chakra", size } }), /background\.size must be a non-empty string/);
  }
  for (const repeat of ["", "   ", null, 123]) {
    assert.throws(() => parseCommonSettings({ background: { backgroundImage: "@chakra", repeat } }), /background\.repeat must be a non-empty string/);
  }
  for (const position of ["", "   ", null, 123]) {
    assert.throws(() => parseCommonSettings({ background: { backgroundImage: "@chakra", position } }), /background\.position must be a non-empty string/);
  }
});

test("resolveCommonSettings resolves @chakra, @image.chakra and direct URLs", () => {
  const resolvedAtKey = resolveCommonSettings({
    background: {
      backgroundImage: "@chakra",
      opacity: 0.12,
      size: "cover",
      repeat: "no-repeat",
      position: "center",
    },
  }, "dev");
  assert.match(resolvedAtKey.background.backgroundImage, /^https:\/\/.*\/chakra\.png$/);

  const resolvedAtImageKey = resolveCommonSettings({
    background: {
      backgroundImage: "@image.chakra",
      opacity: 0.12,
      size: "cover",
      repeat: "no-repeat",
      position: "center",
    },
  }, "dev");
  assert.equal(resolvedAtImageKey.background.backgroundImage, resolvedAtKey.background.backgroundImage);

  const directHttps = resolveCommonSettings({
    background: {
      backgroundImage: "https://example.org/bg.jpg",
      opacity: 0.1,
      size: "cover",
      repeat: "no-repeat",
      position: "center",
    },
  }, "dev");
  assert.equal(directHttps.background.backgroundImage, "https://example.org/bg.jpg");

  assert.throws(
    () => resolveCommonSettings({
      background: {
        backgroundImage: "@nonexistentImage",
        opacity: 0.1,
        size: "cover",
        repeat: "no-repeat",
        position: "center",
      },
    }, "dev"),
    /unknown image alias/
  );
});

test("loadCommonSettings loads and resolves settings/common.json", () => {
  const devSettings = loadCommonSettings("dev");
  assert.match(devSettings.background.backgroundImage, /chakra\.png/);
  assert.equal(devSettings.background.size, "cover");
  assert.equal(devSettings.background.repeat, "no-repeat");
  assert.ok(devSettings.fontFamily.display.includes("var(--font-marcellus)"));
  assert.ok(devSettings.fontFamily.body.includes("var(--font-montserrat)"));
  assert.equal(devSettings.fontSize.micro, "12px");
  assert.equal(devSettings.fontSize.caption, "13px");
  assert.equal(devSettings.fontSize.ui, "14px");
  assert.equal(devSettings.fontSize.nav, "15px");
  assert.equal(devSettings.fontSize.body, "16px");
  assert.equal(devSettings.font.micro, "12px");

  const prodSettings = loadCommonSettings("prod");
  assert.match(prodSettings.background.backgroundImage, /chakra\.png/);
  assert.equal(prodSettings.fontSize.micro, "12px");
  assert.equal(prodSettings.font.micro, "12px");
});

test("RootLayout includes the fixed common background image behind main content", async () => {
  const { readFileSync } = await import("node:fs");
  const layout = readFileSync(new URL("../../src/app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /import\s*\{\s*commonSettings\s*\}\s*from\s*"@\/gen\/settings\/common"/);
  assert.match(layout, /<main className="flex-1 relative isolate">/);
  assert.match(layout, /common-background-image/);
  assert.match(layout, /commonSettings\.background/);
  assert.match(layout, /aria-hidden="true"/);
});
