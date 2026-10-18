"use client";

import { useLang } from "@/context/LanguageContext";
import HomePageGrid from "./HomePageGrid";
import { useUiSettings } from "@/context/UiSettingsContext";

export default function HomeFeatures() {
  const { tr } = useLang();
  const { layoutSettings } = useUiSettings();
  return (
    <section data-carousel="bottom_carousel" aria-labelledby={layoutSettings.sectionHeaders ? "home-features-title" : undefined} className="home-featured-layout layout-section bg-[var(--color-sand)] py-7 mt-2">
      <div className="layout-wide mx-auto max-w-7xl px-4 lg:px-8">
        {layoutSettings.sectionHeaders && (
          <header className="layout-section-header">
            <h2 id="home-features-title" className="font-display">{tr.layout_experiments.features_title}</h2>
            <p>{tr.layout_experiments.features_description}</p>
          </header>
        )}
        <HomePageGrid items={tr.home.bottom_carousel} />
      </div>
    </section>
  );
}
