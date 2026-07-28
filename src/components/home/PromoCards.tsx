"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

export function PromoCards() {
  const { tr } = useLang();

  return (
    <section className="flex flex-col gap-3 px-4 pt-6 lg:mx-auto lg:max-w-6xl lg:flex-row lg:gap-5 lg:px-8">
      {tr.home.promoCards.map((card) => (
        <div
          key={card.id}
          className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-3 shadow-[var(--shadow-card)] lg:flex-1"
        >
          <PlaceholderImage
            imageKey={card.image}
            alt={card.title}
            aspect="1 / 1"
            radius="md"
            className="h-16 w-16 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-saffron-700)]">
              {card.eyebrow}
            </span>
            <h3 className="mt-0.5 truncate font-display text-base text-[var(--color-ink-900)]">
              {card.title}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-ink-700)]">{card.body}</p>
            <Link
              href={card.href}
              className="mt-1.5 inline-block text-xs font-semibold text-[var(--color-saffron-700)] underline underline-offset-2"
            >
              {card.ctaLabel}
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
