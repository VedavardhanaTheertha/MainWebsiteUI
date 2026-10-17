"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "@/context/LanguageContext";
import {
  realRecurringEvents,
  placeholderRecurringEvents,
  type EventItem,
} from "@/gen/events/data";
import { imagePaths } from "@/lib/images";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import EventDetailModal from "./EventDetailModal";

const catColor: Record<string, string> = {
  festival: "bg-[#FFF7C5] text-[#92400E]",
  concert: "bg-[#E0F2FE] text-[#0369A1]",
  dance: "bg-[#FCE7F3] text-[#BE185D]",
  yakshagana: "bg-[#FEE2E2] text-[#B91C1C]",
  pravachana: "bg-[#F3E8FF] text-[#6B21A8]",
  utsava: "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]",
  pooja: "bg-[#FEF3C7] text-[#92400E]",
  parayana: "bg-[#EFF6FF] text-[#2B6CB0]",
  annadaana: "bg-[#F0FDF4] text-[#166534]",
  special: "bg-[#CCFBF1] text-[#0F766E]",
};

function CategoryBadge({ category, code }: { category: string; code?: string }) {
  const colorClass = (code && catColor[code]) || "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]";
  return (
    <span
      className={`font-body text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${colorClass}`}
    >
      {category}
    </span>
  );
}

export default function EventsAccordion() {
  const { lang, contentMode, tr } = useLang();
  const isKn = lang === "kn";
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const viewDetails = tr.events_exact.view_details ?? tr.library_browser.view_details;

  const recurringList =
    contentMode === "placeholder" ? placeholderRecurringEvents : realRecurringEvents;

  const scrollRef = useAutoScrollRail(recurringList.length);

  // Do not display this row if there are no recurring events
  if (recurringList.length === 0) {
    return null;
  }

  const sectionTitle = tr.events_recurring || "Recurring Events";

  return (
    <section className="border-t border-[var(--color-line)] pt-10" aria-labelledby="recurring-events-heading">
      <h2 id="recurring-events-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
        {sectionTitle}
      </h2>

      {/* Mobile: horizontal scroll */}
      <div
        ref={scrollRef}
        className="-mx-4 mt-5 flex gap-5 px-4 pb-2 lg:hidden"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {recurringList.map((ev) => {
          const title = isKn ? ev.title?.kn : ev.title?.en;
          const displayDate = isKn ? ev.displayDate?.kn : ev.displayDate?.en;
          const time = isKn ? ev.time?.kn : ev.time?.en;
          const location = isKn ? ev.location?.kn : ev.location?.en;
          const primaryCat = ev.categories?.[0];
          const catLabel = primaryCat ? (isKn ? primaryCat.kn : primaryCat.en) : "";
          const imgUrl = ev.image || imagePaths.event || "/slide/1.jpg";

          return (
            <div
              key={ev.slug}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedEvent(ev)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedEvent(ev);
                }
              }}
              className="event-card flex h-80 w-[82vw] max-w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--color-saffron-600)] bg-white shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer"
            >
              <div className="relative h-40 w-full shrink-0">
                <Image
                  src={imgUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 82vw, 320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/70 to-transparent" />
                {catLabel && (
                  <span className="absolute bottom-2 left-2">
                    <CategoryBadge category={catLabel} code={primaryCat?.code} />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 mb-0.5">
                  {displayDate} {time ? `· ${time}` : ""}
                </p>
                <p className="mb-1 line-clamp-2 font-display text-base font-bold leading-snug text-[var(--color-text-primary)]">
                  {title}
                </p>
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 line-clamp-1">
                  {location}
                </p>
                <span className="mt-auto pt-3 text-xs font-semibold text-[var(--color-text-brand)]">
                  {viewDetails}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: bounded card grid */}
      <div className="mt-5 hidden lg:grid grid-cols-3 gap-5">
        {recurringList.map((ev) => {
          const title = isKn ? ev.title?.kn : ev.title?.en;
          const displayDate = isKn ? ev.displayDate?.kn : ev.displayDate?.en;
          const time = isKn ? ev.time?.kn : ev.time?.en;
          const location = isKn ? ev.location?.kn : ev.location?.en;
          const primaryCat = ev.categories?.[0];
          const catLabel = primaryCat ? (isKn ? primaryCat.kn : primaryCat.en) : "";
          const imgUrl = ev.image || imagePaths.event || "/slide/1.jpg";

          return (
            <article
              key={ev.slug}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedEvent(ev)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedEvent(ev);
                }
              }}
              className="event-card flex h-80 flex-col overflow-hidden rounded-xl border border-[var(--color-saffron-600)] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              <div className="relative h-40 w-full shrink-0">
                <Image
                  src={imgUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 33vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/60 to-transparent" />
                {catLabel && (
                  <span className="absolute bottom-2 left-2">
                    <CategoryBadge category={catLabel} code={primaryCat?.code} />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 mb-0.5">
                  {displayDate} {time ? `· ${time}` : ""}
                </p>
                <p className="font-display font-bold text-[var(--color-text-primary)] text-base leading-snug mb-1 line-clamp-2">
                  {title}
                </p>
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 line-clamp-1">
                  {location}
                </p>
                <span className="mt-auto pt-3 text-xs font-semibold text-[var(--color-text-brand)]">
                  {viewDetails}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Event Details Modal Popup */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  );
}
