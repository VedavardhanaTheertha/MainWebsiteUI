"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

export default function SpotlightCarousel() {
  const { tr } = useLang();
  const items = tr.home.spotlight;
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const stepW = () => {
    const el = trackRef.current;
    if (!el) return 1;
    const card = el.querySelector<HTMLElement>(":scope > *");
    return card ? card.offsetWidth + 12 : el.clientWidth;
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (el) setActive(Math.round(el.scrollLeft / stepW()));
  };

  const goTo = (k: number) => {
    trackRef.current?.scrollTo({ left: k * stepW(), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-3">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto px-[18px] pt-0.5"
        style={{
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: 18,
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="relative shrink-0 h-[190px] rounded-[20px] overflow-hidden"
            style={{ flex: "0 0 84%", scrollSnapAlign: "start", boxShadow: "0 12px 26px -14px rgba(38,27,18,.45)" }}
          >
            <Image src={item.img} alt="" fill sizes="84vw" className="object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(20,12,4,.06) 0%, rgba(20,12,4,.12) 40%, rgba(20,12,4,.74) 100%)" }}
            />
            <div className="absolute left-0 right-0 bottom-0 px-[18px] py-4">
              <div className="text-[9.5px] font-bold tracking-[.16em] uppercase text-[var(--color-gold-300)] mb-1">{item.tag}</div>
              <div className="font-display text-[21px] leading-[1.1] text-[var(--color-cream-hi)]">{item.title}</div>
              <div className="text-[11.5px] leading-[1.45] mt-1 max-w-[230px]" style={{ color: "rgba(255,248,232,.82)" }}>{item.sub}</div>
              <span className="inline-flex items-center gap-1.5 mt-[11px] text-xs font-semibold text-[var(--color-cream-hi)]">
                Explore
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {items.map((item, k) => (
          <button
            key={item.title}
            onClick={() => goTo(k)}
            aria-label={`Go to slide ${k + 1}`}
            className="h-[7px] rounded-full transition-all duration-200"
            style={{
              width: k === active ? 22 : 7,
              background: k === active ? "var(--color-saffron-500)" : "var(--color-line-strong)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
