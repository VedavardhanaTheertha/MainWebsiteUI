"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { ContactRows } from "@/components/shared/ContactRows";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

export default function DirectionsPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.directions.heading} subheading={tr.directions.intro} />
      <div className="px-4 pt-6 lg:mx-auto lg:max-w-xl lg:px-8">
        <PlaceholderImage imageKey="map-embed" alt="Map to Shri Shiroor Matha" aspect="16 / 9" radius="lg" />
      </div>
      <ContactRows rows={tr.directions.rows} />
    </div>
  );
}
