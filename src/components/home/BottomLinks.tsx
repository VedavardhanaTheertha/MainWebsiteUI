"use client";

import { useLang } from "@/context/LanguageContext";
import HomePageGrid from "./HomePageGrid";

export default function BottomLinks() {
  const { tr } = useLang();
  const home = tr.home;
  return (
    <div className="w-full bg-transparent px-4 lg:px-8 pt-4 pb-6 sm:pb-8">
      <div className="layout-wide max-w-7xl mx-auto">
        <section data-carousel="explore_carousel" aria-labelledby="home-explore-title" className="layout-section mb-6 sm:mb-8">
          <header className="layout-section-header text-center mb-4">
            <p className="font-body text-micro tracking-[.2em] uppercase text-[var(--color-text-brand)] font-bold mb-1">{home.explore_label}</p>
            <h2 id="home-explore-title" className="font-display font-bold text-[var(--color-text-primary)] text-2xl sm:text-3xl leading-tight">{home.explore_title}</h2>
          </header>
          <HomePageGrid items={home.explore_carousel} />
        </section>
        {home.remidies_carousel && home.remidies_carousel.length > 0 && (
          <section data-carousel="remidies_carousel" aria-labelledby="home-remedies-title" className="layout-section">
            <header className="layout-section-header text-center mb-4">
              <p className="font-body text-micro tracking-[.2em] uppercase text-[var(--color-text-brand)] font-bold mb-1">{home.guidance_label}</p>
              <h2 id="home-remedies-title" className="font-display font-bold text-[var(--color-text-primary)] text-2xl sm:text-3xl leading-tight">{home.guidance_title}</h2>
            </header>
            <HomePageGrid items={home.remidies_carousel} showFootnotes={false} />
          </section>
        )}
      </div>
    </div>
  );
}
