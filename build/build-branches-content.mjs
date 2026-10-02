// ─────────────────────────────────────────────────────────────────────────────
// Build Branches Content
//
// Reads branch Markdown files from library/branches/*.md, parses YAML frontmatter
// and bilingual content, and generates src/gen/branches/data.ts and index.html
// with environment-aware switchable copy support.
// ─────────────────────────────────────────────────────────────────────────────
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { renderMarkdown } from "./markdown.mjs";
import { describeContentMode } from "./environment-utils.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const branchesSourceDir = path.join(rootDir, "library", "branches");
const outputDir = path.join(rootDir, "src", "gen", "branches");

// 1. Resolve environment configuration
const envName = process.env.SITE_ENV || "dev";
const siteConfigFile = path.join(rootDir, "config", "site.yml");
const siteConfig = yaml.load(readFileSync(siteConfigFile, "utf8"));
const envConfig = siteConfig.environments?.[envName] || siteConfig.environments?.dev;
const mode = describeContentMode(envConfig?.content_mode, envConfig?.default_variant);
const isPlaceholderDefault = mode.defaultVariant === "placeholder";
const isSwitchable = mode.includesReal && mode.includesPlaceholder;

// Ensure output directory exists
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

if (!existsSync(branchesSourceDir)) {
  throw new Error(`Branches directory not found at: ${branchesSourceDir}`);
}

// 2. Discover top-level markdown files
const entries = await readdir(branchesSourceDir);
const branchFiles = entries
  .filter((file) => {
    if (!file.endsWith(".md")) return false;
    const fullPath = path.join(branchesSourceDir, file);
    return statSync(fullPath).isFile();
  })
  .sort();

const resolveBilingual = (field) => {
  if (!field) return { en: "", kn: "" };
  if (typeof field === "string") return { en: field, kn: field };
  if (typeof field === "object") {
    const en = field.en || field.english || "";
    const kn = field.kn || field.kannada || en;
    return { en, kn };
  }
  return { en: "", kn: "" };
};

const realCatalog = [];

for (const file of branchFiles) {
  const slug = file.replace(/^\d+-/, "").replace(/\.md$/, "");
  const fullPath = path.join(branchesSourceDir, file);
  const raw = await readFile(fullPath, "utf8");

  // Parse frontmatter
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) {
    console.warn(`[branches] Skipping ${file} (missing YAML frontmatter)`);
    continue;
  }

  const fmRaw = fmMatch[1];
  const bodyMarkdown = fmMatch[2].trim();

  let fm = {};
  try {
    fm = yaml.load(fmRaw) || {};
  } catch (err) {
    console.error(`[branches] Error parsing YAML in ${file}:`, err.message);
    continue;
  }

  const id = fm.id || slug;
  const titleObj = resolveBilingual(fm.title);
  const nameObj = resolveBilingual(fm.name);
  const branchTypeObj = resolveBilingual(fm.branch_type);
  const addressObj = resolveBilingual(fm.address);
  const streetObj = resolveBilingual(fm.street);
  const cityObj = resolveBilingual(fm.city);
  const districtObj = resolveBilingual(fm.district);
  const stateObj = resolveBilingual(fm.state);
  const countryObj = resolveBilingual(fm.country);
  const timingsObj = resolveBilingual(fm.timings);
  const descriptionObj = resolveBilingual(fm.description);
  const detailsObj = resolveBilingual(fm.details);
  const deityObj = resolveBilingual(fm.deity);
  const establishedByObj = resolveBilingual(fm.established_by);
  const historyEraObj = resolveBilingual(fm.history_era);

  // Extract language-specific details from body markdown
  let detailsEn = "";
  let detailsKn = "";

  const enOverviewMatch = bodyMarkdown.match(/###\s+Overview & Significance[^\r\n]*[\r\n]+([\s\S]*?)(?=---|(?:\r?\n){2,}###|$)/i);
  const enHistoryMatch = bodyMarkdown.match(/###\s+History & Sacred Lineage Connection[^\r\n]*[\r\n]+([\s\S]*?)(?=---|(?:\r?\n){2,}###|$)/i);
  if (enOverviewMatch) {
    detailsEn = [
      `### Overview & Significance\n\n${enOverviewMatch[1].trim()}`,
      enHistoryMatch ? `### History & Sacred Lineage\n\n${enHistoryMatch[1].trim()}` : "",
    ].filter(Boolean).join("\n\n");
  }

  const knOverviewMatch = bodyMarkdown.match(/###\s+ವಿವರಣೆ ಮತ್ತು ಮಹತ್ವ[^\r\n]*[\r\n]+([\s\S]*?)(?=---|(?:\r?\n){2,}###|$)/i);
  const knHistoryMatch = bodyMarkdown.match(/###\s+ಇತಿಹಾಸ ಮತ್ತು ಸಂಸ್ಥಾನದ ಹಿನ್ನೆಲೆ[^\r\n]*[\r\n]+([\s\S]*?)(?=---|(?:\r?\n){2,}###|$)/i);
  if (knOverviewMatch) {
    detailsKn = [
      `### ವಿವರಣೆ ಮತ್ತು ಮಹತ್ವ\n\n${knOverviewMatch[1].trim()}`,
      knHistoryMatch ? `### ಇತಿಹಾಸ ಮತ್ತು ಹಿನ್ನೆಲೆ\n\n${knHistoryMatch[1].trim()}` : "",
    ].filter(Boolean).join("\n\n");
  }

  realCatalog.push({
    id,
    file,
    title: titleObj,
    name: nameObj,
    branchType: branchTypeObj,
    address: addressObj,
    street: streetObj,
    city: cityObj,
    district: districtObj,
    state: stateObj,
    country: countryObj,
    pincode: String(fm.pincode || ""),
    phone: String(fm.phone || ""),
    email: String(fm.email || ""),
    timings: timingsObj,
    deity: deityObj,
    establishedBy: establishedByObj,
    historyEra: historyEraObj,
    mapLink: fm.map_link || "",
    embedMapUrl: fm.embed_map_url || "",
    coordinates: fm.coordinates || { latitude: 0, longitude: 0 },
    image: fm.image || "",
    images: Array.isArray(fm.images) ? fm.images : [],
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    description: descriptionObj,
    details: detailsObj,
    detailsMarkdown: {
      en: detailsEn || detailsObj.en,
      kn: detailsKn || detailsObj.kn,
    },
    detailsHtml: {
      en: renderMarkdown(detailsEn || detailsObj.en),
      kn: renderMarkdown(detailsKn || detailsObj.kn),
    },
  });
}

// Placeholder generator
function toPlaceholders(items, code) {
  return items.map((item, idx) => ({
    ...item,
    title: {
      en: `Branch ${idx + 1} Title`,
      kn: `ಶಾಖೆ ${idx + 1} ಶೀರ್ಷಿಕೆ`,
    },
    name: {
      en: `Branch ${idx + 1}`,
      kn: `ಶಾಖೆ ${idx + 1}`,
    },
    branchType: {
      en: "Branch Type",
      kn: "ಶಾಖೆಯ ಪ್ರಕಾರ",
    },
    address: {
      en: "Sample Branch Address, Udupi District, Karnataka",
      kn: "ಮಾದರಿ ಶಾಖಾ ವಿಳಾಸ, ಉಡುಪಿ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ",
    },
    description: {
      en: "Placeholder branch description for layout preview only.",
      kn: "ವಿನ್ಯಾಸ ಮುನ್ನೋಟಕ್ಕಾಗಿ ಕೇವಲ ಪರ್ಯಾಯ ವಿವರಣೆ.",
    },
    detailsHtml: {
      en: "<p>Placeholder details content for preview.</p>",
      kn: "<p>ಮುನ್ನೋಟಕ್ಕಾಗಿ ವಿವರಗಳ ಪರ್ಯಾಯ ಮಾಹಿತಿ.</p>",
    },
  }));
}

const placeholderCatalog = toPlaceholders(realCatalog);

const activeCatalog = isPlaceholderDefault ? placeholderCatalog : realCatalog;
const alternateCatalog = isSwitchable
  ? isPlaceholderDefault ? realCatalog : placeholderCatalog
  : null;

// Map catalog to localized records
function mapToLanguageRecord(catalog) {
  const result = { en: [], kn: [] };
  for (const item of catalog) {
    result.en.push({
      id: item.id,
      name: item.name.en,
      title: item.title.en,
      type: item.branchType.en,
      address: item.address.en,
      city: item.city.en,
      district: item.district.en,
      pincode: item.pincode,
      phone: item.phone,
      email: item.email,
      hours: item.timings.en,
      deity: item.deity.en,
      establishedBy: item.establishedBy.en,
      historyEra: item.historyEra.en,
      mapLink: item.mapLink,
      embedMapUrl: item.embedMapUrl,
      image: item.image,
      images: item.images,
      description: item.description.en,
      detailsHtml: item.detailsHtml.en,
    });
    result.kn.push({
      id: item.id,
      name: item.name.kn,
      title: item.title.kn,
      type: item.branchType.kn,
      address: item.address.kn,
      city: item.city.kn,
      district: item.district.kn,
      pincode: item.pincode,
      phone: item.phone,
      email: item.email,
      hours: item.timings.kn,
      deity: item.deity.kn,
      establishedBy: item.establishedBy.kn,
      historyEra: item.historyEra.kn,
      mapLink: item.mapLink,
      embedMapUrl: item.embedMapUrl,
      image: item.image,
      images: item.images,
      description: item.description.kn,
      detailsHtml: item.detailsHtml.kn,
    });
  }
  return result;
}

const branchesByLanguage = mapToLanguageRecord(activeCatalog);
const alternateBranchesByLanguage = alternateCatalog ? mapToLanguageRecord(alternateCatalog) : null;

// Write src/gen/branches/data.ts
const dataCode = `// AUTO-GENERATED by build/build-branches-content.mjs — do not edit directly.
export interface LocalizedBranch {
  id: string;
  name: string;
  title: string;
  type: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  phone: string;
  email: string;
  hours: string;
  deity: string;
  establishedBy: string;
  historyEra: string;
  mapLink: string;
  embedMapUrl: string;
  image: string;
  images: string[];
  description: string;
  detailsHtml: string;
}

export const branchesByLanguage: Record<string, LocalizedBranch[]> = ${JSON.stringify(branchesByLanguage, null, 2)};
export const alternateBranchesByLanguage: Record<string, LocalizedBranch[]> | null = ${
  alternateBranchesByLanguage ? JSON.stringify(alternateBranchesByLanguage, null, 2) : "null"
};
`;

await writeFile(path.join(outputDir, "data.ts"), dataCode, "utf8");

// Write interactive index.html preview
const defaultLang = "en";
const cardsHtml = branchesByLanguage[defaultLang]
  .map(
    (b) => `
    <article class="branch-card" data-id="${b.id}">
      <span class="type-badge">${b.type}</span>
      <h2>${b.title}</h2>
      <p class="address"><strong>Address:</strong> ${b.address}</p>
      <p class="hours"><strong>Hours:</strong> ${b.hours}</p>
      <p class="phone"><strong>Phone:</strong> ${b.phone}</p>
      <p class="email"><strong>Email:</strong> ${b.email}</p>
      <div class="desc">${b.description}</div>
      ${b.mapLink ? `<a class="map-btn" href="${b.mapLink}" target="_blank" rel="noopener noreferrer">View on Map &rarr;</a>` : ""}
    </article>`
  )
  .join("");

const previewHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Shri Shiroor Matha — Branches & Locations</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#fbf3e7;color:#261b12;font:15px system-ui,sans-serif}
    .wrap{max-width:1120px;margin:auto;padding:40px 20px 64px}
    header{margin-bottom:32px;text-align:center}
    h1{font:700 36px Georgia,serif;color:#8f2d08;margin:0 0 10px}
    .intro{color:#5c4a38;font-size:16px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
    .branch-card{background:#fff;border:1px solid #e0cfb3;border-radius:12px;padding:24px;box-shadow:0 4px 12px rgba(38,27,18,.05)}
    .type-badge{display:inline-block;background:#fdf2e9;color:#c4520a;font-size:11px;font-weight:700;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:12px}
    .branch-card h2{font:700 22px Georgia,serif;margin:0 0 12px;color:#261b12}
    .address,.hours,.phone,.email{margin:6px 0;color:#5c4a38;font-size:14px;line-height:1.5}
    .desc{margin:14px 0;color:#4a3b2c;line-height:1.6}
    .map-btn{display:inline-block;margin-top:10px;padding:8px 16px;background:#c4520a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Branches & Sacred Locations</h1>
      <p class="intro">Explore the holy seats and branch monasteries of Shri Shiroor Matha</p>
    </header>
    <div class="grid">
      ${cardsHtml}
    </div>
  </div>
</body>
</html>
`;

await writeFile(path.join(outputDir, "index.html"), previewHtml, "utf8");

console.log(`Built ${realCatalog.length} branches in src/gen/branches.`);
