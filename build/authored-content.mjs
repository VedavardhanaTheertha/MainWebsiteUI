import { readFileSync } from "node:fs";
import path from "node:path";
import { loadEditorialContent, mergeAuthoredSources } from "./editorial-content.mjs";
import { loadHomeContent } from "./home-content.mjs";
import { applyNavigation, loadNavigation } from "./navigation-content.mjs";

export function loadAuthoredLanguage(rootDir, languageCode, languagesDir = "content/languages", { navigation = true } = {}) {
  const source = path.join(rootDir, languagesDir, `${languageCode}.json`);
  const raw = readFileSync(source, "utf8");
  let labels;
  try {
    labels = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${source}: invalid language JSON (${error.message}).`, { cause: error });
  }
  if (labels === null || typeof labels !== "object" || Array.isArray(labels)) {
    throw new Error(`${source}: language UI content must be an object.`);
  }
  const editorial = mergeAuthoredSources(labels, loadEditorialContent(rootDir, languageCode));
  const authored = mergeAuthoredSources(editorial, loadHomeContent(rootDir, languageCode));
  return navigation ? applyNavigation(authored, loadNavigation(rootDir)) : authored;
}
