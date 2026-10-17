"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useDialog } from "@/hooks/useDialog";
import type { MediaAlbumItem } from "@/lib/content-types";
import { mediaItemId, safeMediaUrl } from "@/lib/media-utils";
import { mediaViewerSettings } from "@/gen/settings/ui-elements";

export type ViewerItem = MediaAlbumItem & { viewerId: string };

export function MediaTileAction({ item, onOpen }: { item: MediaAlbumItem; onOpen: () => void }) {
  const { tr } = useLang();
  if (item.type === "photo" || safeMediaUrl(item.videoUrl) || safeMediaUrl(item.externalUrl, true)) return (
    <button
      type="button"
      aria-label={`${item.type === "photo" ? tr.media.open_photo : tr.media.open_video}: ${item.title}`}
      onClick={onOpen}
      className="absolute inset-0 z-10 h-full w-full cursor-zoom-in rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
    />
  );
  return <p className="mt-3 text-sm text-[var(--color-text-muted)]">{tr.media.playback_unavailable}</p>;
}

export function MediaPlayback({ item }: { item: MediaAlbumItem }) {
  const { tr } = useLang();
  const [failed, setFailed] = useState(false);
  const videoUrl = safeMediaUrl(item.videoUrl);
  const externalUrl = safeMediaUrl(item.externalUrl, true);
  if (item.type === "photo") {
    return failed ? <p role="status" className="p-8">{tr.media.media_error}</p> : (
      <div className="relative h-[60vh] min-h-48 w-full">
        <Image
          src={item.fullImage ?? item.image}
          alt={item.caption ?? item.title}
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
          className="max-h-[60vh] w-full"
          onError={() => setFailed(true)}
        >
          <source src={videoUrl} onError={() => setFailed(true)} />
        </video>
      ) : (
        (failed || !externalUrl) && <p role="status">{failed ? tr.media.media_error : tr.media.playback_unavailable}</p>
      )}
      {externalUrl && (
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 underline">
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
      {(item.caption || item.detail) && <p className="mt-2 text-sm">{item.caption ?? item.detail}</p>}
      <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {item.duration && <div><dt className="inline font-semibold">{copy.duration_label}: </dt><dd className="inline">{item.duration}</dd></div>}
        {item.recordedAt && <div><dt className="inline font-semibold">{copy.recorded_label}: </dt><dd className="inline"><time dateTime={item.recordedAt}>{item.recordedAt}</time></dd></div>}
        {item.language && <div><dt className="inline font-semibold">{copy.language_label}: </dt><dd className="inline">{item.language}</dd></div>}
      </dl>
      {item.albumId && (
        <Link href={`/albums/${encodeURIComponent(item.albumId)}`} className="relative z-20 mt-2 inline-flex min-h-11 items-center underline">
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
  const copy = tr.media;
  const headingId = useId();
  const dialogRef = useDialog(itemId !== null, onClose);
  const start = useRef<{ x: number; y: number } | null>(null);
  const index = items.findIndex((item) => item.viewerId === itemId);
  const item = items[index];
  const canMove = (offset: number) => items.length > 1 && !!item &&
    (mediaViewerSettings.wrap || (index + offset >= 0 && index + offset < items.length));
  const move = (offset: number) => {
    if (canMove(offset)) onMove(items[(index + offset + items.length) % items.length].viewerId);
  };
  if (itemId === null) return null;
  const controlClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/40 px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <div
      className="fixed inset-0 z-[100] grid items-center overflow-y-auto bg-black/85 p-3 text-white sm:p-6"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="mx-auto w-full max-w-6xl rounded-xl bg-[var(--color-ink-900)] p-4 shadow-2xl"
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest('video, audio, input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id={headingId} className="font-display text-xl font-bold">{item?.title ?? copy.item_not_found}</h2>
          <button type="button" onClick={onClose} aria-label={copy.close_viewer} className={controlClass}><X aria-hidden="true" /></button>
        </div>
        {item && (
          <>
            <div
              className={`relative mt-4 ${item.type === "photo" ? "touch-pan-y" : ""}`}
              onTouchStart={(event) => {
                const target = event.target as HTMLElement;
                const video = target.closest("video");
                const touch = event.touches[0];
                // Leave the native video control strip to the player.
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
              <button type="button" disabled={!canMove(-1)} onClick={() => move(-1)} aria-label={copy.previous_item}
                className={`${controlClass} absolute left-1 top-1/2 z-30 -translate-y-1/2 bg-black/70 shadow-lg disabled:opacity-40 sm:left-3`}><ChevronLeft aria-hidden="true" /></button>
              <button type="button" disabled={!canMove(1)} onClick={() => move(1)} aria-label={copy.next_item}
                className={`${controlClass} absolute right-1 top-1/2 z-30 -translate-y-1/2 bg-black/70 shadow-lg disabled:opacity-40 sm:right-3`}><ChevronRight aria-hidden="true" /></button>
            </div>
            <MediaMetadata item={item} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" aria-atomic="true" className="text-sm">{copy.position_template.replace("{current}", String(index + 1)).replace("{total}", String(items.length))}</p>
              <a href={`#item=${encodeURIComponent(item.viewerId)}`} className={`${controlClass} underline`}>{copy.item_link}</a>
            </div>
          </>
        )}
        <Link href="/albums" className="mt-4 inline-flex min-h-11 items-center underline">{copy.back_to_albums}</Link>
      </div>
    </div>
  );
}

export function albumViewerItems(items: MediaAlbumItem[]): ViewerItem[] {
  return items.map((item, index) => ({ ...item, viewerId: mediaItemId(item, index) }));
}
