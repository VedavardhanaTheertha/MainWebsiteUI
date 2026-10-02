"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { events, alternateEvents, type EventItem } from "@/gen/events/data";

const categoryColors: Record<string, string> = {
  festival: "bg-[#FFF7C5] text-[#92400E]",
  concert: "bg-[#E0F2FE] text-[#0369A1]",
  dance: "bg-[#FCE7F3] text-[#BE185D]",
  yakshagana: "bg-[#FEE2E2] text-[#B91C1C]",
  pravachana: "bg-[#F3E8FF] text-[#6B21A8]",
  utsava: "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]",
  pooja: "bg-[#FEF3C7] text-[#92400E]",
  parayana: "bg-[#F0F7FF] text-[#2B6CB0]",
  special: "bg-[#CCFBF1] text-[#0F766E]",
};

export default function MilestonesEvents() {
  const { lang, contentMode, tr } = useLang();
  const isKn = lang === "kn";

  const allEvents: EventItem[] =
    contentMode === "real" && alternateEvents ? alternateEvents : events;

  // Select 3 highlight events
  const highlightEvents = allEvents.slice(0, 3);

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
          <Link
            href="/events"
            className="font-body text-sm font-medium text-[var(--color-text-brand)] hover:underline focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2 shrink-0"
          >
            {tr.mile_view_all} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlightEvents.map((event) => {
            const title = isKn ? event.title?.kn : event.title?.en;
            const displayDate = isKn ? event.displayDate?.kn : event.displayDate?.en;
            const location = isKn ? event.location?.kn : event.location?.en;
            const description = isKn ? event.description?.kn : event.description?.en;
            const primaryCategory = event.categories?.[0];
            const catLabel = primaryCategory ? (isKn ? primaryCategory.kn : primaryCategory.en) : "";
            const catCode = primaryCategory?.code ?? "special";

            // Parse date string for badge box
            const parts = displayDate.split(" ");
            const dayStr = parts[0] || "";
            const monthStr = parts[1] || "";
            const yearStr = parts[2] || "";

            return (
              <article
                key={event.slug}
                className="bg-white/5 border border-white/10 rounded-[18px] p-6 hover:bg-white/8 hover:border-[var(--color-saffron-600)]/30 transition-all flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="bg-gradient-to-br from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-xl w-14 h-14 flex flex-col items-center justify-center text-white shrink-0">
                    <span className="font-display font-bold text-xl leading-none">{dayStr}</span>
                    <span className="font-body text-[10px] font-medium uppercase">{monthStr}</span>
                  </div>
                  {catLabel && (
                    <span
                      className={`font-body text-[10px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${
                        categoryColors[catCode] ?? "bg-white/10 text-white"
                      }`}
                    >
                      {catLabel}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white text-xl mb-1">{title}</h4>
                  <p className="font-body text-xs text-[var(--color-text-brand)]/50 mb-2">
                    {location} {yearStr ? `· ${yearStr}` : ""}
                  </p>
                  <p className="font-body text-sm text-[var(--color-text-brand)]/70 leading-relaxed line-clamp-3">
                    {description}
                  </p>
                </div>
                <Link
                  href="/events"
                  className="mt-auto font-body text-xs font-medium text-[var(--color-text-brand)] hover:underline focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-1"
                >
                  {tr.mile_learn} →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
