import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const target =
  "const ext = /\\.(woff|woff2|eot|ttf|otf)(?:\\?.*)?$/i.exec(googleFontFileUrl)[1];";

const replacement =
  'const extMatch = /\\.(woff|woff2|eot|ttf|otf)(?:\\?.*)?$/i.exec(googleFontFileUrl);\n            const ext = extMatch ? extMatch[1] : "woff2";';

/**
 * Patches next/font Google loader to prevent TypeError when Google Fonts returns
 * extensionless dynamic font URLs (such as /l/font?kit=... for Noto Sans Kannada).
 */
export function patchNextFont(projectRoot = process.cwd()) {
  const loaderPath = path.resolve(
    projectRoot,
    "node_modules/next/dist/compiled/@next/font/dist/google/loader.js"
  );

  if (!fs.existsSync(loaderPath)) {
    return false;
  }

  const content = fs.readFileSync(loaderPath, "utf8");
  if (content.includes(target)) {
    const updated = content.replace(target, replacement);
    fs.writeFileSync(loaderPath, updated, "utf8");
    console.log(
      "[patch-next-font] Applied Google Fonts URL extension fallback to next/font loader."
    );
    return true;
  }

  return true;
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  patchNextFont();
}

