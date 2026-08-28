import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const generatedPaths = [".next", "out", "dist", "src/gen", "public/robots.txt"];

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
console.log(`[clean] removed ${generatedPaths.join(", ")}`);