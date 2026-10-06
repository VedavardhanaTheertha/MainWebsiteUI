import type { Metadata } from "next";
import UpcomingEventRail from "@/components/UpcomingEventRail";
import EventsAccordion from "@/components/EventsAccordion";
import EventsExact from "@/components/EventsExact";
import LocalizedCopy from "@/components/LocalizedCopy";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.events;

export default function EventsPage() {
  return (
    <>
      <header className="bg-[var(--color-parchment)] px-5 py-7 text-center lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-brand)]">
          <LocalizedCopy path={["events_label"]} />
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl">
          <LocalizedCopy path={["events_title"]} />
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--color-text-brand)]/75 lg:text-base">
          <LocalizedCopy path={["events_subtitle"]} />
        </p>
      </header>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:space-y-12 lg:px-8 lg:py-12">
        <section aria-labelledby="upcoming-events-heading">
          <div className="mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 id="upcoming-events-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
              <LocalizedCopy path={["events_upcoming"]} />
            </h2>
          </div>
          <UpcomingEventRail />
        </section>

        <EventsAccordion />

        <section className="border-t border-[var(--color-line)] pt-10" aria-labelledby="all-events-heading">
          <h2 id="all-events-heading" className="mb-5 font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            <LocalizedCopy path={["events_all"]} />
          </h2>
          <EventsExact />
        </section>
      </div>

    </>
  );
}
