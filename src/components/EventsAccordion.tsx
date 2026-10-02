"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Repeat } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import {
  realRecurringEvents,
  placeholderRecurringEvents,
  type EventItem,
} from "@/gen/events/data";
import { imagePaths } from "@/lib/images";
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

  const recurringList =
    contentMode === "placeholder" ? placeholderRecurringEvents : realRecurringEvents;

  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || recurringList.length <= 1) return;
    const step = () => {
      if (!paused.current && el) {
        el.scrollLeft -= 0.6;
        if (el.scrollLeft <= 0) el.scrollLeft = el.scrollWidth - el.clientWidth;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    const pause = () => {
      paused.current = true;
    };
    const resume = () => {
      setTimeout(() => {
        paused.current = false;
      }, 1500);
    };
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);
    el.addEventListener("mousedown", pause);
    el.addEventListener("mouseup", resume);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("mousedown", pause);
      el.removeEventListener("mouseup", resume);
    };
  }, [recurringList.length]);

  // Do not display this row if there are no recurring events
  if (recurringList.length === 0) {
    return null;
  }

  const sectionTitle = tr.events_recurring || "Recurring Events";

  return (
    <section className="mb-8 px-3">
      <div className="flex items-center gap-2 mb-4">
        <Repeat size={18} className="text-[var(--color-saffron-800)]" />
        <h2 className="font-display font-bold text-[#4F252E] text-xl lg:text-2xl">
          {sectionTitle}
        </h2>
      </div>

      {/* Mobile: horizontal scroll */}
      <div
        ref={scrollRef}
        className="lg:hidden flex gap-3 -mx-3 px-3 pb-2"
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
              className="event-card shrink-0 w-[200px] bg-white border border-[var(--color-saffron-600)] rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300"
            >
              <div className="relative w-full h-[110px]">
                <Image
                  src={imgUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/70 to-transparent" />
                {catLabel && (
                  <span className="absolute bottom-2 left-2">
                    <CategoryBadge category={catLabel} code={primaryCat?.code} />
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 mb-0.5">
                  {displayDate} {time ? `· ${time}` : ""}
                </p>
                <p className="font-display font-bold text-[var(--color-text-primary)] text-[13px] leading-snug mb-1 line-clamp-1">
                  {title}
                </p>
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 line-clamp-1">
                  {location}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: static grid with photo */}
      <div className="hidden lg:grid grid-cols-3 xl:grid-cols-6 gap-3">
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
              className="event-card bg-white rounded-xl overflow-hidden border border-[var(--color-saffron-600)] shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300"
            >
              <div className="relative w-full h-[120px]">
                <Image
                  src={imgUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/60 to-transparent" />
                {catLabel && (
                  <span className="absolute bottom-2 left-2">
                    <CategoryBadge category={catLabel} code={primaryCat?.code} />
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 mb-0.5">
                  {displayDate} {time ? `· ${time}` : ""}
                </p>
                <p className="font-display font-bold text-[var(--color-text-primary)] text-[13px] leading-snug mb-1 line-clamp-1">
                  {title}
                </p>
                <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 line-clamp-1">
                  {location}
                </p>
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
