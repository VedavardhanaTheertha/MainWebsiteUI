import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = fileURLToPath(new URL("../", import.meta.url));
export const contentSteps = [
  "build/build-theme-settings.mjs",
  "build/build-ui-settings.mjs",
  "build/build-media-albums.mjs",
  "build/build-bhakti-content.mjs",
  "build/build-sevas-content.mjs",
  "build/build-events-content.mjs",
  "build/build-library-sections.mjs",
  "scripts/generate-content.mjs",
];

export function runNode(script, args = []) {
  const result = spawnSync(process.execPath, [path.resolve(rootDir, script), ...args], {
    cwd: rootDir, stdio: "inherit", env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

export function generateContent(run = runNode) {
  for (const script of contentSteps) run(script);
}

export function runUnitTests() {
  const files = readdirSync(path.join(rootDir, "build", "test"))
    .filter((name) => name.endsWith(".test.mjs"))
    .sort().map((name) => path.join("build", "test", name));
  runNode("build/test-runner.mjs", files);
}
