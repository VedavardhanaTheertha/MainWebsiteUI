import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import ThisWeekRail from "@/components/ThisWeekRail";
import EventsAccordion from "@/components/EventsAccordion";
import EventsExact from "@/components/EventsExact";
import LocalizedCopy from "@/components/LocalizedCopy";
import { content, defaultLang } from "@/gen/content";
import { imagePaths } from "@/lib/images";

export const metadata: Metadata = content[defaultLang].page_metadata.events;

export default function EventsPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Madhwacharya watermark — full page */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.06 }}>
        <Image
          src={imagePaths.madhwacharya}
          alt=""
          fill
          className="object-cover"
          style={{ filter: "sepia(1) saturate(3) hue-rotate(340deg) brightness(1.3)" }}
          sizes="100vw"
        />
      </div>

      {/* Page header */}
      <div className="relative z-10 bg-[var(--color-parchment)] pt-4 pb-3 lg:pt-7 lg:pb-6 text-center px-5">
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-4xl mb-2 lg:mb-3">
          <LocalizedCopy path={["events_title"]} />
        </h1>
        <p className="font-body text-[var(--color-text-brand)]/75 text-sm lg:text-base max-w-xl mx-auto">
          <LocalizedCopy path={["events_subtitle"]} />
        </p>
      </div>

      <div className="w-full px-0 py-6 lg:py-12 relative z-10">

        {/* Upcoming events — top upcoming events */}
        <section className="mb-8 px-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="font-display font-bold text-[#4F252E] text-xl lg:text-2xl">
              <LocalizedCopy path={["events_upcoming"]} />
            </h2>
          </div>
          <ThisWeekRail />
        </section>

        {/* Divider */}
        <div className="border-t border-[var(--color-saffron-600)] mb-4 mx-3" />

        {/* Recurring events row */}
        <EventsAccordion />

        {/* Divider */}
        <div className="border-t border-[var(--color-saffron-600)] mb-6 mx-3" />

        {/* All Events — chips + card list */}
        <section className="px-3">
          <h2 className="font-display font-bold text-[#4F252E] text-xl lg:text-2xl mb-4">
            <LocalizedCopy path={["events_all"]} />
          </h2>
          <EventsExact />
        </section>
      </div>

      <div className="relative z-10"><SiteFooter /></div>
    </div>
  );
}
