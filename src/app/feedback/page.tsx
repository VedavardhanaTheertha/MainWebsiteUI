"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function FeedbackPage() {
  const { tr } = useLang();
  const { feedback } = tr;

  return (
    <div className="pb-10">
      <PageHero heading={feedback.heading} subheading={feedback.intro} />
      <form
        className="flex flex-col gap-3 px-4 py-6 lg:mx-auto lg:max-w-md lg:px-8"
        onSubmit={(e) => e.preventDefault()}
      >
        {feedback.fields.map((field) => (
          <label key={field.label} className="flex flex-col gap-1 text-sm text-[var(--color-ink-700)]">
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                rows={4}
                className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-cream-soft)] p-2.5 text-sm"
              />
            ) : (
              <input
                type={field.type}
                className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-cream-soft)] p-2.5 text-sm"
              />
            )}
          </label>
        ))}
        <button
          type="submit"
          className="mt-2 rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {feedback.submitLabel}
        </button>
      </form>
    </div>
  );
}
