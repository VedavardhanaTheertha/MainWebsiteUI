// ─────────────────────────────────────────────────────────────────────────────
// Post-build verification.
//
// Checks the built site in out/ before it is published:
//
//   1. robots.txt matches the environment's indexing policy
//   2. non-production pages carry a noindex directive
//   3. every page has its route-specific production canonical URL
//   4. placeholder-default HTML and manifests contain no detectable real prose
//   5. placeholder-default output contains none of the configured brand terms
//   6. the web manifest exists and uses environment-correct paths
//
// Switchable builds intentionally include real alternate copy in public assets.
// Prose checks match exact default-language strings of at least 30 characters;
// brand terms are checked at any length. Neither check is a confidentiality gate.
//
// See docs/ARCHITECTURE.md §3 and §6.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "js-yaml";
import { canonicalForRoute, routeForHtml } from "./canonical-utils.mjs";
import { describeContentMode } from "./environment-utils.mjs";
import { loadAuthoredLanguage } from "./authored-content.mjs";
import { discoverParampara } from "./parampara-content.mjs";
import { collectRealProse } from "./content-values.mjs";
import { loadRemedyCarouselCandidates } from "./home-carousels.mjs";
import { validateSitemapLocations } from "./sitemap-utils.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(rootDir, "out");
const envName = process.env.SITE_ENV || "dev";

const config = yaml.load(readFileSync(path.join(rootDir, "config", "site.yml"), "utf8"));
const environment = config.environments?.[envName];

if (!environment) {
  console.error(`[verify] SITE_ENV="${envName}" is not defined in config/site.yml`);
  process.exit(1);
}
const mode = describeContentMode(environment.content_mode, environment.default_variant);

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

// ── Check 1: out/ exists ─────────────────────────────────────────────────────

if (!existsSync(outDir)) {
  console.error("[verify] out/ does not exist — run the build first.");
  process.exit(1);
}

const htmlFiles = collectHtmlFiles(outDir);
const sitemapEligibleHtmlFiles = htmlFiles.filter((file) => {
  const route = routeForHtml(outDir, file);
  return route !== null;
});
if (!htmlFiles.length) {
  problems.push("out/ contains no HTML files — the export produced nothing.");
}
const defaultLanguage = config.site.default_language;
const authoredCopy = loadAuthoredLanguage(rootDir, defaultLanguage, config.content.languages_dir);
const remedyCandidates = loadRemedyCarouselCandidates(rootDir, defaultLanguage, defaultLanguage);
const exportedRoutes = new Set(sitemapEligibleHtmlFiles.map((file) => routeForHtml(outDir, file)));
const homeCards = Object.entries(authoredCopy.home).filter(([key]) => key.endsWith("_carousel")).flatMap(([, cards]) => cards);
for (const url of new Set([...homeCards, ...remedyCandidates].map((card) => card.url))) {
  if (!exportedRoutes.has(url)) problems.push(`homepage carousel destination ${url} has no exported page.`);
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
      (icon) => typeof icon.src !== "string" ||
        (!icon.src.startsWith(`${basePath}/`) && !/^https?:\/\//.test(icon.src))
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
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeEntities(match[1]));
  if (!locations.length) problems.push("sitemap.xml contains no URLs.");
  problems.push(...validateSitemapLocations(locations, exportedRoutes, config.site.production_url));
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

// ── Check 7: copy selector is emitted only for switchable builds ────────────

const localToggleFiles = htmlFiles.filter((file) =>
  readFileSync(file, "utf8").includes("data-local-content-toggle")
);
if (mode.switchable && localToggleFiles.length !== htmlFiles.length) {
  problems.push("the local content selector must appear on every page in a switchable build.");
}
if (!mode.switchable && localToggleFiles.length) {
  problems.push(`the local content selector must not appear in the ${envName} build.`);
}

const generatedContentFile = path.join(rootDir, "src", "gen", "content.ts");
if (mode.switchable && existsSync(generatedContentFile)) {
  const generatedContent = readFileSync(generatedContentFile, "utf8");
  if (!generatedContent.includes("alternateContent") ||
      !generatedContent.includes(`defaultContentMode = "${mode.defaultVariant}"`) ||
      !generatedContent.includes("alternateHomeHero: HomeHeroData | null") ||
      /alternateHomeHero: HomeHeroData \| null = null/.test(generatedContent)) {
    problems.push(`the ${envName} bundle must include its configured copy default and alternate variant.`);
  }
  if (mode.defaultVariant === "real" && !generatedContent.includes("·")) {
    problems.push("a real-default switchable build must contain its placeholder alternate variant.");
  }
  const generatedParamparaFile = path.join(rootDir, "src", "gen", "parampara", "data.ts");
  if (!existsSync(generatedParamparaFile)) {
    problems.push("a switchable build must generate Parampara data.");
  } else {
    const generatedParampara = readFileSync(generatedParamparaFile, "utf8");
    if (!generatedParampara.includes("alternateParamparaByLanguage") ||
        /alternateParamparaByLanguage = null/.test(generatedParampara)) {
      problems.push(`the ${envName} bundle must include alternate Parampara copy.`);
    }
  }
}
if (!mode.switchable && existsSync(generatedContentFile)) {
  const generatedContent = readFileSync(generatedContentFile, "utf8");
  if (!/alternateContent = null/.test(generatedContent)) {
    problems.push(`the ${envName} bundle must not contain switchable alternate content.`);
  }
  if (!/alternateHomeHero: HomeHeroData \| null = null/.test(generatedContent)) {
    problems.push(`the ${envName} bundle must not contain an alternate home hero.`);
  }
  const generatedParamparaFile = path.join(rootDir, "src", "gen", "parampara", "data.ts");
  if (existsSync(generatedParamparaFile) &&
      !/alternateParamparaByLanguage = null/.test(readFileSync(generatedParamparaFile, "utf8"))) {
    problems.push(`the ${envName} bundle must not contain alternate Parampara copy.`);
  }
}

// ── Check 8: placeholder-default HTML contains no real content ────────────────

if (mode.defaultVariant === "placeholder") {
  const defaultLang = config.site.default_language;
  const realProse = [...new Set(collectRealProse({
    copy: authoredCopy,
    parampara: discoverParampara(rootDir, [defaultLang], defaultLang),
    remedies: remedyCandidates,
  }))];

  // Pure-placeholder builds also check generated content; switchable builds
  // intentionally retain real alternate copy in that module.
  const contentFiles = [
    ...htmlFiles,
    ...(existsSync(manifestFile) ? [manifestFile] : []),
    ...(!mode.includesReal && existsSync(generatedContentFile) ? [generatedContentFile] : []),
  ];
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

// ── Check 9: brand terms must not appear in placeholder-default output ────────

if (mode.defaultVariant === "placeholder") {
  const brandTerms = config.build?.brand_terms ?? [];
  const hits = new Map();

  const contentFiles = [
    ...htmlFiles,
    ...(existsSync(manifestFile) ? [manifestFile] : []),
    ...(!mode.includesReal && existsSync(generatedContentFile) ? [generatedContentFile] : []),
  ];
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
