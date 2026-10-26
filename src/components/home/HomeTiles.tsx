"use client";

import Link from "next/link";
import { Calendar, HandHeart, Sparkles, BookOpen, Video, type LucideIcon } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { HomeIconCard } from "@/lib/content-types";

const ICONS: Record<HomeIconCard["icon"], LucideIcon> = {
  calendar: Calendar,
  "hand-heart": HandHeart,
  sparkles: Sparkles,
  "book-open": BookOpen,
  video: Video,
};

const TONES: Record<HomeIconCard["tone"], { bg: string; color: string }> = {
  saffron: { bg: "var(--color-saffron-50)", color: "var(--color-saffron-600)" },
  green: { bg: "var(--color-success-50)", color: "var(--color-success-500)" },
  amber: { bg: "var(--color-warning-50)", color: "var(--color-warning-500)" },
  rose: { bg: "var(--color-danger-50)", color: "var(--color-danger-500)" },
  plum: { bg: "var(--color-plum-50)", color: "var(--color-plum-500)" },
};

export default function HomeTiles() {
  const { tr } = useLang();
  return (
    <section data-carousel="icon_carousel" className="grid grid-cols-5 gap-1.5 px-3 pt-[18px] pb-3 sm:gap-3 sm:px-3.5">
      {tr.home.icon_carousel.map((t) => {
        const Icon = ICONS[t.icon];
        const tone = TONES[t.tone];
        return (
          <Link
            key={t.id}
            href={t.url}
            className="min-w-0 min-h-11 flex flex-col items-center gap-2 text-center text-caption font-semibold text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
          >
            <span
              className="size-11 shrink-0 rounded-[17px] flex items-center justify-center transition-transform active:scale-[.93] min-[360px]:size-12 sm:size-[54px]"
              style={{ background: tone.bg, color: tone.color }}
            >
              <Icon size={22} />
            </span>
            <span className="w-full min-w-0 leading-snug [overflow-wrap:anywhere]">{t.title}</span>
          </Link>
        );
      })}
    </section>
  );
}
