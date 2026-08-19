"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";

const top4 = [
  {
    id: "top1",
    tag: "TOP 1 SEVA",
    title: "Top 1 Seva",
    desc: "Details coming soon.",
    img: "/slide/KRAJ0615.JPG",
    href: "/sevas/top-1",
  },
  {
    id: "top2",
    tag: "TOP 2 SEVA",
    title: "Top 2 Seva",
    desc: "Details coming soon.",
    img: "/slide/KRAJ0835.JPG",
    href: "/sevas#top2",
  },
  {
    id: "top3",
    tag: "TOP 3 SEVA",
    title: "Top 3 Seva",
    desc: "Details coming soon.",
    img: "/slide/go-matha.jpg",
    href: "/sevas#top3",
  },
  {
    id: "top4",
    tag: "TOP 4 SEVA",
    title: "Top 4 Seva",
    desc: "Details coming soon.",
    img: "/slide/KRAJ0615.JPG",
    href: "/sevas#top4",
  },
];

export default function Top4SevaRail() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = () => {
      if (!paused.current && el) {
        el.scrollLeft -= 0.5;
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
    <div className="w-full bg-[var(--color-cream)] pt-4 pb-0" id="top4">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mb-4">
        <p className="font-body text-[10px] tracking-[.2em] uppercase text-[var(--color-text-brand)] font-semibold mb-1">FEATURED</p>
        <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-2xl">Top 4 Sevas</h2>
      </div>

      {/* Mobile: auto-scrolling rail */}
      <div
        ref={scrollRef}
        className="lg:hidden flex gap-3 px-5 pb-1"
        style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {top4.map((seva) => (
          <a key={seva.id} href={seva.href}
            className="group shrink-0 flex flex-col rounded-xl overflow-hidden border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)]/50 transition-colors bg-white"
            style={{ width: "200px" }}>
            <div className="relative w-full h-[120px]">
              <Image src={seva.img} alt={seva.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/50 to-transparent" />
              <span className="absolute top-2 left-2 font-body text-[9px] tracking-widest uppercase px-2 py-0.5 bg-[var(--color-paper)]" style={{color: "var(--color-text-primary)"}}>{seva.tag}</span>
            </div>
            <div className="p-3">
              <p className="font-display font-bold text-[var(--color-text-primary)] text-[14px] mb-1">{seva.title}</p>
              <p className="font-body text-[var(--color-text-secondary)] text-[11px] leading-relaxed">{seva.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Desktop: static 4-column grid */}
      <div className="hidden lg:grid grid-cols-4 gap-5 max-w-7xl mx-auto px-8">
        {top4.map((seva) => (
          <a key={seva.id} href={seva.href}
            className="group flex flex-col rounded-xl overflow-hidden border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)]/50 transition-colors bg-white">
            <div className="relative w-full h-[180px]">
              <Image src={seva.img} alt={seva.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-900)]/50 to-transparent" />
              <span className="absolute top-3 left-3 font-body text-[9px] tracking-widest uppercase px-2 py-0.5 bg-[var(--color-paper)]" style={{color: "var(--color-text-primary)"}}>{seva.tag}</span>
            </div>
            <div className="p-4">
              <p className="font-display font-bold text-[var(--color-text-primary)] text-[16px] mb-1">{seva.title}</p>
              <p className="font-body text-[var(--color-text-secondary)] text-[12px] leading-relaxed">{seva.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
