"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

/** Shared detail-page template for each of the 5 library categories —
 * parameterized by categoryKey so adding a 6th category is a content change
 * (content/*.yml + one new thin route file), not a new component. */
export function LibraryCategoryPage({ categoryKey }: { categoryKey: string }) {
  const { tr } = useLang();
  const category = tr.library.categories.find((c) => c.key === categoryKey);

  if (!category) return null;

  return (
    <div>
      <PageHero heading={category.title} subheading={category.kn_label} imageKey={category.image} />
      <div className="px-4 py-6 lg:mx-auto lg:max-w-4xl lg:px-8">
        <p className="text-sm text-[var(--color-ink-700)]">{category.description}</p>
        <div className="mt-5 flex flex-col divide-y divide-[var(--color-line-soft)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] shadow-[var(--shadow-card)]">
          {category.items.map((item) => (
            <div key={item.id} className="px-4 py-3.5">
              <p className="text-sm font-semibold text-[var(--color-ink-900)]">{item.title}</p>
              <p className="mt-0.5 text-xs text-[var(--color-ink-500)]">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
