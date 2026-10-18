"use client";

import { useId } from "react";
import { isContentSwitchable } from "@/gen/content";
import { useLang } from "@/context/LanguageContext";

export default function LocalContentToggle() {
  const { tr, contentMode, setContentMode } = useLang();
  const descriptionId = useId();
  if (!isContentSwitchable) return null;

  return (
    <fieldset
      data-local-content-toggle
      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5"
    >
      <legend className="px-2 font-semibold text-[var(--color-text-primary)]">
        {tr.local_preview.label}
      </legend>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 font-semibold text-[var(--color-text-primary)]">
        <input
          type="checkbox"
          data-developer-option="placeholder-copy"
          checked={contentMode === "placeholder"}
          onChange={(event) => setContentMode(event.target.checked ? "placeholder" : "real")}
          aria-describedby={descriptionId}
          className="mt-1 size-5 shrink-0 accent-[var(--color-saffron-600)]"
        />
        {tr.local_preview.placeholder}
      </label>
      <p id={descriptionId} className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{tr.developer_options.copy_description}</p>
    </fieldset>
  );
}