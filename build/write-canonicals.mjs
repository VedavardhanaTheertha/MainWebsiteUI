// Normalize canonical links after Next.js static export. App Router layouts do
// not receive the current static pathname, so a root canonical is inherited as
// "/" by pages that do not define one. The exported file path is authoritative
// and lets this step cover present and future filesystem-discovered routes.
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "js-yaml";
import { canonicalForRoute, routeForHtml } from "./canonical-utils.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(rootDir, "out");
const config = yaml.load(readFileSync(path.join(rootDir, "config", "site.yml"), "utf8"));

function collectHtmlFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory()
      ? collectHtmlFiles(full)
      : entry.endsWith(".html") ? [full] : [];
  });
}

for (const file of collectHtmlFiles(outDir)) {
  const route = routeForHtml(outDir, file);
  const html = readFileSync(file, "utf8");
  const withoutCanonical = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/gi, "");
  const canonical = route === null
    ? ""
    : `<link rel="canonical" href="${canonicalForRoute(config.site.production_url, route)}"/>`;
  const updated = withoutCanonical.replace("</head>", `${canonical}</head>`);
  if (updated === withoutCanonical && canonical) {
    throw new Error(`${path.relative(outDir, file)} has no </head> for canonical insertion.`);
  }
  writeFileSync(file, updated);
}

console.log(`[canonical] normalized ${collectHtmlFiles(outDir).length} exported HTML file(s)`);
