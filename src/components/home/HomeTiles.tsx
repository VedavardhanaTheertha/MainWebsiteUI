"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import type { HomeIconCard } from "@/lib/content-types";

let basePath = "";
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  basePath = require("@/gen/content")?.siteConfig?.basePath ?? "";
} catch {
  basePath = "";
}

const TONES: Record<HomeIconCard["tone"], { bg: string; color: string }> = {
  saffron: { bg: "var(--color-saffron-50)", color: "var(--color-saffron-600)" },
  green: { bg: "var(--color-saffron-50)", color: "var(--color-saffron-600)" },
  amber: { bg: "var(--color-saffron-50)", color: "var(--color-saffron-600)" },
  rose: { bg: "var(--color-saffron-50)", color: "var(--color-saffron-600)" },
  plum: { bg: "var(--color-saffron-50)", color: "var(--color-saffron-600)" },
};

function getMenuIconSrc(icon: string): string {
  const filename = icon.endsWith(".svg") ? icon : `${icon}.svg`;
  return `${basePath}/icons/menu/${filename}`;
}

export default function HomeTiles() {
  const { tr, isRouteEnabled } = useLang();
  const items = isRouteEnabled
    ? tr.home.icon_carousel.filter((t) => (t.enabled !== false) && isRouteEnabled(t.url))
    : tr.home.icon_carousel.filter((t) => t.enabled !== false);
  if (!items.length) return null;
  return (
      <div className="xl:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-cream)]/80 backdrop-blur-md border-t border-[var(--color-line)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto">
          <section data-carousel="icon_carousel" className="grid grid-cols-5 gap-1.5 px-3 py-2 sm:gap-3 sm:px-3.5">
            {items.map((t) => {
              const tone = TONES[t.tone] ?? TONES.saffron;
              const iconSrc = getMenuIconSrc(t.icon);
              return (
                <Link
                  key={t.id}
                  href={t.url}
                  aria-label={t.title}
                  className="min-w-0 min-h-11 flex flex-col items-center justify-center rounded-[17px] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                >
                  <span
                    className="size-11 shrink-0 rounded-[17px] flex items-center justify-center transition-transform active:scale-[.93] min-[360px]:size-12 sm:size-[54px]"
                    style={{ background: tone.bg }}
                  >
                    <img
                      src={iconSrc}
                      alt=""
                      width={22}
                      height={22}
                      className="size-[22px] min-[360px]:size-6 sm:size-7 object-contain select-none pointer-events-none"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 text-center font-body text-[10px] min-[360px]:text-[11px] sm:text-xs text-[var(--color-text-primary)] font-medium leading-tight whitespace-nowrap max-w-full">
                    {t.title}
                  </span>
                </Link>
              );
            })}
          </section>
        </div>
      </div>
  );
}
