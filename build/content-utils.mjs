import path from "node:path";

export function removeSearchTags(markdown) {
  return markdown.replace(/\r?\n##\s+Search Tags\s*[\s\S]*$/iu, "").trim();
}

export function assertSafeSourceFile(sourceFile) {
  if (
    typeof sourceFile !== "string" ||
    path.basename(sourceFile) !== sourceFile ||
    path.extname(sourceFile).toLowerCase() !== ".md"
  ) {
    throw new Error(`Unsafe or invalid sourceFile: ${sourceFile}`);
  }
}

export function validateMetadata(metadata, tabId) {
  if (!metadata || !Array.isArray(metadata.songs)) {
    throw new Error(`${tabId}/metadata.json must contain a songs array.`);
  }

  const ids = new Set();
  for (const song of metadata.songs) {
    if (!song.id || !song.title || !song.sourceFile) {
      throw new Error(`${tabId} contains a song without id, title, or sourceFile.`);
    }
    if (ids.has(song.id)) {
      throw new Error(`${tabId} contains duplicate id: ${song.id}`);
    }
    assertSafeSourceFile(song.sourceFile);
    ids.add(song.id);
  }
}