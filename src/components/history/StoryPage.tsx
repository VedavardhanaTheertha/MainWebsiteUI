"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

/** Shared template for the six /history/* routes — parameterized by
 * pageKey, matching content.history.pages[].key. */
export function StoryPage({ pageKey }: { pageKey: string }) {
  const { tr } = useLang();
  const page = tr.history.pages.find((p) => p.key === pageKey);

  if (!page) return null;

  return (
    <div className="pb-10">
      <PageHero heading={page.title} subheading={page.intro} imageKey={page.image} />
      <section className="flex flex-col gap-4 px-4 py-6 lg:mx-auto lg:max-w-3xl lg:px-8">
        {page.entries.map((entry) => (
          <div key={entry.id} className="rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-4 shadow-[var(--shadow-card)]">
            <h3 className="font-display text-base text-[var(--color-ink-900)]">{entry.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-700)]">{entry.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
