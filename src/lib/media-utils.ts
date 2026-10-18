import type { MediaAlbum, MediaAlbumItem } from "./content-types";

export type MediaSort = "newest" | "oldest";
export type MediaTypeFilter = "" | "photo" | "video";
export interface MediaFilters {
  from: string;
  to: string;
  event: string;
  type: MediaTypeFilter;
  sort: MediaSort;
}

export function mediaItemId(item: { id?: string }, index: number): string {
  return item.id ?? `item-${index + 1}`;
}

export function mediaDate(value?: string): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(date) && new Date(date).toISOString().slice(0, 10) === value
    ? date : null;
}

export function filterMediaAlbums(albums: MediaAlbum[], filters: MediaFilters): MediaAlbum[] {
  const from = mediaDate(filters.from);
  const to = mediaDate(filters.to);
  return albums.filter((album) => {
    const date = mediaDate(album.date);
    return (!filters.event || album.event === filters.event)
      && (!filters.type || album.items.some((item) => item.type === filters.type))
      && (from === null || (date !== null && date >= from))
      && (to === null || (date !== null && date <= to));
  }).sort((a, b) => {
    const left = mediaDate(a.date);
    const right = mediaDate(b.date);
    if (left === null) return right === null ? 0 : 1;
    if (right === null) return -1;
    return filters.sort === "oldest" ? left - right : right - left;
  });
}

export function mediaCounts(items: Pick<MediaAlbumItem, "type">[]) {
  return {
    photos: items.filter((item) => item.type === "photo").length,
    videos: items.filter((item) => item.type === "video").length,
  };
}

export function safeMediaUrl(value?: string, external = false): string | undefined {
  if (!value || value !== value.trim() || /[\s\\]/.test(value)) return undefined;
  if (!external && /^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? value : undefined;
  } catch {
    return undefined;
  }
}
