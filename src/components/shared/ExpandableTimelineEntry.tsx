"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PlaceholderImage } from "./PlaceholderImage";

export function ExpandableTimelineEntry({
  order,
  name,
  title,
  description,
  portrait,
}: {
  order: number;
  name: string;
  title: string;
  description: string;
  portrait: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-3 border-b border-[var(--color-line-soft)] py-4 last:border-0">
      <PlaceholderImage
        imageKey={portrait}
        alt={name}
        aspect="1 / 1"
        radius="pill"
        className="h-14 w-14 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-[var(--color-saffron-700)]">#{order}</span>
            <h3 className="font-display text-lg text-[var(--color-ink-900)]">{name}</h3>
            <p className="text-xs text-[var(--color-ink-500)]">{title}</p>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-label={`Toggle history for ${name}`}
            onClick={() => setOpen((v) => !v)}
            className="mt-1 shrink-0 p-1 text-[var(--color-ink-500)]"
          >
            <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
        {open && <p className="mt-2 text-sm text-[var(--color-ink-700)]">{description}</p>}
      </div>
    </div>
  );
}
