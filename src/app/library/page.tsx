"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

export default function LibraryPage() {
  const { tr } = useLang();
  const { library } = tr;

  return (
    <div className="pb-10">
      <PageHero heading={library.heading} subheading={library.intro} />
      <section className="grid grid-cols-2 gap-3 px-4 py-6 lg:mx-auto lg:max-w-5xl lg:grid-cols-5 lg:gap-5 lg:px-8">
        {library.categories.map((category) => (
          <Link
            key={category.key}
            href={`/library/${category.key}`}
            className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] shadow-[var(--shadow-card)]"
          >
            <PlaceholderImage imageKey={category.image} alt={category.title} aspect="1 / 1" radius="none" />
            <div className="p-3">
              <h3 className="text-sm font-semibold text-[var(--color-ink-900)]">{category.title}</h3>
              <p className="mt-0.5 text-xs text-[var(--color-ink-500)]">{category.kn_label}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
