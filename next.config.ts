import { readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { NextConfig } from "next";

interface SiteEnvironment {
  base_path?: string;
  content_mode?: string;
  indexable?: boolean;
}

interface SiteConfigFile {
  environments: Record<string, SiteEnvironment>;
}

/**
 * Reads the active environment's settings from config/site.yml.
 *
 * Defaults to "dev" when SITE_ENV is unset — showing production content must be
 * an explicit choice, so an unconfigured build can never behave like production.
 * See docs/ARCHITECTURE.md §6.3.
 */
function loadEnvironment(): SiteEnvironment {
  const file = path.join(process.cwd(), "config", "site.yml");
  const config = yaml.load(readFileSync(file, "utf8")) as SiteConfigFile;
  const name = process.env.SITE_ENV || "dev";
  const env = config.environments?.[name];
  if (!env) {
    throw new Error(
      `SITE_ENV="${name}" is not defined in config/site.yml ` +
        `(known: ${Object.keys(config.environments ?? {}).join(", ")})`
    );
  }
  return env;
}

const environment = loadEnvironment();

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/, so
// assets and links need that prefix. Production sits at a domain root and uses "".
const basePath = environment.base_path ?? "";

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: process.cwd(),
  },
  // Static export has no server, so next/image's optimization API route isn't
  // available — serve pre-optimized WebP/AVIF assets as-is instead (see
  // content decision: images are pre-optimized at authoring time).
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
