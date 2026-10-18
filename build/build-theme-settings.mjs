import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadThemeSettings, renderThemeCss } from "./theme-settings.mjs";
import { holdWorkspaceLock } from "./workspace-lock.mjs";

holdWorkspaceLock("theme generation");
const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(rootDir, "src", "gen", "settings", "theme.css");
const settings = loadThemeSettings();
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, renderThemeCss(settings), "utf8");
console.log(`[theme] Generated ${Object.keys(settings.tokens).length} shared tokens.`);
