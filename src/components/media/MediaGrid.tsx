"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Play } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { MediaVideo } from "@/lib/content-types";

export default function MediaGrid({ type }: { type: "photo" | "video" }) {
  const { tr } = useLang();
  const list: Array<MediaVideo | { title: string; detail: string; img: string }> =
    type === "video" ? tr.media.videos : tr.media.photos;
  const [q, setQ] = useState("");
  const items = list.filter((x) => x.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-2.5 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-full px-4 py-2.5 shadow-[var(--shadow-xs)] mb-4 max-w-md">
        <Search size={18} className="text-[var(--color-text-muted)] shrink-0" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={type === "video" ? "Search videos…" : "Search photos…"}
          className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((x) => (
          <div key={x.title} className="rounded-[8px] overflow-hidden bg-[var(--color-paper)] border border-[var(--color-line)] shadow-[var(--shadow-xs)]">
            <div className="relative h-[120px]">
              <Image src={x.img} alt="" fill sizes="200px" className="object-cover" />
              {type === "video" && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center text-white" style={{ background: "rgba(26,17,8,.22)" }}>
                    <Play size={34} fill="currentColor" />
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 text-[10px] font-semibold text-white px-1.5 py-0.5 rounded" style={{ background: "rgba(26,17,8,.7)" }}>
                    {"dur" in x ? x.dur : ""}
                  </span>
                </>
              )}
            </div>
            <div className="px-2.5 py-2">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-tight">{x.title}</p>
              <p className="text-[10.5px] text-[var(--color-text-muted)] mt-0.5">{x.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
