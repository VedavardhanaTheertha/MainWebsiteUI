"use client";

import { useDeferredValue, useMemo, useState } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { topAlbumIds, recentAlbumIds } from "@/gen/media/albums";
import { useUiSettings } from "@/context/UiSettingsContext";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import RailMotionControl from "@/components/RailMotionControl";
import RailNavigation from "@/components/RailNavigation";
import AdvancedFilters from "@/components/AdvancedFilters";
import { useMiniSearch } from "@/hooks/useMiniSearch";
import { getSearchProfile } from "@/lib/search";
import type { MediaAlbum } from "@/lib/content-types";
import { filterMediaAlbums, mediaCounts, type MediaFilters } from "@/lib/media-utils";
import CollectionEmptyState from "@/components/presentation/CollectionEmptyState";
import { collectionCardBodyClassName, collectionCardClassName, collectionCardImageClassName } from "@/lib/collection-presentation";

function AlbumTile({
  album,
  photoLabel,
  videoLabel,
  unknownDate,
  featured = false,
}: {
  album: MediaAlbum;
  photoLabel: string;
  videoLabel: string;
  unknownDate: string;
  featured?: boolean;
}) {
  const counts = mediaCounts(album.items);
  return (
    <Link
      href={`/albums/${album.id}`}
      className={`${collectionCardClassName(featured ? "featured" : "collection", true)} layout-info-tile ${
        featured ? "w-[82vw] max-w-[320px] shrink-0 md:w-auto md:max-w-none" : "w-full"
      }`}
    >
      <div className={collectionCardImageClassName}>
        <ContentImage
          src={album.cover}
          alt=""
          fill
          sizes={featured
            ? "(max-width: 768px) 82vw, 320px"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        />
      </div>
      <div className={collectionCardBodyClassName}>
        <span className="layout-tile-category visual-tile-badge mb-2 block w-fit rounded-full bg-[var(--color-cream-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-brand)]">{counts.photos} {photoLabel} · {counts.videos} {videoLabel}</span>
        <h3 className="layout-tile-title line-clamp-2 font-display text-lg font-bold text-[var(--color-text-primary)]">
          {album.title}
        </h3>
        <p className="layout-tile-summary mt-1 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {album.description}
        </p>
        <p className="layout-tile-footer layout-tile-date mt-2 text-xs text-[var(--color-text-muted)]">
          {album.date ? <time dateTime={album.date}>{album.date}</time> : unknownDate}
          {album.event && <span> · {album.event}</span>}
        </p>
      </div>
    </Link>
  );
}

export default function MediaAlbumsBrowser() {
  const { tr } = useLang();
  const { browserDefaults, collectionPagination } = useUiSettings();
  const defaultFilters = useMemo<MediaFilters>(
    () => ({ from: "", to: "", event: "", type: "", sort: browserDefaults.albumsSort }),
    [browserDefaults.albumsSort],
  );
  const copy = tr.media;
  const albums = copy.albums;
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MediaFilters>(defaultFilters);
  const [topPaused, setTopPaused] = useState(false);
  const [recentPaused, setRecentPaused] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const [visibleCount, setVisibleCount] = useState<number>(collectionPagination.initialVisible);
  const [previousQuery, setPreviousQuery] = useState(deferredQuery);
  const [previousFilters, setPreviousFilters] = useState(filters);

  if (previousQuery !== deferredQuery || previousFilters !== filters) {
    setPreviousQuery(deferredQuery);
    setPreviousFilters(filters);
    setVisibleCount(collectionPagination.initialVisible);
  }

  const searchConfig = useMemo(
    () => ({
      ...getSearchProfile("mediaAlbums"),
      extractField: (album: MediaAlbum, field: string) => {
        const value = album[field as keyof MediaAlbum];
        return Array.isArray(value) ? value.join(" ") : String(value ?? "");
      },
    }),
    [],
  );
  const searched = useMiniSearch(albums, deferredQuery, searchConfig);
  const filtered = filterMediaAlbums(searched, filters);
  const events = [...new Set(albums.flatMap((album) => album.event ? [album.event] : []))];
  const visible = filtered.slice(0, visibleCount);
  const topAlbums = topAlbumIds
    .map((id) => albums.find((album) => album.id === id))
    .filter((album): album is MediaAlbum => Boolean(album));
  const recentAlbums = recentAlbumIds
    .map((id) => albums.find((album) => album.id === id))
    .filter((album): album is MediaAlbum => Boolean(album));
  const topScrollRef = useAutoScrollRail(topAlbums.length, topPaused);
  const recentScrollRef = useAutoScrollRail(recentAlbums.length, recentPaused);
  const clear = () => { setQuery(""); setFilters(defaultFilters); };
  const controlClass = "min-h-11 w-full rounded-lg border border-[var(--color-line-strong)] bg-white px-3 py-2 text-sm";

  return (
    <>
      <header className="bg-[var(--color-parchment)] px-5 py-7 text-center lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-brand)]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 flex min-h-10 max-w-2xl items-center justify-center text-sm text-[var(--color-text-brand)]/75 lg:min-h-12 lg:text-base">
          {copy.description}
        </p>
      </header>

      <section className="layout-section bg-[var(--color-cream)] px-5 py-7 lg:px-8 lg:py-10" aria-labelledby="top-albums-heading">
        <div className="layout-wide mx-auto max-w-7xl">
          <h2 id="top-albums-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            {copy.top_title}
          </h2>
          <div className="relative mt-5">
          {topAlbums.length > 1 && <RailMotionControl paused={topPaused} onToggle={() => setTopPaused((paused) => !paused)} />}
          {topAlbums.length > 1 && <RailNavigation scrollRef={topScrollRef} />}
          <div
            ref={topScrollRef}
            className="layout-carousel-track -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {topAlbums.map((album) => (
              <AlbumTile
                key={album.id}
                album={album}
                photoLabel={copy.photos_label}
                videoLabel={copy.videos_label}
                unknownDate={copy.date_unknown}
                featured
              />
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="layout-section bg-[var(--color-paper)] px-5 py-7 lg:px-8 lg:py-10" aria-labelledby="recent-albums-heading">
        <div className="layout-wide mx-auto max-w-7xl">
          <h2 id="recent-albums-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            {copy.recent_title}
          </h2>
          <div className="relative mt-5">
          {recentAlbums.length > 1 && <RailMotionControl paused={recentPaused} onToggle={() => setRecentPaused((paused) => !paused)} />}
          {recentAlbums.length > 1 && <RailNavigation scrollRef={recentScrollRef} />}
          <div
            ref={recentScrollRef}
            className="layout-carousel-track -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {recentAlbums.map((album) => (
              <AlbumTile
                key={album.id}
                album={album}
                photoLabel={copy.photos_label}
                videoLabel={copy.videos_label}
                unknownDate={copy.date_unknown}
                featured
              />
            ))}
          </div>
          </div>
        </div>
      </section>

      <div className="layout-collection layout-section mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <section aria-labelledby="all-albums-heading">
          <AdvancedFilters
            active={Boolean(filters.from || filters.to || filters.event || filters.type || filters.sort !== defaultFilters.sort)}
            heading={
            <h2 id="all-albums-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
              {copy.all_title}
            </h2>
            }
            search={
            <label className="relative block w-full">
              <span className="sr-only">{copy.search_label}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search_placeholder}
                className="min-h-11 w-full rounded-xl border border-[var(--color-line-strong)] bg-white py-2.5 pl-10 pr-12 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-saffron-600)] focus:ring-2 focus:ring-[var(--color-saffron-100)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-0 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  aria-label={copy.clear_filters}
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
            }
          >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="grid gap-1 text-sm">{copy.date_from}<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className={controlClass} /></label>
            <label className="grid gap-1 text-sm">{copy.date_to}<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className={controlClass} /></label>
            <label className="grid gap-1 text-sm">{copy.event_filter}<select value={filters.event} onChange={(event) => setFilters({ ...filters, event: event.target.value })} className={controlClass}>
              <option value="">{copy.all_events}</option>
              {events.map((event) => <option key={event} value={event}>{event}</option>)}
            </select></label>
            <label className="grid gap-1 text-sm">{copy.type_filter}<select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value as MediaFilters["type"] })} className={controlClass}>
              <option value="">{copy.all_types}</option><option value="photo">{copy.photos_label}</option><option value="video">{copy.videos_label}</option>
            </select></label>
            <label className="grid gap-1 text-sm">{copy.sort_label}<select value={filters.sort} onChange={(event) => {
              const sort = event.target.value;
              if (sort === "newest" || sort === "oldest") setFilters({ ...filters, sort });
            }} className={controlClass}>
              <option value="newest">{copy.newest}</option><option value="oldest">{copy.oldest}</option>
            </select></label>
          </div>
          <button type="button" onClick={clear} className="mt-3 min-h-11 rounded-lg border border-[var(--color-line-strong)] px-4 py-2 text-sm font-semibold">{copy.clear_filters}</button>
          </AdvancedFilters>
          <p role="status" className="my-4 text-xs text-[var(--color-text-secondary)]">
            {copy.showing_template
              .replace("{shown}", String(visible.length))
              .replace("{total}", String(filtered.length))}
          </p>

          {visible.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((album) => (
                <AlbumTile
                  key={album.id}
                  album={album}
                  photoLabel={copy.photos_label}
                  videoLabel={copy.videos_label}
                  unknownDate={copy.date_unknown}
                />
              ))}
            </div>
          ) : (
            <CollectionEmptyState>
              {copy.no_results}
            </CollectionEmptyState>
          )}

          {filtered.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + collectionPagination.loadIncrement)}
              className="mx-auto mt-7 block min-h-11 rounded-full border border-[var(--color-line-strong)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--color-text-brand)] hover:border-[var(--color-saffron-600)]"
            >
              {copy.show_more}
            </button>
          )}
        </section>
      </div>
    </>
  );
}
