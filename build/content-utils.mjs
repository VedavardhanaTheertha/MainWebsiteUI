import path from "node:path";

export function removeSearchTags(markdown) {
  return markdown.replace(/\r?\n##\s+Search Tags\s*[\s\S]*$/iu, "").trim();
}

export function toTitleCase(filename) {
  if (typeof filename !== "string") return "";
  return filename
    .replace(/\.md$/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function splitSongContent(markdown, song = {}) {
  const cleanMarkdown = removeSearchTags(markdown);
  const titleEn = song.titleEn || song["title-en"] || toTitleCase(song.sourceFile || "") || song.title || "";
  const knMatch = cleanMarkdown.match(/##\s*ಕನ್ನಡ\s*ಸಾಹಿತ್ಯ\s*\r?\n([\s\S]*?)(?=##\s*Lyrics transliterated to english|$)/i);
  const enMatch = cleanMarkdown.match(/##\s*Lyrics transliterated to english\s*\r?\n([\s\S]*?)(?=##\s*Search Tags|$)/i);

  if (!knMatch || !enMatch) {
    return {
      knMarkdown: cleanMarkdown,
      enMarkdown: cleanMarkdown,
      titleEn,
    };
  }

  const header = cleanMarkdown.slice(0, cleanMarkdown.search(/##\s*ಕನ್ನಡ\s*ಸಾಹಿತ್ಯ/i)).trim();
  const lines = header.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const titleLine = lines[0] || (`# ${song.titleKn || song.title || ""}`);
  const metaLines = lines.slice(1);

  const knMeta = metaLines.find((l) => !/^[a-zA-Z]/.test(l)) || (song["kruti-kn"] || song.krutiKn ? `ಸಾಹಿತ್ಯ : ${song["kruti-kn"] || song.krutiKn}` : "");
  const enMeta = metaLines.find((l) => /^[a-zA-Z]/.test(l)) || (song.kruti ? `Kruti: ${song.kruti}` : "");

  const knMarkdown = [titleLine, knMeta, knMatch[1].trim()].filter(Boolean).join("\n\n");
  const enMarkdown = [`# ${titleEn}`, enMeta, enMatch[1].trim()].filter(Boolean).join("\n\n");

  return {
    knMarkdown,
    enMarkdown,
    titleEn,
  };
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

export function normalizeSearchText(value) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[|–—.,'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchText(song) {
  const titleEn = song.titleEn || song["title-en"] || toTitleCase(song.sourceFile || "");
  const parts = [
    song.title,
    titleEn,
    song.kruti ?? "",
    song["kruti-kn"] ?? song.krutiKn ?? "",
    song.ankita ?? "",
    song["ankita-kn"] ?? song.ankitaKn ?? "",
    ...(Array.isArray(song.searchTags) ? song.searchTags : []),
  ];

  const normalized = normalizeSearchText(parts.join(" "));
  const words = Array.from(new Set(normalized.split(/\s+/).filter(Boolean)));
  return words.join(" ");
}