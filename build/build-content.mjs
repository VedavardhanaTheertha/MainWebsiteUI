import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import { tabs } from "./tabs.config.mjs";
import { removeSearchTags, validateMetadata } from "./content-utils.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libraryRoot = path.join(projectRoot, "library");
const dataRoot = path.join(projectRoot, "src", "generated");
const legacyDataRoot = path.join(projectRoot, "website-data");
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });

async function buildTab(tab) {
  const tabOutput = path.join(dataRoot, tab.id);
  await mkdir(tabOutput, { recursive: true });

  if (!tab.sourceDirectory) {
    await writeFile(
      path.join(tabOutput, "index.json"),
      `${JSON.stringify({ schemaVersion: "1.0", items: [] }, null, 2)}\n`,
      "utf8",
    );
    return { ...tab, available: false, itemCount: 0 };
  }

  const sourceRoot = path.join(libraryRoot, tab.sourceDirectory);
  const metadataPath = path.join(sourceRoot, "metadata.json");
  await access(metadataPath);

  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  validateMetadata(metadata, tab.id);

  const contentOutput = path.join(tabOutput, "content");
  await mkdir(contentOutput, { recursive: true });

  const catalog = [];
  for (const song of metadata.songs) {
    const sourcePath = path.join(sourceRoot, song.sourceFile);
    const source = await readFile(sourcePath, "utf8");
    const contentFile = `content/${song.id}.html`;
    const html = markdown.render(removeSearchTags(source));

    await writeFile(path.join(tabOutput, contentFile), html, "utf8");
    catalog.push({
      id: song.id,
      title: song.title,
      kruti: song.kruti ?? "",
      krutiKn: song["kruti-kn"] ?? "",
      ankita: song.ankita ?? "",
      ankitaKn: song["ankita-kn"] ?? "",
      searchTags: Array.isArray(song.searchTags) ? song.searchTags : [],
      contentFile,
    });
  }

  await writeFile(
    path.join(tabOutput, "index.json"),
    `${JSON.stringify({ schemaVersion: metadata.schemaVersion, items: catalog }, null, 2)}\n`,
    "utf8",
  );

  return { ...tab, available: true, itemCount: catalog.length };
}

await Promise.all([
  ...tabs.map((tab) => rm(path.join(dataRoot, tab.id), { recursive: true, force: true })),
  rm(path.join(dataRoot, "tabs.json"), { force: true }),
  rm(legacyDataRoot, { recursive: true, force: true }),
]);
await mkdir(dataRoot, { recursive: true });

const manifest = [];
for (const tab of tabs) {
  manifest.push(await buildTab(tab));
}

await writeFile(
  path.join(dataRoot, "tabs.json"),
  `${JSON.stringify({ tabs: manifest }, null, 2)}\n`,
  "utf8",
);

console.log(
  `Built ${manifest.reduce((total, tab) => total + tab.itemCount, 0)} items across ${manifest.length} collections.`,
);