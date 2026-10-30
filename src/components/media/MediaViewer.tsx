"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useDialog } from "@/hooks/useDialog";
import type { MediaAlbumItem } from "@/lib/content-types";
import { mediaItemId, safeMediaUrl } from "@/lib/media-utils";
import { useUiSettings } from "@/context/UiSettingsContext";

export type ViewerItem = MediaAlbumItem & { viewerId: string };

export function AlbumItemOverviewImage({
  item,
  className = "h-full w-full object-cover",
}: {
  item: MediaAlbumItem;
  className?: string;
}) {
  if (item.smallAvif || item.smallWebp) {
    return (
      <picture className="block w-full">
        {item.smallAvif && <source srcSet={item.smallAvif} type="image/avif" />}
        {item.smallWebp && <source srcSet={item.smallWebp} type="image/webp" />}
        <img
          src={item.smallWebp || item.smallAvif || item.image}
          alt={item.caption ?? item.title ?? ""}
          loading="lazy"
          className={className}
        />
      </picture>
    );
  }
  return (
    <Image
      src={item.image}
      alt={item.caption ?? item.title ?? ""}
      fill
      unoptimized
      className={className}
    />
  );
}

export function MediaTileAction({ item, onOpen }: { item: MediaAlbumItem; onOpen: () => void }) {
  const { tr } = useLang();
  if (item.type === "photo" || safeMediaUrl(item.videoUrl) || safeMediaUrl(item.externalUrl, true)) return (
    <button
      type="button"
      aria-label={`${item.type === "photo" ? tr.media.open_photo : tr.media.open_video}: ${item.title ?? ""}`}
      onClick={onOpen}
      className="absolute inset-0 z-10 h-full w-full cursor-zoom-in rounded-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
    />
  );
  return <p className="mt-3 text-caption text-[var(--color-text-muted)]">{tr.media.playback_unavailable}</p>;
}

export function MediaPlayback({ item }: { item: MediaAlbumItem }) {
  const { tr } = useLang();
  const [failed, setFailed] = useState(false);
  const videoUrl = safeMediaUrl(item.videoUrl);
  const externalUrl = safeMediaUrl(item.externalUrl, true);
  if (item.type !== "video") {
    if (failed) return <p role="status" className="p-8 text-ui">{tr.media.media_error}</p>;
    if (item.largeAvif || item.largeWebp) {
      return (
        <div className="relative flex min-h-48 max-h-[80vh] w-full items-center justify-center p-1 sm:p-2">
          <picture className="flex max-h-[80vh] max-w-full items-center justify-center">
            {item.largeAvif && <source srcSet={item.largeAvif} type="image/avif" />}
            {item.largeWebp && <source srcSet={item.largeWebp} type="image/webp" />}
            <img
              src={item.largeWebp || item.largeAvif || item.image}
              alt={item.caption ?? item.title ?? ""}
              className="max-h-[80vh] w-auto max-w-full object-contain shadow-2xl select-none"
              onError={() => setFailed(true)}
            />
          </picture>
        </div>
      );
    }
    return (
      <div className="relative h-[75vh] min-h-48 w-full">
        <Image
          src={item.fullImage ?? item.image}
          alt={item.caption ?? item.title ?? ""}
          fill
          unoptimized
          sizes="100vw"
          className="object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }
  return (
    <div className="grid min-h-48 place-items-center gap-4 p-4">
      {videoUrl && !failed ? (
        <video
          key={videoUrl}
          controls
          playsInline
          preload="metadata"
          poster={item.image}
          aria-label={item.title}
          className="max-h-[75vh] w-full"
          onError={() => setFailed(true)}
        >
          <source src={videoUrl} onError={() => setFailed(true)} />
        </video>
      ) : (
        (failed || !externalUrl) && <p role="status" className="text-ui">{failed ? tr.media.media_error : tr.media.playback_unavailable}</p>
      )}
      {externalUrl && (
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border border-white/40 px-4 py-2 text-ui underline">
          {tr.media.open_video}
        </a>
      )}
    </div>
  );
}

export function MediaMetadata({ item }: { item: MediaAlbumItem }) {
  const { tr } = useLang();
  const copy = tr.media;
  return (
    <>
      {(item.caption || item.detail) && <p className="mt-1 text-caption text-white/90">{item.caption ?? item.detail}</p>}
      <dl className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-micro text-white/70">
        {item.duration && <div><dt className="inline font-semibold">{copy.duration_label}: </dt><dd className="inline">{item.duration}</dd></div>}
        {item.recordedAt && <div><dt className="inline font-semibold">{copy.recorded_label}: </dt><dd className="inline"><time dateTime={item.recordedAt}>{item.recordedAt}</time></dd></div>}
        {item.language && <div><dt className="inline font-semibold">{copy.language_label}: </dt><dd className="inline">{item.language}</dd></div>}
      </dl>
      {item.albumId && (
        <Link href={`/albums/${encodeURIComponent(item.albumId)}`} className="relative z-20 mt-1 inline-flex min-h-11 items-center text-caption text-[var(--color-saffron-300)] underline">
          {copy.parent_album}
        </Link>
      )}
    </>
  );
}

export default function MediaViewer({
  items, itemId, onClose, onMove,
}: {
  items: ViewerItem[];
  itemId: string | null;
  onClose: () => void;
  onMove: (id: string) => void;
}) {
  const { tr } = useLang();
  const { mediaViewerSettings } = useUiSettings();
  const copy = tr.media;
  const headingId = useId();
  const dialogRef = useDialog(itemId !== null, onClose);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const index = items.findIndex((item) => item.viewerId === itemId);
  const item = items[index];

  const canMove = (offset: number) => items.length > 1 && !!item &&
    (mediaViewerSettings.wrap || (index + offset >= 0 && index + offset < items.length));

  const move = (offset: number) => {
    if (canMove(offset)) onMove(items[(index + offset + items.length) % items.length].viewerId);
  };

  if (itemId === null) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col justify-between bg-black/95 text-white backdrop-blur-md select-none"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative flex h-full w-full flex-col justify-between p-2 sm:p-4"
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest('video, audio, input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {/* Top Minimal Header: Title, Position Counter & Close Button */}
        <div className="z-30 flex items-center justify-between gap-3 px-2 py-1.5 sm:px-4">
          <Link href="/albums" className="sr-only" tabIndex={-1} aria-hidden="true" />

          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <h2 id={headingId} className="truncate font-display text-body sm:text-nav font-bold text-white">
              {!item ? copy.item_not_found : (item.title ?? "")}
            </h2>
            {index >= 0 && (
              <p
                aria-live="polite"
                aria-atomic="true"
                className="shrink-0 bg-white/10 px-2 py-0.5 text-micro font-medium text-white/80"
              >
                {copy.position_template.replace("{current}", String(index + 1)).replace("{total}", String(items.length))}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close_viewer}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-500)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {!item && (
          <div className="flex flex-1 items-center justify-center p-8">
            <p role="status" className="text-ui text-white/80">
              {copy.item_not_found}
            </p>
          </div>
        )}

        {/* Center Stage: Photo with Chevrons and Swipe */}
        {item && (
          <div
            className={`relative flex flex-1 items-center justify-center overflow-hidden w-full ${item.type === "photo" ? "touch-pan-y touch-pinch-zoom" : ""}`}
            onTouchStart={(event) => {
              const target = event.target as HTMLElement;
              const video = target.closest("video");
              const touch = event.touches[0];
              if (target.closest("a, button") || event.touches.length !== 1 ||
                (video && touch.clientY >= video.getBoundingClientRect().bottom - mediaViewerSettings.videoControlExclusionPx)) {
                start.current = null;
                return;
              }
              start.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchEnd={(event) => {
              const end = event.changedTouches[0];
              if (start.current && end) {
                const dx = end.clientX - start.current.x;
                const dy = end.clientY - start.current.y;
                if (Math.abs(dx) > mediaViewerSettings.swipeThresholdPx && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
              }
              start.current = null;
            }}
            onTouchCancel={() => { start.current = null; }}
          >
            <MediaPlayback key={item.viewerId} item={item} />

            {/* Left Chevron (matches test /absolute left-1 top-1\/2/) */}
            <button
              type="button"
              disabled={!canMove(-1)}
              onClick={() => move(-1)}
              aria-label={copy.previous_item}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-30 inline-flex min-h-11 min-w-11 items-center justify-center border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-xs transition hover:bg-black/90 disabled:opacity-20 sm:left-3"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Right Chevron (matches test /absolute right-1 top-1\/2/) */}
            <button
              type="button"
              disabled={!canMove(1)}
              onClick={() => move(1)}
              aria-label={copy.next_item}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-30 inline-flex min-h-11 min-w-11 items-center justify-center border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-xs transition hover:bg-black/90 disabled:opacity-20 sm:right-3"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Bottom Area: Metadata & Interactive Filmstrip Ribbon */}
        {item && (
          <div className="z-30 mt-2 flex flex-col gap-2 px-2 sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
              <div className="min-w-0 flex-1">
                <MediaMetadata item={item} />
              </div>
              <a
                href={`#item=${encodeURIComponent(item.viewerId)}`}
                className="shrink-0 text-caption text-white/70 hover:text-white underline"
              >
                {copy.item_link}
              </a>
            </div>

            {/* Interactive Filmstrip Thumbnail Ribbon */}
            {items.length > 1 && (
              <div
                ref={filmstripRef}
                className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none [scrollbar-width:_none]"
              >
                {items.map((it, idx) => {
                  const isActive = idx === index;
                  const thumb = it.smallWebp || it.smallAvif || it.image;
                  return (
                    <button
                      key={it.viewerId}
                      type="button"
                      aria-label={`${it.title || copy.photo_label} (${idx + 1})`}
                      onClick={() => onMove(it.viewerId)}
                      className={`relative h-11 w-14 shrink-0 overflow-hidden border transition-all ${
                        isActive
                          ? "border-[var(--color-saffron-500)] opacity-100 ring-2 ring-[var(--color-saffron-500)]"
                          : "border-white/20 opacity-40 hover:opacity-80"
                      }`}
                    >
                      <img
                        src={thumb}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function albumViewerItems(items: MediaAlbumItem[]): ViewerItem[] {
  return items.map((item, index) => ({ ...item, viewerId: mediaItemId(item, index) }));
}
