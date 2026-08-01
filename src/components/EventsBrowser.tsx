"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Event = {
  displayDate: string;
  category: string;
  title: string;
  location: string;
  time: string;
  description: string;
};

const catColor: Record<string, { bg: string; text: string }> = {
  Pooja:      { bg: "#FFF7C5", text: "#4F252E" },
  Pravachana: { bg: "#C1EBE9", text: "#4F252E" },
  Annadaana:  { bg: "#C1EBE9", text: "#4F252E" },
  Utsava:     { bg: "#F4AE52", text: "#4F252E" },
  Parayana:   { bg: "#FFF7C5", text: "#4F252E" },
  Festival:   { bg: "#FFF7C5", text: "#4F252E" },
};

function EventCard({ ev }: { ev: Event }) {
  const color = catColor[ev.category] ?? { bg: "#F4AE52", text: "#4F252E" };
  return (
    <article
      className="rounded-2xl overflow-hidden border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      style={{ borderColor: "#4F252E22" }}
    >
      {/* Color band header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: color.bg }}>
        <span className="font-body text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4F252E" }}>
          {ev.category}
        </span>
        <span className="font-body text-[10px]" style={{ color: "#4F252E99" }}>{ev.time}</span>
      </div>
      <div className="bg-white px-4 py-3">
        <p className="font-body text-[10px] mb-0.5" style={{ color: "#4F252E99" }}>{ev.displayDate}</p>
        <p className="font-display font-bold text-base leading-snug mb-1" style={{ color: "#4F252E" }}>{ev.title}</p>
        <p className="font-body text-[11px]" style={{ color: "#4F252Eaa" }}>{ev.location}</p>
      </div>
    </article>
  );
}

function EventSection({ title, items, defaultOpen = false }: { title: string; items: Event[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 4);

  return (
    <div className="mb-3">
      <button
        onClick={() => { setOpen((o) => !o); setShowAll(false); }}
        className="w-full flex items-center justify-between rounded-2xl px-4 py-3.5 shadow-sm border transition-colors"
        style={{ background: "#4F252E", borderColor: "#4F252E" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-base text-white">{title}</span>
          <span className="font-body text-[11px] rounded-full px-2 py-0.5" style={{ background: "#F4AE52", color: "#4F252E" }}>
            {items.length}
          </span>
        </div>
        {open
          ? <ChevronUp size={18} color="#F4AE52" />
          : <ChevronDown size={18} color="#F4AE52" />}
      </button>

      {open && (
        <>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((ev, i) => <EventCard key={i} ev={ev} />)}
          </div>
          {items.length > 4 && (
            <button
              onClick={() => setShowAll((s) => !s)}
              className="mt-3 w-full font-body text-sm font-semibold py-2 rounded-xl border transition-colors"
              style={{ color: "#4F252E", borderColor: "#F4AE52", background: "#FFF7C5" }}
            >
              {showAll ? "Show Less" : `Show All ${items.length} →`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

const monthlyEvents: Event[] = [
  { displayDate: "Every Friday (Ashadha)", category: "Pooja", title: "Ashadha Shukravara Pooja", location: "Shri Shiroor Matha, Udupi", time: "7:00 AM", description: "Special pooja every Friday of Ashadha month." },
  { displayDate: "Every Ekadashi", category: "Parayana", title: "Vishnu Sahasranama Parayana", location: "Shri Shiroor Matha, Udupi", time: "4:00 PM", description: "Group recitation of the thousand names of Lord Vishnu." },
  { displayDate: "Every Ekadashi", category: "Utsava", title: "Ekadashi Celebrations", location: "Udupi Sri Krishna Temple", time: "6:00 AM onwards", description: "Monthly Ekadashi fasting and special puja." },
  { displayDate: "Monthly", category: "Annadaana", title: "Annadaana Seva", location: "Bhojana Shala, Shiroor Matha", time: "11:30 AM", description: "Community meal offering — open to all devotees." },
  { displayDate: "Every Purnima", category: "Pravachana", title: "Swamiji Pravachana", location: "Matha Auditorium, Udupi", time: "5:30 PM", description: "Monthly discourse by Pujya Swamiji." },
];

const annualEvents: Event[] = [
  { displayDate: "15 July 2026", category: "Festival", title: "Guru Purnima Celebrations", location: "Shri Shiroor Matha, Udupi", time: "8:00 AM", description: "Offer prayers to the Guru lineage." },
  { displayDate: "16 August 2026", category: "Festival", title: "Krishnashtami Mahotsava", location: "Shri Shiroor Matha, Udupi", time: "From midnight", description: "Grand celebration of Lord Krishna's birth anniversary." },
  { displayDate: "15 October 2026", category: "Parayana", title: "Dvaadashastuti Utsava", location: "Shri Shiroor Matha, Udupi", time: "9:00 AM", description: "Annual recitation of the sacred twelve-verse hymn." },
  { displayDate: "30 November 2026", category: "Annadaana", title: "Karthika Annadaana Mahotsava", location: "Bhojana Shala, Shiroor Matha", time: "11:00 AM", description: "Mass Annadaana — feeding over 5,000 devotees." },
  { displayDate: "14 January 2027", category: "Festival", title: "Makara Sankranti Celebrations", location: "Shri Shiroor Matha, Udupi", time: "6:00 AM", description: "Harvest festival with special Nitya Pooja." },
];

const specialEvents: Event[] = [
  { displayDate: "12 July 2026", category: "Utsava", title: "Paryaya Rathotsava", location: "Udupi Sri Krishna Temple", time: "6:00 AM onwards", description: "The grand chariot festival." },
  { displayDate: "30 June 2026", category: "Pooja", title: "Ashadha Shukravara Pooja", location: "Shri Shiroor Matha, Udupi", time: "7:00 AM", description: "Special opening pooja of the season." },
  { displayDate: "2 July 2026", category: "Pravachana", title: "Swamiji Pravachana — Bhagavata", location: "Matha Auditorium, Udupi", time: "5:30 PM", description: "Special discourse on the tenth canto of Bhagavata." },
  { displayDate: "4 July 2026", category: "Annadaana", title: "Ashadha Annadaana Seva", location: "Bhojana Shala, Shiroor Matha", time: "11:30 AM", description: "Grand Annadaana of the Ashadha season." },
];

export default function EventsBrowser() {
  return (
    <div className="px-3 lg:px-8 pt-4 pb-8 relative z-10">
      <EventSection title="Monthly Events"  items={monthlyEvents}  defaultOpen={true} />
      <EventSection title="Annual Events"   items={annualEvents}   />
      <EventSection title="Special Events"  items={specialEvents}  />
    </div>
  );
}
