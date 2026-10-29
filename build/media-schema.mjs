function fail(location, message) {
  throw new Error(`${location}: ${message}`);
}

function text(record, key, location, required = false) {
  const value = record[key];
  if (value === undefined && !required) return;
  if (typeof value !== "string" || !value.trim()) fail(location, `${key} must be a non-empty string.`);
}

function date(record, key, location) {
  text(record, key, location);
  const value = record[key];
  if (value === undefined) return;
  const timestamp = /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(`${value}T00:00:00Z`) : NaN;
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    fail(location, `${key} must be a real ISO calendar date (YYYY-MM-DD).`);
  }
}

function url(record, key, location, external = false) {
  text(record, key, location);
  const value = record[key];
  if (value === undefined) return;
  if (!/[\s\\]/.test(value)) {
    if (!external && /^\/(?!\/)/.test(value)) return;
    try {
      const parsed = new URL(value);
      if (parsed.protocol === "https:" && !parsed.username && !parsed.password) return;
    } catch { /* Report the same validation error for all invalid URLs. */ }
  }
  fail(location, `${key} must be ${external ? "an HTTPS URL" : "a root-relative path or HTTPS URL"} without credentials, spaces or backslashes.`);
}

function list(value, location) {
  if (!Array.isArray(value)) fail(location, "must be an array.");
}

function object(value, location) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(location, "must be an object.");
}

function identity(record, location) {
  text(record, "id", location);
  if (record.id !== undefined && !/^[a-z0-9][a-z0-9_-]*$/.test(record.id)) {
    fail(location, "id must contain only lowercase ASCII letters, digits, hyphens or underscores.");
  }
}

function items(records, location, albumIds) {
  list(records, location);
  const ids = new Set();
  records.forEach((record, index) => {
    const at = `${location}[${index}]`;
    object(record, at);
    identity(record, at);
    const id = record.id ?? `item-${index + 1}`;
    if (ids.has(id)) fail(at, `duplicate item id "${id}".`);
    ids.add(id);

    const smallWebp = record["small-webp"] ?? record.smallWebp;
    const smallAvif = record["small-avif"] ?? record.smallAvif;
    const largeWebp = record["large-webp"] ?? record.largeWebp;
    const largeAvif = record["large-avif"] ?? record.largeAvif;

    if (smallWebp !== undefined || smallAvif !== undefined || largeWebp !== undefined || largeAvif !== undefined) {
      for (const [k, v] of [
        ["small-webp", smallWebp],
        ["small-avif", smallAvif],
        ["large-webp", largeWebp],
        ["large-avif", largeAvif],
      ]) {
        if (typeof v !== "string" || !v.trim()) fail(at, `${k} must be a non-empty string.`);
      }
    } else {
      for (const key of ["title", "detail", "image"]) text(record, key, at, true);
      for (const key of ["caption", "language", "albumId"]) text(record, key, at);
      if (record.albumId !== undefined && !albumIds.has(record.albumId)) fail(at, `unknown albumId "${record.albumId}".`);
      date(record, "recordedAt", at);
      url(record, "fullImage", at);
      const type = record.type;
      if (type !== "photo" && type !== "video") fail(at, 'type must be "photo" or "video".');
      if (type === "video") {
        const durationKey = "duration";
        text(record, durationKey, at);
        if (record[durationKey] !== undefined && !/^\d+:[0-5]\d(?::[0-5]\d)?$/.test(record[durationKey])) {
          fail(at, `${durationKey} must use minutes:seconds or hours:minutes:seconds.`);
        }
        url(record, "videoUrl", at);
        url(record, "externalUrl", at, true);
      } else if (record.videoUrl !== undefined || record.externalUrl !== undefined) {
        fail(at, "photo records must not define video playback URLs.");
      }
    }
  });
}

export function validateMedia(media, source = "media", { existingEventSlugs } = {}) {
  object(media, source);
  list(media.albums, `${source}.albums`);
  const albumIds = new Set();
  media.albums.forEach((album, index) => {
    const at = `${source}.albums[${index}]`;
    object(album, at);
    identity(album, at);
    text(album, "id", at, true);
    if (albumIds.has(album.id)) fail(at, `duplicate album id "${album.id}".`);
    albumIds.add(album.id);
    for (const key of ["title", "description", "cover"]) text(album, key, at, true);
    text(album, "event", at);
    if (album.event && existingEventSlugs && !existingEventSlugs.has(album.event)) {
      fail(at, `references unknown event "${album.event}".`);
    }
    date(album, "date", at);
    list(album.tags, `${at}.tags`);
    if (album.tags.some((tag) => typeof tag !== "string" || !tag.trim())) fail(at, "tags must contain non-empty strings.");
  });
  media.albums.forEach((album, index) => items(album.items, `${source}.albums[${index}].items`, albumIds));
}
