import path from "node:path";

const ERROR_DOCUMENTS = new Set(["404.html", "_not-found.html"]);

/** Returns the public route represented by a Next.js static-export HTML file. */
export function routeForHtml(outDir, file) {
  const relative = path.relative(outDir, file).split(path.sep).join("/");
  if (ERROR_DOCUMENTS.has(relative) || ERROR_DOCUMENTS.has(path.posix.basename(relative))) {
    return null;
  }
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"/index.html".length)}`;
  return `/${relative.slice(0, -".html".length)}`;
}

/** Builds the production canonical URL for an exported route. */
export function canonicalForRoute(productionUrl, route) {
  const base = productionUrl.endsWith("/") ? productionUrl : `${productionUrl}/`;
  return new URL(route.replace(/^\//, ""), base).href.replace(/\/$/, route === "/" ? "/" : "");
}
