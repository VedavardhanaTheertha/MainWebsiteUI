"use client";

import { useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";

export default function DonationsPage() {
  const { tr, lang } = useLang();
  const { sevaDonations } = tr;
  const [amount, setAmount] = useState(sevaDonations.presetAmounts[0]);
  const donateLabel = lang === "kn" ? "ದೇಣಿಗೆ ನೀಡಿ" : "Donate Now";
  const upiLabel = lang === "kn" ? "UPI ID" : "UPI ID";

  return (
    <div className="pb-10">
      <PageHero heading={sevaDonations.heading} subheading={sevaDonations.intro} />
      <section className="px-4 py-6 lg:mx-auto lg:max-w-md lg:px-8">
        <div className="grid grid-cols-2 gap-2">
          {sevaDonations.presetAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              className={`rounded-[var(--radius-md)] py-3 text-sm font-semibold ${
                amount === amt
                  ? "bg-[var(--color-saffron-600)] text-white"
                  : "bg-[var(--color-cream-soft)] text-[var(--color-ink-700)]"
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-[var(--radius-pill)] bg-[var(--color-saffron-600)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {donateLabel} — ₹{amount}
        </button>
        <p className="mt-4 text-center text-xs text-[var(--color-ink-500)]">
          {upiLabel}: {sevaDonations.upiId}
        </p>
      </section>
    </div>
  );
}
