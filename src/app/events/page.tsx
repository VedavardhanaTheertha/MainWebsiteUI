import type { Metadata } from "next";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";
import ThisWeekRail from "@/components/ThisWeekRail";
import EventsAccordion from "@/components/EventsAccordion";
import EventsExact from "@/components/EventsExact";

export const metadata: Metadata = {
  title: "Events | Shri Shiroor Matha, Udupi",
  description: "Upcoming and past events at Shri Shiroor Matha during the Paryaya 2026-2028 term.",
};

const allEvents = [
  {
    date: "2026-06-30",
    displayDate: "30 June 2026",
    category: "Pooja",
    title: "Ashadha Shukravara Pooja",
    location: "Shri Shiroor Matha, Udupi",
    time: "7:00 AM",
    description: "Special pooja observed every Friday of Ashadha month with floral offerings and bhajans.",
    thisWeek: true,
  },
  {
    date: "2026-07-02",
    displayDate: "2 July 2026",
    category: "Pravachana",
    title: "Swamiji Pravachana — Bhagavata",
    location: "Matha Auditorium, Udupi",
    time: "5:30 PM",
    description: "Evening discourse by Pujya Swamiji on the tenth canto of Shrimad Bhagavata.",
    thisWeek: true,
  },
  {
    date: "2026-07-04",
    displayDate: "4 July 2026",
    category: "Annadaana",
    title: "Ashadha Annadaana Seva",
    location: "Bhojana Shala, Shiroor Matha",
    time: "11:30 AM",
    description: "Community meal offering during the sacred Ashadha month — open to all devotees.",
    thisWeek: true,
  },
  {
    date: "2026-07-05",
    displayDate: "5 July 2026",
    category: "Utsava",
    title: "Ashadha Ekadashi Celebrations",
    location: "Udupi Sri Krishna Temple",
    time: "6:00 AM onwards",
    description: "Auspicious Ekadashi fasting day with Vishnu Sahasranama parayana and special Abhisheka.",
    thisWeek: true,
  },
  {
    date: "2026-07-05",
    displayDate: "5 July 2026",
    category: "Parayana",
    title: "Vishnu Sahasranama Parayana",
    location: "Shri Shiroor Matha, Udupi",
    time: "4:00 PM",
    description: "Group recitation of the thousand names of Lord Vishnu on Ekadashi.",
    thisWeek: true,
  },
  {
    date: "2026-07-12",
    displayDate: "12 July 2026",
    category: "Utsava",
    title: "Paryaya Rathotsava",
    location: "Udupi Sri Krishna Temple",
    time: "6:00 AM onwards",
    description: "The grand chariot festival — Lord Krishna's processional journey through the streets of Udupi, drawing lakhs of devotees.",
    thisWeek: false,
  },
  {
    date: "2026-07-15",
    displayDate: "15 July 2026",
    category: "Festival",
    title: "Guru Purnima Celebrations",
    location: "Shri Shiroor Matha, Udupi",
    time: "8:00 AM",
    description: "Offer prayers to the Guru lineage — special puja and ashirvachana by Pujya Swamiji.",
    thisWeek: false,
  },
  {
    date: "2026-08-16",
    displayDate: "16 August 2026",
    category: "Festival",
    title: "Krishnashtami Mahotsava",
    location: "Shri Shiroor Matha, Udupi",
    time: "From midnight",
    description: "Grand celebration of Lord Krishna's birth anniversary with Abhisheka, Alankaara, special poojas, and Annadaana.",
    thisWeek: false,
  },
  {
    date: "2026-10-15",
    displayDate: "15 October 2026",
    category: "Parayana",
    title: "Dvaadashastuti Utsava",
    location: "Shri Shiroor Matha, Udupi",
    time: "9:00 AM",
    description: "Annual recitation of the sacred twelve-verse hymn praising Lord Vishnu.",
    thisWeek: false,
  },
  {
    date: "2026-11-30",
    displayDate: "30 November 2026",
    category: "Annadaana",
    title: "Karthika Annadaana Mahotsava",
    location: "Bhojana Shala, Shiroor Matha",
    time: "11:00 AM",
    description: "Mass Annadaana on the auspicious Karthika month — feeding over 5,000 devotees in a single sitting.",
    thisWeek: false,
  },
  {
    date: "2027-01-14",
    displayDate: "14 January 2027",
    category: "Festival",
    title: "Makara Sankranti Celebrations",
    location: "Shri Shiroor Matha, Udupi",
    time: "6:00 AM",
    description: "Celebration of the harvest festival with sesame-jaggery offerings and special Nitya Pooja.",
    thisWeek: false,
  },
];

const thisWeekEvents = allEvents.filter((e) => e.thisWeek).slice(0, 5);

export default function EventsPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Madhwacharya watermark — full page */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.06 }}>
        <Image
          src="/Madhwacharya.jpg"
          alt=""
          fill
          className="object-cover"
          style={{ filter: "sepia(1) saturate(3) hue-rotate(340deg) brightness(1.3)" }}
          sizes="100vw"
        />
      </div>

      {/* Page header */}
      <div className="relative z-10 bg-[var(--color-parchment)] pt-4 pb-3 lg:pt-7 lg:pb-6 text-center px-5">
        <p className="font-body text-[10px] lg:text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-2 lg:mb-3">
          Calendar
        </p>
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-4xl mb-2 lg:mb-3">
          Events
        </h1>
        <p className="font-body text-[var(--color-text-brand)]/75 text-sm lg:text-base max-w-xl mx-auto">
          <span className="lg:hidden">Festivals, utsavas & more.</span>
          <span className="hidden lg:inline">Festivals, utsavas, parayanasa, and more — the living rhythm of Paryaya 2026-2028.</span>
        </p>
      </div>

      <div className="w-full px-0 py-6 lg:py-12 relative z-10">

        {/* This Week — top 5 */}
        <section className="mb-8 px-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="font-display font-bold text-[#4F252E] text-xl lg:text-2xl">This Week</h2>
          </div>
          <ThisWeekRail events={thisWeekEvents} />
        </section>

        {/* Divider */}
        <div className="border-t border-[var(--color-saffron-600)] mb-4 mx-3" />

        {/* Monthly / Annual / Special accordions */}
        <EventsAccordion />

        {/* Divider */}
        <div className="border-t border-[var(--color-saffron-600)] mb-6 mx-3" />

        {/* All Events — matches the design reference's EventsScreen chips + card list */}
        <section className="px-3">
          <h2 className="font-display font-bold text-[#4F252E] text-xl lg:text-2xl mb-4">All Events</h2>
          <EventsExact />
        </section>
      </div>

      <div className="relative z-10"><SiteFooter /></div>
    </div>
  );
}
