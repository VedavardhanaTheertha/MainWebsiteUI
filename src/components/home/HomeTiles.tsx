"use client";

import Link from "next/link";
import { Calendar, HandHeart, Sparkles, BookOpen, Video, type LucideIcon } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const ICONS: Record<string, LucideIcon> = {
  calendar: Calendar,
  "hand-heart": HandHeart,
  sparkles: Sparkles,
  "book-open": BookOpen,
  video: Video,
};

const TONES: Record<string, { bg: string; color: string }> = {
  saffron: { bg: "var(--color-saffron-50)", color: "var(--color-saffron-600)" },
  green: { bg: "var(--color-success-50)", color: "var(--color-success-500)" },
  amber: { bg: "var(--color-warning-50)", color: "var(--color-warning-500)" },
  rose: { bg: "var(--color-danger-50)", color: "var(--color-danger-500)" },
  plum: { bg: "#ece7f4", color: "#6d5a94" },
};

export default function HomeTiles() {
  const { tr } = useLang();
  return (
    <div className="flex gap-1.5 px-3.5 pt-[18px] pb-2">
      {tr.home.tiles.map((t) => {
        const Icon = ICONS[t.icon];
        const tone = TONES[t.tone];
        return (
          <Link
            key={t.label}
            href={t.href}
            className="flex-1 flex flex-col items-center gap-2 text-[11px] font-semibold text-[var(--color-text-secondary)]"
          >
            <span
              className="w-[54px] h-[54px] rounded-[17px] flex items-center justify-center transition-transform active:scale-[.93]"
              style={{ background: tone.bg, color: tone.color }}
            >
              {Icon ? <Icon size={22} /> : null}
            </span>
            <span className="leading-none">{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
