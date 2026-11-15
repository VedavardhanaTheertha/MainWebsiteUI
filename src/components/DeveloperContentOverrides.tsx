"use client";

import { useId } from "react";
import { useLang } from "@/context/LanguageContext";
import {
  allSectionDefinitions,
  useContentOverrides,
} from "@/lib/content-overrides";

export default function DeveloperContentOverrides() {
  const { tr } = useLang();
  const { overrides, setOverride } = useContentOverrides();
  const baseId = useId();

  const copy = tr.developer_options?.content_overrides;
  if (!copy) return null;

  return (
    <fieldset className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
      <legend className="px-2 font-semibold text-[var(--color-text-primary)]">
        {copy.title}
      </legend>
      <p className="mb-5 text-sm leading-6 text-[var(--color-text-secondary)]">
        {copy.description}
      </p>

      <div className="space-y-4">
        {allSectionDefinitions.map((section) => {
          const currentOverride = overrides[section.id];
          const pageEnabled = currentOverride?.page ?? section.defaultPage;
          const itemsEnabled = currentOverride?.items ?? section.defaultItems;
          const isOverridden =
            currentOverride?.page !== undefined || currentOverride?.items !== undefined;
          const pageId = `${baseId}-${section.id}-page`;
          const itemsId = `${baseId}-${section.id}-items`;

          return (
            <div
              key={section.id}
              className="rounded-xl border border-[var(--color-line-strong)]/60 bg-[var(--color-paper)] p-4 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)]/50 pb-2.5">
                <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                  {section.name}
                  <span className="ml-1.5 text-xs text-[var(--color-text-secondary)] font-normal">
                    ({section.id})
                  </span>
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      section.defaultPage
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {section.defaultPage ? copy.default_enabled : copy.default_disabled}
                  </span>
                  {isOverridden && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                      {copy.overridden}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-6 text-sm">
                <label htmlFor={pageId} className="flex min-h-8 cursor-pointer items-center gap-2 text-[var(--color-text-primary)]">
                  <input
                    id={pageId}
                    type="checkbox"
                    checked={pageEnabled}
                    onChange={(event) =>
                      setOverride(section.id, { page: event.target.checked })
                    }
                    className="size-4 rounded accent-[var(--color-saffron-600)]"
                  />
                  <span>{copy.page_checkbox}</span>
                </label>

                <label htmlFor={itemsId} className="flex min-h-8 cursor-pointer items-center gap-2 text-[var(--color-text-primary)]">
                  <input
                    id={itemsId}
                    type="checkbox"
                    checked={itemsEnabled}
                    onChange={(event) =>
                      setOverride(section.id, { items: event.target.checked })
                    }
                    className="size-4 rounded accent-[var(--color-saffron-600)]"
                  />
                  <span>{copy.items_checkbox}</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
