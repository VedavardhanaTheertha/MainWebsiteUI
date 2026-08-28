"use client";

import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

export default function QuickActionBars() {
  const { tr } = useLang();

  const bars = [
    {
      label: tr.qa_volunteer,
      sublabel: tr.qa_volunteer_sub,
      href: "/volunteer",
      icon: "🙏",
      accent: "from-[var(--color-saffron-600)] to-[var(--color-saffron-600)]",
      textColor: "text-white",
    },
    {
      label: tr.qa_kotilekhana,
      sublabel: tr.qa_kotilekhana_sub,
      href: "#",   // TODO: Replace with real Kotilekhana registration link from management
      icon: "✍️",
      accent: "from-[var(--color-text-primary)] to-[#3d2b1a]",
      textColor: "text-white",
    },
    {
      label: tr.qa_events,
      sublabel: tr.qa_events_sub,
      href: "/events",
      icon: "📅",
      accent: "from-[var(--color-cream)] to-[var(--color-saffron-100)]",
      textColor: "text-[var(--color-text-primary)]",
    },
  ];

  return (
    <section
      className="bg-[var(--color-cream)] px-4 lg:px-8 py-5"
      aria-label="Quick links"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
        {bars.map((bar) => (
          <Link
            key={bar.label}
            href={bar.href}
            className={`flex-1 flex items-center gap-4 bg-gradient-to-r ${bar.accent} rounded-2xl px-5 py-4 hover:scale-[1.015] hover:shadow-lg transition-all duration-200 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2`}
          >
            <span className="text-2xl shrink-0" aria-hidden="true">{bar.icon}</span>
            <div className="min-w-0">
              <p className={`font-display font-semibold text-[17px] leading-tight ${bar.textColor}`}>
                {bar.label}
              </p>
              <p className={`font-body text-[12px] mt-0.5 ${bar.textColor} opacity-75 truncate`}>
                {bar.sublabel}
              </p>
            </div>
            <span className={`ml-auto text-lg ${bar.textColor} opacity-60`} aria-hidden="true">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
