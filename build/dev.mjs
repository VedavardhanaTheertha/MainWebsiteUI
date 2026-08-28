import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envName = process.argv[2] || "dev";
const childEnv = { ...process.env, SITE_ENV: envName };

function run(scriptPath, args = []) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: rootDir,
    stdio: "inherit",
    env: childEnv,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(path.join(rootDir, "build", "build-bhakti-content.mjs"));
run(path.join(rootDir, "scripts", "generate-content.mjs"));
run(path.join(rootDir, "node_modules", "next", "dist", "bin", "next"), ["dev"]);