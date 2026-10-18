"use client";

import { useState } from "react";
import ContentImage from "@/components/presentation/ContentImage";
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
            className="visual-tile relative flex min-h-80 w-[82vw] max-w-[320px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-[var(--color-paper)] lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
            style={{ boxShadow: "0 12px 26px -14px rgba(38,27,18,.45)" }}
          >
            <div className="visual-tile-art relative h-44 w-full shrink-0">
              <ContentImage src={item.image} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 391px) 320px, 82vw" />
            </div>
            <div className="visual-tile-body flex-1 px-[18px] py-4 text-[var(--color-text-primary)]">
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
