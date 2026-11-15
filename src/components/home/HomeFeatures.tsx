"use client";

import { useLang } from "@/context/LanguageContext";
import HomePageGrid from "./HomePageGrid";

export default function HomeFeatures() {
  const { tr, isRouteEnabled } = useLang();
  const items = isRouteEnabled
    ? tr.home.bottom_carousel.filter((item) => (item.enabled !== false) && isRouteEnabled(item.url))
    : tr.home.bottom_carousel;
  if (!items.length) return null;
  return (
    <section data-carousel="bottom_carousel" className="home-featured-layout layout-section bg-transparent pt-1 pb-4 sm:pt-2 sm:pb-5">
      <div className="layout-wide mx-auto max-w-7xl px-4 lg:px-8">
        <HomePageGrid items={items} />
      </div>
    </section>
  );
}
