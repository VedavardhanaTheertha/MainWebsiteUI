"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

/** Single seva-browsing implementation, reused by both /sevas and
 * /seva/all-sevas — avoids maintaining two near-identical browsers. */
export function SevaBrowser({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const { tr, lang } = useLang();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const allLabel = lang === "kn" ? "ಎಲ್ಲಾ" : "All";

  const items = useMemo(() => {
    let list = tr.seva.items;
    if (featuredOnly) list = list.filter((i) => i.featured);
    if (activeCategory !== "all") list = list.filter((i) => i.category === activeCategory);
    return list;
  }, [tr.seva.items, activeCategory, featuredOnly]);

  return (
    <div className="px-4 py-6 lg:mx-auto lg:max-w-6xl lg:px-8">
      {!featuredOnly && (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {["all", ...tr.seva.categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-[var(--radius-pill)] px-4 py-1.5 text-sm font-medium ${
                activeCategory === cat
                  ? "bg-[var(--color-saffron-600)] text-white"
                  : "bg-[var(--color-cream-soft)] text-[var(--color-ink-700)]"
              }`}
            >
              {cat === "all" ? allLabel : cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] shadow-[var(--shadow-card)]"
          >
            <PlaceholderImage imageKey={item.image} alt={item.name} aspect="4 / 3" radius="none" />
            <div className="flex flex-1 flex-col p-3">
              <h3 className="font-display text-base text-[var(--color-ink-900)]">{item.name}</h3>
              <p className="mt-1 line-clamp-2 flex-1 text-xs text-[var(--color-ink-700)]">
                {item.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--color-saffron-700)]">
                  {item.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
