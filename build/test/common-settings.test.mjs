import assert from "node:assert/strict";
import test from "node:test";
import { parseCommonSettings, resolveCommonSettings, loadCommonSettings } from "../common-settings.mjs";

test("parseCommonSettings accepts valid configuration and assigns defaults", () => {
  const minimal = parseCommonSettings({
    background: { backgroundImage: "@chakra" },
  });
  assert.equal(minimal.background.backgroundImage, "@chakra");
  assert.equal(minimal.background.opacity, 0.12);
  assert.equal(minimal.background.size, "cover");
  assert.equal(minimal.background.repeat, "no-repeat");
  assert.equal(minimal.background.position, "center");

  const custom = parseCommonSettings({
    background: {
      backgroundImage: "@image.chakra",
      opacity: 0.25,
      size: "contain",
      repeat: "repeat",
      position: "top left",
    },
  });
  assert.equal(custom.background.backgroundImage, "@image.chakra");
  assert.equal(custom.background.opacity, 0.25);
  assert.equal(custom.background.size, "contain");
  assert.equal(custom.background.repeat, "repeat");
  assert.equal(custom.background.position, "top left");
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

  const prodSettings = loadCommonSettings("prod");
  assert.match(prodSettings.background.backgroundImage, /chakra\.png/);
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
