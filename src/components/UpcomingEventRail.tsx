"use client";

import { useState } from "react";
import ContentImage from "@/components/presentation/ContentImage";
import { useLang } from "@/context/LanguageContext";
import { localizedText } from "@/lib/localization";
import {
  realEvents,
  placeholderEvents,
  type EventItem,
} from "@/gen/events/data";
import { imagePaths } from "@/lib/images";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import { useUiSettings } from "@/context/UiSettingsContext";
import { selectUpcomingEvents } from "@/lib/ui-settings";
import EventDetailModal from "./EventDetailModal";
import RailMotionControl from "./RailMotionControl";
import CategoryBadge from "./presentation/CategoryBadge";
import CollectionEmptyState from "./presentation/CollectionEmptyState";
import { collectionCardBodyClassName, collectionCardClassName } from "@/lib/collection-presentation";

export default function UpcomingEventRail() {
  const { lang, contentMode, tr } = useLang();
  const { upcomingEventSettings } = useUiSettings();
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const upcomingList = contentMode === "placeholder" ? placeholderEvents : realEvents;

  const railEvents = selectUpcomingEvents(upcomingList, upcomingEventSettings);

  const [paused, setPaused] = useState(false);
  const scrollRef = useAutoScrollRail(railEvents.length, paused);

  if (railEvents.length === 0) {
    return (
      <CollectionEmptyState>
        <p className="font-body text-xs sm:text-sm text-[var(--color-text-secondary)] italic">
          {tr.events_exact.no_upcoming_events}
        </p>
      </CollectionEmptyState>
    );
  }

  return (
    <>
      <div className="relative">
      {railEvents.length > 1 && (
        <RailMotionControl className="lg:hidden" paused={paused} onToggle={() => setPaused((value) => !value)} />
      )}
      {/* Mobile: smooth scrolling carousel */}
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
        {railEvents.map((ev) => {
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
                <ContentImage
                  src={imgUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 82vw, 320px"
                />
              </div>
              <div className={collectionCardBodyClassName}>
                {catLabel && <span className="mb-2 block"><CategoryBadge category={catLabel} code={primaryCat?.code} /></span>}
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
      <div className="hidden lg:grid grid-cols-3 gap-5">
        {railEvents.map((ev) => {
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
              <div className="relative h-44 w-full shrink-0">
                <ContentImage
                  src={imgUrl}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 33vw, 400px"
                />
              </div>
              <div className={collectionCardBodyClassName}>
                {catLabel && <span className="mb-2 block"><CategoryBadge category={catLabel} code={primaryCat?.code} /></span>}
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
    </>
  );
}
