import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MiniSearch from "minisearch";
import { collection } from "./collection.config.mjs";
import {
  buildSearchText,
  parseMarkdownFrontmatter,
  splitSongContent,
  validateSongs,
} from "./content-utils.mjs";
import { renderMarkdown } from "./markdown.mjs";
import { getSearchProfile, withSearchDefaults } from "./search-config.mjs";
import { bhaktiSummaryModule, compositionTypeFromMetadata } from "./bhakti-metadata.mjs";
import { bhaktiLocalePresentation, discoverLanguageContent, localizeBhaktiSong } from "./language-content.mjs";
import { holdWorkspaceLock } from "./workspace-lock.mjs";

holdWorkspaceLock("Bhakti generation");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libraryRoot = path.join(projectRoot, "library");
const dataRoot = path.join(projectRoot, "src", "gen");
const { defaultLanguage, metadata } = discoverLanguageContent(projectRoot);
const localePresentation = bhaktiLocalePresentation(metadata, defaultLanguage);

async function buildCollection({ id, sourceDirectory }) {
  const collectionOutput = path.join(dataRoot, id);
  await mkdir(collectionOutput, { recursive: true });

  const sourceRoot = path.join(libraryRoot, sourceDirectory);
  let sourceFiles;
  try {
    sourceFiles = (await readdir(sourceRoot))
      .filter((file) => path.extname(file).toLowerCase() === ".md")
      .sort();
  } catch (error) {
    throw new Error(
      `Required library content is missing at ${path.relative(projectRoot, sourceRoot)}. ` +
        "Initialize submodules with: git submodule update --init --recursive",
      { cause: error },
    );
  }

  if (sourceFiles.length === 0) {
    throw new Error(`${path.relative(projectRoot, sourceRoot)} contains no Markdown files.`);
  }

  const songs = await Promise.all(sourceFiles.map(async (sourceFile) => {
    const sourcePath = path.join(sourceRoot, sourceFile);
    const source = await readFile(sourcePath, "utf8");
    const { metadata, body } = parseMarkdownFrontmatter(source, path.relative(projectRoot, sourcePath));
    if (metadata.sourceFile !== sourceFile) {
      throw new Error(
        `${path.relative(projectRoot, sourcePath)} front matter sourceFile must equal ${sourceFile}.`,
      );
    }
    return { ...metadata, sourceFile, body };
  }));
  validateSongs(songs, id);

  const contentOutput = path.join(collectionOutput, "content");
  await mkdir(contentOutput, { recursive: true });

  const catalog = [];
  const loaders = [];
  for (const song of songs) {
    const { knMarkdown, enMarkdown, titleEn } = splitSongContent(song.body, song);

    const html = renderMarkdown(song.body);
    const htmlKn = renderMarkdown(knMarkdown);
    const htmlEn = renderMarkdown(enMarkdown);
    const { localized, localizedHtml } = localizeBhaktiSong(song, titleEn, localePresentation, {
      original: htmlKn, transliteration: htmlEn,
    });

    const contentFile = `content/${song.id}.html`;
    await writeFile(path.join(collectionOutput, contentFile), html, "utf8");
    await writeFile(path.join(collectionOutput, `content/${song.id}-kn.html`), htmlKn, "utf8");
    await writeFile(path.join(collectionOutput, `content/${song.id}-en.html`), htmlEn, "utf8");
    await writeFile(
      path.join(collectionOutput, `content/${song.id}.ts`),
      `export const html: string = ${JSON.stringify(html)};\n` +
        `export const localizedHtml: Record<string, string> = ${JSON.stringify(localizedHtml)};\n`,
      "utf8",
    );
    loaders.push(`  ${JSON.stringify(song.id)}: () => import("./content/${song.id}"),`);

    catalog.push({
      id: song.id,
      title: song.title,
      kruti: song.kruti ?? "",
      ankita: song.ankita ?? "",
      localized,
      searchFields: {
        title: song.title, titleKn: song.title, titleEn,
        kruti: song.kruti ?? "", krutiKn: song["kruti-kn"] ?? "",
        ankita: song.ankita ?? "", ankitaKn: song["ankita-kn"] ?? "",
      },
      compositionType: compositionTypeFromMetadata(song),
      searchText: buildSearchText({ ...song, titleEn }, [knMarkdown, enMarkdown]),
      contentFile,
    });
  }

  const searchIndex = new MiniSearch(withSearchDefaults({
    idField: "__search_id",
    fields: [
      "title",
      "titleKn",
      "titleEn",
      "kruti",
      "krutiKn",
      "ankita",
      "ankitaKn",
      "searchText",
    ],
    extractField: (item, field) => {
      const val = item.searchFields?.[field] ?? item[field];
      return val != null ? String(val) : "";
    },
    searchOptions: {
      boost: getSearchProfile("bhakti").boost,
    },
  }));

  const docs = catalog.map((item, idx) => ({ ...item, __search_id: idx }));
  searchIndex.addAll(docs);

  const serialized = JSON.stringify(searchIndex.toJSON());
  const compressed = gzipSync(serialized).toString("base64");

  const searchIndexCode = `// Generated by build/build-bhakti-content.mjs — do not edit
export const compressedBhaktiSearchIndex = ${JSON.stringify(compressed)};
`;

  const loadersCode = `// Generated by build/build-bhakti-content.mjs — do not edit
export interface BhaktiSongModule {
  html: string;
  localizedHtml?: Record<string, string>;
}

export const bhaktiPresentation = ${JSON.stringify(localePresentation)};

export const loadBhaktiSearchIndex = () => import("./search-index");

export const bhaktiContentLoaders: Record<string, () => Promise<BhaktiSongModule>> = {
${loaders.join("\n")}
};
`;

  await writeFile(path.join(collectionOutput, "search-index.ts"), searchIndexCode, "utf8");
  await writeFile(path.join(collectionOutput, "loaders.ts"), loadersCode, "utf8");
  await writeFile(path.join(collectionOutput, "summary.ts"), bhaktiSummaryModule(catalog.length), "utf8");
  await writeFile(
    path.join(collectionOutput, "index.json"),
    `${JSON.stringify({ schemaVersion: "1.0", items: catalog })}\n`,
    "utf8",
  );

  return catalog.length;
}

await rm(path.join(dataRoot, collection.id), { recursive: true, force: true });
await mkdir(dataRoot, { recursive: true });

const itemCount = await buildCollection(collection);
console.log(`Built ${itemCount} items for ${collection.id}.`);
