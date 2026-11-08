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
      <header className="bg-transparent px-5 pt-6 pb-2 text-center sm:pt-8 sm:pb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-brand)]">
          <LocalizedCopy path={["events_label"]} />
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl">
          <LocalizedCopy path={["events_title"]} />
        </h1>
        <p className="mx-auto mt-3 flex min-h-10 max-w-2xl items-center justify-center text-base leading-relaxed text-[var(--color-text-brand)]/75 lg:min-h-12">
          <LocalizedCopy path={["events_subtitle"]} />
        </p>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-4 pb-8 lg:space-y-10 lg:px-8 lg:pt-6 lg:pb-12">
        <section aria-labelledby="upcoming-events-heading">
          <h2 id="upcoming-events-heading" className="font-display text-2xl font-bold text-[var(--color-text-primary)] lg:text-3xl">
            <LocalizedCopy path={["events_upcoming"]} />
          </h2>
          <div className="mt-5">
            <UpcomingEventRail />
          </div>
        </section>

        <EventsAccordion />

        <section className="border-t border-[var(--color-line)] pt-10" aria-labelledby="all-events-heading">
          <EventsExact />
        </section>
      </div>

    </>
  );
}
