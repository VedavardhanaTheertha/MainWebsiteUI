import { readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { NextConfig } from "next";
import { pageExtensionsForEnvironment } from "./build/developer-options.mjs";

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
 * See docs/ARCHITECTURE.md, Environments.
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

function loadImagePolicy(): NonNullable<NextConfig["images"]> {
  const source = "settings/image_policy.json";
  const parsed: unknown = JSON.parse(
    readFileSync(path.join(process.cwd(), "settings", "image_policy.json"), "utf8")
  );
  function record(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`${source} ${field} must be an object.`);
    }
    return value as Record<string, unknown>;
  }
  function fields(value: Record<string, unknown>, allowed: string[], field: string) {
    if (Object.keys(value).some((key) => !allowed.includes(key))) {
      throw new Error(`${source} ${field} contains unknown fields.`);
    }
  }
  const policy = record(parsed, "root");
  fields(policy, ["unoptimized", "remotePatterns"], "root");
  if (typeof policy.unoptimized !== "boolean") {
    throw new Error(`${source} unoptimized must be a boolean.`);
  }
  if (!Array.isArray(policy.remotePatterns)) {
    throw new Error(`${source} remotePatterns must be an array.`);
  }
  const remotePatterns = policy.remotePatterns.map((value: unknown, index: number) => {
    const field = `remotePatterns[${index}]`;
    const pattern = record(value, field);
    fields(pattern, ["protocol", "hostname", "pathname"], field);
    if (pattern.protocol !== "https" && pattern.protocol !== "http") {
      throw new Error(`${source} ${field}.protocol must be http or https.`);
    }
    const hostnameForValidation = typeof pattern.hostname === "string"
      ? pattern.hostname.replace(/^([a-z0-9][a-z0-9-]{0,61})\*\./i, "$1x.")
      : "";
    if (typeof pattern.hostname !== "string" || pattern.hostname.length > 253 ||
        !/^(?:\*\*?\.)?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i.test(hostnameForValidation)) {
      throw new Error(`${source} ${field}.hostname must be a hostname, optionally prefixed with *., **., or a literal prefix followed by *.`);
    }
    if (typeof pattern.pathname !== "string" ||
        !/^\/(?:[a-z0-9._~!$&'()+,=@%-]|\*|\/)*$/i.test(pattern.pathname) ||
        /%(?![\da-f]{2})/i.test(pattern.pathname) || pattern.pathname.includes("//") ||
        pattern.pathname.split("/").some((segment, index, segments) =>
          segment === "." || segment === ".." ||
          (segment.includes("*") && segment !== "*" && !(segment === "**" && index === segments.length - 1)))) {
      throw new Error(`${source} ${field}.pathname must be an absolute URL path with * segments or a final **.`);
    }
    return {
      protocol: pattern.protocol,
      hostname: pattern.hostname,
      pathname: pattern.pathname,
    } as const;
  });
  if (new Set(remotePatterns.map((pattern) => JSON.stringify(pattern))).size !== remotePatterns.length) {
    throw new Error(`${source} remotePatterns must not contain duplicates.`);
  }
  return { unoptimized: policy.unoptimized, remotePatterns };
}

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: pageExtensionsForEnvironment(process.env.SITE_ENV || "dev"),
  env: {
    SITE_ENV: process.env.SITE_ENV || "dev",
  },
  turbopack: {
    root: process.cwd(),
  },
  // Static export has no server, so next/image's optimization API route isn't
  // available — serve pre-optimized WebP/AVIF assets as-is instead (see
  // content decision: images are pre-optimized at authoring time).
  images: loadImagePolicy(),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
