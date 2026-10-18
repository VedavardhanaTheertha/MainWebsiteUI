"use client";

import { useLang } from "@/context/LanguageContext";
import PageCarousel from "./PageCarousel";
import { useUiSettings } from "@/context/UiSettingsContext";

export default function SpotlightCarousel() {
  const { tr } = useLang();
  const { layoutSettings } = useUiSettings();
  if (layoutSettings.sectionHeaders && tr.home.top_carousel.length) {
    return (
      <section aria-labelledby="home-spotlight-title" className="home-spotlight mx-auto max-w-7xl">
        <header className="layout-section-header px-4 lg:px-8">
          <h2 id="home-spotlight-title" className="font-display">{tr.layout_experiments.spotlight_title}</h2>
          <p>{tr.layout_experiments.spotlight_description}</p>
        </header>
        <PageCarousel items={tr.home.top_carousel} />
      </section>
    );
  }
  return <PageCarousel items={tr.home.top_carousel} />;
}
