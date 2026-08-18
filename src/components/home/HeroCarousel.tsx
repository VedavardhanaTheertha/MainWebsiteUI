"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

const AUTO_MS = 4500;

export default function HeroCarousel() {
  const { tr } = useLang();
  const { title, cta_label, cta_href, images } = tr.home.hero_intro;
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;
    const t = setInterval(() => setI((p) => (p + 1) % images.length), AUTO_MS);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section className="relative w-full h-[462px] lg:h-[600px] overflow-hidden rounded-b-[22px]">
      {images.map((src, k) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[900ms]"
          style={{ opacity: k === i ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={k === 0}
            sizes="100vw"
            className="object-cover"
            style={{ transform: k === i ? "scale(1)" : "scale(1.04)", transition: "transform 7s ease-out" }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,12,4,.42) 0%, rgba(20,12,4,.05) 22%, rgba(20,12,4,0) 40%, rgba(20,12,4,.55) 70%, rgba(16,9,3,.86) 100%)",
        }}
      />

      <div className="absolute left-0 right-0 bottom-0 px-6 pb-8 text-center">
        <h1
          className="font-display text-[26px] lg:text-4xl leading-tight text-[var(--color-cream-hi)] whitespace-pre-line mb-5"
          style={{ textShadow: "0 1px 20px rgba(0,0,0,.4)" }}
        >
          {title}
        </h1>
        <Link
          href={cta_href}
          className="inline-block font-body font-semibold text-[15px] text-[var(--color-text-on-brand)] bg-[var(--color-saffron-500)] hover:bg-[var(--color-saffron-600)] active:bg-[var(--color-saffron-700)] rounded-full px-[30px] py-[14px] transition-colors"
          style={{ boxShadow: "0 8px 22px -8px rgba(0,0,0,.55)" }}
        >
          {cta_label}
        </Link>
      </div>
    </section>
  );
}
