import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { loadAuthoredLanguage } from "../authored-content.mjs";
import { resolveImageUrl } from "../image-resolution.mjs";

const source = (file) => readFile(new URL(`../../${file}`, import.meta.url), "utf8");
const retired = new Set(["/contact", "/v2", "/about", "/blog"]);

test("retired pages no longer have page entry points", async () => {
  for (const route of retired) {
    await assert.rejects(source(`src/app${route}/page.tsx`), { code: "ENOENT" });
  }
  await assert.rejects(source("src/app/blog/[slug]/page.tsx"), { code: "ENOENT" });
  assert.match(await source("src/app/connect/page.tsx"), /export default function/);
});

test("retired blog records cannot create public routes or sitemap entries", async () => {
  const script = await source("scripts/generate-content.mjs");
  const start = script.indexOf("\nconst routes = [");
  const end = script.indexOf("\nconst langUnion", start);
  assert.ok(start >= 0 && end > start);
  const routes = vm.runInNewContext(`${script.slice(start, end)}\nroutes;`, {
    rootDir: ".",
    path,
    discoverStaticRoutes: () => ["/", "/story", "/connect"],
    content: { fixture: { learn: [] } },
    defaultLang: "fixture",
    discoveredParampara: { fixture: [] },
  });
  assert.deepEqual(Array.from(routes), ["/", "/connect", "/story"]);
});

test("retired content and exclusive components stay removed without removing shared readers", async () => {
    for (const component of [
      "ContactRows", "StoryPage", "library/LibraryCategoryPage", "EventsBrowser", "LocalizedImage", "media/MediaGrid",
      ...["CardGrid", "HeroSection", "HeroV2", "LegacySection", "LiveStats", "MilestonesEvents",
        "QuickActionBars", "SevaPreview", "SignificanceSection", "SocialPresence", "SwamijiSection",
        "TimingsStrip", "VolunteerCallout"].map((name) => `home/${name}`),
    ]) {
      await assert.rejects(source(`src/components/${component}.tsx`), { code: "ENOENT" });
    }
    for (const file of [
      "src/lib/scheduler.ts", "library/general/about.md", "library/blog/solar-power-installed.md",
      "library/connect/pages/legacy.md", "library/events/pages/legacy.md", "library/sections/legacy-stories.md",
      "build/blog-content.mjs", "build/blog-source.mjs",
    ]) await assert.rejects(source(file), { code: "ENOENT" });
    const root = fileURLToPath(new URL("../../", import.meta.url));
    const content = loadAuthoredLanguage(root, "en");
    for (const key of ["stories", "connect2", "legacy_home", "blog_controls", "blog_title"]) assert.equal(content[key], undefined);
    assert.equal(content.pages.about, undefined);
    assert.equal(content.pages.events, undefined);
    assert.deepEqual(Object.keys(content.library), ["bhakti"]);
    assert.deepEqual(Object.keys(content.library.bhakti), ["page"]);
    assert.ok(content.library.bhakti.page.title);
    assert.ok(content.pages.parampara.title);
    for (const key of ["photos", "videos", "gallery", "photo_search", "video_search"]) {
      assert.equal(content.media[key], undefined);
    }
    assert.ok(content.media.albums.length);
    assert.ok(content.media.no_media_results, "active album detail empty-state copy remains available");
    assert.match(await source("src/lib/reader-utils.ts"), /export function formatArticleDate/);
    assert.match(await source("src/lib/reader-utils.ts"), /export async function copyReaderLink/);
    const parampara = await source("src/app/history/parampara/page.tsx");
    assert.match(parampara, /\.pages\.parampara\.title/);
    assert.match(parampara, /\.pages\.parampara\.intro/);
  });

  test("routine Bhakti generation deletes only its current owned collection output", async () => {
    const script = await source("build/build-bhakti-content.mjs");
    assert.match(script, /await rm\(path\.join\(dataRoot, collection\.id\)/);
    assert.doesNotMatch(script, /previousCollectionRoot|previousGeneratedRoot|legacyGeneratedRoot|legacyDataRoot|website-data|generated-content/);
  });

  test("main content image lookup preserves exact configured absolute and relative targets in both environments", async () => {
    const script = await source("scripts/generate-content.mjs");
    const start = script.indexOf("function loadImageConfig(");
    const end = script.indexOf("\n/**", start);
    const rootDir = fileURLToPath(new URL("../../", import.meta.url));
    const load = vm.runInNewContext(`${script.slice(start, end)}\nloadImageConfig`, {
      rootDir, path, readFileSync, existsSync, resolveImageUrl,
    });
    for (const environment of ["dev", "prod"]) {
      const config = JSON.parse(await source(`settings/${environment}/images.json`));
      const lookup = load(environment);
      for (const [key, target] of Object.entries(config.paths)) {
        assert.equal(lookup.get(`@image.${key}`), resolveImageUrl(target, config.baseUrl));
        if (target.startsWith("https://")) assert.equal(lookup.get(`@image.${key}`), target);
      }
      for (const [alias, key] of Object.entries(config.aliases ?? {})) {
        assert.equal(lookup.get(alias), resolveImageUrl(config.paths[key], config.baseUrl));
      }
    }
  });
test("configured navigation targets Connect and has no retired page destinations", async () => {
  function check(value) {
    if (typeof value === "string" && value.startsWith("/")) {
      const route = value.split(/[?#]/)[0];
      assert.equal(retired.has(route) || route.startsWith("/blog/"), false, `Retired destination: ${value}`);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(check);
    }
  }
  for (const file of ["settings/home.json", "settings/navigation.json"]) check(JSON.parse(await source(file)));
  const navigation = JSON.parse(await source("settings/navigation.json"));
  assert.equal(navigation.menu.find(({ key }) => key === "connect").href, "/connect");
});
