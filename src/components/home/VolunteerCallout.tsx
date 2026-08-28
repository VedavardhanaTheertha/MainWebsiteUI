"use client";

import { useLang } from "@/context/LanguageContext";
import { openVolunteerModal } from "@/hooks/useVolunteerModal";

const roles = {
  en: ["Logistics", "Guest Services", "Digital & Media", "Annadaana Support"],
  kn: ["ಸಾಮಾನು ನಿರ್ವಹಣೆ", "ಅತಿಥಿ ಸೇವೆ", "ಡಿಜಿಟಲ್ & ಮಾಧ್ಯಮ", "ಅನ್ನದಾನ ಸಹಾಯ"],
};

export default function VolunteerCallout() {
  const { lang, tr } = useLang();

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden" aria-labelledby="volunteer-heading"
      style={{ backgroundImage: "url('/Madhwacharya.jpg')", backgroundSize: "cover", backgroundPosition: "center top" }}>
      {/* Dark blend overlay */}
      <div className="absolute inset-0 bg-[var(--color-ink-900)]/91 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
        <div className="bg-[var(--color-parchment)]/5 border border-[var(--color-saffron-600)]/10 rounded-[20px] p-8 lg:p-12 lg:flex lg:items-center lg:gap-12">
          <div className="flex-1 mb-8 lg:mb-0">
            <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-3">
              {tr.volunteer_label}
            </p>
            <h2 id="volunteer-heading" className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
              {tr.volunteer_title}
            </h2>
            <p className="font-body text-[var(--color-text-brand)]/75 text-base lg:text-lg leading-relaxed max-w-xl mb-6">
              {tr.volunteer_body}
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {roles[lang].map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-brand)] bg-white/8 border border-white/10 rounded-full px-4 py-1.5"
                >
                  {role}
                </span>
              ))}
            </div>

            <button
              onClick={openVolunteerModal}
              className="inline-flex items-center gap-2 font-body font-semibold text-white bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-full px-7 py-3 text-sm hover:shadow-lg hover:scale-[1.02] transition-all focus-visible:outline-white focus-visible:outline-2"
            >
              {tr.volunteer_cta} →
            </button>
          </div>

          <div className="shrink-0 bg-gradient-to-br from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-2xl p-8 text-white text-center min-w-[200px]">
            {/* TODO: Replace with real volunteer count from management */}
            <p className="font-display font-bold text-5xl mb-1">500+</p>
            <p className="font-body text-sm font-medium text-white/80">{tr.volunteer_needed}</p>
            <div className="my-4 h-px bg-white/20" />
            <p className="font-body text-xs text-white/70">Paryaya 2026–2028 · Udupi</p>
          </div>
        </div>
      </div>
    </section>
  );
}
