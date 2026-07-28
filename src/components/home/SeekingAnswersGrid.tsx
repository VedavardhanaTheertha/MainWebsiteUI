"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

export function SeekingAnswersGrid() {
  const { tr } = useLang();
  const section = tr.home.seekingAnswers;

  return (
    <section className="px-4 pt-8 lg:mx-auto lg:max-w-6xl lg:px-8">
      <h2 className="font-display text-xl text-[var(--color-ink-900)] lg:text-2xl">{section.heading}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {section.tiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className="flex flex-col gap-2 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-4 shadow-[var(--shadow-card)]"
          >
            <span className="font-display text-2xl text-[var(--color-saffron-600)]">{tile.glyph}</span>
            <p className="text-sm font-medium leading-snug text-[var(--color-ink-900)]">{tile.question}</p>
            <p className="text-[11px] text-[var(--color-ink-500)]">{tile.subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
