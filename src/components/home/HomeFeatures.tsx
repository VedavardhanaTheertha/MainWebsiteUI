"use client";

import { useLang } from "@/context/LanguageContext";
import HomePageGrid from "./HomePageGrid";

export default function HomeFeatures() {
  const { tr } = useLang();
  return (
    <section data-carousel="bottom_carousel" className="bg-[var(--color-sand)] py-7 mt-2">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <HomePageGrid items={tr.home.bottom_carousel} />
      </div>
    </section>
  );
}
