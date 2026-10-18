import { canonicalForRoute } from "./canonical-utils.mjs";

export function validateSitemapLocations(locations, routes, productionUrl) {
  const expected = new Set([...routes].map((route) => canonicalForRoute(productionUrl, route)));
  const actual = new Set();
  const problems = [];
  for (const location of locations) {
    let normalized;
    try {
      normalized = new URL(location).href;
    } catch {
      problems.push(`sitemap.xml contains an invalid URL: ${location}`);
      continue;
    }
    if (actual.has(normalized)) problems.push(`sitemap.xml contains duplicate URL: ${normalized}`);
    actual.add(normalized);
    if (!expected.has(normalized)) problems.push(`sitemap.xml contains unexpected URL: ${normalized}`);
  }
  for (const location of expected) {
    if (!actual.has(location)) problems.push(`sitemap.xml is missing URL: ${location}`);
  }
  return problems;
}
