"use client";

import { useState, useMemo, useId } from "react";
import Image from "next/image";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { sevas, type SevaCategory } from "@/data/sevas";

const categoryImg: Record<string, string> = {
  "Krishna Sannidhi":     "/krishna.jpg",
  "Mukhyaprana Sannidhi": "/slide/KRAJ0615.JPG",
  "Garuda Deva Sannidhi": "/vittala.png",
  "Bhojana Shala":        "/slide/KRAJ0835.JPG",
  "Bhageerathi":          "/shiroor-mutt.jpg",
  "Navagraha":            "/chakra.png",
  "Subrahmanya":          "/lord-vitthala.jpeg",
  "Special":              "/swamiji.jpg",
  "Other":                "/main-logo.png",
};

const specialSevas = sevas.filter((s) => s.isSpecial);
const nityaSevas  = sevas.filter((s) => s.category === "Krishna Sannidhi");
const allSevas    = sevas;

function SevaCard({ seva, onOffer }: { seva: typeof sevas[0]; onOffer: () => void }) {
  const img = categoryImg[seva.category] ?? "/main-logo.png";
  return (
    <article className="bg-white p-4 flex flex-col gap-2 border border-[var(--color-saffron-600)] shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3">
        {/* Small circular category photo */}
        <div className="shrink-0 w-11 h-11 overflow-hidden">
          <Image src={img} alt={seva.category} width={44} height={44}
            className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="font-body text-[10px] text-[var(--color-text-secondary)]/60">{seva.category}</p>
            {seva.isSpecial && (
              <span className="font-body text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 shrink-0 bg-[var(--color-paper)]" style={{color: "var(--color-text-primary)"}}>
                Special
              </span>
            )}
          </div>
          <h3 className="font-display font-semibold text-[var(--color-text-primary)] text-[13px] leading-tight">{seva.name}</h3>
        </div>
      </div>
      <p className="font-body text-[var(--color-text-secondary)] text-xs leading-relaxed line-clamp-2">{seva.significance}</p>
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-saffron-600)]">
        <span className="font-body text-sm font-semibold text-[var(--color-text-primary)]">₹{seva.price.toLocaleString("en-IN")}</span>
        <button
          onClick={onOffer}
          className="font-body text-xs font-semibold text-white bg-[var(--color-saffron-600)] hover:bg-[var(--color-saffron-700)] px-4 py-1.5 transition-colors"
        >
          Offer Seva
        </button>
      </div>
    </article>
  );
}

function SevaSection({ title, items, defaultOpen = false }: { title: string; items: typeof sevas; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 4);

  return (
    <div className="mb-3">
      {/* Section header */}
      <button
        onClick={() => { setOpen((o) => !o); setShowAll(false); }}
        className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-[var(--color-saffron-600)]"
      >
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-[var(--color-text-primary)] text-base">{title}</span>
          <span className="font-body text-[11px] text-[var(--color-text-primary)] bg-[#8FDDDF] rounded-full px-2 py-0.5">{items.length}</span>
        </div>
        {open
          ? <ChevronUp size={18} className="text-[var(--color-text-brand)]" />
          : <ChevronDown size={18} className="text-[var(--color-text-brand)]" />}
      </button>

      {/* Cards — only shown when open */}
      {open && (
        <>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {visible.map((seva) => (
              <SevaCard
                key={seva.id}
                seva={seva}
                onOffer={() => alert(`Seva booking for "${seva.name}" — payment integration coming soon.`)}
              />
            ))}
          </div>

          {items.length > 4 && (
            <button
              onClick={() => setShowAll((s) => !s)}
              className="mt-3 w-full font-body text-sm text-[var(--color-text-brand)] font-semibold py-2 border border-[var(--color-saffron-600)]/30 rounded-xl hover:bg-[var(--color-saffron-100)] transition-colors"
            >
              {showAll ? "Show Less" : `Show All ${items.length} →`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function SevasBrowser() {
  const [query, setQuery] = useState("");
  const searchId = useId();

  const filteredResults = useMemo(() => {
    if (!query) return null;
    const q = query.toLowerCase();
    return sevas.filter((s) => s.name.toLowerCase().includes(q) || s.significance.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="px-3 lg:px-8 pt-1 pb-8 lg:py-12" id="donate">
      {/* Search bar */}
      <div className="sticky top-[56px] lg:top-[64px] z-30 bg-[var(--color-parchment)]/95 backdrop-blur-sm pt-3 pb-3 mb-4">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">Search sevas</label>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]/50 pointer-events-none" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sevas…"
            className="w-full bg-white border border-[var(--color-saffron-600)] rounded-full pl-10 pr-4 py-2.5 font-body text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/40 focus:outline-none focus:border-[var(--color-saffron-600)] focus:ring-2 focus:ring-[var(--color-saffron-600)]/20 transition-all"
          />
        </div>
      </div>

      {/* Search results */}
      {filteredResults !== null ? (
        <div>
          <p className="font-body text-xs text-[var(--color-text-secondary)]/60 mb-3">{filteredResults.length} results for "{query}"</p>
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredResults.map((seva) => (
                <SevaCard key={seva.id} seva={seva} onOffer={() => alert(`Booking for "${seva.name}" — coming soon.`)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-display text-[var(--color-text-secondary)] text-xl mb-1">No sevas found</p>
              <p className="font-body text-[var(--color-text-secondary)]/60 text-sm">Try a different search term.</p>
            </div>
          )}
        </div>
      ) : (
        /* Accordion sections */
        <>
          <SevaSection title="Special Sevas" items={specialSevas} defaultOpen={true} />
          <SevaSection title="Nitya Sevas" items={nityaSevas} defaultOpen={false} />
          <SevaSection title="All Sevas" items={allSevas} defaultOpen={false} />
        </>
      )}
    </div>
  );
}
