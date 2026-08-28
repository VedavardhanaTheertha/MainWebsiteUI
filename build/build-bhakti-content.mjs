import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import { collection } from "./collection.config.mjs";
import { removeSearchTags, validateMetadata } from "./content-utils.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libraryRoot = path.join(projectRoot, "library");
const dataRoot = path.join(projectRoot, "src", "gen");
const previousCollectionRoot = path.join(dataRoot, "dasasahitya");
const previousGeneratedRoot = path.join(projectRoot, "src", "generated-content");
const legacyGeneratedRoot = path.join(projectRoot, "src", "generated");
const legacyDataRoot = path.join(projectRoot, "website-data");
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });

async function buildCollection({ id, sourceDirectory }) {
  const collectionOutput = path.join(dataRoot, id);
  await mkdir(collectionOutput, { recursive: true });

  const sourceRoot = path.join(libraryRoot, sourceDirectory);
  const metadataPath = path.join(sourceRoot, "metadata.json");
  await access(metadataPath);

  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  validateMetadata(metadata, id);

  const contentOutput = path.join(collectionOutput, "content");
  await mkdir(contentOutput, { recursive: true });

  const catalog = [];
  for (const song of metadata.songs) {
    const sourcePath = path.join(sourceRoot, song.sourceFile);
    const source = await readFile(sourcePath, "utf8");
    const contentFile = `content/${song.id}.html`;
    const html = markdown.render(removeSearchTags(source));

    await writeFile(path.join(collectionOutput, contentFile), html, "utf8");
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
    path.join(collectionOutput, "index.json"),
    `${JSON.stringify({ schemaVersion: metadata.schemaVersion, items: catalog }, null, 2)}\n`,
    "utf8",
  );

  return catalog.length;
}

await Promise.all([
  rm(path.join(dataRoot, collection.id), { recursive: true, force: true }),
  rm(previousCollectionRoot, { recursive: true, force: true }),
  rm(previousGeneratedRoot, { recursive: true, force: true }),
  rm(legacyGeneratedRoot, { recursive: true, force: true }),
  rm(legacyDataRoot, { recursive: true, force: true }),
]);
await mkdir(dataRoot, { recursive: true });

const itemCount = await buildCollection(collection);
console.log(`Built ${itemCount} items for ${collection.id}.`);
