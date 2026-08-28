import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../src/config/site.config.js";
import { tabs } from "./tabs.config.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(projectRoot, "src", "config", "generated.placeholder.json");
const buildId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function interpolationTokens(value) {
  return [...String(value).matchAll(/\{[^}]+\}/g)].map(([token]) => token).join(" ");
}

function placeholder(key, source) {
  const tokens = interpolationTokens(source);
  return `⟦${buildId}:${key}⟧${tokens ? ` ${tokens}` : ""}`;
}

const generated = {
  buildId,
  text: Object.fromEntries(
    siteConfig.locales.map(({ code }) => [
      code,
      Object.fromEntries(
        Object.entries(siteConfig.text[code]).map(([key, value]) => [key, placeholder(key, value)]),
      ),
    ]),
  ),
  tabs: Object.fromEntries(
    tabs.map((tab) => [
      tab.id,
      Object.fromEntries(
        siteConfig.locales.map(({ code }) => [
          code,
          {
            label: placeholder(`${tab.id}.label`, tab.text[code]?.label ?? tab.id),
            description: placeholder(
              `${tab.id}.description`,
              tab.text[code]?.description ?? tab.id,
            ),
          },
        ]),
      ),
    ]),
  ),
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(generated, null, 2)}\n`, "utf8");
console.log(`Generated placeholder text set ${buildId}.`);