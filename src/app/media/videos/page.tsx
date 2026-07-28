"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { VideoGrid } from "@/components/media/VideoGrid";

export default function VideosPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.media.heading} />
      <VideoGrid />
    </div>
  );
}
