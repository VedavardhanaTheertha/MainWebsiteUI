"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "@/context/LanguageContext";
import { localizedText } from "@/lib/localization";
import {
  realRecurringEvents,
  placeholderRecurringEvents,
  type EventItem,
} from "@/gen/events/data";
import { imagePaths } from "@/lib/images";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import EventDetailModal from "./EventDetailModal";
import RailMotionControl from "./RailMotionControl";
import CategoryBadge from "./presentation/CategoryBadge";
import { collectionCardBodyClassName, collectionCardClassName } from "@/lib/collection-presentation";

export default function EventsAccordion() {
  const { lang, contentMode, tr } = useLang();
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const recurringList =
    contentMode === "placeholder" ? placeholderRecurringEvents : realRecurringEvents;

  const [paused, setPaused] = useState(false);
  const scrollRef = useAutoScrollRail(recurringList.length, paused);

  // Do not display this row if there are no recurring events
  if (recurringList.length === 0) {
    return null;
  }

  const sectionTitle = tr.events_recurring;

  return (
    <section className="border-t border-[var(--color-line)] pt-6 lg:pt-10" aria-labelledby="recurring-events-heading">
      <h2 id="recurring-events-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
        {sectionTitle}
      </h2>
      <div className="relative mt-5">
      {recurringList.length > 1 && (
        <RailMotionControl className="lg:hidden" paused={paused} onToggle={() => setPaused((value) => !value)} />
      )}

      {/* Mobile: horizontal scroll */}
      <div
        ref={scrollRef}
        className="-mx-4 flex gap-5 px-4 pb-2 lg:hidden"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {recurringList.map((ev) => {
          const title = localizedText(ev.title, lang);
          const displayDate = localizedText(ev.displayDate, lang);
          const time = localizedText(ev.time, lang);
          const location = localizedText(ev.location, lang);
          const primaryCat = ev.categories?.[0];
          const catLabel = localizedText(primaryCat, lang);
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
              className={`${collectionCardClassName("featured")} event-card w-[82vw] max-w-[320px] shrink-0 cursor-pointer`}
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
              <div className={collectionCardBodyClassName}>
                <p className="font-body text-sm text-[var(--color-text-secondary)]/80 mb-0.5">
                  {displayDate} {time ? `· ${time}` : ""}
                </p>
                <p className="mb-1 line-clamp-2 font-display text-base font-bold leading-snug text-[var(--color-text-primary)]">
                  {title}
                </p>
                <p className="font-body text-sm text-[var(--color-text-secondary)]/80 line-clamp-1">
                  {location}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Desktop: bounded card grid */}
      <div className="mt-5 hidden lg:grid grid-cols-3 gap-5">
        {recurringList.map((ev) => {
          const title = localizedText(ev.title, lang);
          const displayDate = localizedText(ev.displayDate, lang);
          const time = localizedText(ev.time, lang);
          const location = localizedText(ev.location, lang);
          const primaryCat = ev.categories?.[0];
          const catLabel = localizedText(primaryCat, lang);
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
              className={`${collectionCardClassName("featured")} event-card cursor-pointer`}
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
              <div className={collectionCardBodyClassName}>
                <p className="font-body text-sm text-[var(--color-text-secondary)]/80 mb-0.5">
                  {displayDate} {time ? `· ${time}` : ""}
                </p>
                <p className="font-display font-bold text-[var(--color-text-primary)] text-base leading-snug mb-1 line-clamp-2">
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
