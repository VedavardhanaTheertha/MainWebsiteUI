"use client";

import { useDeferredValue, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { MapPin, Calendar, Clock, User, Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import {
  realEvents,
  placeholderEvents,
  type EventItem,
  type EventCategory,
} from "@/gen/events/data";
import {
  loadEventsSearchIndex,
  loadPastEventsSearchIndex,
  loadPastEvents,
} from "@/gen/events/loaders";
import { useLazyMiniSearch } from "@/hooks/useMiniSearch";
import { imagePaths } from "@/lib/images";
import EventDetailModal from "./EventDetailModal";

const catColor: Record<string, { bg: string; text: string }> = {
  festival: { bg: "bg-[#FFF7C5]", text: "text-[#92400E]" },
  concert: { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]" },
  dance: { bg: "bg-[#FCE7F3]", text: "text-[#BE185D]" },
  yakshagana: { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]" },
  pravachana: { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]" },
  utsava: { bg: "bg-[#FFEDD5]", text: "text-[#C2410C]" },
  pooja: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
  parayana: { bg: "bg-[#E0E7FF]", text: "text-[#3730A3]" },
  special: { bg: "bg-[#CCFBF1]", text: "text-[#0F766E]" },
};

export default function EventsExact() {
  const { lang, contentMode, tr } = useLang();
  const copy = tr.events_exact;
  const isKn = lang === "kn";

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedCat, setSelectedCat] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Lazy loaded past events data state
  const [pastDataModule, setPastDataModule] = useState<{
    realPastEvents: EventItem[];
    placeholderPastEvents: EventItem[];
  } | null>(null);
  const [loadingPast, setLoadingPast] = useState(false);

  const isPastTab = selectedCat === "past";

  const loadPast = useCallback(() => {
    if (pastDataModule || loadingPast) return;
    setLoadingPast(true);
    loadPastEvents()
      .then((mod) => {
        setPastDataModule(mod);
        setLoadingPast(false);
      })
      .catch((err) => {
        console.error("Failed to load past events:", err);
        setLoadingPast(false);
      });
  }, [pastDataModule, loadingPast]);

  // Upcoming catalog (always contains only future events)
  const upcomingCatalog = useMemo(() => {
    return contentMode === "placeholder" ? placeholderEvents : realEvents;
  }, [contentMode]);

  // Past catalog (lazy loaded, always contains only past events)
  const pastCatalog = useMemo(() => {
    if (!pastDataModule) return [];
    return contentMode === "placeholder"
      ? pastDataModule.placeholderPastEvents
      : pastDataModule.realPastEvents;
  }, [pastDataModule, contentMode]);

  const searchConfig = useMemo(
    () => ({
      fields: [
        "titleEn",
        "titleKn",
        "categoriesText",
        "locationEn",
        "locationKn",
        "performersText",
        "tagsText",
        "searchText",
      ],
      boost: {
        titleEn: 3,
        titleKn: 3,
        categoriesText: 2,
        performersText: 1.8,
        locationEn: 1.5,
        locationKn: 1.5,
        tagsText: 1.2,
        searchText: 1,
      },
    }),
    []
  );

  const loadFutureIndex = useCallback(
    () => loadEventsSearchIndex().then((m) => m.compressedEventsSearchIndex),
    []
  );
  const loadPastIndex = useCallback(
    () => loadPastEventsSearchIndex().then((m) => m.compressedPastEventsSearchIndex),
    []
  );

  // Search upcoming events when on future tabs
  const { results: upcomingSearchResults, ensureLoaded: loadUpcomingIndex } =
    useLazyMiniSearch<EventItem>(
      upcomingCatalog,
      isPastTab ? "" : deferredQuery,
      loadFutureIndex,
      searchConfig
    );

  // Search past events when on past tab
  const { results: pastSearchResults, ensureLoaded: loadPastIndexFn } =
    useLazyMiniSearch<EventItem>(
      pastCatalog,
      isPastTab ? deferredQuery : "",
      loadPastIndex,
      searchConfig
    );

  const handleSearchFocus = () => {
    if (isPastTab) {
      loadPast();
      loadPastIndexFn();
    } else {
      loadUpcomingIndex();
    }
  };

  // Filter events based on active tab
  const filteredEvents: EventItem[] = useMemo(() => {
    if (isPastTab) {
      return deferredQuery.trim() ? pastSearchResults : pastCatalog;
    }
    const currentUpcoming = deferredQuery.trim() ? upcomingSearchResults : upcomingCatalog;
    if (selectedCat === "upcoming" || selectedCat === "all") {
      return currentUpcoming;
    }
    return currentUpcoming.filter((item: EventItem) =>
      (item.categories || []).some((c: EventCategory) => c.code === selectedCat)
    );
  }, [
    isPastTab,
    selectedCat,
    deferredQuery,
    pastSearchResults,
    pastCatalog,
    upcomingSearchResults,
    upcomingCatalog,
  ]);

  const tabs = copy.tabs || [
    { id: "upcoming", label: "All Upcoming" },
    { id: "festival", label: "Festivals" },
    { id: "concert", label: "Concerts" },
    { id: "dance", label: "Dance" },
    { id: "pooja", label: "Pooja" },
    { id: "special", label: "Special" },
    { id: "past", label: "All Past Events" },
  ];

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative flex items-center">
          <Search
            size={18}
            className="absolute left-3.5 text-[var(--color-text-secondary)]/60 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearchFocus();
            }}
            onFocus={handleSearchFocus}
            placeholder={copy.search_placeholder ?? "Search events, artists, dates..."}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--color-line-strong)] bg-white text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-saffron-600)] transition-all"
            aria-label={copy.search_placeholder ?? "Search events"}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 p-1 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              aria-label={copy.clear_search ?? "Clear search"}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 lg:mx-0 lg:px-0 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setSelectedCat(t.id);
              if (t.id === "past") {
                loadPast();
              }
            }}
            className={`shrink-0 px-4 py-1.5 rounded-full border font-body text-xs font-semibold transition-colors ${
              selectedCat === t.id
                ? "bg-[var(--color-saffron-600)] text-white border-transparent shadow-sm"
                : "bg-white text-[var(--color-text-secondary)] border-[var(--color-line-strong)] hover:border-[var(--color-saffron-600)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading state for past events */}
      {isPastTab && loadingPast && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[var(--color-line)] mt-4 p-6">
          <p className="font-body text-sm text-[var(--color-text-secondary)] animate-pulse">
            {copy.loading_past ?? "Loading past events..."}
          </p>
        </div>
      )}

      {/* Empty State */}
      {(!isPastTab || !loadingPast) && filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[var(--color-line)] mt-4 p-6">
          <p className="font-body text-sm text-[var(--color-text-secondary)]">
            {deferredQuery.trim()
              ? copy.no_results ?? "No events found matching your search."
              : isPastTab
              ? copy.no_past_events ?? "No past events recorded."
              : copy.no_upcoming_events ?? "No scheduled upcoming events at this time."}
          </p>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 font-body text-xs font-semibold text-[var(--color-saffron-600)] hover:underline"
            >
              {copy.clear_search ?? "Clear Search"}
            </button>
          )}
        </div>
      )}

      {/* Events List */}
      {(!isPastTab || !loadingPast) && filteredEvents.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          {filteredEvents.map((item: EventItem) => {
            const title = isKn ? item.title?.kn : item.title?.en;
            const displayDate = isKn ? item.displayDate?.kn : item.displayDate?.en;
            const time = isKn ? item.time?.kn : item.time?.en;
            const location = isKn ? item.location?.kn : item.location?.en;
            const performers = isKn ? item.performers?.kn : item.performers?.en;
            const description = isKn ? item.description?.kn : item.description?.en;
            const imgUrl = item.image || imagePaths.event || "/slide/1.jpg";

            return (
              <article
                key={item.slug}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEvent(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedEvent(item);
                  }
                }}
                className="bg-white rounded-2xl border border-[var(--color-line)] hover:border-[var(--color-saffron-600)] shadow-sm hover:shadow-md cursor-pointer transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  {/* Event Thumbnail */}
                  <div className="relative w-full sm:w-[170px] h-[170px] shrink-0 rounded-xl overflow-hidden bg-[var(--color-cream-soft)]">
                    <Image
                      src={imgUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 170px"
                      className="object-cover"
                    />
                    {item.categories?.[0] && (
                      <span className="absolute top-2 left-2 bg-[rgba(26,17,8,0.75)] backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {isKn ? item.categories[0].kn : item.categories[0].en}
                      </span>
                    )}
                  </div>

                  {/* Main Event Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-[var(--color-text-secondary)]">
                        <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-saffron-800)]">
                          <Calendar size={13} />
                          {displayDate}
                        </span>
                        {time && (
                          <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)]">
                            <Clock size={13} />
                            {time}
                          </span>
                        )}
                        {location && (
                          <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)] truncate max-w-[200px]">
                            <MapPin size={13} />
                            {location}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-lg text-[var(--color-text-primary)] leading-snug mb-1">
                        {title}
                      </h3>

                      {/* Performers */}
                      {performers && performers.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-2 text-xs text-[var(--color-text-brand)]">
                          <User size={13} className="shrink-0" />
                          <span className="truncate">{performers.join(", ")}</span>
                        </div>
                      )}

                      {/* Short Description */}
                      <p className="font-body text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                        {description}
                      </p>
                    </div>

                    {/* Bottom Category badges */}
                    {item.categories && item.categories.length > 1 && (
                      <div className="mt-3 pt-2 border-t border-[var(--color-line)] flex items-center gap-1">
                        {item.categories.slice(1, 3).map((cat: EventCategory) => (
                          <span
                            key={cat.code}
                            className={`text-[9.5px] px-2 py-0.5 rounded-full font-medium ${
                              catColor[cat.code]?.bg ?? "bg-[var(--color-cream)]"
                            } ${catColor[cat.code]?.text ?? "text-[var(--color-text-secondary)]"}`}
                          >
                            {isKn ? cat.kn : cat.en}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Event Details Modal Popup */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
