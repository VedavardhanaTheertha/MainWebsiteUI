import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { parseMarkdownFrontmatter } from "../content-utils.mjs";
import { discoverParampara } from "../parampara-content.mjs";

const project = path.resolve(import.meta.dirname, "../..");
let fixtureNumber = 0;
const founder = { id: "founder", name: "Source founder", summary: "Source summary." };
const teacher = { id: "teacher", name: "Source teacher", summary: "Second source summary." };

function markdown(metadata, details = "Details **from source**.") {
  const frontmatter = Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n");
  return `---\n${frontmatter}\n---\n\n# ${metadata.name}\n\n${metadata.summary}\n\n## Details\n\n${details}\n`;
}

function fixture(t) {
  const root = path.join(project, "build", `.parampara-fixture-${process.pid}-${fixtureNumber++}`);
  const directory = path.join(root, "library", "parampara");
  mkdirSync(directory, { recursive: true });
  t.after(() => rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  const write = (filename, metadata, details) => writeFileSync(path.join(directory, filename), markdown(metadata, details));
  write("00-founder.md", founder);
  write("01-teacher.md", teacher);
  return { root, directory, write, discover: (codes = ["en", "kn"]) => discoverParampara(root, codes, "en") };
}

test("all 31 canonical gurus retain facts and support localized presentation without a collection JSON", () => {
  assert.equal(existsSync(path.join(project, "settings", "parampara.json")), false);
  assert.equal(existsSync(path.join(project, "library", "parampara", "index.json")), false);
  const filenames = readdirSync(path.join(project, "library", "parampara")).filter((name) => /^\d+-[^.]+\.md$/.test(name)).sort();
  const result = discoverParampara(project, ["en", "kn"], "en");
  assert.equal(result.en.length, 31);
  assert.equal(result.kn.length, 31);
  assert.equal(result.en[0].name, "Sri Madhwacharyaru");
  assert.equal(result.kn[0].name, "ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯರು");
  assert.equal(result.en[1].name, "Sri Vamana Teertharu");
  assert.equal(result.kn[1].name, "ಶ್ರೀ ವಾಮನ ತೀರ್ಥರು");
  filenames.forEach((filename, index) => {
    const { metadata, body } = parseMarkdownFrontmatter(readFileSync(path.join(project, "library", "parampara", filename), "utf8"), filename);
    const guruEn = result.en[index];
    const guruKn = result.kn[index];
    assert.equal(metadata.position, index);
    assert.equal(guruEn.position, index);
    assert.equal(guruKn.position, index);
    assert.equal(guruEn.officialPosition, index === 0 ? null : index);
    assert.equal(guruKn.officialPosition, index === 0 ? null : index);
    assert.equal(guruEn.id, metadata.id);
    assert.equal(guruKn.id, metadata.id);
    assert.equal(guruEn.name, metadata["name-en"]);
    assert.equal(guruKn.name, metadata["name-kn"]);
    assert.equal(guruEn.summary, metadata["summary-en"]);
    assert.equal(guruKn.summary, metadata["summary-kn"]);
    assert.equal(guruEn.timePeriod, metadata["timePeriod-en"]);
    assert.equal(guruKn.timePeriod, metadata["timePeriod-kn"]);
    assert.equal(guruEn.thumbnailImage, metadata.thumbnailImage);
    assert.equal(guruEn.fullImage, metadata.fullImage);
  });
  assert.equal(result.en[0].thumbnailImage, "https://pub-0b8a6620d6eb460aaa020636cb2c7784.r2.dev/m.avif");
  assert.equal(result.en[30].fullImage, "https://pub-0b8a6620d6eb460aaa020636cb2c7784.r2.dev/swamiji.avif");
});

test("numeric filename prefixes alone control ordering, including gaps and three digits", (t) => {
  const f = fixture(t);
  renameSync(path.join(f.directory, "00-founder.md"), path.join(f.directory, "100-founder.md"));
  renameSync(path.join(f.directory, "01-teacher.md"), path.join(f.directory, "09-teacher.md"));
  const result = f.discover().en;
  assert.deepEqual(result.map(({ id }) => id), ["teacher", "founder"]);
  assert.deepEqual(result.map(({ position }) => position), [0, 1]);
  assert.deepEqual(result.map(({ officialPosition }) => officialPosition), [null, 1]);
});

test("sibling translations inherit optional facts without another index", (t) => {
  const f = fixture(t);
  f.write("00-founder.md", {
    ...founder, timePeriod: "Source period", thumbnailImage: "/portrait.jpg",
    references: [{ label: "Source citation", href: "/reference" }],
  });
  f.write("00-founder.kn.md", { ...founder, name: "Translated title", summary: "Translated summary." }, "Translated details.");
  const result = f.discover();
  assert.equal(result.kn[0].name, "Translated title");
  assert.equal(result.kn[0].detailsMarkdown, "Translated details.");
  for (const field of ["timePeriod", "thumbnailImage", "fullImage", "references"]) assert.deepEqual(result.kn[0][field], result.en[0][field]);
  assert.deepEqual(result.kn[1], result.en[1]);
  f.write("00-founder.kn.md", { ...founder, id: "different" });
  assert.throws(() => f.discover(), /stable id matching/);
});

test("duplicate prefixes, duplicate IDs, orphan translations and unnumbered sources fail clearly", (t) => {
  const f = fixture(t);
  f.write("00-duplicate.md", teacher);
  assert.throws(() => f.discover(), /duplicate or invalid numeric prefix/);
  rmSync(path.join(f.directory, "00-duplicate.md"));
  f.write("01-teacher.md", { ...teacher, id: founder.id });
  assert.throws(() => f.discover(), /duplicate guru id/);
  f.write("01-teacher.md", teacher);
  f.write("02-orphan.kn.md", teacher);
  assert.throws(() => f.discover(), /no canonical guru/);
  rmSync(path.join(f.directory, "02-orphan.kn.md"));
  f.write("unnumbered.md", teacher);
  assert.throws(() => f.discover(), /numeric prefix/);
});

test("malformed frontmatter, duplicated order metadata and body drift are rejected", (t) => {
  const f = fixture(t);
  const file = path.join(f.directory, "00-founder.md");
  for (const source of [
    "# No frontmatter", "---\nname: [\n---\nBody", "---\n- item\n---\nBody",
    markdown(founder).replace('id: "founder"', 'id: "founder"\nid: "duplicate"'),
    markdown(founder).replace("# Source founder", "# Different title"),
    markdown(founder).replace("\nSource summary.\n", "\nDifferent summary.\n"),
    markdown(founder).replace("## Details", "## Other"),
    markdown({ ...founder, unknownField: 0 }),
  ]) {
    writeFileSync(file, source);
    assert.throws(() => f.discover(), /front matter|YAML|title|summary|Details|unknown field/);
  }
  writeFileSync(file, markdown(founder).replaceAll("\n", "\r\n"));
  assert.equal(f.discover().en[0].detailsMarkdown, "Details **from source**.");
});

test("optional references and portraits reject unsafe URLs without silently dropping values", (t) => {
  const f = fixture(t);
  const unsafe = [
    "javascript:alert(1)", "data:text/plain,unsafe", "http://example.org", "//example.org",
    "/\\example.org", "******example.org", " https://example.org", "https://example.org/with space",
    "https://example.org/\npath", "https://example.org/\u0000", "/%2fexample.org",
    "/%5cexample.org", "/%252fexample.org", "https://example.org/%0a", "/bad%escape", "https:example.org", "/%00",
  ];
  for (const field of ["references", "relatedPlaces", "relatedWorks"]) {
    for (const value of [null, "invalid", {}, [null], [{ label: "", href: "/safe" }]]) {
      f.write("00-founder.md", { ...founder, [field]: value });
      assert.throws(() => f.discover(), /must be an array|must be an object|needs a label/);
    }
    for (const href of unsafe) {
      f.write("00-founder.md", { ...founder, [field]: [{ label: "Unsafe fixture", href }] });
      assert.throws(() => f.discover(), /safe root-relative or HTTPS/);
    }
  }
  for (const field of ["thumbnailImage", "fullImage"]) {
    for (const href of unsafe) {
      f.write("00-founder.md", { ...founder, [field]: href });
      assert.throws(() => f.discover(), /portraits need a safe/);
    }
  }
  f.write("00-founder.md", { ...founder, references: [{ label: "Valid citation", href: "https://example.org/source" }] });
  assert.equal(f.discover().en[0].references.length, 1);
});

test("invalid language arguments cannot alter source lookup", (t) => {
  const f = fixture(t);
  for (const codes of [null, ["en", "en"], ["../outside"], ["en", "__proto__"]]) {
    assert.throws(() => f.discover(codes), /unique language codes/);
  }
  assert.throws(() => discoverParampara(f.root, ["en"], "../outside"), /valid defaultLang/);
});
