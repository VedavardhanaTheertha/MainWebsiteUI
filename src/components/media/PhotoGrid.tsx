"use client";

import { useLang } from "@/context/LanguageContext";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

export function PhotoGrid() {
  const { tr } = useLang();
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-6 lg:mx-auto lg:max-w-5xl lg:grid-cols-4 lg:gap-4 lg:px-8">
      {tr.media.photos.map((photo) => (
        <PlaceholderImage key={photo.id} imageKey={photo.image} alt={photo.caption} aspect="1 / 1" radius="md" />
      ))}
    </div>
  );
}
