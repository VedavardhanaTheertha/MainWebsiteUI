"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { topAlbumIds, recentAlbumIds } from "@/gen/media/albums";
import { collectionPagination } from "@/gen/settings/ui-elements";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import { useMiniSearch } from "@/hooks/useMiniSearch";
import type { MediaAlbum } from "@/lib/content-types";

function AlbumTile({
  album,
  openLabel,
  itemLabel,
  featured = false,
}: {
  album: MediaAlbum;
  openLabel: string;
  itemLabel: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/albums/${album.id}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-saffron-600)] hover:shadow-lg ${
        featured ? "h-80" : "h-[360px]"
      } ${
        featured ? "w-[82vw] max-w-[320px] shrink-0 md:w-auto md:max-w-none" : "w-full"
      }`}
    >
      <div className="relative h-40 overflow-hidden bg-[var(--color-cream-soft)]">
        <Image
          src={album.cover}
          alt=""
          fill
          sizes={featured
            ? "(max-width: 768px) 82vw, 320px"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/65 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-brand)]">
          {album.items.length} {itemLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-lg font-bold text-[var(--color-text-primary)]">
          {album.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {album.description}
        </p>
        <span className="mt-auto inline-block pt-3 text-xs font-semibold text-[var(--color-text-brand)]">
          {openLabel}
        </span>
      </div>
    </Link>
  );
}

export default function MediaAlbumsBrowser() {
  const { tr } = useLang();
  const copy = tr.media;
  const albums = copy.albums;
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [visibleCount, setVisibleCount] = useState<number>(collectionPagination.initialVisible);
  const [previousQuery, setPreviousQuery] = useState(deferredQuery);

  if (previousQuery !== deferredQuery) {
    setPreviousQuery(deferredQuery);
    setVisibleCount(collectionPagination.initialVisible);
  }

  const searchConfig = useMemo(
    () => ({
      fields: ["title", "description", "tags"],
      boost: { title: 3, tags: 2, description: 1 },
      extractField: (album: MediaAlbum, field: string) => {
        const value = album[field as keyof MediaAlbum];
        return Array.isArray(value) ? value.join(" ") : String(value ?? "");
      },
    }),
    [],
  );
  const filtered = useMiniSearch(albums, deferredQuery, searchConfig);
  const visible = filtered.slice(0, visibleCount);
  const topAlbums = topAlbumIds
    .map((id) => albums.find((album) => album.id === id))
    .filter((album): album is MediaAlbum => Boolean(album));
  const recentAlbums = recentAlbumIds
    .map((id) => albums.find((album) => album.id === id))
    .filter((album): album is MediaAlbum => Boolean(album));
  const topScrollRef = useAutoScrollRail(topAlbums.length);
  const recentScrollRef = useAutoScrollRail(recentAlbums.length);

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

      <section className="bg-[var(--color-cream)] px-5 py-7 lg:px-8 lg:py-10" aria-labelledby="top-albums-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="top-albums-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            {copy.top_title}
          </h2>
          <div
            ref={topScrollRef}
            className="mt-5 -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {topAlbums.map((album) => (
              <AlbumTile
                key={album.id}
                album={album}
                openLabel={copy.open_album}
                itemLabel={copy.album_items}
                featured
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-paper)] px-5 py-7 lg:px-8 lg:py-10" aria-labelledby="recent-albums-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="recent-albums-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            {copy.recent_title}
          </h2>
          <div
            ref={recentScrollRef}
            className="mt-5 -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {recentAlbums.map((album) => (
              <AlbumTile
                key={album.id}
                album={album}
                openLabel={copy.open_album}
                itemLabel={copy.album_items}
                featured
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <section aria-labelledby="all-albums-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="all-albums-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
              {copy.all_title}
            </h2>
            <label className="relative block w-full sm:max-w-md">
              <span className="sr-only">{copy.search_label}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search_placeholder}
                className="w-full rounded-xl border border-[var(--color-line-strong)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-saffron-600)] focus:ring-2 focus:ring-[var(--color-saffron-100)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  aria-label={copy.search_label}
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>

          <p className="my-4 text-xs text-[var(--color-text-secondary)]">
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
                  openLabel={copy.open_album}
                  itemLabel={copy.album_items}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center text-sm text-[var(--color-text-secondary)]">
              {copy.no_results}
            </p>
          )}

          {filtered.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + collectionPagination.loadIncrement)}
              className="mx-auto mt-7 block rounded-full border border-[var(--color-line-strong)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--color-text-brand)] hover:border-[var(--color-saffron-600)]"
            >
              {copy.show_more}
            </button>
          )}
        </section>
      </div>
    </>
  );
}
