// ─────────────────────────────────────────────────────────────────────────────
// Content build step.
//
// Scans content/languages/ and content/blog/, merges every language over the
// default language, optionally replaces all real text with placeholders, and
// emits src/gen/content.ts for the app to import.
//
// Nothing in src/ lists languages or blog posts by name — this script discovers
// them from the filesystem, which is what lets a contributor add a language or
// an article by adding a single file.
//
// Runs automatically via the "predev"/"prebuild" npm scripts.
// Never edit src/gen/content.ts directly — edit content/ instead.
//
// See docs/ARCHITECTURE.md §5 (content system) and §6 (environments).
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "js-yaml";
import { renderMarkdown } from "../build/markdown.mjs";
import { describeContentMode } from "../build/environment-utils.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Keys whose values are machine-readable (paths, ids, dates, style tokens) and
// must survive the placeholder transform untouched. Replacing an `href` would
// break navigation; replacing an `id` would break item matching.
const PRESERVED_KEYS = new Set([
  "id", "key", "code", "kind", "tone", "cat", "slug",
  "href", "img", "bg", "icon", "symbol", "upi", "images", "gallery",
  "launch_date", "end_date", "pinned_date", "date",
  "img_position",
  // This local-only control must remain understandable while it selects which
  // transform to preview. Its translated labels still come from content files.
  "local_preview",
]);

// Words appended to a placeholder so it roughly matches the length of the real
// text it stands in for — short placeholders would hide genuine layout bugs.
const FILLER = ["sample", "placeholder", "copy", "for", "layout", "preview", "only", "text"];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Reads and parses config/site.yml, the single source of environment settings. */
function loadConfig() {
  const file = path.join(rootDir, "config", "site.yml");
  if (!existsSync(file)) {
    throw new Error("config/site.yml is missing — it defines the environments this build needs.");
  }
  return yaml.load(readFileSync(file, "utf8"));
}

/**
 * Resolves the active environment from SITE_ENV, defaulting to "dev".
 * Defaulting to dev is deliberate: showing real content must be an explicit
 * opt-in, so a misconfigured build can never leak production content.
 */
function resolveEnvironment(config) {
  const name = process.env.SITE_ENV || "dev";
  const env = config.environments?.[name];
  if (!env) {
    const known = Object.keys(config.environments ?? {}).join(", ");
    throw new Error(`SITE_ENV="${name}" is not defined in config/site.yml (known: ${known})`);
  }
  return { name, ...env };
}

/**
 * Discovers available languages by scanning the languages directory.
 * The returned codes drive both the generated content map and the language
 * switcher, so adding a file here is all that is needed to add a language.
 */
function discoverLanguages(config) {
  const dir = path.join(rootDir, config.content.languages_dir);
  if (!existsSync(dir)) {
    throw new Error(`${config.content.languages_dir} does not exist — no language files to build.`);
  }
  const codes = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.basename(f, ".json"))
    .sort();

  if (!codes.length) {
    throw new Error(`No .json language files found in ${config.content.languages_dir}`);
  }
  const fallback = config.site.default_language;
  if (!codes.includes(fallback)) {
    throw new Error(
      `Default language "${fallback}" has no file. Expected ${config.content.languages_dir}/${fallback}.json`
    );
  }
  // Default language first — it is the base every other language merges over.
  return [fallback, ...codes.filter((c) => c !== fallback)];
}

/** Loads one language file, failing with a readable message on malformed JSON. */
function loadLanguage(config, code) {
  const file = path.join(rootDir, config.content.languages_dir, `${code}.json`);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`${config.content.languages_dir}/${code}.json is not valid JSON — ${err.message}`);
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Deep-merges `override` onto `base`, recording the dotted path of every key
 * that was absent from `override` and therefore inherited from the default
 * language. Arrays are replaced wholesale rather than merged element-by-element:
 * a partially translated list would interleave languages unpredictably.
 */
function mergeOverDefault(base, override, fallbacks, prefix = "") {
  const result = {};
  for (const [key, baseValue] of Object.entries(base)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    const hasOverride = isPlainObject(override) && key in override;

    if (!hasOverride) {
      result[key] = baseValue;
      fallbacks.push(keyPath);
      continue;
    }
    const overrideValue = override[key];
    result[key] = isPlainObject(baseValue) && isPlainObject(overrideValue)
      ? mergeOverDefault(baseValue, overrideValue, fallbacks, keyPath)
      : overrideValue;
  }
  // Keys a translation adds that the default language does not have are kept,
  // so a language can carry extra material without the build discarding it.
  if (isPlainObject(override)) {
    for (const [key, value] of Object.entries(override)) {
      if (!(key in base)) result[key] = value;
    }
  }
  return result;
}

/** Turns a dotted key path into readable words, dropping array indices. */
function humanize(keyPath) {
  return keyPath
    .split(".")
    .filter((segment) => !/^\d+$/.test(segment))
    .join(" ")
    .replace(/_/g, " ")
    .trim();
}

/** Shortens text to a length limit without cutting a word in half. */
function truncateWords(text, maxLength) {
  if (text.length <= maxLength) return text;
  const words = text.split(" ");
  let out = words[0];
  for (let i = 1; i < words.length; i++) {
    if (`${out} ${words[i]}`.length > maxLength) break;
    out += ` ${words[i]}`;
  }
  return out.length > maxLength ? out.slice(0, maxLength) : out;
}

/**
 * Builds the stand-in text shown in non-production environments. The result
 * names the key it replaces, so anyone looking at the dev site can tell which
 * content file to edit, and is padded to approximately the length of the real
 * text so the layout stays representative for design review.
 *
 * The language code is included so that switching language visibly changes the
 * text — otherwise every language would render identically and the switcher
 * could not be tested outside production.
 */
function makePlaceholder(keyPath, original, langCode) {
  const target = original.length;
  const label = humanize(keyPath);

  // Items within a list get their position appended. Several components use a
  // content string as a React key, so identical placeholders across a list would
  // produce duplicate keys — and an unnumbered list of stand-ins is impossible
  // to match back to the entry it came from.
  const indices = keyPath.split(".").filter((s) => /^\d+$/.test(s));
  const suffix = indices.length ? ` ${Number(indices[indices.length - 1]) + 1}` : "";

  // Short strings (nav labels, buttons) get a short stand-in — a long sentence
  // in a button would misrepresent the layout as badly as an empty one. Allow a
  // little overflow so the text stays meaningful rather than a stub.
  if (target < 24) {
    const segments = keyPath.split(".").filter((s) => !/^\d+$/.test(s));
    const lastSegment = humanize(segments[segments.length - 1] ?? label);
    const base = truncateWords(`${langCode}·${lastSegment}`, Math.max(target + 6, 8));
    return `${base}${suffix}`;
  }

  let text = `${langCode}·${label}${suffix} — content goes here`;
  for (let i = 0; text.length < target; i++) {
    text += ` ${FILLER[i % FILLER.length]}`;
  }
  return text;
}

/** True when a string carries machine meaning (path, URL, date) rather than prose. */
function isMachineValue(value) {
  return (
    value.startsWith("/") ||
    value.startsWith("#") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    ISO_DATE.test(value)
  );
}

/**
 * Recursively replaces prose with placeholders while leaving structure, paths,
 * ids and dates intact. Keys beginning with "_" (such as the `_language`
 * descriptor) are metadata and are never transformed — the language switcher
 * must stay readable in order to be testable.
 */
function toPlaceholders(node, langCode, prefix = "") {
  if (typeof node === "string") {
    if (isMachineValue(node)) return node;
    return makePlaceholder(prefix, node, langCode);
  }
  if (Array.isArray(node)) {
    return node.map((item, index) => toPlaceholders(item, langCode, `${prefix}.${index}`));
  }
  if (isPlainObject(node)) {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      const keyPath = prefix ? `${prefix}.${key}` : key;
      out[key] = key.startsWith("_") || PRESERVED_KEYS.has(key)
        ? value
        : toPlaceholders(value, langCode, keyPath);
    }
    return out;
  }
  return node;
}

/**
 * Reads one `<lang>.md` article: the first level-1 heading becomes the title and
 * everything after it becomes the body.
 */
function parseArticle(file) {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(/^\s*#\s+(.+)$/m);
  if (!match) {
    throw new Error(`${path.relative(rootDir, file)} has no "# Title" heading on its first line.`);
  }
  const title = match[1].trim();
  const body = raw.slice(match.index + match[0].length);
  return { title, bodyMarkdown: body.trim() };
}

/**
 * Discovers blog posts by scanning one folder per post. Each folder supplies a
 * meta.json of shared settings plus one Markdown file per language. Unlike a
 * missing translation — which falls back to the default language — a post with
 * no date or title fails the build, because there is no sensible default.
 */
function discoverBlogPosts(config, languageCodes) {
  const dir = path.join(rootDir, config.content.blog_dir);
  if (!existsSync(dir)) return [];

  const fallback = config.site.default_language;
  const posts = [];

  for (const slug of readdirSync(dir).sort()) {
    const postDir = path.join(dir, slug);
    if (!statSync(postDir).isDirectory()) continue;

    const metaFile = path.join(postDir, "meta.json");
    if (!existsSync(metaFile)) {
      throw new Error(`content/blog/${slug}/ is missing meta.json`);
    }
    let meta;
    try {
      meta = JSON.parse(readFileSync(metaFile, "utf8"));
    } catch (err) {
      throw new Error(`content/blog/${slug}/meta.json is not valid JSON — ${err.message}`);
    }
    if (!meta.date || !ISO_DATE.test(meta.date)) {
      throw new Error(`content/blog/${slug}/meta.json needs a "date" in YYYY-MM-DD form.`);
    }

    const defaultArticle = path.join(postDir, `${fallback}.md`);
    if (!existsSync(defaultArticle)) {
      throw new Error(`content/blog/${slug}/ must contain ${fallback}.md (the default language).`);
    }

    // Every language resolves to something: its own article when present,
    // otherwise the default language's.
    const articles = {};
    const base = parseArticle(defaultArticle);
    for (const code of languageCodes) {
      const file = path.join(postDir, `${code}.md`);
      articles[code] = existsSync(file) ? parseArticle(file) : base;
    }

    posts.push({
      slug,
      date: meta.date,
      hero: meta.hero ?? null,
      tags: meta.tags ?? [],
      articles,
    });
  }
  // Newest first — the order the blog index displays.
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

/** Applies the placeholder transform to article titles and bodies. */
function placeholderArticles(posts) {
  return posts.map((post) => ({
    ...post,
    articles: Object.fromEntries(
      Object.entries(post.articles).map(([code, article]) => [
        code,
        {
          title: makePlaceholder(`blog.${post.slug}.title`, article.title, code),
          bodyMarkdown: makePlaceholder(`blog.${post.slug}.body`, article.bodyMarkdown, code),
        },
      ])
    ),
  }));
}

/**
 * Writes public/robots.txt for the active environment. Non-production
 * environments disallow all crawling so they cannot compete with the live site
 * in search results.
 */
function writeRobots(env, config) {
  const lines = env.indexable
    ? ["User-agent: *", "Allow: /", "", `Sitemap: ${config.site.production_url}/sitemap.xml`]
    : [
        `# ${env.name} environment — must never be indexed.`,
        "# Generated by scripts/generate-content.mjs; edit config/site.yml instead.",
        "User-agent: *",
        "Disallow: /",
      ];
  writeFileSync(path.join(rootDir, "public", "robots.txt"), lines.join("\n") + "\n", "utf8");
}

// ── Build ────────────────────────────────────────────────────────────────────

const config = loadConfig();
const env = resolveEnvironment(config);
const mode = describeContentMode(env.content_mode);
const languageCodes = discoverLanguages(config);
const defaultLang = config.site.default_language;

const defaultContent = loadLanguage(config, defaultLang);

const realContent = {};
const placeholderContent = {};
const descriptors = [];
const fallbackReport = {};

for (const code of languageCodes) {
  const raw = code === defaultLang ? defaultContent : loadLanguage(config, code);
  const fallbacks = [];
  const merged = code === defaultLang
    ? raw
    : mergeOverDefault(defaultContent, raw, fallbacks);

  if (fallbacks.length) fallbackReport[code] = fallbacks;

  const descriptor = merged._language ?? {};
  descriptors.push({
    code,
    name: descriptor.name ?? code,
    native_name: descriptor.native_name ?? descriptor.name ?? code,
    label: descriptor.label ?? code.toUpperCase(),
    short_label: descriptor.short_label ?? code.toUpperCase(),
    is_default: code === defaultLang,
  });

  if (mode.includesReal) realContent[code] = merged;
  if (mode.includesPlaceholder) placeholderContent[code] = toPlaceholders(merged, code);
}

const discoveredBlogPosts = discoverBlogPosts(config, languageCodes);
const realBlogPosts = mode.includesReal ? discoveredBlogPosts : [];
const placeholderBlogPosts = mode.includesPlaceholder ? placeholderArticles(discoveredBlogPosts) : [];

const content = mode.defaultVariant === "real" ? realContent : placeholderContent;
const alternateContent = mode.switchable ? placeholderContent : null;
const blogPosts = mode.defaultVariant === "real" ? realBlogPosts : placeholderBlogPosts;
const alternateBlogPosts = mode.switchable ? placeholderBlogPosts : null;

// Markdown is converted after the placeholder pass so placeholder bodies render
// as ordinary paragraphs too.
const renderedPosts = blogPosts.map((post) => ({
  ...post,
  articles: Object.fromEntries(
    Object.entries(post.articles).map(([code, article]) => [
      code,
      { title: article.title, html: renderMarkdown(article.bodyMarkdown) },
    ])
  ),
}));

writeRobots(env, config);

const outDir = path.join(rootDir, "src", "gen");
mkdirSync(outDir, { recursive: true });

function discoverStaticRoutes(dir, prefix = "") {
  const routes = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!entry.startsWith("[") && !entry.startsWith("_")) {
        routes.push(...discoverStaticRoutes(full, `${prefix}/${entry}`));
      }
    } else if (entry === "page.tsx") {
      routes.push(prefix || "/");
    }
  }
  return routes;
}

const routes = [
  ...discoverStaticRoutes(path.join(rootDir, "src", "app")),
  ...blogPosts.map((post) => `/blog/${post.slug}`),
].filter((route, index, all) => all.indexOf(route) === index).sort();

const langUnion = languageCodes.map((c) => `"${c}"`).join(" | ");
const generated = `// AUTO-GENERATED by scripts/generate-content.mjs — do not edit directly.
// Edit the files in content/ instead, then rerun \`npm run content:build\`.
//
// Built for SITE_ENV="${env.name}" (content_mode: ${env.content_mode}).
import type { ContentShape, LanguageDescriptor, BlogPost } from "@/lib/content-types";

export type Lang = ${langUnion};

/** Language every other language falls back to, from config/site.yml. */
export const defaultLang: Lang = "${defaultLang}";

/** Environment this bundle was built for. */
export const siteEnv = "${env.name}";

/** Whether this bundle contains real content or generated placeholders. */
export const isPlaceholderContent = ${mode.defaultVariant === "placeholder"};

/** Whether this build enables the local runtime content selector. */
export const isContentSwitchable = ${mode.switchable};

/**
 * Environment settings resolved from config/site.yml at build time, so pages can
 * apply them without reading configuration at runtime (there is no server).
 */
export const siteConfig = ${JSON.stringify(
  {
    env: env.name,
    productionUrl: config.site.production_url,
    basePath: env.base_path ?? "",
    indexable: Boolean(env.indexable),
  },
  null,
  2
)} as const;

/** Static routes discovered from app pages and content-driven blog entries. */
export const routes = ${JSON.stringify(routes, null, 2)} as const;

/** Discovered languages, in switcher order. Add a file to content/languages/ to extend. */
export const languages: LanguageDescriptor[] = ${JSON.stringify(descriptors, null, 2)};

export const content = ${JSON.stringify(content, null, 2)} as unknown as Record<Lang, ContentShape>;

/** Placeholder variant for local testing; null in development and production bundles. */
export const localPlaceholderContent = ${JSON.stringify(alternateContent, null, 2)} as unknown as Record<Lang, ContentShape> | null;

/** Discovered blog posts, newest first. Add a folder to content/blog/ to extend. */
export const blogPosts: BlogPost[] = ${JSON.stringify(renderedPosts, null, 2)} as unknown as BlogPost[];

/** Placeholder article variant for local testing; null in other bundles. */
export const localPlaceholderBlogPosts: BlogPost[] | null = ${JSON.stringify(
  alternateBlogPosts
    ? alternateBlogPosts.map((post) => ({
        ...post,
        articles: Object.fromEntries(
          Object.entries(post.articles).map(([code, article]) => [
            code,
            { title: article.title, html: renderMarkdown(article.bodyMarkdown) },
          ])
        ),
      }))
    : null,
  null,
  2
)} as unknown as BlogPost[] | null;

export type { ContentShape } from "@/lib/content-types";
`;

writeFileSync(path.join(outDir, "content.ts"), generated, "utf8");

// ── Report ───────────────────────────────────────────────────────────────────

console.log(
  `[content] env=${env.name} mode=${env.content_mode} ` +
    `languages=[${languageCodes.join(", ")}] posts=${renderedPosts.length}`
);

for (const [code, fallbacks] of Object.entries(fallbackReport)) {
  const preview = fallbacks.slice(0, 8).join(", ");
  const more = fallbacks.length > 8 ? `, …and ${fallbacks.length - 8} more` : "";
  console.warn(
    `[content] ${code}.json is missing ${fallbacks.length} key(s); showing ${defaultLang} for: ${preview}${more}`
  );
}

if (mode.contentMode === "placeholder") {
  console.log(`[content] placeholder mode — real text is not included in this build.`);
} else if (mode.switchable) {
  console.log(`[content] switchable mode — real and placeholder text are included; real is the default.`);
}
