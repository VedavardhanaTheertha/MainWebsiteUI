// ─────────────────────────────────────────────────────────────────────────────
// The deployment build.
//
// This is the script CI runs, and the same script you can run locally to
// reproduce a CI build exactly:
//
//     node build/build.mjs dev
//     node build/build.mjs prod
//
// The environment is taken from the first argument, falling back to SITE_ENV and
// then to "dev". An argument is used rather than only an environment variable so
// the npm scripts work identically on Windows, macOS and Linux.
//
// Keeping the logic here rather than inside a CI configuration file means build
// problems can be debugged locally instead of by pushing commits, and moving to
// a different CI provider only requires rewriting a thin wrapper.
//
// See docs/ARCHITECTURE.md §7.
// ─────────────────────────────────────────────────────────────────────────────
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "js-yaml";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envName = process.argv[2] || process.env.SITE_ENV || "dev";

/**
 * Runs a Node script in the project root, aborting the build if it fails.
 *
 * Everything is invoked through `node` with an explicit script path rather than
 * through npx or a shell: package binaries need a .cmd shim on Windows but not
 * elsewhere, and going through a shell would pass arguments unescaped.
 */
function run(label, scriptPath, args = []) {
  console.log(`\n[build] ${label}`);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, SITE_ENV: envName },
  });
  if (result.error) {
    console.error(`\n[build] FAILED at: ${label}\n  could not start: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`\n[build] FAILED at: ${label}`);
    process.exit(result.status ?? 1);
  }
}

/** Reads config/site.yml so the build can report what it is about to produce. */
function loadConfig() {
  const file = path.join(rootDir, "config", "site.yml");
  if (!existsSync(file)) {
    console.error("[build] config/site.yml is missing — cannot resolve the environment.");
    process.exit(1);
  }
  return yaml.load(readFileSync(file, "utf8"));
}

const config = loadConfig();
const environment = config.environments?.[envName];

if (!environment) {
  const known = Object.keys(config.environments ?? {}).join(", ");
  console.error(`[build] SITE_ENV="${envName}" is not defined in config/site.yml (known: ${known})`);
  process.exit(1);
}

console.log("─".repeat(70));
console.log(`  Building "${config.site.name}"`);
console.log(`  environment : ${envName}`);
console.log(`  content     : ${environment.content_mode}`);
console.log(`  indexable   : ${environment.indexable}`);
console.log(`  base path   : ${environment.base_path || "(site root)"}`);
console.log("─".repeat(70));

run("cleaning stale output", path.join(rootDir, "build", "clean.mjs"));
run("generating Bhakti", path.join(rootDir, "build", "build-bhakti-content.mjs"));
run("generating website content", path.join(rootDir, "scripts", "generate-content.mjs"));
run("building static site", path.join(rootDir, "node_modules", "next", "dist", "bin", "next"), ["build"]);
run("verifying output", path.join(rootDir, "build", "verify.mjs"));

console.log(`\n[build] done — static site written to out/`);
