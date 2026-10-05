// ─────────────────────────────────────────────────────────────────────────────
// Content build step.
//
// Scans content/languages/, content/blog/, and the active library/hero environment,
// merges every language over the default language, optionally replaces all real
// text with placeholders, and emits generated website content under src/gen/.
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
  "id", "key", "code", "kind", "tone", "cat", "slug", "phone", "email",
  "href", "img", "bg", "icon", "symbol", "upi", "images", "gallery",
  "launch_date", "end_date", "pinned_date", "date",
  "img_position",
  // This preview control must remain understandable while it selects which
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

/** Loads the single source of truth for all public image paths. */
function loadImageConfig(environmentName) {
  const configName = environmentName === "local" ? "dev" : environmentName;
  const file = path.join(rootDir, "settings", configName, "images.json");
  if (!existsSync(file)) {
    throw new Error(`settings/${configName}/images.json is missing — it defines the website image paths.`);
  }
  const config = JSON.parse(readFileSync(file, "utf8"));
  const baseUrl = config.baseUrl ?? "";
  const paths = config.paths ?? {};
  const resolve = (imagePath) => `${baseUrl}${imagePath}`;
  const lookup = new Map(Object.entries(paths).map(([key, imagePath]) => [`@image.${key}`, resolve(imagePath)]));
  for (const imagePath of Object.values(paths)) lookup.set(imagePath, resolve(imagePath));
  for (const [alias, key] of Object.entries(config.aliases ?? {})) {
    if (!paths[key]) throw new Error(`settings/images.json alias ${alias} points to unknown image ${key}.`);
    lookup.set(alias, resolve(paths[key]));
  }
  return lookup;
}

/** Replaces legacy content paths with the paths currently selected in settings. */
function resolveImagePaths(value, imageLookup) {
  if (typeof value === "string") return imageLookup.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => resolveImagePaths(item, imageLookup));
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveImagePaths(item, imageLookup)])
    );
  }
  return value;
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

function parseParamparaMarkdown(file) {
  const raw = readFileSync(file, "utf8");
  const heading = raw.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const detailsMatch = raw.match(/^##\s+Details\s*$/m);
  if (!heading || !detailsMatch) {
    throw new Error(`${path.relative(rootDir, file)} needs a title and a "## Details" heading.`);
  }

  const summary = raw
    .slice(raw.indexOf("\n") + 1, detailsMatch.index)
    .split(/\r?\n/)
    .filter((line) => !/^\s*-\s+\*\*[^*]+:\*\*/.test(line) && line.trim())
    .join("\n\n")
    .trim();
  const detailsMarkdown = raw.slice(detailsMatch.index + detailsMatch[0].length).trim();
  return { heading, summary, detailsMarkdown };
}

/** Loads the indexed Guru Parampara, falling back to English until translations exist. */
function discoverParampara(languageCodes, defaultLang) {
  const dir = path.join(rootDir, "library", "parampara");
  const indexFile = path.join(dir, "index.json");
  if (!existsSync(indexFile)) {
    throw new Error("library/parampara/index.json is missing — initialize the library submodule.");
  }

  const loadIndex = (file) => {
    try {
      return JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
      throw new Error(`${path.relative(rootDir, file)} is not valid JSON — ${err.message}`);
    }
  };
  const baseIndex = loadIndex(indexFile);
  if (!Array.isArray(baseIndex.items) || !baseIndex.items.length) {
    throw new Error("library/parampara/index.json needs a non-empty items array.");
  }

  const result = {};
  for (const code of languageCodes) {
    const translatedIndexFile = path.join(dir, `index.${code}.json`);
    const hasTranslatedIndex = code !== defaultLang && existsSync(translatedIndexFile);
    const index = hasTranslatedIndex ? loadIndex(translatedIndexFile) : baseIndex;
    if (!Array.isArray(index.items) || index.items.length !== baseIndex.items.length) {
      throw new Error(`${path.relative(rootDir, translatedIndexFile)} must contain the same ${baseIndex.items.length} entries as index.json.`);
    }

    result[code] = index.items.map((item, itemIndex) => {
      const baseItem = baseIndex.items[itemIndex];
      if (!item.id || item.id !== baseItem.id || !item.contentFile) {
        throw new Error(`library/parampara index entry ${itemIndex + 1} needs a stable id and contentFile.`);
      }

      const parsedPath = path.parse(item.contentFile);
      const translatedMarkdown = path.join(dir, `${parsedPath.name}.${code}${parsedPath.ext}`);
      const markdownFile = hasTranslatedIndex
        ? path.join(dir, item.contentFile)
        : code !== defaultLang && existsSync(translatedMarkdown)
          ? translatedMarkdown
          : path.join(dir, baseItem.contentFile);
      if (!existsSync(markdownFile)) {
        throw new Error(`${path.relative(rootDir, markdownFile)} is referenced by the parampara index but is missing.`);
      }

      const parsed = parseParamparaMarkdown(markdownFile);
      if (code === defaultLang && (parsed.heading !== item.name || parsed.summary !== item.summary)) {
        throw new Error(`${path.relative(rootDir, markdownFile)} title or summary does not match library/parampara/index.json.`);
      }
      return {
        id: item.id,
        name: parsed.heading,
        position: item.position,
        officialPosition: item.officialPosition ?? null,
        timePeriod: item.timePeriod ?? "",
        summary: parsed.summary,
        thumbnailImage: item.thumbnailImage ?? "",
        fullImage: item.fullImage ?? item.thumbnailImage ?? "",
        detailsMarkdown: parsed.detailsMarkdown,
      };
    });
  }
  return result;
}

function placeholderParampara(parampara) {
  return Object.fromEntries(Object.entries(parampara).map(([code, items]) => [
    code,
    items.map((item, index) => ({
      ...item,
      name: makePlaceholder(`parampara.items.${index}.name`, item.name, code),
      timePeriod: item.timePeriod
        ? makePlaceholder(`parampara.items.${index}.time_period`, item.timePeriod, code)
        : "",
      summary: makePlaceholder(`parampara.items.${index}.summary`, item.summary, code),
      detailsMarkdown: item.detailsMarkdown
        ? makePlaceholder(`parampara.items.${index}.details`, item.detailsMarkdown, code)
        : "",
      thumbnailImage: "",
      fullImage: "",
    })),
  ]));
}

function writeParamparaArtifacts(parampara, alternateParampara, content, defaultLang) {
  const dir = path.join(rootDir, "src", "gen", "parampara");
  mkdirSync(dir, { recursive: true });

  const renderParampara = (itemsByLanguage) => Object.fromEntries(Object.entries(itemsByLanguage).map(([code, items]) => [
    code,
    items.map(({ detailsMarkdown, ...item }) => ({
      ...item,
      detailsHtml: detailsMarkdown ? renderMarkdown(detailsMarkdown) : "",
    })),
  ]));
  const rendered = renderParampara(parampara);
  const renderedAlternate = alternateParampara ? renderParampara(alternateParampara) : null;
  const generated = `// AUTO-GENERATED by scripts/generate-content.mjs — do not edit directly.\n` +
    `export interface ParamparaGuru {\n` +
    `  id: string; name: string; position: number; officialPosition: number | null;\n` +
    `  timePeriod: string; summary: string; thumbnailImage: string; fullImage: string; detailsHtml: string;\n` +
    `}\n\n` +
    `export const paramparaByLanguage = ${JSON.stringify(rendered, null, 2)} as unknown as Record<string, ParamparaGuru[]>;\n` +
    `export const alternateParamparaByLanguage = ${JSON.stringify(renderedAlternate, null, 2)} as unknown as Record<string, ParamparaGuru[]> | null;\n`;
  writeFileSync(path.join(dir, "data.ts"), generated, "utf8");

  const labels = content[defaultLang].pages.parampara;
  const gurus = rendered[defaultLang];
  const cards = gurus.map((guru) => `
      <button class="guru" data-id="${escapeHtml(guru.id)}">
        <span class="position">${escapeHtml(guru.officialPosition === null ? labels.founder : `${labels.position} ${guru.officialPosition}`)}</span>
        <strong>${escapeHtml(guru.name)}</strong>
        ${guru.timePeriod ? `<small>${escapeHtml(guru.timePeriod)}</small>` : ""}
        <span class="summary">${escapeHtml(guru.summary)}</span>
      </button>`).join("");
  const payload = JSON.stringify(rendered).replaceAll("<", "\\u003c");
  const labelPayload = JSON.stringify(Object.fromEntries(
    Object.keys(rendered).map((code) => [code, content[code].pages.parampara])
  )).replaceAll("<", "\\u003c");
  const html = `<!doctype html>
<html lang="${escapeHtml(defaultLang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(labels.title)}</title><style>
*{box-sizing:border-box}body{margin:0;background:#fbf3e7;color:#261b12;font:15px system-ui,sans-serif}.wrap{max-width:1120px;margin:auto;padding:40px 20px 64px}header{max-width:680px;margin-bottom:28px}h1{font:700 38px Georgia,serif;margin:0 0 10px}.intro{color:#5c4a38;line-height:1.65}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.guru{min-height:190px;padding:18px;text-align:left;background:#fff;border:1px solid #e0cfb3;border-radius:8px;color:inherit;cursor:pointer}.guru:hover{border-color:#c4520a;box-shadow:0 10px 30px -12px rgba(38,27,18,.2)}.position{display:block;color:#c4520a;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:12px}.guru strong{display:block;font:700 20px Georgia,serif}.guru small{display:block;color:#9a8a72;margin-top:5px}.summary{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;color:#5c4a38;line-height:1.55;margin-top:14px}.modal{position:fixed;inset:0;background:rgba(26,17,8,.7);display:none;place-items:center;padding:20px}.modal.open{display:grid}.panel{width:min(620px,100%);max-height:85vh;overflow:auto;background:#fff;border-radius:8px;padding:24px}.close{float:right;border:0;background:none;font-size:24px;cursor:pointer}.details{line-height:1.7;color:#5c4a38}.action{border:0;border-radius:999px;background:#c4520a;color:#fff;padding:12px 20px;font-weight:700;cursor:pointer}@media(max-width:600px){.wrap{padding:28px 14px}h1{font-size:30px}.grid{grid-template-columns:1fr 1fr}.guru{min-height:210px;padding:14px}}
</style></head><body><main class="wrap"><header><h1>${escapeHtml(labels.title)}</h1><p class="intro">${escapeHtml(labels.intro)}</p></header><div class="grid">${cards}
</div></main><div class="modal" role="dialog" aria-modal="true"><div class="panel"><button class="close" aria-label="${escapeHtml(labels.close)}">&times;</button><p class="position modal-position"></p><h2></h2><p class="details modal-summary"></p><div class="details modal-details" hidden></div><button class="action">${escapeHtml(labels.see_more)}</button></div></div><script>
const byLanguage=${payload};const labelsByLanguage=${labelPayload};const modal=document.querySelector('.modal');const grid=document.querySelector('.grid');const title=modal.querySelector('h2');const position=modal.querySelector('.modal-position');const summary=modal.querySelector('.modal-summary');const details=modal.querySelector('.modal-details');const action=modal.querySelector('.action');let gurus;let labels;let selected;
const positionText=guru=>guru.officialPosition===null?labels.founder:labels.position+' '+guru.officialPosition;const openGuru=guru=>{selected=guru;title.textContent=guru.name;position.textContent=positionText(guru);summary.textContent=guru.summary;summary.hidden=false;details.hidden=true;details.innerHTML=guru.detailsHtml||'<p>'+labels.details_placeholder+'</p>';action.hidden=false;action.textContent=labels.see_more;modal.classList.add('open')};const render=lang=>{if(!byLanguage[lang])lang='${escapeHtml(defaultLang)}';gurus=byLanguage[lang];labels=labelsByLanguage[lang];document.documentElement.lang=lang;document.title=labels.title;document.querySelector('h1').textContent=labels.title;document.querySelector('.intro').textContent=labels.intro;modal.querySelector('.close').setAttribute('aria-label',labels.close);grid.replaceChildren(...gurus.map(guru=>{const card=document.createElement('button');card.className='guru';card.dataset.id=guru.id;const pos=document.createElement('span');pos.className='position';pos.textContent=positionText(guru);const name=document.createElement('strong');name.textContent=guru.name;card.append(pos,name);if(guru.timePeriod){const time=document.createElement('small');time.textContent=guru.timePeriod;card.append(time)}const text=document.createElement('span');text.className='summary';text.textContent=guru.summary;card.append(text);card.addEventListener('click',()=>openGuru(guru));return card}))};
render(localStorage.getItem('shiroor-lang')||'${escapeHtml(defaultLang)}');addEventListener('storage',event=>{if(event.key==='shiroor-lang')render(event.newValue)});addEventListener('site-language-change',()=>render(localStorage.getItem('shiroor-lang')));action.addEventListener('click',()=>{summary.hidden=true;details.hidden=false;action.hidden=true});const close=()=>modal.classList.remove('open');modal.querySelector('.close').addEventListener('click',close);modal.addEventListener('click',event=>{if(event.target===modal)close()});addEventListener('keydown',event=>{if(event.key==='Escape')close()});
</script></body></html>\n`;
  writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

function parseLibraryFrontmatter(file) {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) {
    throw new Error(`${path.relative(rootDir, file)} must begin with YAML front matter.`);
  }
  let metadata;
  try {
    metadata = yaml.load(match[1]);
  } catch (err) {
    throw new Error(`${path.relative(rootDir, file)} has invalid YAML front matter — ${err.message}`);
  }
  if (!isPlainObject(metadata)) {
    throw new Error(`${path.relative(rootDir, file)} front matter must be an object.`);
  }
  return { metadata, body: match[2].trim() };
}

function requireLocalized(value, field, file) {
  if (!isPlainObject(value) || typeof value.en !== "string" || typeof value.kn !== "string") {
    throw new Error(`${path.relative(rootDir, file)} needs ${field}.en and ${field}.kn.`);
  }
  return { en: value.en.trim(), kn: value.kn.trim() };
}

function discoverConnectContent() {
  const branchesDir = path.join(rootDir, "library", "branches");
  const connectDir = path.join(rootDir, "library", "connect");
  for (const dir of [branchesDir, connectDir]) {
    if (!existsSync(dir)) {
      throw new Error(`${path.relative(rootDir, dir)} is missing — initialize the library submodule.`);
    }
  }

  const branchFiles = readdirSync(branchesDir).filter((file) => file.endsWith(".md")).sort();
  const connectFiles = readdirSync(connectDir).filter((file) => file.endsWith(".md")).sort();
  if (!branchFiles.length || !connectFiles.length) {
    throw new Error("library/branches and library/connect must each contain Markdown files.");
  }

  const branchIds = new Set();
  const branches = branchFiles.map((filename, index) => {
    const file = path.join(branchesDir, filename);
    const { metadata, body } = parseLibraryFrontmatter(file);
    for (const field of ["id", "email", "map_link"]) {
      if (typeof metadata[field] !== "string" || !metadata[field].trim()) {
        throw new Error(`${path.relative(rootDir, file)} needs a non-empty ${field}.`);
      }
    }
    if (typeof metadata.phone !== "string") {
      throw new Error(`${path.relative(rootDir, file)} phone must be a string.`);
    }
    const latitude = Number(metadata.coordinates?.latitude);
    const longitude = Number(metadata.coordinates?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error(`${path.relative(rootDir, file)} needs numeric coordinates.`);
    }
    if (!metadata.map_link.startsWith("https://")) {
      throw new Error(`${path.relative(rootDir, file)} map_link must use HTTPS.`);
    }
    if (branchIds.has(metadata.id)) {
      throw new Error(`library/branches contains duplicate id: ${metadata.id}`);
    }
    branchIds.add(metadata.id);

    const detailsSection = body.split(/^##\s+Details\s*$/imu)[1]?.trim() ?? "";
    const withoutContact = detailsSection.split(/^###\s+Contact & Location Information.*$/imu)[0]?.trim() ?? "";
    const [englishDetails, kannadaDetails = englishDetails] = withoutContact.split(/^\s*---\s*$/mu, 2);
    if (!englishDetails?.trim() || !kannadaDetails?.trim()) {
      throw new Error(`${path.relative(rootDir, file)} needs English and Kannada details.`);
    }

    return {
      id: metadata.id,
      order: index + 1,
      title: requireLocalized(metadata.title, "title", file),
      name: requireLocalized(metadata.name, "name", file),
      branchType: requireLocalized(metadata.branch_type, "branch_type", file),
      address: requireLocalized(metadata.address, "address", file),
      timings: requireLocalized(metadata.timings, "timings", file),
      deity: requireLocalized(metadata.deity, "deity", file),
      description: requireLocalized(metadata.description, "description", file),
      phone: metadata.phone,
      email: metadata.email,
      pincode: String(metadata.pincode ?? ""),
      mapLink: metadata.map_link,
      embedMapUrl: `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      coordinates: { latitude, longitude },
      detailsMarkdown: {
        en: englishDetails.trim(),
        kn: kannadaDetails.trim(),
      },
    };
  });

  const ids = new Set();
  const orders = new Set();
  const connectLinks = connectFiles.map((filename) => {
    const file = path.join(connectDir, filename);
    const { metadata } = parseLibraryFrontmatter(file);
    for (const field of ["id", "platform", "handle", "url", "brand_color", "icon"]) {
      if (typeof metadata[field] !== "string" || !metadata[field].trim()) {
        throw new Error(`${path.relative(rootDir, file)} needs a non-empty ${field}.`);
      }
    }
    if (ids.has(metadata.id)) {
      throw new Error(`library/connect contains duplicate id: ${metadata.id}`);
    }
    const iconRelativePath = metadata.icon.slice(1);
    if (
      (!metadata.url.startsWith("https://") && !metadata.url.startsWith("mailto:")) ||
      !/^#[\da-f]{6}$/iu.test(metadata.brand_color) ||
      !metadata.icon.startsWith("/") ||
      metadata.icon.includes("..") ||
      !existsSync(path.join(rootDir, "public", iconRelativePath))
    ) {
      throw new Error(
        `${path.relative(rootDir, file)} needs an HTTPS or mailto URL, a local icon, and six-digit brand_color.`
      );
    }
    const order = Number(metadata.order);
    if (!Number.isInteger(order) || order < 1 || orders.has(order)) {
      throw new Error(`${path.relative(rootDir, file)} needs a unique positive integer order.`);
    }
    ids.add(metadata.id);
    orders.add(order);
    return {
      id: metadata.id,
      order,
      platform: { en: metadata.platform, kn: metadata.platform },
      handle: { en: metadata.handle, kn: metadata.handle },
      audience: typeof metadata.audience === "string" ? metadata.audience : "",
      url: metadata.url,
      brandColor: metadata.brand_color,
      icon: metadata.icon,
    };
  }).sort((a, b) => a.order - b.order);

  return { branches, connectLinks };
}

function placeholderConnectContent(connectContent) {
  const placeholderLocalized = (value, key) => Object.fromEntries(
    Object.entries(value).map(([code, text]) => [code, makePlaceholder(`${key}.${code}`, text, code)])
  );
  return {
    branches: connectContent.branches.map((branch, index) => ({
      ...branch,
      title: placeholderLocalized(branch.title, `connect.branches.${index}.title`),
      name: placeholderLocalized(branch.name, `connect.branches.${index}.name`),
      branchType: placeholderLocalized(branch.branchType, `connect.branches.${index}.branch_type`),
      address: placeholderLocalized(branch.address, `connect.branches.${index}.address`),
      timings: placeholderLocalized(branch.timings, `connect.branches.${index}.timings`),
      deity: placeholderLocalized(branch.deity, `connect.branches.${index}.deity`),
      description: placeholderLocalized(branch.description, `connect.branches.${index}.description`),
      detailsMarkdown: placeholderLocalized(branch.detailsMarkdown, `connect.branches.${index}.details`),
    })),
    connectLinks: connectContent.connectLinks.map((link, index) => ({
      ...link,
      platform: placeholderLocalized(link.platform, `connect.links.${index}.platform`),
      handle: placeholderLocalized(link.handle, `connect.links.${index}.handle`),
      audience: link.audience
        ? makePlaceholder(`connect.links.${index}.audience`, link.audience, "en")
        : "",
    })),
  };
}

function writeConnectArtifacts(connectContent, alternateConnectContent) {
  const dir = path.join(rootDir, "src", "gen", "connect");
  mkdirSync(dir, { recursive: true });
  const renderContent = (source) => ({
    branches: source.branches.map(({ detailsMarkdown, ...branch }) => ({
      ...branch,
      detailsHtml: {
        en: renderMarkdown(detailsMarkdown.en),
        kn: renderMarkdown(detailsMarkdown.kn),
      },
    })),
    connectLinks: source.connectLinks,
  });
  const rendered = renderContent(connectContent);
  const alternate = alternateConnectContent ? renderContent(alternateConnectContent) : null;
  const generated = `// AUTO-GENERATED by scripts/generate-content.mjs — do not edit directly.\n` +
    `export interface LocalizedText { en: string; kn: string; [language: string]: string; }\n` +
    `export interface BranchRecord {\n` +
    `  id: string; order: number; title: LocalizedText; name: LocalizedText; branchType: LocalizedText;\n` +
    `  address: LocalizedText; timings: LocalizedText; deity: LocalizedText; description: LocalizedText;\n` +
    `  phone: string; email: string; pincode: string; mapLink: string; embedMapUrl: string;\n` +
    `  directionsUrl: string; coordinates: { latitude: number; longitude: number };\n` +
    `  detailsHtml: LocalizedText;\n` +
    `}\n` +
    `export interface ConnectLinkRecord {\n` +
    `  id: string; order: number; platform: LocalizedText; handle: LocalizedText;\n` +
    `  audience: string; url: string; brandColor: string; icon: string;\n` +
    `}\n\n` +
    `export const branches = ${JSON.stringify(rendered.branches, null, 2)} as unknown as BranchRecord[];\n` +
    `export const connectLinks = ${JSON.stringify(rendered.connectLinks, null, 2)} as unknown as ConnectLinkRecord[];\n` +
    `export const alternateBranches = ${JSON.stringify(alternate?.branches ?? null, null, 2)} as unknown as BranchRecord[] | null;\n` +
    `export const alternateConnectLinks = ${JSON.stringify(alternate?.connectLinks ?? null, null, 2)} as unknown as ConnectLinkRecord[] | null;\n`;
  writeFileSync(path.join(dir, "data.ts"), generated, "utf8");
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
  mkdirSync(path.join(rootDir, "public"), { recursive: true });
  writeFileSync(path.join(rootDir, "public", "robots.txt"), lines.join("\n") + "\n", "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Discovers hero groups for the active environment and selects default.hero.json. */
function loadDefaultHero(imageLookup, environmentName) {
  const heroEnvironment = environmentName === "local" ? "dev" : environmentName;
  const relativeHeroDir = path.join("library", "hero", heroEnvironment);
  const heroDir = path.join(rootDir, relativeHeroDir);
  if (!existsSync(heroDir)) {
    throw new Error(`${relativeHeroDir} is missing — initialize the library submodule and add a hero group.`);
  }

  const groupFiles = readdirSync(heroDir).filter((file) => file.endsWith(".hero.json")).sort();
  const defaultFile = "default.hero.json";
  if (!groupFiles.includes(defaultFile)) {
    throw new Error(`${path.join(relativeHeroDir, defaultFile)} is missing — it selects the default hero group.`);
  }

  const file = path.join(heroDir, defaultFile);
  let hero;
  try {
    hero = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`${path.join(relativeHeroDir, defaultFile)} is not valid JSON — ${err.message}`);
  }

  for (const key of ["title_en", "title_kn", "href"]) {
    if (typeof hero[key] !== "string" || !hero[key].trim()) {
      throw new Error(`${path.join(relativeHeroDir, defaultFile)} needs a non-empty "${key}" string.`);
    }
  }
  if (!Array.isArray(hero.images) || !hero.images.length) {
    throw new Error(`${path.join(relativeHeroDir, defaultFile)} needs a non-empty "images" array.`);
  }

  const images = hero.images.map((image, index) => {
    if (typeof image !== "string" || (!image.startsWith("http://") && !image.startsWith("https://") && !image.startsWith("@image."))) {
      throw new Error(`${path.join(relativeHeroDir, defaultFile)} images[${index}] must be an HTTP URL or @image reference.`);
    }
    if (image.startsWith("@image.") && !imageLookup.has(image)) {
      throw new Error(`${path.join(relativeHeroDir, defaultFile)} images[${index}] references unknown image "${image}".`);
    }
    return image;
  });

  console.log(`[content] hero env=${heroEnvironment} groups=[${groupFiles.map((name) => name.replace(/\.hero\.json$/, "")).join(", ")}] selected=default`);
  return { ...hero, images };
}

function resolveHeroHref(href, basePath) {
  if (!href.startsWith("/") || !basePath || href === basePath || href.startsWith(`${basePath}/`)) return href;
  return `${basePath}${href}`;
}

/** Writes a standalone HTML rendering of the home page's hero carousel. */
function writeHeroImages(hero, content, lang, basePath) {
  const titleEn = escapeHtml(hero.title_en);
  const titleKn = escapeHtml(hero.title_kn);
  const activeTitle = lang === "kn" ? titleKn : titleEn;
  const ctaEn = escapeHtml(content.en?.home?.hero_intro?.cta_label ?? "");
  const ctaKn = escapeHtml(content.kn?.home?.hero_intro?.cta_label ?? ctaEn);
  const activeCta = lang === "kn" ? ctaKn : ctaEn;
  const slides = hero.images.map((src, index) => `
      <div class="hero-image${index === 0 ? " is-active" : ""}" aria-hidden="${index === 0 ? "false" : "true"}">
        <img src="${escapeHtml(src)}" alt=""${index === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>
      </div>`).join("");

  const html = `<!doctype html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${activeTitle}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; }
    .hero { position: relative; width: 100%; height: 462px; overflow: hidden; border-radius: 0 0 22px 22px; background: #140c04; }
    .hero-image { position: absolute; inset: 0; opacity: 0; transition: opacity 900ms ease; }
    .hero-image img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.04); transition: transform 7s ease-out; }
    .hero-image.is-active { opacity: 1; }
    .hero-image.is-active img { transform: scale(1); }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,12,4,.42) 0%, rgba(20,12,4,.05) 22%, rgba(20,12,4,0) 40%, rgba(20,12,4,.55) 70%, rgba(16,9,3,.86) 100%); }
    .hero-content { position: absolute; right: 0; bottom: 0; left: 0; padding: 0 24px 32px; text-align: center; }
    .hero-title { margin: 0 0 20px; color: #fffaf0; font-family: Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.25; white-space: pre-line; text-shadow: 0 1px 20px rgba(0,0,0,.4); }
    .hero-cta { display: inline-block; padding: 14px 30px; border-radius: 999px; background: #c86d1d; color: #fff; font-family: sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; box-shadow: 0 8px 22px -8px rgba(0,0,0,.55); transition: background-color 150ms ease; }
    .hero-cta:hover { background: #a95315; }
    .hero-cta:active { background: #85400f; }
    @media (min-width: 1024px) {
      .hero { height: 600px; }
      .hero-title { font-size: 36px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .hero-image, .hero-image img { transition: none; }
    }
  </style>
</head>
<body>
  <section class="hero" data-title-en="${titleEn}" data-title-kn="${titleKn}" data-cta-en="${ctaEn}" data-cta-kn="${ctaKn}">
    <div class="hero-images">${slides}
    </div>
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="hero-content">
      <h1 class="hero-title">${activeTitle}</h1>
      <a class="hero-cta" href="${escapeHtml(resolveHeroHref(hero.href, basePath))}">${activeCta}</a>
    </div>
  </section>
  <script>
    (() => {
      const hero = document.querySelector(".hero");
      const applyLanguage = (lang) => {
        if (lang !== "en" && lang !== "kn") return;
        document.documentElement.lang = lang;
        document.title = hero.dataset[lang === "kn" ? "titleKn" : "titleEn"];
        document.querySelector(".hero-title").textContent = document.title;
        document.querySelector(".hero-cta").textContent = hero.dataset[lang === "kn" ? "ctaKn" : "ctaEn"];
      };
      applyLanguage(new URLSearchParams(location.search).get("lang") || localStorage.getItem("shiroor-lang") || "${escapeHtml(lang)}");
      window.addEventListener("storage", (event) => {
        if (event.key === "shiroor-lang") applyLanguage(event.newValue);
      });
      window.addEventListener("site-language-change", () => applyLanguage(localStorage.getItem("shiroor-lang")));
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      const slides = [...document.querySelectorAll(".hero-image")];
      let active = 0;
      window.setInterval(() => {
        slides[active].classList.remove("is-active");
        slides[active].setAttribute("aria-hidden", "true");
        active = (active + 1) % slides.length;
        slides[active].classList.add("is-active");
        slides[active].setAttribute("aria-hidden", "false");
      }, 4500);
    })();
  </script>
</body>
</html>
`;

  const heroDir = path.join(rootDir, "src", "gen", "hero-images");
  mkdirSync(heroDir, { recursive: true });
  writeFileSync(path.join(heroDir, "index.html"), html, "utf8");
}

// ── Build ────────────────────────────────────────────────────────────────────

const config = loadConfig();
const env = resolveEnvironment(config);
const imageLookup = loadImageConfig(env.name);
const mode = describeContentMode(env.content_mode, env.default_variant);
const languageCodes = discoverLanguages(config);
const defaultLang = config.site.default_language;
const defaultHero = loadDefaultHero(imageLookup, env.name);

const defaultContent = resolveImagePaths(loadLanguage(config, defaultLang), imageLookup);

const realContent = {};
const placeholderContent = {};
const descriptors = [];
const fallbackReport = {};

for (const code of languageCodes) {
  const raw = code === defaultLang
    ? defaultContent
    : resolveImagePaths(loadLanguage(config, code), imageLookup);
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

const discoveredBlogPosts = resolveImagePaths(
  discoverBlogPosts(config, languageCodes),
  imageLookup
);
const realBlogPosts = mode.includesReal ? discoveredBlogPosts : [];
const placeholderBlogPosts = mode.includesPlaceholder ? placeholderArticles(discoveredBlogPosts) : [];

const content = mode.defaultVariant === "real" ? realContent : placeholderContent;
const alternateContent = mode.switchable
  ? mode.defaultVariant === "real" ? placeholderContent : realContent
  : null;
const blogPosts = mode.defaultVariant === "real" ? realBlogPosts : placeholderBlogPosts;
const alternateBlogPosts = mode.switchable
  ? mode.defaultVariant === "real" ? placeholderBlogPosts : realBlogPosts
  : null;
const discoveredParampara = discoverParampara(languageCodes, defaultLang);
const placeholderParamparaContent = placeholderParampara(discoveredParampara);
const parampara = mode.defaultVariant === "real" ? discoveredParampara : placeholderParamparaContent;
const alternateParampara = mode.switchable
  ? mode.defaultVariant === "real" ? placeholderParamparaContent : discoveredParampara
  : null;
const discoveredConnectContent = discoverConnectContent();
const placeholderConnect = placeholderConnectContent(discoveredConnectContent);
const connectContent = mode.defaultVariant === "real" ? discoveredConnectContent : placeholderConnect;
const alternateConnectContent = mode.switchable
  ? mode.defaultVariant === "real" ? placeholderConnect : discoveredConnectContent
  : null;
const placeholderHero = {
  ...defaultHero,
  title_en: makePlaceholder("hero.default.title", defaultHero.title_en, "en"),
  title_kn: makePlaceholder("hero.default.title", defaultHero.title_kn, "kn"),
};
const hero = mode.defaultVariant === "real" ? defaultHero : placeholderHero;
const alternateHero = mode.switchable
  ? mode.defaultVariant === "real" ? placeholderHero : defaultHero
  : null;
const toHomeHero = (heroData) => ({
  titles: { en: heroData.title_en, kn: heroData.title_kn },
  href: heroData.href,
  images: heroData.images.map((image) => imageLookup.get(image) ?? image),
});
const homeHero = toHomeHero(hero);
const alternateHomeHero = alternateHero ? toHomeHero(alternateHero) : null;

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
writeHeroImages(hero, content, defaultLang, env.base_path ?? "");
writeParamparaArtifacts(parampara, alternateParampara, content, defaultLang);
writeConnectArtifacts(connectContent, alternateConnectContent);

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
  ...discoveredParampara[defaultLang].map((guru) => `/history/parampara/${guru.id}`),
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

/** Whether the server-rendered copy uses generated placeholders. */
export const isPlaceholderContent = ${mode.defaultVariant === "placeholder"};

/** Initial copy mode for server rendering and first-time visitors. */
export const defaultContentMode = "${mode.defaultVariant}" as const;

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

/** Home hero selected from the configured default copy mode. */
export interface HomeHeroData {
  titles: Record<Lang, string>;
  href: string;
  images: string[];
}
export const homeHero: HomeHeroData = ${JSON.stringify(homeHero, null, 2)};
export const alternateHomeHero: HomeHeroData | null = ${JSON.stringify(alternateHomeHero, null, 2)};

export const content = ${JSON.stringify(content, null, 2)} as unknown as Record<Lang, ContentShape>;

/** Alternate copy variant for switchable environments; null otherwise. */
export const alternateContent = ${JSON.stringify(alternateContent, null, 2)} as unknown as Record<Lang, ContentShape> | null;

/** Discovered blog posts, newest first. Add a folder to content/blog/ to extend. */
export const blogPosts: BlogPost[] = ${JSON.stringify(renderedPosts, null, 2)} as unknown as BlogPost[];

/** Alternate article variant for switchable environments; null otherwise. */
export const alternateBlogPosts: BlogPost[] | null = ${JSON.stringify(
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
  console.log(
    `[content] switchable mode — real and placeholder text are included; ` +
      `${mode.defaultVariant} is the default.`
  );
}
