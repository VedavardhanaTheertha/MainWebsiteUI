import { rm, mkdir, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { holdWorkspaceLock } from "./workspace-lock.mjs";

holdWorkspaceLock("cleaning generated output");
const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Preserve Next.js upgrade-retry receipts across clean runs so that agent
// upgrade nudge retries within TTL are not invalidated.
const retriesCache = path.join(rootDir, ".next", "cache", "next-agentic-upgrade-retries");
const tempRetriesCache = path.join(rootDir, "node_modules", ".cache", "next-agentic-upgrade-retries");
if (existsSync(retriesCache)) {
  await mkdir(path.dirname(tempRetriesCache), { recursive: true });
  await cp(retriesCache, tempRetriesCache, { recursive: true, force: true }).catch(() => {});
}

const preserveNextCache = process.env.PRESERVE_NEXT_CACHE === "1";
const nextDir = path.join(rootDir, ".next");
const generatedPaths = preserveNextCache
  ? ["out", "dist", "src/gen", "public/robots.txt"]
  : [".next", "out", "dist", "src/gen", "public/robots.txt"];

if (preserveNextCache && existsSync(nextDir)) {
  const entries = await readdir(nextDir);
  await Promise.all(
    entries
      .filter((entry) => entry !== "cache")
      .map((entry) =>
        rm(path.join(nextDir, entry), {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 250,
        }),
      ),
  );
}

await Promise.all(
  generatedPaths.map((entry) =>
    rm(path.join(rootDir, entry), {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 250,
    }),
  ),
);

if (existsSync(tempRetriesCache)) {
  await mkdir(retriesCache, { recursive: true });
  await cp(tempRetriesCache, retriesCache, { recursive: true, force: true }).catch(() => {});
  await rm(tempRetriesCache, { recursive: true, force: true }).catch(() => {});
}

console.log(`[clean] removed ${generatedPaths.join(", ")}`);