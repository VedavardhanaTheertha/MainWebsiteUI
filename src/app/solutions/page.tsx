"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function SolutionsPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.solutions.heading} subheading={tr.solutions.intro} />
      <section className="grid grid-cols-1 gap-3 px-4 py-6 lg:mx-auto lg:max-w-4xl lg:grid-cols-2 lg:gap-4 lg:px-8">
        {tr.solutions.categories.map((cat) => (
          <div
            key={cat.id}
            className="flex gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-4 shadow-[var(--shadow-card)]"
          >
            <span className="font-display text-2xl text-[var(--color-saffron-600)]">{cat.glyph}</span>
            <div>
              <h3 className="font-display text-base text-[var(--color-ink-900)]">{cat.title}</h3>
              <p className="mt-0.5 text-xs text-[var(--color-ink-700)]">{cat.description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
