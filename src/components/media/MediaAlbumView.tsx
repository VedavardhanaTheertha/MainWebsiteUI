"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function MediaAlbumView({ albumId }: { albumId: string }) {
  const { tr } = useLang();
  const copy = tr.media;
  const album = copy.albums.find((entry) => entry.id === albumId);

  if (!album) return null;

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

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
          {copy.album_items}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {album.items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-sm"
            >
              <div className="relative h-48 overflow-hidden bg-[var(--color-cream-soft)]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                {item.type === "video" && (
                  <>
                    <div className="absolute inset-0 grid place-items-center bg-[var(--color-ink-900)]/25 text-white">
                      <span className="grid size-12 place-items-center rounded-full bg-[var(--color-ink-900)]/65">
                        <Play size={22} fill="currentColor" aria-hidden="true" />
                      </span>
                    </div>
                    {item.duration && (
                      <span className="absolute bottom-3 right-3 rounded bg-[var(--color-ink-900)]/75 px-2 py-1 text-[10px] font-semibold text-white">
                        {item.duration}
                      </span>
                    )}
                  </>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-brand)]">
                  {item.type === "video" ? copy.video_label : copy.photo_label}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {item.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
