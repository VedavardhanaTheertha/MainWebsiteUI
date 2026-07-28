"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLang } from "@/context/LanguageContext";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { selectActiveItems } from "@/lib/scheduler";

/**
 * SRS 2.1: 5-10 active items, chosen by the scheduler (pinned-today >
 * evergreen > active date-range > seeded-random padding). Content authors
 * add as many candidate items as they like to content/*.yml — this decides
 * which ones actually show today.
 */
export function Carousel() {
  const { tr, lang } = useLang();
  const exploreLabel = lang === "kn" ? "ಅನ್ವೇಷಿಸಿ" : "Explore";

  const items = useMemo(
    () => selectActiveItems(tr.home.carousel1.items, { min: 5, max: 10 }),
    [tr.home.carousel1.items]
  );

  return (
    <section className="px-4 pt-5 lg:px-8 lg:pt-8">
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:mx-auto lg:max-w-6xl lg:grid lg:snap-none lg:grid-cols-3 lg:gap-5 lg:overflow-visible xl:grid-cols-5"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group relative flex h-56 w-[78vw] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] sm:w-72 lg:h-64 lg:w-auto"
          >
            <PlaceholderImage
              imageKey={item.bg}
              alt={item.title}
              aspect="auto"
              radius="lg"
              className="absolute inset-0 h-full w-full"
            />
            <div className="absolute inset-0 rounded-[var(--radius-lg)] bg-gradient-to-t from-[var(--color-ink-900)]/80 via-[var(--color-ink-900)]/20 to-transparent" />
            <div className="relative z-10 p-4">
              <span className="text-[11px] font-semibold tracking-wide text-[var(--color-saffron-200)]">
                {item.tag}
              </span>
              <h3 className="mt-1 font-display text-xl text-[var(--color-text-on-image)]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-on-image)]/85">{item.summary}</p>
              <span className="mt-2 inline-block text-xs font-semibold text-[var(--color-cream-hi)] underline underline-offset-2">
                {exploreLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
