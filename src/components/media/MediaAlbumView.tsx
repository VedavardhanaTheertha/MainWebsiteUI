"use client";

import ContentImage from "@/components/presentation/ContentImage";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import MediaViewer, { albumViewerItems, MediaMetadata, MediaTileAction } from "./MediaViewer";
import { useMediaViewer } from "./useMediaViewer";

export default function MediaAlbumView({ albumId }: { albumId: string }) {
  const { tr } = useLang();
  const copy = tr.media;
  const album = copy.albums.find((entry) => entry.id === albumId);
  const viewer = useMediaViewer();

  if (!album) return (
    <div className="layout-wide layout-section mx-auto max-w-7xl p-8">
      <p role="status">{copy.album_not_found}</p>
      <Link href="/albums" className="inline-flex min-h-11 items-center underline">{copy.back_to_albums}</Link>
    </div>
  );
  const items = albumViewerItems(album.items);

  return (
    <>
      <header className="bg-[var(--color-parchment)] px-5 py-7 text-center lg:py-10">
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl">
          {album.title}
        </h1>
        <p className="mx-auto mt-3 flex min-h-10 max-w-2xl items-center justify-center text-sm text-[var(--color-text-brand)]/75 lg:min-h-12 lg:text-base">
          {album.description}
        </p>
      </header>

      <div className="layout-wide layout-section mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <Link href="/albums" className="mb-4 inline-flex min-h-11 items-center font-semibold text-[var(--color-text-brand)] underline">{copy.back_to_albums}</Link>
        <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
          {copy.album_items}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.viewerId}
              className="layout-info-tile visual-tile relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-sm"
            >
              <div className="visual-tile-art relative h-48 overflow-hidden bg-[var(--color-cream-soft)]">
                <ContentImage
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="visual-tile-body p-4">
                <span className="layout-tile-category visual-tile-badge mb-2 inline-block rounded-full bg-[var(--color-cream-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-brand)]">{item.type === "video" ? copy.video_label : copy.photo_label}</span>
                <h3 className="layout-tile-title font-display text-lg font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <div className="layout-tile-footer"><MediaMetadata item={item} /></div>
                <div className="layout-tile-actions"><MediaTileAction item={item} onOpen={() => viewer.open(item.viewerId)} /></div>
              </div>
            </article>
          ))}
        </div>
        {items.length === 0 && <p role="status" className="py-8">{copy.no_media_results}</p>}
      </div>
      <MediaViewer items={items} itemId={viewer.itemId} onClose={viewer.close} onMove={viewer.move} />
    </>
  );
}
