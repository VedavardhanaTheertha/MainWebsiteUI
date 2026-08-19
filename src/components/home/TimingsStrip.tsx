"use client";

import { useLang } from "@/context/LanguageContext";

// TODO: Replace placeholder timings with verified schedule from temple management
const timings = [
  { en: "Usha Pooja",   kn: "ಉಷಾ ಪೂಜೆ",   time: "5:00 AM" },
  { en: "Nitya Pooja",  kn: "ನಿತ್ಯ ಪೂಜೆ",  time: "6:00 AM" },
  { en: "Pratha Pooja", kn: "ಪ್ರಾತಃ ಪೂಜೆ", time: "8:30 AM" },
  { en: "Maha Pooja",   kn: "ಮಹಾ ಪೂಜೆ",   time: "12:00 PM" },
  { en: "Chandan Pooja",kn: "ಚಂದನ ಪೂಜೆ",  time: "7:00 PM" },
  { en: "Dhoop Pooja",  kn: "ಧೂಪ ಪೂಜೆ",   time: "8:30 PM" },
  { en: "Ratri Pooja",  kn: "ರಾತ್ರಿ ಪೂಜೆ",  time: "9:30 PM" },
];

// TODO: Verify darshan hours with management
const darshanEN = "6:00 AM – 12:30 PM · 5:00 PM – 9:00 PM";
const darshanKN = "ಬೆಳಿಗ್ಗೆ 6:00 – ಮಧ್ಯಾಹ್ನ 12:30 · ಸಂಜೆ 5:00 – ರಾತ್ರಿ 9:00";

export default function TimingsStrip() {
  const { lang, tr } = useLang();

  return (
    <section
      className="bg-[var(--color-cream)] text-[var(--color-text-brand)] py-5 overflow-hidden"
      aria-label="Daily Pooja and Darshan timings"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold">
            {tr.timings_label}
          </span>
          <div className="h-px flex-1 bg-white/10" aria-hidden="true" />
          <span className="font-body text-[11px] text-[var(--color-text-brand)]/50">
            {tr.timings_darshan}: {lang === "kn" ? darshanKN : darshanEN}
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" role="list">
          {timings.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 snap-start flex flex-col items-center bg-white/5 rounded-xl px-5 py-3 min-w-[110px] border border-white/8"
              role="listitem"
            >
              <span className="font-body text-[11px] text-[var(--color-text-brand)]/60 mb-1 text-center leading-tight">
                {lang === "kn" ? item.kn : item.en}
              </span>
              <span className="font-display font-semibold text-lg text-[var(--color-text-brand)]">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
