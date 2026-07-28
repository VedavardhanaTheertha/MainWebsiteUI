"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { PhotoGrid } from "@/components/media/PhotoGrid";

export default function PhotosPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.media.heading} />
      <PhotoGrid />
    </div>
  );
}
