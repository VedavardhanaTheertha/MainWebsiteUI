"use client";

import { useLang } from "@/context/LanguageContext";
import HomePageGrid from "./HomePageGrid";

export default function HomeFeatures() {
  const { tr } = useLang();
  return (
    <section data-carousel="bottom_carousel" className="home-featured-layout layout-section bg-transparent py-5 mt-1 sm:py-6">
      <div className="layout-wide mx-auto max-w-7xl px-4 lg:px-8">
        <HomePageGrid items={tr.home.bottom_carousel} />
      </div>
    </section>
  );
}
