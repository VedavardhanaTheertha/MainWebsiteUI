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
    <fieldset
      data-local-content-toggle
      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5"
    >
      <legend className="px-2 font-semibold text-[var(--color-text-primary)]">
        {tr.local_preview.label}
      </legend>
      <p className="mb-4 text-sm leading-6 text-[var(--color-text-secondary)]">{tr.developer_options.copy_description}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={tr.local_preview.label}>
        {options.map((option) => (
          <button
            key={option.mode}
            type="button"
            onClick={() => setContentMode(option.mode)}
            aria-pressed={contentMode === option.mode}
            className={`min-h-11 rounded-full border border-[var(--color-line-strong)] px-4 py-2 font-body text-sm font-semibold transition-colors ${
              contentMode === option.mode
                ? "bg-[var(--color-saffron-600)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}