"use client";

import { useState, useMemo, useId } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { sevas } from "@/data/sevas";

const categoryImg: Record<string, string> = {
  "Krishna Sannidhi": "/krishna.jpg",
  "Mukhyaprana Sannidhi": "/slide/KRAJ0615.JPG",
  "Garuda Deva Sannidhi": "/vittala.png",
  "Bhojana Shala": "/slide/KRAJ0835.JPG",
  "Bhageerathi": "/shiroor-mutt.jpg",
  "Navagraha": "/chakra.png",
  "Subrahmanya": "/lord-vitthala.jpeg",
  "Special": "/swamiji.jpg",
  "Other": "/main-logo.png",
};

const TABS = [
  { id: "nitya", label: "Nitya Seva" },
  { id: "special", label: "Special Seva" },
  { id: "all", label: "All Seva" },
] as const;

export default function AllSevaBrowser() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("nitya");
  const [q, setQ] = useState("");
  const searchId = useId();

  const items = useMemo(() => {
    const byTab =
      tab === "nitya" ? sevas.filter((s) => s.category === "Krishna Sannidhi")
      : tab === "special" ? sevas.filter((s) => s.isSpecial)
      : sevas;
    if (!q) return byTab;
    const query = q.toLowerCase();
    return byTab.filter((s) => s.name.toLowerCase().includes(query) || s.significance.toLowerCase().includes(query));
  }, [tab, q]);

  return (
    <div>
      <div className="flex gap-1 border-b border-[var(--color-line)] overflow-x-auto mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 px-3 py-3 text-sm font-semibold transition-colors ${tab === t.id ? "text-[var(--color-saffron-700)]" : "text-[var(--color-text-muted)]"}`}
          >
            {t.label}
            {tab === t.id && <span className="absolute left-3 right-3 -bottom-px h-[2.5px] rounded bg-[var(--color-saffron-500)]" />}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-full px-4 py-2.5 shadow-[var(--shadow-xs)] mb-4">
        <Search size={18} className="text-[var(--color-text-muted)] shrink-0" />
        <label htmlFor={searchId} className="sr-only">Search sevas</label>
        <input
          id={searchId}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sevas…"
          className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-3 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] p-2.5 shadow-[var(--shadow-xs)]">
            <div className="relative w-[62px] h-[62px] shrink-0 rounded-[4px] overflow-hidden">
              <Image src={categoryImg[s.category] ?? "/main-logo.png"} alt="" fill sizes="62px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-[15px] text-[var(--color-text-primary)] leading-tight">{s.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">{s.significance}</p>
            </div>
            <span className="font-display text-lg text-[var(--color-saffron-700)] shrink-0">₹{s.price.toLocaleString("en-IN")}</span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-muted)] py-10">No seva found.</p>
        )}
      </div>
    </div>
  );
}
