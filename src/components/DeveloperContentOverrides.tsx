"use client";

import { useId } from "react";
import { useLang } from "@/context/LanguageContext";
import {
  allSectionDefinitions,
  type ContentOverrides,
} from "@/lib/content-overrides";

export default function DeveloperContentOverrides({
  overrides,
  onPageChange,
  onItemsChange,
}: {
  overrides: ContentOverrides;
  onPageChange: (sectionId: string, checked: boolean) => void;
  onItemsChange: (sectionId: string, checked: boolean) => void;
}) {
  const { tr } = useLang();
  const baseId = useId();

  const copy = tr.developer_options?.content_overrides;
  if (!copy) return null;

  // Only show sections that are disabled by default (enabled sections in markdown are always enabled)
  const overridableSections = allSectionDefinitions.filter((section) => !section.defaultPage);

  return (
    <fieldset className="min-w-0 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
      <legend className="px-2 font-semibold text-[var(--color-text-primary)]">
        {copy.title}
      </legend>
      <p className="mb-4 text-sm leading-6 text-[var(--color-text-secondary)]">
        {copy.description}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-line-strong)] text-[var(--color-text-primary)] font-semibold">
              <th scope="col" className="py-2.5 px-3">{copy.section_header ?? "Section"}</th>
              <th scope="col" className="py-2.5 px-3 text-center">{copy.page_checkbox}</th>
              <th scope="col" className="py-2.5 px-3 text-center">{copy.items_checkbox}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]/60">
            {overridableSections.map((section) => {
              const currentOverride = overrides[section.id];
              const isPageEnabled = currentOverride?.page ?? false;
              const isItemsEnabled = isPageEnabled && (currentOverride?.items ?? false);
              const pageId = `${baseId}-${section.id}-page`;
              const itemsId = `${baseId}-${section.id}-items`;

              return (
                <tr key={section.id} className="hover:bg-[var(--color-cream-soft)]/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                    <span>{section.name}</span>
                    <span className="ml-1.5 text-xs text-[var(--color-text-secondary)] font-normal">
                      ({section.id})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <label htmlFor={pageId} className="inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center">
                      <input
                        id={pageId}
                        name={`overrides.${section.id}.page`}
                        type="checkbox"
                        checked={isPageEnabled}
                        onChange={(e) => onPageChange(section.id, e.target.checked)}
                        className="size-4.5 rounded accent-[var(--color-saffron-600)] cursor-pointer"
                        aria-label={`${section.name} - ${copy.page_checkbox}`}
                      />
                    </label>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <label htmlFor={itemsId} className={`inline-flex min-h-8 min-w-8 items-center justify-center ${isPageEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}>
                      <input
                        id={itemsId}
                        name={`overrides.${section.id}.items`}
                        type="checkbox"
                        checked={isItemsEnabled}
                        disabled={!isPageEnabled}
                        onChange={(e) => onItemsChange(section.id, e.target.checked)}
                        className={`size-4.5 rounded accent-[var(--color-saffron-600)] ${isPageEnabled ? "cursor-pointer" : "cursor-not-allowed"}`}
                        aria-label={`${section.name} - ${copy.items_checkbox}`}
                      />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </fieldset>
  );
}
