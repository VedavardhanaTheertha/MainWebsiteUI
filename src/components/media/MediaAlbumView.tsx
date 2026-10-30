"use client";

import { Calendar, Images, ZoomIn } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import MediaViewer, { albumViewerItems, AlbumItemOverviewImage, MediaTileAction } from "./MediaViewer";
import { useMediaViewer } from "./useMediaViewer";

export default function MediaAlbumView({ albumId }: { albumId: string }) {
  const { tr } = useLang();
  const copy = tr.media;
  const album = copy.albums.find((entry) => entry.id === albumId);
  const viewer = useMediaViewer();

  if (!album) {
    return (
      <div className="layout-wide layout-section mx-auto max-w-7xl px-4 py-12 text-center">
        <p role="status" className="text-body text-[var(--color-text-secondary)]">
          {copy.album_not_found}
        </p>
      </div>
    );
  }

  const items = albumViewerItems(album.items);

  return (
    <>
      {/* Compact Top Navigation & Metadata Header (Space-efficient, no rounded corners) */}
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-parchment)]/95 backdrop-blur-md px-4 py-2.5 sm:px-6 lg:px-8 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5">
          {/* Album title */}
          <div className="flex min-w-0 flex-1 items-center">
            <h1 className="truncate font-display text-nav sm:text-body lg:text-xl font-bold text-[var(--color-text-primary)]">
              {album.title}
            </h1>
          </div>

          {/* Compact badges: date and photo count */}
          <div className="flex shrink-0 items-center gap-2">
            {album.date && (
              <span className="inline-flex items-center gap-1 border border-[var(--color-line)] bg-[var(--color-cream-soft)] px-2 py-0.5 text-micro font-medium text-[var(--color-text-secondary)]">
                <Calendar className="h-3 w-3 text-[var(--color-text-brand)]" aria-hidden="true" />
                <span>{album.date}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 border border-[var(--color-line)] bg-[var(--color-cream-soft)] px-2 py-0.5 text-micro font-semibold text-[var(--color-text-brand)]">
              <Images className="h-3 w-3" aria-hidden="true" />
              <span>
                {items.length} {copy.photos_label}
              </span>
            </span>
          </div>
        </div>

        {/* Optional 1-line description */}
        {album.description && (
          <div className="mx-auto mt-1 max-w-7xl">
            <p className="line-clamp-1 text-caption text-[var(--color-text-secondary)]">
              {album.description}
            </p>
          </div>
        )}
      </header>

      {/* Main Editorial Masonry Gallery (Natural aspect ratios, sharp clean edges) */}
      <main className="layout-wide layout-section mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4 [column-fill:_balance]">
          {items.map((item, index) => (
            <div
              key={item.viewerId}
              className="group relative mb-3 sm:mb-4 break-inside-avoid overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream-soft)] shadow-xs transition duration-300 hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--color-saffron-600)]"
            >
              {/* Natural aspect ratio photo container */}
              <div className="relative w-full overflow-hidden">
                <AlbumItemOverviewImage
                  item={item}
                  className="block h-auto w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.03]"
                />

                {/* Floating ambient hover overlay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                />

                {/* Hover zoom icon badge (sharp edges) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center bg-black/50 text-white backdrop-blur-xs opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </div>

                {/* Video badge if item is video */}
                {item.type === "video" && (
                  <div className="absolute left-2.5 top-2.5 bg-black/70 px-2 py-0.5 text-badge font-bold uppercase tracking-wide text-white backdrop-blur-xs">
                    {copy.video_label}
                  </div>
                )}

                {/* Hover caption / title overlay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <p className="line-clamp-2 text-caption font-semibold leading-snug drop-shadow-xs">
                    {item.title || `${copy.photo_label} ${index + 1}`}
                  </p>
                </div>
              </div>

              {/* Accessible Click Action to open full lightbox */}
              <MediaTileAction
                item={item}
                onOpen={() => viewer.open(item.viewerId)}
              />
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p role="status" className="py-16 text-center text-ui text-[var(--color-text-secondary)]">
            {copy.no_media_results}
          </p>
        )}
      </main>

      {/* Cinematic Darkroom Lightbox with Filmstrip */}
      <MediaViewer
        items={items}
        itemId={viewer.itemId}
        onClose={viewer.close}
        onMove={viewer.move}
      />
    </>
  );
}
