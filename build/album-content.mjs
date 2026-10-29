import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseMarkdownFrontmatter } from "./content-utils.mjs";
import { discoverLanguageContent, resolveLocalizedValues } from "./language-content.mjs";

export function loadAlbumConfig(rootDir) {
  const configFile = path.join(rootDir, "settings", "album_config.json");
  if (!existsSync(configFile)) {
    throw new Error(`Album config missing: ${configFile}`);
  }
  const config = JSON.parse(readFileSync(configFile, "utf8"));
  return {
    recent: {
      count: config.recent?.count ?? 3,
    },
    top_library: {
      count: config.top_library?.count ?? 3,
      recency_weight: config.top_library?.recency_weight ?? 0.5,
      image_count_weight: config.top_library?.image_count_weight ?? 0.5,
    },
  };
}

export function loadAlbums(rootDir) {
  const albumsDir = path.join(rootDir, "library", "albums");
  if (!existsSync(albumsDir)) {
    throw new Error(`Albums directory not found: ${albumsDir}`);
  }

  const { codes: languageCodes, defaultLanguage } = discoverLanguageContent(rootDir);
  const files = readdirSync(albumsDir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("."))
    .sort();

  if (files.length === 0) {
    throw new Error("library/albums must contain at least one .md album file.");
  }

  const eventsDir = path.join(rootDir, "library", "events");

  const albums = files.map((file) => {
    const filePath = path.join(albumsDir, file);
    const sourceName = `library/albums/${file}`;
    const raw = readFileSync(filePath, "utf8");
    const { metadata } = parseMarkdownFrontmatter(raw, sourceName);

    const id = metadata.id;
    if (typeof id !== "string" || !id.trim() || !/^[a-z0-9][a-z0-9_-]*$/.test(id)) {
      throw new Error(`${sourceName}: album id must contain only lowercase ASCII letters, digits, hyphens or underscores.`);
    }
    if (`${id}.md` !== file) {
      throw new Error(`${sourceName}: album id "${id}" must match its filename "${file}".`);
    }

    if (typeof metadata.cover !== "string" || !metadata.cover.trim()) {
      throw new Error(`${sourceName}: must define a non-empty cover.`);
    }

    if (metadata.date !== undefined) {
      if (typeof metadata.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.date)) {
        throw new Error(`${sourceName}: date must be an ISO calendar date (YYYY-MM-DD).`);
      }
    }

    if (metadata.event !== undefined) {
      if (typeof metadata.event !== "string" || !metadata.event.trim()) {
        throw new Error(`${sourceName}: event reference must be a non-empty string.`);
      }
      const eventFile = path.join(eventsDir, `${metadata.event}.md`);
      if (!existsSync(eventFile)) {
        throw new Error(`${sourceName}: references unknown event "${metadata.event}" (expected ${eventFile}).`);
      }
    }

    const titleMap = resolveLocalizedValues(metadata.title, languageCodes, defaultLanguage);
    const descriptionMap = resolveLocalizedValues(metadata.description, languageCodes, defaultLanguage);

    const rawTags = metadata.tags;
    const localizedTags = {};
    for (const code of languageCodes) {
      if (Array.isArray(rawTags)) {
        localizedTags[code] = rawTags.map(String);
      } else if (rawTags && typeof rawTags === "object") {
        const list = rawTags[code] ?? rawTags[defaultLanguage] ?? [];
        localizedTags[code] = Array.isArray(list) ? list.map(String) : [];
      } else {
        localizedTags[code] = [];
      }
    }

    if (!Array.isArray(metadata.items) || metadata.items.length === 0) {
      throw new Error(`${sourceName}: items must be a non-empty array of images.`);
    }

    const items = metadata.items.map((item, index) => {
      const at = `${sourceName}.items[${index}]`;
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new Error(`${at}: item must be an object.`);
      }
      const smallWebp = item["small-webp"] ?? item.smallWebp;
      const smallAvif = item["small-avif"] ?? item.smallAvif;
      const largeWebp = item["large-webp"] ?? item.largeWebp;
      const largeAvif = item["large-avif"] ?? item.largeAvif;

      if (typeof smallWebp !== "string" || !smallWebp.trim()) {
        throw new Error(`${at}: small-webp must be a non-empty string.`);
      }
      if (typeof largeWebp !== "string" || !largeWebp.trim()) {
        throw new Error(`${at}: large-webp must be a non-empty string.`);
      }
      if (smallAvif !== undefined && (typeof smallAvif !== "string" || !smallAvif.trim())) {
        throw new Error(`${at}: small-avif must be a non-empty string.`);
      }
      if (largeAvif !== undefined && (typeof largeAvif !== "string" || !largeAvif.trim())) {
        throw new Error(`${at}: large-avif must be a non-empty string.`);
      }

      return {
        id: item.id ?? `item-${index + 1}`,
        smallWebp,
        ...(smallAvif ? { smallAvif } : {}),
        largeWebp,
        ...(largeAvif ? { largeAvif } : {}),
        image: largeWebp || smallWebp,
        type: "photo",
      };
    });

    return {
      id,
      date: metadata.date,
      cover: metadata.cover,
      event: metadata.event,
      title: titleMap,
      description: descriptionMap,
      tags: localizedTags,
      items,
    };
  });

  return albums;
}

export function computeAlbumRankings(albums, config) {
  const recentCount = config.recent?.count ?? 3;
  const topCount = config.top_library?.count ?? 3;
  const recencyWeight = config.top_library?.recency_weight ?? 0.5;
  const countWeight = config.top_library?.image_count_weight ?? 0.5;

  // 1. Recent albums: sort descending by date
  const sortedByDate = [...albums].sort((a, b) => {
    const timeA = a.date ? Date.parse(`${a.date}T00:00:00Z`) : 0;
    const timeB = b.date ? Date.parse(`${b.date}T00:00:00Z`) : 0;
    if (timeB !== timeA) return timeB - timeA;
    return a.id.localeCompare(b.id);
  });
  const recentAlbumIds = sortedByDate.slice(0, recentCount).map((a) => a.id);

  // 2. Top library albums: composite score of recency and image count
  const albumMetrics = albums.map((album) => {
    const timestamp = album.date ? Date.parse(`${album.date}T00:00:00Z`) : 0;
    const count = album.items.length;
    return { id: album.id, timestamp, count };
  });

  const timestamps = albumMetrics.map((m) => m.timestamp);
  const counts = albumMetrics.map((m) => m.count);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  const scoredAlbums = albumMetrics.map((m) => {
    const normRecency = maxTime === minTime ? 1 : (m.timestamp - minTime) / (maxTime - minTime);
    const normCount = maxCount === minCount ? 1 : (m.count - minCount) / (maxCount - minCount);
    const score = (recencyWeight * normRecency) + (countWeight * normCount);
    return { id: m.id, score, timestamp: m.timestamp, count: m.count };
  });

  scoredAlbums.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 1e-6) return b.score - a.score;
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    return a.id.localeCompare(b.id);
  });

  const topAlbumIds = scoredAlbums.slice(0, topCount).map((a) => a.id);

  return { recentAlbumIds, topAlbumIds };
}

export function loadAlbumContent(rootDir, languageCode) {
  const albums = loadAlbums(rootDir);
  const localizedAlbums = albums.map((album) => ({
    id: album.id,
    title: album.title[languageCode] ?? album.title.en ?? "",
    description: album.description[languageCode] ?? album.description.en ?? "",
    cover: album.cover,
    tags: album.tags[languageCode] ?? album.tags.en ?? [],
    date: album.date,
    event: album.event,
    items: album.items,
  }));

  return {
    media: {
      albums: localizedAlbums,
    },
  };
}

