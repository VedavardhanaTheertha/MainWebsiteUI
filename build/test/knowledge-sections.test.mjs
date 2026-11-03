import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { librarySections, parseKnowledgeSections } from "../library-sections.config.mjs";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const defaults = JSON.parse(await readFile(new URL("../../settings/knowledge_sections.json", import.meta.url), "utf8"));

test("knowledge settings preserve default presentation and code-owned routes", () => {
  assert.deepEqual(librarySections.map(({ id }) => id), [
    "mantra", "shastra", "jnana", "dharma", "projects", "stories",
    "articles", "symbolism", "remedies", "science", "pilgrim",
  ]);
  assert.deepEqual(librarySections.map(({ order }) => order), Array.from({ length: 11 }, (_, i) => i + 1));
  assert.equal(librarySections.find(({ id }) => id === "pilgrim").route, "/history/pilgrim-guide");
  assert.equal(librarySections.find(({ id }) => id === "science").image, "https://pub-0b8a6620d6eb460aaa020636cb2c7784.r2.dev/vedic-science-philosophy.avif");
});

test("knowledge settings reject incomplete, unknown, malformed and conflicting configuration", () => {
  for (const value of [null, [], "settings"]) {
    assert.throws(() => parseKnowledgeSections(value), /must define an object keyed by section ID/);
  }
  const missing = structuredClone(defaults);
  delete missing.mantra;
  assert.throws(() => parseKnowledgeSections(missing), /must define an object for section "mantra"/);
  assert.throws(() => parseKnowledgeSections({ ...defaults, unknown: defaults.mantra }), /unknown section "unknown"/);
  for (const value of [null, [], false]) {
    assert.throws(() => parseKnowledgeSections({ ...defaults, mantra: value }), /object for section "mantra"/);
  }
  for (const order of [undefined, 0, -1, 1.5, "1", null, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => parseKnowledgeSections({
      ...defaults, mantra: { ...defaults.mantra, order },
    }), /order must be a positive integer/);
  }
  assert.throws(() => parseKnowledgeSections({
    ...defaults, mantra: { ...defaults.mantra, order: defaults.shastra.order },
  }), /duplicate order/);
  for (const field of ["id", "route", "image", "typo"]) {
    assert.throws(() => parseKnowledgeSections({
      ...defaults, mantra: { ...defaults.mantra, [field]: "override" },
    }), new RegExp(`unknown field "${field}"`));
  }
});

test("isolated library generation honors ordering and markdown section images and rejects invalid files", async (t) => {
  const root = await mkdtemp(path.join(projectRoot, ".knowledge-sections-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  await mkdir(path.join(root, "build"));
  await mkdir(path.join(root, "settings"));
  await mkdir(path.join(root, "content", "languages"), { recursive: true });
  await mkdir(path.join(root, "config"));
  for (const file of ["library-sections.config.mjs", "build-library-sections.mjs", "knowledge-schema.mjs", "content-utils.mjs", "markdown.mjs", "environment-utils.mjs", "editorial-content.mjs", "image-resolution.mjs", "language-content.mjs", "workspace-lock.mjs", "search-config.mjs"]) {
    await copyFile(path.join(projectRoot, "build", file), path.join(root, "build", file));
  }
  await cp(path.join(projectRoot, "library"), path.join(root, "library"), { recursive: true });
  await copyFile(path.join(projectRoot, "content", "languages", "en.json"), path.join(root, "content", "languages", "en.json"));
  await copyFile(path.join(projectRoot, "config", "site.yml"), path.join(root, "config", "site.yml"));
  await copyFile(path.join(projectRoot, "settings", "search.json"), path.join(root, "settings", "search.json"));
  await copyFile(path.join(projectRoot, "settings", "toplibrary.json"), path.join(root, "settings", "toplibrary.json"));
  for (const environment of ["dev", "prod"]) {
    await cp(path.join(projectRoot, "settings", environment), path.join(root, "settings", environment), { recursive: true });
  }

  const source = path.join(root, "settings", "knowledge_sections.json");
  const run = async (environment = "dev") => {
    await rm(path.join(root, "src", "gen"), { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    return spawnSync(
      process.execPath, [path.join(root, "build", "build-library-sections.mjs")],
      { encoding: "utf8", env: { ...process.env, SITE_ENV: environment } },
    );
  };
  const custom = structuredClone(defaults);
  custom.mantra.order = 11;
  custom.pilgrim.order = 1;
  await writeFile(source, JSON.stringify(custom));
  const mantraPagePath = path.join(root, "library", "pages", "library--mantra.md");
  const mantraPageContent = await readFile(mantraPagePath, "utf8");
  await writeFile(mantraPagePath, mantraPageContent.replace(/image: "[^"]*"/, 'image: "https://example.test/custom-mantra.jpg"'));
  const { librarySections: configured } = await import(pathToFileURL(path.join(root, "build", "library-sections.config.mjs")).href);
  assert.equal(configured[0].id, "pilgrim");
  assert.equal(configured.at(-1).image, "https://example.test/custom-mantra.jpg");
  for (const environment of ["dev", "local", "prod"]) {
    const result = await run(environment);
    assert.equal(result.status, 0, result.stderr);
    const generated = await readFile(path.join(root, "src", "gen", "library", "data.ts"), "utf8");
    const sections = JSON.parse(generated.match(/export const realLibrarySections: LibrarySection\[\] = (.*);/u)[1]);
    assert.equal(sections[0].id, "pilgrim");
    assert.equal(sections.at(-1).id, "mantra");
    assert.equal(sections.at(-1).image, "https://example.test/custom-mantra.jpg");
  }
  await writeFile(mantraPagePath, mantraPageContent.replace(/image: "[^"]*"/, 'image: "@image.unknownAlias"'));
  for (const environment of ["dev", "local", "prod"]) {
    const result = await run(environment);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unknown image alias "@image.unknownAlias"/);
  }
  await writeFile(source, "{");
  assert.notEqual((await run()).status, 0);
  await rm(source);
  const missing = await run();
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /knowledge_sections\.json/);
});
