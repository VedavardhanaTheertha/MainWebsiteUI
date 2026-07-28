"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

/**
 * Capped at ~50vh (mobile) so the carousel below is visible without
 * scrolling, per the design review — earlier versions of this design ran
 * the hero to ~75-100% of the screen, crowding out everything else.
 */
export function Hero() {
  const { tr } = useLang();
  const hero = tr.home.hero;

  return (
    <section className="relative flex h-[50vh] min-h-[340px] items-end overflow-hidden lg:h-[62vh] lg:min-h-[420px]">
      <PlaceholderImage
        imageKey={hero.image}
        alt={hero.heading}
        aspect="auto"
        radius="none"
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/75 via-[var(--color-ink-900)]/20 to-transparent" />
      <div className="relative z-10 w-full px-5 pb-8 lg:mx-auto lg:max-w-3xl lg:px-0 lg:pb-14 lg:text-center">
        <h1 className="max-w-sm font-display text-[26px] leading-tight text-[var(--color-text-on-image)] lg:mx-auto lg:max-w-none lg:text-4xl">
          {hero.heading}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-text-on-image)]/90 lg:mx-auto lg:mt-4 lg:max-w-xl lg:text-base">
          {hero.subheading}
        </p>
        <Link
          href={hero.ctaHref}
          className="mt-4 inline-block rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] px-5 py-2.5 text-[15px] font-semibold text-white"
        >
          {hero.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
