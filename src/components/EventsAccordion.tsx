"use client";

import { useState } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import { useLang } from "@/context/LanguageContext";
import { localized, localizedText } from "@/lib/localization";
import {
  realRecurringEvents,
  placeholderRecurringEvents,
  type EventItem,
  type EventCategory,
} from "@/gen/events/data";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import EventDetailModal from "./EventDetailModal";
import RailMotionControl from "./RailMotionControl";
import CategoryBadge from "./presentation/CategoryBadge";
import { categoryToneClassName } from "@/lib/category-tones";
import { collectionCardBodyClassName, collectionCardClassName } from "@/lib/collection-presentation";
import { Calendar, Clock, MapPin, User } from "lucide-react";

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
    <section className="border-t border-[var(--color-line)] pt-5 lg:pt-6" aria-labelledby="recurring-events-heading">
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
          const performers = localized(ev.performers, lang);
          const description = localizedText(ev.description, lang);
          const primaryCat = ev.categories?.[0];
          const catLabel = localizedText(primaryCat, lang);
          const imgUrl = ev.image || "/icons/event-placeholder.svg";

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
              className={`${collectionCardClassName("collection")} event-card w-[82vw] max-w-[320px] shrink-0 cursor-pointer`}
            >
              <div className="relative h-40 w-full shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--color-gold-100),var(--color-cream-soft))] [&_.content-image-foreground]:transition-transform [&_.content-image-foreground]:duration-500 [&_.content-image-foreground]:ease-out group-hover:[&_.content-image-foreground]:scale-105">
                <ContentImage
                  src={imgUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 82vw, 320px"
                />
              </div>
              <div className={collectionCardBodyClassName}>
                {catLabel && (
                  <span className="mb-1.5 block">
                    <CategoryBadge category={catLabel} code={primaryCat?.code} />
                  </span>
                )}
                <div>
                  <div className="mb-1.5 flex items-center gap-2 overflow-hidden whitespace-nowrap text-meta text-[var(--color-text-secondary)]">
                    <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--color-saffron-800)]">
                      <Calendar size={13} />
                      {displayDate}
                    </span>
                    {time && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[var(--color-text-muted)]">
                        <Clock size={13} />
                        {time}
                      </span>
                    )}
                    {location && (
                      <span className="inline-flex min-w-0 items-center gap-1 text-[var(--color-text-muted)]">
                        <MapPin size={13} />
                        <span className="truncate">{location}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 line-clamp-2 font-display text-base sm:text-lg font-bold leading-snug text-[var(--color-text-primary)]">
                    {title}
                  </h3>

                  {performers && performers.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-[var(--color-text-brand)]">
                      <User size={13} className="shrink-0" />
                      <span className="truncate">{performers.join(", ")}</span>
                    </div>
                  )}

                  <p className="font-body text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--color-line)] pt-2">
                  <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                    {ev.categories?.slice(1, 3).map((cat: EventCategory, cIdx: number) => (
                      <span
                        key={`${cat.code}-${cIdx}`}
                        className={`shrink-0 text-[9.5px] px-2 py-0.5 rounded-full font-medium ${categoryToneClassName(cat.code)}`}
                      >
                        {localizedText(cat, lang)}
                      </span>
                    ))}
                  </div>
                </div>
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
          const performers = localized(ev.performers, lang);
          const description = localizedText(ev.description, lang);
          const primaryCat = ev.categories?.[0];
          const catLabel = localizedText(primaryCat, lang);
          const imgUrl = ev.image || "/icons/event-placeholder.svg";

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
              className={`${collectionCardClassName("collection")} event-card cursor-pointer`}
            >
              <div className="relative h-40 w-full shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--color-gold-100),var(--color-cream-soft))] [&_.content-image-foreground]:transition-transform [&_.content-image-foreground]:duration-500 [&_.content-image-foreground]:ease-out group-hover:[&_.content-image-foreground]:scale-105">
                <ContentImage
                  src={imgUrl}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 33vw, 400px"
                />
              </div>
              <div className={collectionCardBodyClassName}>
                {catLabel && (
                  <span className="mb-1.5 block">
                    <CategoryBadge category={catLabel} code={primaryCat?.code} />
                  </span>
                )}
                <div>
                  <div className="mb-1.5 flex items-center gap-2 overflow-hidden whitespace-nowrap text-meta text-[var(--color-text-secondary)]">
                    <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--color-saffron-800)]">
                      <Calendar size={13} />
                      {displayDate}
                    </span>
                    {time && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[var(--color-text-muted)]">
                        <Clock size={13} />
                        {time}
                      </span>
                    )}
                    {location && (
                      <span className="inline-flex min-w-0 items-center gap-1 text-[var(--color-text-muted)]">
                        <MapPin size={13} />
                        <span className="truncate">{location}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 line-clamp-2 font-display text-base sm:text-lg font-bold leading-snug text-[var(--color-text-primary)]">
                    {title}
                  </h3>

                  {performers && performers.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-[var(--color-text-brand)]">
                      <User size={13} className="shrink-0" />
                      <span className="truncate">{performers.join(", ")}</span>
                    </div>
                  )}

                  <p className="font-body text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--color-line)] pt-2">
                  <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                    {ev.categories?.slice(1, 3).map((cat: EventCategory, cIdx: number) => (
                      <span
                        key={`${cat.code}-${cIdx}`}
                        className={`shrink-0 text-[9.5px] px-2 py-0.5 rounded-full font-medium ${categoryToneClassName(cat.code)}`}
                      >
                        {localizedText(cat, lang)}
                      </span>
                    ))}
                  </div>
                </div>
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
