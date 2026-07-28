"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function VolunteerPage() {
  const { tr } = useLang();
  const { sevaVolunteer } = tr;

  return (
    <div className="pb-10">
      <PageHero heading={sevaVolunteer.heading} subheading={sevaVolunteer.intro} />
      <section className="px-4 py-6 lg:mx-auto lg:max-w-2xl lg:px-8">
        <ol className="flex flex-col gap-3">
          {sevaVolunteer.steps.map((step, i) => (
            <li key={i} className="flex gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] text-xs font-semibold text-white">
                {i + 1}
              </span>
              <span className="text-sm text-[var(--color-ink-700)]">{step}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="mt-5 w-full rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] px-5 py-2.5 text-sm font-semibold text-white lg:w-auto"
        >
          {sevaVolunteer.ctaLabel}
        </button>
      </section>
    </div>
  );
}
