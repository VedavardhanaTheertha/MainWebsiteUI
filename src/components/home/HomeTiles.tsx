"use client";

import Link from "next/link";
import { Calendar, HandHeart, Sparkles, BookOpen, Video, Home, Users, type LucideIcon } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { HomeIconCard } from "@/lib/content-types";

const ICONS: Record<HomeIconCard["icon"], LucideIcon> = {
  calendar: Calendar,
  "hand-heart": HandHeart,
  sparkles: Sparkles,
  "book-open": BookOpen,
  video: Video,
  home: Home,
  users: Users,
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
    <div className="fixed bottom-0 inset-x-0 z-30 bg-[var(--color-cream)]/80 backdrop-blur-md border-t border-[var(--color-line)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto">
        <section data-carousel="icon_carousel" className="grid grid-cols-5 gap-1.5 px-3 py-2 sm:gap-3 sm:px-3.5">
          {tr.home.icon_carousel.map((t) => {
            const Icon = ICONS[t.icon];
            const tone = TONES[t.tone];
            return (
              <Link
                key={t.id}
                href={t.url}
                aria-label={t.title}
                className="min-w-0 min-h-11 flex items-center justify-center rounded-[17px] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
              >
                <span
                  className="size-11 shrink-0 rounded-[17px] flex items-center justify-center transition-transform active:scale-[.93] min-[360px]:size-12 sm:size-[54px]"
                  style={{ background: tone.bg, color: tone.color }}
                >
                  <Icon size={22} />
                </span>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
