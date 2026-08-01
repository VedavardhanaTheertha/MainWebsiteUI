"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

export default function HomeFeatures() {
  const { tr } = useLang();
  return (
    <div className="bg-[var(--color-sand)] px-5 pt-[26px] pb-[30px] mt-2">
      {tr.home.features.map((f, i) => (
        <div key={f.title} className={i > 0 ? "mt-8" : ""}>
          <div className="relative w-full h-[240px] rounded-[6px] overflow-hidden" style={{ boxShadow: "0 12px 26px -16px rgba(38,27,18,.4)" }}>
            <Image src={f.img} alt="" fill sizes="(max-width: 1023px) 100vw, 600px" className="object-cover" />
          </div>
          <p className="font-display text-[22px] leading-[1.3] text-[var(--color-text-primary)] text-center max-w-[300px] mx-auto mt-5">
            {f.title}
          </p>
          <Link
            href={f.cta_href}
            className="block w-max mx-auto mt-6 bg-[var(--color-saffron-500)] hover:bg-[var(--color-saffron-600)] active:bg-[var(--color-saffron-700)] text-white font-semibold text-[15px] rounded transition-colors px-7 py-[14px]"
            style={{ boxShadow: "0 8px 18px -8px rgba(196,82,10,.5)" }}
          >
            {f.cta_label}
          </Link>
        </div>
      ))}
    </div>
  );
}
