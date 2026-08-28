// ─────────────────────────────────────────────────────────────────────────────
// Post-build verification.
//
// Checks the built site in out/ before it is published:
//
//   1. robots.txt matches the environment's indexing policy
//   2. non-production pages carry a noindex directive
//   3. every page has its route-specific production canonical URL
//   4. non-production pages contain no real content
//   5. non-production pages contain none of the institution's brand terms
//   6. the web manifest exists and uses environment-correct paths
//
// The content checks make the architecture partly self-policing. In a placeholder
// build the generated content module contains no real text at all, so any real
// sentence appearing in the output can only have come from a string hardcoded in
// a component — exactly the mistake the content system exists to prevent.
//
// Check 4 exists because check 3 only matches prose above a length threshold, to
// avoid false positives on ordinary words. A brand name is short but is exactly
// what someone would search for, so it is matched at any length.
//
// See docs/ARCHITECTURE.md §3 and §6.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "js-yaml";
import { canonicalForRoute, routeForHtml } from "./canonical-utils.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(rootDir, "out");
const envName = process.env.SITE_ENV || "dev";

// Strings shorter than this are too common to attribute to a content leak
// ("Donate", "Home"), and would produce noise rather than findings.
const MIN_LEAK_LENGTH = 30;

const config = yaml.load(readFileSync(path.join(rootDir, "config", "site.yml"), "utf8"));
const environment = config.environments?.[envName];

if (!environment) {
  console.error(`[verify] SITE_ENV="${envName}" is not defined in config/site.yml`);
  process.exit(1);
}

const problems = [];
const warnings = [];

/** Collects every .html file produced by the static export. */
function collectHtmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...collectHtmlFiles(full));
    else if (entry.endsWith(".html")) found.push(full);
  }
  return found;
}

/** Decodes the HTML entities the renderer emits, so text can be matched literally. */
function decodeEntities(html) {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Gathers the real prose from the default language file — the text that must NOT
 * appear in a placeholder build. Machine values (paths, dates, ids) are excluded
 * because they are deliberately preserved in every environment.
 */
function collectRealProse(node, out = []) {
  if (typeof node === "string") {
    const value = node.trim();
    const isMachineValue =
      value.startsWith("/") ||
      value.startsWith("#") ||
      value.startsWith("http") ||
      /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (value.length >= MIN_LEAK_LENGTH && !isMachineValue) out.push(value);
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectRealProse(item, out);
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith("_")) collectRealProse(value, out);
    }
  }
  return out;
}

// ── Check 1: out/ exists ─────────────────────────────────────────────────────

if (!existsSync(outDir)) {
  console.error("[verify] out/ does not exist — run the build first.");
  process.exit(1);
}

const htmlFiles = collectHtmlFiles(outDir);
const sitemapEligibleHtmlFiles = htmlFiles.filter((file) => routeForHtml(outDir, file) !== null);
if (!htmlFiles.length) {
  problems.push("out/ contains no HTML files — the export produced nothing.");
}

// ── Check 2: web manifest is generated for the selected environment ─────────

const manifestFile = path.join(outDir, "manifest.webmanifest");
if (!existsSync(manifestFile)) {
  problems.push("out/manifest.webmanifest is missing.");
} else {
  try {
    const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
    const basePath = environment.base_path ?? "";
    const expectedRoot = basePath ? `${basePath}/` : "/";
    if (manifest.start_url !== expectedRoot) {
      problems.push(
        `manifest start_url must be "${expectedRoot}" in the ${envName} environment.`
      );
    }
    if (manifest.scope !== expectedRoot) {
      problems.push(`manifest scope must be "${expectedRoot}" in the ${envName} environment.`);
    }
    const invalidIcon = (manifest.icons ?? []).find(
      (icon) => typeof icon.src !== "string" || !icon.src.startsWith(`${basePath}/`)
    );
    if (!manifest.icons?.length || invalidIcon) {
      problems.push(`manifest icons must use the ${envName} environment base path.`);
    }
  } catch (error) {
    problems.push(`manifest.webmanifest is invalid JSON: ${error.message}`);
  }
}

// ── Check 3: sitemap uses the canonical production origin ───────────────────

const sitemapFile = path.join(outDir, "sitemap.xml");
if (!existsSync(sitemapFile)) {
  problems.push("out/sitemap.xml is missing.");
} else {
  const sitemap = readFileSync(sitemapFile, "utf8");
  const productionOrigin = new URL(config.site.production_url).origin;
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!locations.length) problems.push("sitemap.xml contains no URLs.");
  const wrongOrigin = locations.find((location) => {
    try {
      return new URL(location).origin !== productionOrigin;
    } catch {
      return true;
    }
  });
  if (wrongOrigin) problems.push(`sitemap.xml contains a non-canonical URL: ${wrongOrigin}`);
  if (locations.length !== sitemapEligibleHtmlFiles.length) {
    problems.push(
      `sitemap.xml lists ${locations.length} URL(s), but the export contains ` +
        `${sitemapEligibleHtmlFiles.length} indexable page(s).`
    );
  }
}

// ── Check 4: each HTML file has the route-specific production canonical ──────

for (const file of htmlFiles) {
  const relative = path.relative(outDir, file);
  const route = routeForHtml(outDir, file);
  const html = readFileSync(file, "utf8");
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"\s*\/?\s*>/gi)]
    .map((match) => match[1]);

  if (route === null) {
    if (canonicals.length) problems.push(`${relative} is an error document and must not declare a canonical URL.`);
    continue;
  }

  const expected = canonicalForRoute(config.site.production_url, route);
  if (canonicals.length !== 1 || canonicals[0] !== expected) {
    problems.push(
      `${relative} must contain exactly one canonical URL, "${expected}"` +
        (canonicals.length ? ` (found: ${canonicals.join(", ")}).` : " (found none).")
    );
  }
}

// ── Check 5: robots.txt matches the environment ──────────────────────────────

const robotsFile = path.join(outDir, "robots.txt");
if (!existsSync(robotsFile)) {
  problems.push("out/robots.txt is missing.");
} else {
  const robots = readFileSync(robotsFile, "utf8");
  const disallowsAll = /^\s*Disallow:\s*\/\s*$/m.test(robots);
  if (!environment.indexable && !disallowsAll) {
    problems.push(`robots.txt must contain "Disallow: /" in the ${envName} environment.`);
  }
  if (environment.indexable && disallowsAll) {
    problems.push(`robots.txt disallows all crawling, but ${envName} is meant to be indexable.`);
  }
}

// ── Check 6: noindex on non-production pages ─────────────────────────────────

if (!environment.indexable) {
  const missing = htmlFiles.filter((file) => !/noindex/i.test(readFileSync(file, "utf8")));
  if (missing.length) {
    problems.push(
      `${missing.length} page(s) are missing a noindex directive, e.g. ` +
        path.relative(outDir, missing[0])
    );
  }
}

// ── Check 7: no real content in a placeholder build ──────────────────────────

if (environment.content_mode !== "real") {
  const defaultLangFile = path.join(
    rootDir,
    config.content.languages_dir,
    `${config.site.default_language}.json`
  );
  const realProse = collectRealProse(JSON.parse(readFileSync(defaultLangFile, "utf8")));

  const contentFiles = existsSync(manifestFile) ? [...htmlFiles, manifestFile] : htmlFiles;
  const leaks = [];
  for (const file of contentFiles) {
    const text = decodeEntities(readFileSync(file, "utf8"));
    for (const phrase of realProse) {
      if (text.includes(phrase)) {
        leaks.push({ file: path.relative(outDir, file), phrase });
      }
    }
  }

  if (leaks.length) {
    // Group by phrase — one hardcoded string usually appears on many pages.
    const byPhrase = new Map();
    for (const leak of leaks) {
      if (!byPhrase.has(leak.phrase)) byPhrase.set(leak.phrase, []);
      byPhrase.get(leak.phrase).push(leak.file);
    }

    const lines = [...byPhrase.entries()]
      .slice(0, 10)
      .map(([phrase, files]) => {
        const preview = phrase.length > 70 ? `${phrase.slice(0, 70)}…` : phrase;
        return `    "${preview}"\n      in ${files.length} output file(s), e.g. ${files[0]}`;
      });

    const summary =
      `real content found in a ${envName} build — ${byPhrase.size} distinct string(s).\n` +
      `  This text is hardcoded in a component instead of coming from content/.\n` +
      lines.join("\n") +
      (byPhrase.size > 10 ? `\n    …and ${byPhrase.size - 10} more` : "");

    if (config.build?.fail_on_hardcoded_content) problems.push(summary);
    else warnings.push(summary);
  }
}

// ── Check 8: brand terms must not appear outside production ──────────────────

if (environment.content_mode !== "real") {
  const brandTerms = config.build?.brand_terms ?? [];
  const hits = new Map();

  const contentFiles = existsSync(manifestFile) ? [...htmlFiles, manifestFile] : htmlFiles;
  for (const file of contentFiles) {
    const text = decodeEntities(readFileSync(file, "utf8"));
    for (const term of brandTerms) {
      if (text.includes(term)) {
        if (!hits.has(term)) hits.set(term, []);
        hits.get(term).push(path.relative(outDir, file));
      }
    }
  }

  if (hits.size) {
    const lines = [...hits.entries()].map(
      ([term, files]) => `    "${term}" — ${files.length} output file(s), e.g. ${files[0]}`
    );
    const summary =
      `brand terms found in a ${envName} build — these identify the institution and\n` +
      `  are exactly what a search engine would index. Move them into content/.\n` +
      lines.join("\n");

    if (config.build?.fail_on_hardcoded_content) problems.push(summary);
    else warnings.push(summary);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

for (const warning of warnings) {
  console.warn(`\n[verify] WARNING: ${warning}`);
}

if (problems.length) {
  console.error(`\n[verify] FAILED — ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  • ${problem}`);
  process.exit(1);
}

console.log(
  `[verify] passed — ${htmlFiles.length} page(s) checked for env "${envName}"` +
    (warnings.length ? ` (${warnings.length} warning(s))` : "")
);
