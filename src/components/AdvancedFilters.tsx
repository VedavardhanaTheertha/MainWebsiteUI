"use client";

import { useId, useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useUiSettings } from "@/context/UiSettingsContext";

export default function AdvancedFilters({ children, search, heading, active = false }: {
  children: ReactNode;
  search: ReactNode;
  heading?: ReactNode;
  active?: boolean;
}) {
  const { tr } = useLang();
  const { browserDefaults } = useUiSettings();
  const [open, setOpen] = useState<boolean>(browserDefaults.advancedFiltersOpen);
  const id = useId();
  const label = open ? tr.page_controls.close_filters : tr.page_controls.open_filters;
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {heading}
        <div className={`flex min-w-0 items-end gap-2 ${heading ? "w-full sm:max-w-md" : "w-full"}`}>
        <div className="min-w-0 flex-1">{search}</div>
        <button
          type="button"
          aria-label={label}
          title={label}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="relative grid size-11 shrink-0 place-items-center rounded-full border border-[var(--color-line-strong)] bg-white text-[var(--color-text-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
        >
          <SlidersHorizontal size={20} aria-hidden="true" />
          {active && <span aria-hidden="true" className="absolute right-1 top-1 size-2 rounded-full bg-[var(--color-saffron-600)]" />}
        </button>
        </div>
      </div>
      <div id={id} hidden={!open} className="mt-3">{children}</div>
    </div>
  );
}
