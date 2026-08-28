"use client";

import { isContentSwitchable } from "@/gen/content";
import { useLang, type ContentMode } from "@/context/LanguageContext";

export default function LocalContentToggle() {
  const { tr, contentMode, setContentMode } = useLang();
  if (!isContentSwitchable) return null;

  const options: Array<{ mode: ContentMode; label: string }> = [
    { mode: "real", label: tr.local_preview.real },
    { mode: "placeholder", label: tr.local_preview.placeholder },
  ];

  return (
    <aside
      data-local-content-toggle
      className="sticky top-0 z-[70] flex items-center justify-center gap-2 bg-[var(--color-paper)] px-3 py-2 border-b border-[var(--color-line)]"
      aria-label={tr.local_preview.label}
    >
      <span className="font-body text-xs font-semibold text-[var(--color-text-secondary)]">
        {tr.local_preview.label}
      </span>
      <div className="inline-flex rounded-full border border-[var(--color-line-strong)] p-0.5" role="group">
        {options.map((option) => (
          <button
            key={option.mode}
            type="button"
            onClick={() => setContentMode(option.mode)}
            aria-pressed={contentMode === option.mode}
            className={`rounded-full px-3 py-1 font-body text-xs font-semibold transition-colors ${
              contentMode === option.mode
                ? "bg-[var(--color-saffron-600)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </aside>
  );
}