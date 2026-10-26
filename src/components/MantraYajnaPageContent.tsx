"use client";

import ContentImage from "@/components/presentation/ContentImage";
import LocalizedCopy from "@/components/LocalizedCopy";
import { useLang } from "@/context/LanguageContext";
import { imagePaths } from "@/lib/images";
import { actionDestinations } from "@/gen/settings/actions";
import { formatArticleDate } from "@/lib/reader-utils";

export default function MantraYajnaPageContent() {
  const { tr, lang } = useLang();
  const copy = tr.pages.local_copy;
  return (
    <div>
      <div className="relative h-[180px] lg:h-[280px]">
        <ContentImage src={imagePaths.krishna} alt="" fill sizes="100vw" />
      </div>
      <header className="bg-[var(--color-parchment)] px-4 py-5 lg:px-8">
        <p className="text-micro font-bold tracking-[.16em] uppercase text-[var(--color-text-brand)]">
          <LocalizedCopy path={["pages", "detected", "yajna_eyebrow"]} />
        </p>
        <h1 className="font-display text-[30px] lg:text-5xl text-[var(--color-text-primary)] leading-tight mt-1">{copy.yajna_title}</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">

        {/* What is it */}
        <div className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-3">{copy.yajna_what}</h2>
          <p className="font-body text-[var(--color-text-secondary)] text-base leading-relaxed mb-3">
            <LocalizedCopy path={["pages", "detected", "yajna_intro"]} />
          </p>
          <p className="font-body text-[var(--color-text-secondary)] text-base leading-relaxed">
            {copy.yajna_practice}
          </p>
        </div>

        {/* How to participate */}
        <div className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-4">{copy.yajna_how}</h2>
          <ol className="space-y-4">
            {[1, 2, 3, 4].map((step) => (
              <li key={step} className="flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-saffron-600)] text-white font-display font-bold text-sm flex items-center justify-center">{step}</span>
                <div>
                  <p className="font-body font-semibold text-[var(--color-text-primary)] text-[15px]">{copy[`yajna_step_${step}_title`]}</p>
                  <p className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    {step === 4 ? <LocalizedCopy path={["pages", "detected", "yajna_step4"]} /> : copy[`yajna_step_${step}_description`]}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Progress */}
        <div className="bg-gradient-to-br from-[var(--color-saffron-600)] to-[var(--color-saffron-700)] rounded-2xl p-6 text-white mb-6">
          <p className="font-body text-micro uppercase tracking-widest font-semibold opacity-80 mb-1">{copy.yajna_progress}</p>
          <p className="font-display font-bold text-3xl mb-1">{copy.yajna_count}</p>
          <p className="font-body text-white/80 text-sm mb-4">{copy.yajna_goal}</p>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: copy.yajna_progress_percent }} />
          </div>
          <p className="font-body text-white/70 text-meta mt-1">{copy.yajna_complete}</p>
          <p className="mt-3 text-sm">{copy.yajna_as_of.replace("{date}", formatArticleDate(copy.yajna_as_of_date, lang))}</p>
        </div>

        <div className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-2xl p-6">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-4">{copy.yajna_register}</h2>
          <a href={actionDestinations.yajna} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-saffron-600)] px-6 py-3 font-semibold text-white">{copy.yajna_submit}</a>
        </div>

      </div>
    </div>
  );
}
