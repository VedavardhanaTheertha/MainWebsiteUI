"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAutoScrollRail } from "@/hooks/useAutoScrollRail";
import type { HomePageCard } from "@/lib/content-types";
import RailMotionControl from "@/components/RailMotionControl";

export default function PageCarousel({ items }: { items: HomePageCard[] }) {
  const [paused, setPaused] = useState(false);
  const track = useAutoScrollRail(items.length, paused);
  if (!items.length) return null;
  return (
    <section data-carousel="top_carousel" className="relative mx-auto mt-3 max-w-7xl">
      {items.length > 1 && <RailMotionControl className="" paused={paused} onToggle={() => setPaused((value) => !value)} />}
      <div
        ref={track}
        className="flex gap-5 overflow-x-auto px-4 pt-0.5 pb-2 lg:px-8"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {items.map((item) => (
          <Link key={item.id} href={item.url}
            className="relative h-80 w-[82vw] max-w-[320px] shrink-0 overflow-hidden rounded-[20px] lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
            style={{ boxShadow: "0 12px 26px -14px rgba(38,27,18,.45)" }}
          >
            <div className="absolute inset-0">
              <Image src={item.image} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 391px) 320px, 82vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/85" />
            <div className="absolute inset-x-0 bottom-0 px-[18px] py-4 text-[var(--color-cream-hi)]">
              <p className="text-[9.5px] font-bold tracking-[.12em] uppercase mb-1">{item.page_type}</p>
              <h2 className="font-display text-[21px] leading-[1.2] line-clamp-2">{item.title}</h2>
              <p className="text-[12px] leading-[1.5] mt-2 line-clamp-3">{item.description}</p>
              {item.footnote && <p className="text-[11px] mt-2">{item.footnote}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
