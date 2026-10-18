"use client";

import { useLang } from "@/context/LanguageContext";
import PageCarousel from "./PageCarousel";

export default function SpotlightCarousel() {
  const { tr } = useLang();
  return <PageCarousel items={tr.home.top_carousel} />;
}
