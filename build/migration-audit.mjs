import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import ts from "typescript";
import yaml from "js-yaml";
import { loadAuthoredLanguage } from "./authored-content.mjs";
import { applyNavigation, loadNavigation } from "./navigation-content.mjs";

function* files(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "gen") continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* files(file);
    else if (entry.isFile()) yield file;
  }
}

export function findDisplayLiterals(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings = [];
  const record = (node, value) => findings.push({
    line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
    text: value.trim(),
  });
  function visit(node) {
    if (ts.isJsxText(node) && /\p{L}/u.test(node.text.trim())) record(node, node.text);
    if (ts.isJsxAttribute(node) && /^(alt|title|placeholder|aria-label)$/.test(node.name.text) &&
        node.initializer && ts.isStringLiteral(node.initializer) && /\p{L}/u.test(node.initializer.text)) {
      record(node, node.initializer.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return findings;
}

export function auditMigrations(rootDir, { checkTracked = false } = {}) {
  const errors = [];
  const candidates = [];
  const config = yaml.load(readFileSync(path.join(rootDir, "config", "site.yml"), "utf8"));
  if (Object.hasOwn(config.content, "blog_dir")) errors.push("config/site.yml must not configure the retired Blog content pipeline.");
  const obsolete = [
    ...files(path.join(rootDir, "content", "blog")),
    ...files(path.join(rootDir, "library", "projects", "pages")),
    ...files(path.join(rootDir, "library", "yajna")),
  ];
  for (const environment of ["dev", "prod"]) {
    obsolete.push(...[...files(path.join(rootDir, "settings", environment))].filter((file) => file.endsWith(".hero.json")));
  }
  for (const relative of [
    "settings/parampara.json", "library/blog/page.md", "library/sevas/pages/introduction.md",
    "library/general/about-metadata.md", "library/general/privacy-metadata.md",
    "library/general/terms-metadata.md", "library/general/refund-metadata.md", "library/general/site-chrome.md",
  ]) {
    if (existsSync(path.join(rootDir, relative))) obsolete.push(path.join(rootDir, relative));
  }
  obsolete.push(...[...files(path.join(rootDir, "library", "parampara"))]
    .filter((file) => /^index(?:\.[A-Za-z0-9-]+)?\.json$/.test(path.basename(file))));
  for (const file of obsolete) errors.push(`Obsolete canonical source: ${path.relative(rootDir, file)}`);
  if (existsSync(path.join(rootDir, "settings", "learn.json"))) errors.push("Learn configuration belongs in library/learn Markdown, not settings/learn.json.");
  const languages = readdirSync(path.join(rootDir, config.content.languages_dir)).filter((name) => name.endsWith(".json"));
  for (const file of languages) {
    const code = path.basename(file, ".json");
    try {
      const labels = JSON.parse(readFileSync(path.join(rootDir, config.content.languages_dir, file), "utf8"));
      for (const key of Object.keys(labels)) {
        if (key === "home" || /^(hero|qa|swamiji|timings|seva|volunteer|sig|mile)_/.test(key)) {
          errors.push(`${file}: homepage authority "${key}" belongs in settings/home.json.`);
        }
      }
      if (labels.pages?.v2 !== undefined) errors.push(`${file}: remove copy for the retired v2 page.`);
      const authored = loadAuthoredLanguage(rootDir, code, config.content.languages_dir, { navigation: false });
      if (code === config.site.default_language) applyNavigation(authored, loadNavigation(rootDir));
      if (code === config.site.default_language && authored.donation) {
        candidates.push("Donation amount presets, public UPI details and material catalogs still live in language JSON; their broader migration was not selected.");
      }
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
    }
  }
  const sources = [...files(path.join(rootDir, "src"))].filter((file) => file.endsWith(".tsx"));
  for (const file of sources) {
    for (const finding of findDisplayLiterals(file, readFileSync(file, "utf8"))) {
      errors.push(`${path.relative(rootDir, file)}:${finding.line}: display literal "${finding.text.slice(0, 100)}"`);
    }
  }
  if (checkTracked) {
    const trackedByRepository = new Map();
    for (const directory of ["build", "scripts", "content", "config", "library", "settings"]) {
      const repository = ["library", "settings"].includes(directory) ? path.join(rootDir, directory) : rootDir;
      if (!trackedByRepository.has(repository)) {
        const result = spawnSync("git", ["ls-files", "-z"], { cwd: repository, encoding: "utf8" });
        if (result.status !== 0) {
          errors.push(`Cannot inspect tracked inputs in ${repository}: ${result.stderr || result.error?.message}`);
          continue;
        }
        trackedByRepository.set(repository, new Set(result.stdout.split("\0")));
      }
      const tracked = trackedByRepository.get(repository);
      for (const file of files(path.join(rootDir, directory))) {
        const relative = path.relative(repository, file).split(path.sep).join("/");
        if (!tracked.has(relative)) errors.push(`Required authored/build input is not tracked: ${path.relative(rootDir, file)}`);
      }
    }
  }
  return { errors, candidates, languages: languages.length, sources: sources.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rootDir = path.resolve(import.meta.dirname, "..");
  const result = auditMigrations(rootDir, { checkTracked: process.argv.includes("--tracked") });
  for (const error of result.errors) console.error(`[migration] ${error}`);
  if (result.errors.length) process.exitCode = 1;
  else console.log(`[migration] PASS: ${result.languages} languages, ${result.sources} source components; no obsolete sources, duplicate authorities, or direct JSX display literals.`);
  for (const candidate of result.candidates) console.log(`[migration] Remaining candidate: ${candidate}`);
  console.log("[migration] Retained intentionally: UI strings and media catalogs in language JSON; config/site.yml; original library/hero environment groups; document-specific Markdown metadata; homepage/settings JSON.");
}
