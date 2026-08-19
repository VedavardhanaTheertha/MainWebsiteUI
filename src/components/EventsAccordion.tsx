"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Ev = { displayDate: string; category: string; title: string; location: string; time: string };

const catColor: Record<string, string> = {
  Utsava:     "bg-[#FFAE6E] text-[var(--color-text-primary)]",
  Festival:   "bg-[#FFE3E3] text-[var(--color-text-primary)]",
  Parayana:   "bg-[#8FDDDF] text-[var(--color-text-primary)]",
  Annadaana:  "bg-[#8FDDDF] text-[var(--color-text-primary)]",
  Pooja:      "bg-[#FFE3E3] text-[var(--color-text-primary)]",
  Pravachana: "bg-[#FFAE6E] text-[var(--color-text-primary)]",
};

function Badge({ cat }: { cat: string }) {
  return (
    <span className={`font-body text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${catColor[cat] ?? "bg-[var(--color-saffron-600)] text-[var(--color-text-primary)]"}`}>
      {cat}
    </span>
  );
}

function EventRow({ ev }: { ev: Ev }) {
  return (
    <div className="bg-white rounded-xl p-3 flex gap-3 border border-[var(--color-saffron-600)] shadow-sm">
      <div className="shrink-0 bg-gradient-to-br from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-lg w-10 h-10 flex flex-col items-center justify-center text-white">
        <span className="font-body font-bold text-sm leading-none">{ev.displayDate.split(" ")[0]}</span>
        <span className="font-body text-[8px] uppercase">{ev.displayDate.split(" ")[1]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          <Badge cat={ev.category} />
          <span className="font-body text-[10px] text-[var(--color-text-secondary)]/60">{ev.time}</span>
        </div>
        <p className="font-display font-semibold text-[var(--color-text-primary)] text-sm truncate">{ev.title}</p>
        <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 truncate">{ev.location}</p>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: Ev[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-[var(--color-saffron-600)] shadow-sm"
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-[var(--color-text-primary)] text-base">{title}</span>
          <span className="font-body text-[11px] text-[var(--color-text-primary)] bg-[#8FDDDF] rounded-full px-2 py-0.5">{items.length}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-[var(--color-text-brand)]" /> : <ChevronDown size={18} className="text-[var(--color-text-brand)]" />}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {items.map((ev, i) => <EventRow key={i} ev={ev} />)}
        </div>
      )}
    </div>
  );
}

const monthlyEvents: Ev[] = [
  { displayDate: "Every Friday", category: "Pooja", title: "Ashadha Shukravara Pooja", location: "Shri Shiroor Matha, Udupi", time: "7:00 AM" },
  { displayDate: "Every Ekadashi", category: "Parayana", title: "Vishnu Sahasranama Parayana", location: "Shri Shiroor Matha, Udupi", time: "4:00 PM" },
  { displayDate: "Every Ekadashi", category: "Utsava", title: "Ekadashi Celebrations", location: "Udupi Sri Krishna Temple", time: "6:00 AM" },
  { displayDate: "Every Purnima", category: "Pravachana", title: "Swamiji Pravachana", location: "Matha Auditorium, Udupi", time: "5:30 PM" },
];

const annualEvents: Ev[] = [
  { displayDate: "15 July 2026", category: "Festival", title: "Guru Purnima Celebrations", location: "Shri Shiroor Matha, Udupi", time: "8:00 AM" },
  { displayDate: "16 August 2026", category: "Festival", title: "Krishnashtami Mahotsava", location: "Shri Shiroor Matha, Udupi", time: "From midnight" },
  { displayDate: "15 October 2026", category: "Parayana", title: "Dvaadashastuti Utsava", location: "Shri Shiroor Matha, Udupi", time: "9:00 AM" },
  { displayDate: "14 January 2027", category: "Festival", title: "Makara Sankranti Celebrations", location: "Shri Shiroor Matha, Udupi", time: "6:00 AM" },
];

const specialEvents: Ev[] = [
  { displayDate: "12 July 2026", category: "Utsava", title: "Paryaya Rathotsava", location: "Udupi Sri Krishna Temple", time: "6:00 AM onwards" },
  { displayDate: "30 November 2026", category: "Annadaana", title: "Karthika Annadaana Mahotsava", location: "Bhojana Shala, Shiroor Matha", time: "11:00 AM" },
  { displayDate: "30 June 2026", category: "Pooja", title: "Ashadha Shukravara Pooja (Opening)", location: "Shri Shiroor Matha, Udupi", time: "7:00 AM" },
  { displayDate: "4 July 2026", category: "Annadaana", title: "Ashadha Annadaana Seva", location: "Bhojana Shala, Shiroor Matha", time: "11:30 AM" },
];

export default function EventsAccordion() {
  return (
    <div className="px-3 pt-2 pb-4">
      <Section title="Monthly Events" items={monthlyEvents} />
      <Section title="Annual Events"  items={annualEvents} />
      <Section title="Special Events" items={specialEvents} />
    </div>
  );
}
