"use client";

import { Play } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

export function VideoGrid() {
  const { tr } = useLang();
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-6 lg:mx-auto lg:max-w-4xl lg:grid-cols-2 lg:gap-4 lg:px-8">
      {tr.media.videos.map((video) => (
        <div key={video.id} className="relative overflow-hidden rounded-[var(--radius-lg)]">
          <PlaceholderImage imageKey={video.thumbnail} alt={video.title} aspect="16 / 9" radius="lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-ink-900)]/60 text-white">
              <Play size={20} fill="currentColor" />
            </span>
          </div>
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-ink-900)]/80 to-transparent p-3 text-sm font-medium text-[var(--color-cream-hi)]">
            {video.title}
          </p>
        </div>
      ))}
    </div>
  );
}
