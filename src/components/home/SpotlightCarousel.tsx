"use client";

import { useLang } from "@/context/LanguageContext";
import PageCarousel from "./PageCarousel";

export default function SpotlightCarousel() {
  const { tr, isRouteEnabled } = useLang();
  const items = isRouteEnabled
    ? tr.home.top_carousel.filter((item) => (item.enabled !== false) && isRouteEnabled(item.url))
    : tr.home.top_carousel.filter((item) => item.enabled !== false);
  if (!items.length) return null;
  return <PageCarousel items={items} dataCarousel="top_carousel" ariaLabel="Top carousel tiles" />;
}
