"use client";

import { useLang } from "@/context/LanguageContext";
import HomePageGrid from "./HomePageGrid";

export default function BottomLinks() {
  const { tr } = useLang();
  const home = tr.home;
  return (
    <div className="w-full bg-[var(--color-cream)] px-4 lg:px-8 pt-6 pb-6">
      <div className="max-w-7xl mx-auto">
        <section data-carousel="explore_carousel" aria-labelledby="home-explore-title" className="mb-10">
          <p className="font-body text-[10px] tracking-[.25em] uppercase text-[var(--color-text-brand)] font-semibold mb-1 text-center">{home.explore_label}</p>
          <h2 id="home-explore-title" className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-4 lg:mb-8 text-center">{home.explore_title}</h2>
          <HomePageGrid items={home.explore_carousel} />
        </section>
        <section data-carousel="remidies_carousel" aria-labelledby="home-remedies-title">
          <p className="font-body text-[10.5px] tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold lg:text-center">{home.guidance_label}</p>
          <h2 id="home-remedies-title" className="font-display text-2xl text-[var(--color-text-primary)] mt-1 mb-3 lg:text-center">{home.guidance_title}</h2>
          <HomePageGrid items={home.remidies_carousel} />
        </section>
      </div>
    </div>
  );
}
