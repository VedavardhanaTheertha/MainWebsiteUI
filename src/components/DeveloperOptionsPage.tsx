"use client";

import { useId } from "react";
import { useLang } from "@/context/LanguageContext";
import { defaultContentMode, developerOptions } from "@/gen/content";
import { useImageTreatment } from "@/hooks/useImageTreatment";
import LocalContentToggle from "@/components/LocalContentToggle";

export default function DeveloperOptionsPage() {
  const { tr, setContentMode } = useLang();
  const { imageTreatmentEnabled, setImageTreatmentEnabled } = useImageTreatment();
  const descriptionId = useId();
  if (!developerOptions.enabled) return null;
  const copy = tr.developer_options;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-4xl">{copy.title}</h1>
      <p className="mt-3 text-base leading-7 text-[var(--color-text-secondary)]">{copy.description}</p>
      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 font-semibold text-[var(--color-text-primary)]">
            <input
              type="checkbox"
              checked={imageTreatmentEnabled}
              onChange={(event) => setImageTreatmentEnabled(event.target.checked)}
              aria-describedby={descriptionId}
              className="mt-1 size-5 shrink-0 accent-[var(--color-saffron-600)]"
            />
            {copy.image_title}
          </label>
          <p id={descriptionId} className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{copy.image_description}</p>
        </section>
        <LocalContentToggle />
        <button
          type="button"
          onClick={() => {
            setImageTreatmentEnabled(false);
            setContentMode(defaultContentMode);
          }}
          className="min-h-11 rounded-full border border-[var(--color-line-strong)] px-5 py-2 font-semibold text-[var(--color-text-brand)]"
        >
          {copy.reset}
        </button>
      </div>
    </div>
  );
}
