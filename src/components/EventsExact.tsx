"use client";

import { useDeferredValue, useMemo, useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { MapPin, Calendar, Clock, User, Search, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { localized, localizedText } from "@/lib/localization";
import {
  realEvents,
  placeholderEvents,
  type EventItem,
  type EventCategory,
} from "@/gen/events/data";
import {
  loadEventsSearchIndex,
  loadPastEvents,
} from "@/gen/events/loaders";
import { useLazyMiniSearch, useMiniSearch } from "@/hooks/useMiniSearch";
import { getSearchProfile } from "@/lib/search";
import { sortEventsByDateTime, type EventSortOrder } from "@/lib/event-sorting";
import { eventDetailUrl, matchesEventDates } from "@/lib/event-tools";
import { imagePaths } from "@/lib/images";
import { browserDefaults, collectionPagination } from "@/gen/settings/ui-elements";
import EventDetailModal from "./EventDetailModal";
import AdvancedFilters from "./AdvancedFilters";

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

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedCat, setSelectedCat] = useState("upcoming");
  const [sortOrder, setSortOrder] = useState<EventSortOrder>(browserDefaults.eventsUpcomingSort);
  const [eventSlug, setEventSlug] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [month, setMonth] = useState("");
  const [pastError, setPastError] = useState(false);
  const pastRequest = useRef<Promise<unknown> | null>(null);

  // Lazy loaded past events data state
  const [pastDataModule, setPastDataModule] = useState<{
    realPastEvents: EventItem[];
    placeholderPastEvents: EventItem[];
  } | null>(null);
  const [loadingPast, setLoadingPast] = useState(false);

  const isPastTab = selectedCat === "past";

  const loadPast = useCallback(() => {
    if (pastDataModule || pastRequest.current) return;
    setLoadingPast(true);
    setPastError(false);
    pastRequest.current = loadPastEvents()
      .then((mod) => {
        setPastDataModule(mod);
        setLoadingPast(false);
      })
      .catch((err) => {
        console.error("Failed to load past events:", err);
        setPastError(true);
        setLoadingPast(false);
      }).finally(() => { pastRequest.current = null; });
  }, [pastDataModule]);

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
  const selectedEvent = [...upcomingCatalog, ...pastCatalog].find((event) => event.slug === eventSlug) ?? null;

  useEffect(() => {
    const readLink = () => {
      const slug = new URL(window.location.href).searchParams.get("event") ?? "";
      setEventSlug(slug);
      if (slug && !upcomingCatalog.some((event) => event.slug === slug)) {
        setSelectedCat("past");
        setSortOrder(browserDefaults.eventsPastSort);
        if (!pastError) loadPast();
      }
    };
    // Keep both initial deep links and browser Back/Forward in sync.
    const timer = setTimeout(readLink, 0);
    window.addEventListener("popstate", readLink);
    return () => { clearTimeout(timer); window.removeEventListener("popstate", readLink); };
  }, [upcomingCatalog, loadPast, pastError]);

  const openEvent = (event: EventItem) => {
    window.history.pushState(null, "", eventDetailUrl(window.location.href, event.slug));
    setEventSlug(event.slug);
  };
  const closeEvent = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("event");
    window.history.pushState(null, "", url);
    setEventSlug("");
  };

  const searchConfig = useMemo(
    () => ({
      ...getSearchProfile("events"),
    }),
    []
  );

  const loadFutureIndex = useCallback(
    () => loadEventsSearchIndex().then((m) => m.compressedEventsSearchIndex),
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
  const pastSearchResults = useMiniSearch<EventItem>(
      pastCatalog,
      isPastTab ? deferredQuery : "",
      searchConfig
    );

  const handleSearchFocus = () => {
    if (isPastTab) {
      loadPast();
    } else {
      loadUpcomingIndex();
    }
  };

  // Filter events based on active tab
  const categoryEvents: EventItem[] = useMemo(() => {
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
  const filteredEvents = useMemo(
    () => categoryEvents.filter((event) => matchesEventDates(event, dateFrom, dateTo, month)),
    [categoryEvents, dateFrom, dateTo, month],
  );
  const clearFilters = () => {
    setQuery(""); setDateFrom(""); setDateTo(""); setMonth("");
    setSelectedCat(isPastTab ? "past" : "upcoming");
    setSortOrder(isPastTab ? browserDefaults.eventsPastSort : browserDefaults.eventsUpcomingSort);
  };

  const [visibleCount, setVisibleCount] = useState<number>(collectionPagination.initialVisible);
  const filterKey = JSON.stringify([selectedCat, deferredQuery, sortOrder, dateFrom, dateTo, month]);
  const [prevFilter, setPrevFilter] = useState(filterKey);

  if (prevFilter !== filterKey) {
    setPrevFilter(filterKey);
    setVisibleCount(collectionPagination.initialVisible);
  }

  const sortedEvents = useMemo(
    () => sortEventsByDateTime(filteredEvents, sortOrder),
    [filteredEvents, sortOrder]
  );
  const displayedEvents = useMemo(
    () => sortedEvents.slice(0, visibleCount),
    [sortedEvents, visibleCount]
  );

  const tabs = copy.tabs;

  return (
    <div className="w-full">
      <AdvancedFilters
        active={Boolean(dateFrom || dateTo || month || sortOrder !== (isPastTab ? browserDefaults.eventsPastSort : browserDefaults.eventsUpcomingSort))}
        heading={
        <h2 id="all-events-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
          {tr.events_all}
        </h2>
        }
        search={
        <div className="relative w-full">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearchFocus();
            }}
            onFocus={handleSearchFocus}
            placeholder={copy.search_placeholder}
            className="min-h-11 w-full rounded-xl border border-[var(--color-line-strong)] bg-white py-2.5 pl-10 pr-10 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-secondary)]/50 focus:border-[var(--color-saffron-600)] focus:ring-2 focus:ring-[var(--color-saffron-100)]"
            aria-label={copy.search_placeholder}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-0 top-1/2 -translate-y-1/2 min-h-11 min-w-11 grid place-items-center rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              aria-label={copy.clear_search}
            >
              <X size={16} />
            </button>
          )}
        </div>
        }
      >
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">{copy.date_from}
          <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)} className="min-h-11 rounded-xl border border-[var(--color-line-strong)] bg-white px-3" />
        </label>
        <label className="grid gap-1 text-sm">{copy.date_to}
          <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} className="min-h-11 rounded-xl border border-[var(--color-line-strong)] bg-white px-3" />
        </label>
        <label className="grid gap-1 text-sm">{copy.month}
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="min-h-11 rounded-xl border border-[var(--color-line-strong)] bg-white px-3" />
        </label>
        <button type="button" onClick={clearFilters} className="min-h-11 px-3 text-sm font-semibold text-[var(--color-text-brand)]">{copy.clear_filters}</button>
        <label className="flex w-full flex-wrap items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] sm:w-auto">
          <span>{copy.sort_label}</span>
          <select
            value={sortOrder}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "earliest" || value === "latest") setSortOrder(value);
            }}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--color-line-strong)] bg-white px-3 py-2 font-body text-sm font-normal text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)] sm:flex-none"
          >
            <option value="earliest">{copy.sort_earliest}</option>
            <option value="latest">{copy.sort_latest}</option>
          </select>
        </label>
      </div>
      </AdvancedFilters>

      {/* Category Tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-parchment)] p-2 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              if ((t.id === "past") !== isPastTab) {
                setSortOrder(t.id === "past" ? browserDefaults.eventsPastSort : browserDefaults.eventsUpcomingSort);
              }
              setSelectedCat(t.id);
              if (t.id === "past") {
                loadPast();
              }
            }}
            aria-pressed={selectedCat === t.id}
            className={`min-h-11 shrink-0 px-4 py-1.5 rounded-full border font-body text-xs font-semibold transition-colors ${
              selectedCat === t.id
                ? "bg-[var(--color-saffron-600)] text-white border-transparent shadow-sm"
                : "bg-white text-[var(--color-text-secondary)] border-[var(--color-line-strong)] hover:border-[var(--color-saffron-600)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-4 text-xs text-[var(--color-text-secondary)]">
        {isPastTab && loadingPast ? copy.loading_past : copy.results_template.replace("{n}", String(filteredEvents.length))}
      </p>
      {pastError && isPastTab && (
        <div role="alert" className="mt-4 rounded-xl border border-[var(--color-line)] bg-white p-4">
          <p>{copy.load_error}</p>
          <button type="button" onClick={loadPast} className="min-h-11 px-3 font-semibold text-[var(--color-text-brand)]">{copy.retry}</button>
        </div>
      )}
      {eventSlug && !selectedEvent && pastDataModule && !loadingPast && (
        <p role="status" className="mt-4 text-sm">{copy.event_not_found}</p>
      )}

      {/* Loading state for past events */}
      {isPastTab && loadingPast && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[var(--color-line)] mt-4 p-6">
          <p className="font-body text-sm text-[var(--color-text-secondary)] animate-pulse">
            {copy.loading_past}
          </p>
        </div>
      )}

      {/* Empty State */}
      {(!isPastTab || !loadingPast && !pastError) && filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[var(--color-line)] mt-4 p-6">
          <p className="font-body text-sm text-[var(--color-text-secondary)]">
            {deferredQuery.trim() || dateFrom || dateTo || month
              ? copy.no_results
              : isPastTab
              ? copy.no_past_events
              : copy.no_upcoming_events}
          </p>
          {(query || dateFrom || dateTo || month) && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 min-h-11 px-3 font-body text-xs font-semibold text-[var(--color-saffron-600)] hover:underline"
            >
              {copy.clear_filters}
            </button>
          )}
        </div>
      )}

      {/* Events List */}
      {(!isPastTab || !loadingPast) && filteredEvents.length > 0 && (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedEvents.map((item: EventItem) => {
            const title = localizedText(item.title, lang);
            const displayDate = localizedText(item.displayDate, lang);
            const time = localizedText(item.time, lang);
            const location = localizedText(item.location, lang);
            const performers = localized(item.performers, lang);
            const description = localizedText(item.description, lang);
            const imgUrl = item.image || imagePaths.event || "/slide/1.jpg";

            return (
              <article
                key={item.slug}
                className="h-[360px] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-saffron-600)] hover:shadow-lg cursor-pointer"
              >
                <a
                  href={`?event=${encodeURIComponent(item.slug)}`}
                  onClick={(event) => {
                    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    openEvent(item);
                  }}
                  className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
                >
                  {/* Event Thumbnail */}
                  <div className="relative h-40 w-full shrink-0 overflow-hidden bg-[var(--color-cream-soft)]">
                    <Image
                      src={imgUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    {item.categories?.[0] && (
                      <span className="absolute top-2 left-2 bg-[rgba(26,17,8,0.75)] backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {localizedText(item.categories[0], lang)}
                      </span>
                    )}
                  </div>

                  {/* Main Event Info */}
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4">
                    <div>
                      {/* Meta badges */}
                      <div className="mb-1.5 flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs text-[var(--color-text-secondary)]">
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

                      {/* Title */}
                      <h3 className="mb-1 line-clamp-2 font-display text-lg font-bold leading-snug text-[var(--color-text-primary)]">
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
                      <p className="font-body text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                        {description}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--color-line)] pt-2">
                      <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                        {item.categories?.slice(1, 3).map((cat: EventCategory) => (
                          <span
                            key={cat.code}
                            className={`shrink-0 text-[9.5px] px-2 py-0.5 rounded-full font-medium ${
                              catColor[cat.code]?.bg ?? "bg-[var(--color-cream)]"
                            } ${catColor[cat.code]?.text ?? "text-[var(--color-text-secondary)]"}`}
                          >
                            {localizedText(cat, lang)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
          </div>
          {filteredEvents.length > visibleCount && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + collectionPagination.loadIncrement)}
                className="min-h-11 rounded-full border border-[var(--color-saffron-600)] bg-white px-6 py-2.5 font-body text-sm font-semibold text-[var(--color-text-brand)] shadow-xs transition hover:bg-[var(--color-saffron-50)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--color-saffron-600)]"
              >
                {copy.show_more}
              </button>
            </div>
          )}
        </>
      )}

      {/* Event Details Modal Popup */}
      <EventDetailModal key={selectedEvent?.slug ?? ""} event={selectedEvent} onClose={closeEvent} />
    </div>
  );
}
