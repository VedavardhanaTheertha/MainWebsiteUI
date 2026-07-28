"use client";

import { Play } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function ChantingPlayerPage() {
  const { tr } = useLang();
  const { chantingPlayer } = tr;

  return (
    <div className="pb-10">
      <PageHero heading={chantingPlayer.heading} subheading={chantingPlayer.intro} />
      <section className="flex flex-col gap-2 px-4 py-6 lg:mx-auto lg:max-w-2xl lg:px-8">
        {chantingPlayer.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-3 shadow-[var(--shadow-card)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] text-white">
              <Play size={16} fill="currentColor" />
            </span>
            <span className="flex-1 text-sm font-medium text-[var(--color-ink-900)]">{item.title}</span>
            <span className="text-xs text-[var(--color-ink-500)]">{item.duration}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
