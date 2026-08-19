"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

// TODO: Replace all placeholder stats and events with real data from management
const stats = {
  en: [
    { value: "800+", label: "Years of Legacy" },
    { value: "36+", label: "Generations of Swamijis" },
    { value: "10,000+", label: "Devotees Fed Daily" },
    { value: "97", label: "Seva Offerings" },
    { value: "₹2 Cr+", label: "Annadaana in 2024" },
    { value: "2026", label: "Current Paryaya Year" },
  ],
  kn: [
    { value: "800+", label: "ವರ್ಷಗಳ ಪರಂಪರೆ" },
    { value: "36+", label: "ತಲೆಮಾರಿನ ಸ್ವಾಮಿಗಳು" },
    { value: "10,000+", label: "ದಿನನಿತ್ಯ ಊಟ ಮಾಡುವ ಭಕ್ತರು" },
    { value: "97", label: "ಸೇವೆಗಳು" },
    { value: "₹2 ಕೋಟಿ+", label: "2024ರ ಅನ್ನದಾನ" },
    { value: "2026", label: "ಪ್ರಸ್ತುತ ಪರ್ಯಾಯ ವರ್ಷ" },
  ],
};

const upcomingEvents = {
  en: [
    {
      date: { day: "12", month: "Jul", year: "2026" },
      category: "Utsava",
      title: "Paryaya Rathotsava",
      location: "Udupi Sri Krishna Temple",
      description: "The grand chariot festival — a must-witness event.",
    },
    {
      date: { day: "29", month: "Aug", year: "2026" },
      category: "Festival",
      title: "Krishnashtami Mahotsava",
      location: "Shri Shiroor Matha, Udupi",
      description: "Grand celebration of Lord Krishna's birth anniversary.",
    },
    {
      date: { day: "15", month: "Oct", year: "2026" },
      category: "Parayana",
      title: "Dvaadashastuti Utsava",
      location: "Shri Shiroor Matha, Udupi",
      description: "Sacred recitation of the Dvaadashastuti by assembled pontiffs.",
    },
  ],
  kn: [
    {
      date: { day: "12", month: "ಜುಲೈ", year: "2026" },
      category: "ಉತ್ಸವ",
      title: "ಪರ್ಯಾಯ ರಥೋತ್ಸವ",
      location: "ಉಡುಪಿ ಶ್ರೀಕೃಷ್ಣ ಮಠ",
      description: "ಉಡುಪಿಯ ರಸ್ತೆಗಳಲ್ಲಿ ಶ್ರೀಕೃಷ್ಣನ ಭವ್ಯ ರಥೋತ್ಸವ.",
    },
    {
      date: { day: "29", month: "ಆಗ", year: "2026" },
      category: "ಹಬ್ಬ",
      title: "ಕೃಷ್ಣಾಷ್ಟಮಿ ಮಹೋತ್ಸವ",
      location: "ಶ್ರೀ ಶಿರೂರು ಮಠ, ಉಡುಪಿ",
      description: "ಶ್ರೀಕೃಷ್ಣನ ಜನ್ಮ ಮಹೋತ್ಸವ — ವಿಶೇಷ ಪೂಜೆ ಮತ್ತು ಅನ್ನದಾನ.",
    },
    {
      date: { day: "15", month: "ಅಕ್ಟೋ", year: "2026" },
      category: "ಪಾರಾಯಣ",
      title: "ದ್ವಾದಶಸ್ತುತಿ ಉತ್ಸವ",
      location: "ಶ್ರೀ ಶಿರೂರು ಮಠ, ಉಡುಪಿ",
      description: "ಸ್ವಾಮಿಗಳ ಸಮ್ಮುಖದಲ್ಲಿ ಪವಿತ್ರ ದ್ವಾದಶಸ್ತುತಿ ಪಾರಾಯಣ.",
    },
  ],
};

const categoryColors: Record<string, string> = {
  Utsava: "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]",
  Festival: "bg-[var(--color-paper)] text-[var(--color-text-secondary)] border border-[var(--color-saffron-600)]",
  Parayana: "bg-[#F0F7FF] text-[#2B6CB0]",
  ಉತ್ಸವ: "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]",
  ಹಬ್ಬ: "bg-[var(--color-paper)] text-[var(--color-text-secondary)] border border-[var(--color-saffron-600)]",
  ಪಾರಾಯಣ: "bg-[#F0F7FF] text-[#2B6CB0]",
};

export default function MilestonesEvents() {
  const { lang, tr } = useLang();
  const currentStats = stats[lang];
  const currentEvents = upcomingEvents[lang];

  return (
    <section className="py-16 lg:py-24 bg-[var(--color-cream)]" aria-labelledby="milestones-heading">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="mb-10 lg:mb-14">
          <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-2">
            {tr.mile_label}
          </p>
          <h2 id="milestones-heading" className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl">
            {tr.mile_title}
          </h2>
        </div>

        {/* Upcoming events */}
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h3 className="font-display font-semibold text-white text-2xl lg:text-3xl">{tr.mile_upcoming}</h3>
          <Link href="/events" className="font-body text-sm font-medium text-[var(--color-text-brand)] hover:underline focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 shrink-0">
            {tr.mile_view_all} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentEvents.map((event, i) => (
            <article key={i} className="bg-white/5 border border-white/10 rounded-[18px] p-6 hover:bg-white/8 hover:border-[var(--color-saffron-600)]/30 transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="bg-gradient-to-br from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-xl w-14 h-14 flex flex-col items-center justify-center text-white shrink-0">
                  <span className="font-display font-bold text-xl leading-none">{event.date.day}</span>
                  <span className="font-body text-[10px] font-medium uppercase">{event.date.month}</span>
                </div>
                <span className={`font-body text-[10px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${categoryColors[event.category] ?? "bg-white/10 text-white"}`}>
                  {event.category}
                </span>
              </div>
              <div>
                <h4 className="font-display font-semibold text-white text-xl mb-1">{event.title}</h4>
                <p className="font-body text-xs text-[var(--color-text-brand)]/50 mb-2">{event.location} · {event.date.year}</p>
                <p className="font-body text-sm text-[var(--color-text-brand)]/70 leading-relaxed">{event.description}</p>
              </div>
              <Link href="/events" className="mt-auto font-body text-xs font-medium text-[var(--color-text-brand)] hover:underline focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-1">
                {tr.mile_learn} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
