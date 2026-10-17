import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import handler from "serve-handler";
import yaml from "js-yaml";

export function createPreviewServer(publicDirectory, basePath = "") {
  if (!existsSync(path.join(publicDirectory, "index.html"))) {
    throw new Error(`No static export found at ${publicDirectory}. Run the matching build first.`);
  }
  const segmentRoutes = new Map();
  function collectSegmentRoutes(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relative = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) {
        collectSegmentRoutes(path.join(directory, entry.name), relative);
      } else if (entry.isFile() && relative.includes("/__next.") && relative.endsWith(".txt")) {
        const start = relative.indexOf("/__next.") + 1;
        const flattened = relative.slice(0, start) + relative.slice(start).replaceAll("/", ".");
        segmentRoutes.set(flattened, relative);
      }
    }
  }
  collectSegmentRoutes(publicDirectory);
  return createServer((request, response) => {
    const location = new URL(request.url ?? "/", "http://localhost");
    if (basePath && location.pathname === basePath) {
      response.writeHead(307, { Location: `${basePath}/${location.search}` });
      response.end();
      return;
    }
    if (basePath && !location.pathname.startsWith(`${basePath}/`)) {
      response.writeHead(404);
      response.end();
      return;
    }
    const pathname = location.pathname.slice(basePath.length);
    request.url = `${segmentRoutes.get(pathname) ?? pathname}${location.search}`;
    const writeHead = response.writeHead.bind(response);
    response.writeHead = function (statusCode, ...args) {
      const headers = typeof args[0] === "string" ? args[1] : args[0];
      if (basePath && headers && !Array.isArray(headers)) {
        for (const key of Object.keys(headers)) {
          if (key.toLowerCase() === "location" && typeof headers[key] === "string" && headers[key].startsWith("/")) {
            headers[key] = `${basePath}${headers[key]}`;
          }
        }
      }
      const redirect = response.getHeader("Location");
      if (basePath && typeof redirect === "string" && redirect.startsWith("/")) {
        response.setHeader("Location", `${basePath}${redirect}`);
      }
      return writeHead(statusCode, ...args);
    };
    handler(request, response, {
      public: publicDirectory,
      directoryListing: false,
      cleanUrls: true,
      trailingSlash: false,
    }).catch((error) => {
      console.error("[preview] Failed to serve request:", error);
      if (!response.headersSent) response.writeHead(500);
      response.end();
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const config = yaml.load(readFileSync(path.join(root, "config", "site.yml"), "utf8"));
  const environmentName = process.argv[2] ?? process.env.SITE_ENV ?? "dev";
  const environment = config.environments?.[environmentName];
  if (!environment) throw new Error(`Unknown preview environment: ${environmentName}`);
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be an integer from 1 to 65535.");
  const basePath = environment.base_path ?? "";
  const publicDirectory = path.join(root, "out");
  const server = createPreviewServer(publicDirectory, basePath);
  const html = readFileSync(path.join(publicDirectory, "index.html"), "utf8");
  const exportedBase = html.match(/<script[^>]+\bsrc="([^"]*?)\/_next\//u)?.[1];
  if (exportedBase !== undefined && exportedBase !== basePath) {
    throw new Error(`Export base path "${exportedBase}" does not match "${environmentName}". Build that environment or select the matching preview environment.`);
  }
  server.on("error", (error) => { console.error("[preview]", error); process.exitCode = 1; });
  server.listen(port, "127.0.0.1", () => {
    console.log(`[preview] ${environmentName}: http://localhost:${port}${basePath}/`);
  });
}
