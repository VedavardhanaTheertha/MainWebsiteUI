"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { EventsList } from "@/components/events/EventsList";

export default function EventsPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.events.heading} subheading={tr.events.intro} />
      <EventsList />
    </div>
  );
}
