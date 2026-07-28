"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

export function EventsList() {
  const { tr, lang } = useLang();
  const [active, setActive] = useState<string>("all");
  const allLabel = lang === "kn" ? "ಎಲ್ಲಾ" : "All";

  const items = useMemo(() => {
    const sorted = [...tr.events.list].sort((a, b) => a.date.localeCompare(b.date));
    return active === "all" ? sorted : sorted.filter((e) => e.category === active);
  }, [tr.events.list, active]);

  return (
    <div className="px-4 py-6 lg:mx-auto lg:max-w-4xl lg:px-8">
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {["all", ...tr.events.categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`shrink-0 rounded-[var(--radius-pill)] px-4 py-1.5 text-sm font-medium ${
              active === cat
                ? "bg-[var(--color-saffron-600)] text-white"
                : "bg-[var(--color-cream-soft)] text-[var(--color-ink-700)]"
            }`}
          >
            {cat === "all" ? allLabel : cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {items.map((event) => (
          <div
            key={event.id}
            className="flex gap-3 rounded-[var(--radius-lg)] bg-[var(--color-cream-soft)] p-3 shadow-[var(--shadow-card)]"
          >
            <PlaceholderImage
              imageKey={event.image}
              alt={event.title}
              aspect="1 / 1"
              radius="md"
              className="h-20 w-20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-saffron-700)]">
                {event.category} · {event.date}
              </span>
              <h3 className="mt-0.5 font-display text-base text-[var(--color-ink-900)]">
                {event.title}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-ink-700)]">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
