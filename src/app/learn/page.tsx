"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function LearnPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.learn.heading} subheading={tr.learn.intro} />
      <section className="flex flex-col gap-2 px-4 py-6 lg:mx-auto lg:max-w-2xl lg:px-8">
        {tr.learn.items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-4 shadow-[var(--shadow-card)]"
          >
            <div>
              <h3 className="font-display text-base text-[var(--color-ink-900)]">{item.title}</h3>
              <p className="mt-0.5 text-xs text-[var(--color-ink-700)]">{item.description}</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[var(--color-ink-500)]" />
          </Link>
        ))}
      </section>
    </div>
  );
}
