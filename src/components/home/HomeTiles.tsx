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
  plum: { bg: "#ece7f4", color: "#6d5a94" },
};

export default function HomeTiles() {
  const { tr } = useLang();
  return (
    <section data-carousel="icon_carousel" className="flex gap-3 overflow-x-auto px-3.5 pt-[18px] pb-3">
      {tr.home.icon_carousel.map((t) => {
        const Icon = ICONS[t.icon];
        const tone = TONES[t.tone];
        return (
          <Link
            key={t.id}
            href={t.url}
            className="min-w-24 flex-1 flex flex-col items-center gap-2 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
          >
            <span
              className="w-[54px] h-[54px] rounded-[17px] flex items-center justify-center transition-transform active:scale-[.93]"
              style={{ background: tone.bg, color: tone.color }}
            >
              <Icon size={22} />
            </span>
            <span className="leading-snug">{t.title}</span>
          </Link>
        );
      })}
    </section>
  );
}
