"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "@/context/LanguageContext";

export default function EventsExact() {
  const { tr } = useLang();
  const { tabs, list } = tr.events_exact;
  const [cat, setCat] = useState("all");
  const items = list.filter((e) => cat === "all" || e.cat === cat);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 lg:mx-0 lg:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setCat(t.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full border font-body text-xs font-semibold transition-colors ${
              cat === t.id
                ? "bg-[var(--color-ink-800)] text-white border-transparent"
                : "bg-[var(--color-paper)] text-[var(--color-text-secondary)] border-[var(--color-line-strong)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {items.map((e) => (
          <div key={e.title} className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-[170px] h-[170px] shrink-0 rounded-[8px] overflow-hidden">
              <Image src={e.img} alt="" fill sizes="170px" className="object-cover" />
              {e.live ? (
                <span className="absolute bottom-2 left-2 bg-[var(--color-danger-500)] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded">
                  {e.tag}
                </span>
              ) : (
                <span className="absolute bottom-2 right-2 bg-[rgba(26,17,8,.82)] text-white text-[10.5px] font-semibold px-1.5 py-0.5 rounded">
                  {e.dur}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[16.5px] text-[var(--color-text-primary)] leading-tight mt-1 sm:mt-0">{e.title}</p>
              <p className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">{e.date} · {e.views}</p>
              <p className="text-xs text-[var(--color-text-secondary)] leading-[1.5] mt-1">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
