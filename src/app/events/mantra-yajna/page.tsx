"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function MantraYajnaPage() {
  const { tr } = useLang();
  const { mantraYajna } = tr;

  return (
    <div className="pb-10">
      <PageHero heading={mantraYajna.heading} subheading={mantraYajna.subheading} imageKey={mantraYajna.image} />
      <section className="px-4 py-6 lg:mx-auto lg:max-w-2xl lg:px-8">
        <p className="text-sm leading-relaxed text-[var(--color-ink-700)]">{mantraYajna.body}</p>
        <button
          type="button"
          className="mt-5 rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {mantraYajna.ctaLabel}
        </button>
      </section>
    </div>
  );
}
