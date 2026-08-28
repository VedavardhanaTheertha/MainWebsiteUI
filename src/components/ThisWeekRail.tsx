"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";

type Event = {
  displayDate: string;
  category: string;
  title: string;
  location: string;
  time: string;
  description: string;
};

const catColor: Record<string, string> = {
  Utsava: "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]",
  Festival: "bg-[var(--color-paper)] text-[var(--color-text-secondary)] border border-[var(--color-saffron-600)]",
  Parayana: "bg-[#EFF6FF] text-[#2B6CB0]",
  Annadaana: "bg-[#F0FDF4] text-[#166534]",
  Pooja: "bg-[#FEF3C7] text-[#92400E]",
  Pravachana: "bg-[#F5F3FF] text-[#5B21B6]",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`font-body text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${catColor[category] ?? "bg-[var(--color-saffron-600)] text-[var(--color-text-secondary)]"}`}>
      {category}
    </span>
  );
}

export default function ThisWeekRail({ events }: { events: Event[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = () => {
      if (!paused.current && el) {
        el.scrollLeft -= 0.6;
        if (el.scrollLeft <= 0) el.scrollLeft = el.scrollWidth - el.clientWidth;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    const pause = () => { paused.current = true; };
    const resume = () => { setTimeout(() => { paused.current = false; }, 1500); };
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);
    el.addEventListener("mousedown", pause);
    el.addEventListener("mouseup", resume);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("mousedown", pause);
      el.removeEventListener("mouseup", resume);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes cardPop {
          0%   { opacity: 0; transform: translateY(16px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .event-card { animation: cardPop 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .event-card:nth-child(1) { animation-delay: 0.05s; }
        .event-card:nth-child(2) { animation-delay: 0.15s; }
        .event-card:nth-child(3) { animation-delay: 0.25s; }
        .event-card:nth-child(4) { animation-delay: 0.35s; }
        .event-card:nth-child(5) { animation-delay: 0.45s; }
      `}</style>

      {/* Mobile: auto-scrolling rail */}
      <div
        ref={scrollRef}
        className="lg:hidden flex gap-3 -mx-3 px-3 pb-2"
        style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {events.map((ev, i) => (
          <div key={i} className="event-card shrink-0 w-[200px] bg-white border border-[var(--color-saffron-600)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="relative w-full h-[110px]">
              <Image src="/event.JPG" alt={ev.title} fill className="object-cover" sizes="200px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/70 to-transparent" />
              <span className="absolute bottom-2 left-2"><CategoryBadge category={ev.category} /></span>
            </div>
            <div className="p-3">
              <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 mb-0.5">{ev.displayDate} · {ev.time}</p>
              <p className="font-display font-bold text-[var(--color-text-primary)] text-[13px] leading-snug mb-1">{ev.title}</p>
              <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 line-clamp-1">{ev.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: static grid with photo */}
      <div className="hidden lg:grid grid-cols-5 gap-2">
        {events.map((ev, i) => (
          <article key={i} className="event-card bg-white rounded-xl overflow-hidden border border-[var(--color-saffron-600)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="relative w-full h-[120px]">
              <Image src="/event.JPG" alt={ev.title} fill className="object-cover" sizes="20vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/60 to-transparent" />
              <span className="absolute bottom-2 left-2"><CategoryBadge category={ev.category} /></span>
            </div>
            <div className="p-3">
              <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60 mb-0.5">{ev.displayDate} · {ev.time}</p>
              <p className="font-display font-bold text-[var(--color-text-primary)] text-[13px] leading-snug mb-1">{ev.title}</p>
              <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60">{ev.location}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
