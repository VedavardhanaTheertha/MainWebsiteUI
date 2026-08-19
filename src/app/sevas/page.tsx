import type { Metadata } from "next";
import Image from "next/image";
import SevasBrowser from "@/components/SevasBrowser";
import Top4SevaRail from "@/components/Top4SevaRail";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Sevas & Donations | Shri Shiroor Matha, Udupi",
  description:
    "Offer a seva at Shri Shiroor Matha. Browse all 97 sevas across Krishna Sannidhi, Annadaana, Navagraha, and more.",
};

export default function SevasPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Vittala watermark art — bottom fixed, orange tint */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 pointer-events-none" style={{ zIndex: 0, width: 340, height: 340, opacity: 0.07 }}>
        <Image
          src="/vittala.png"
          alt=""
          fill
          className="object-contain"
          style={{ filter: "sepia(1) saturate(4) hue-rotate(340deg) brightness(1.2)" }}
          sizes="340px"
        />
      </div>

      {/* Page header */}
      <div className="bg-[var(--color-parchment)] pt-4 pb-3 lg:pt-7 lg:pb-6 text-center px-5">
        <p className="font-body text-[10px] lg:text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-2 lg:mb-3">
          Offer Your Devotion
        </p>
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-4xl mb-2 lg:mb-3">
          Sevas & Donations
        </h1>
        <p className="font-body text-[var(--color-text-brand)]/75 text-sm lg:text-base max-w-xl mx-auto">
          <span className="lg:hidden">Express your love for the Divine.</span>
          <span className="hidden lg:inline">97 ways to express your love for the Divine — from a daily flower archane to the grand Paryaya Annadaana feeding thousands.</span>
        </p>
      </div>

      {/* Top 4 Sevas */}
      <Top4SevaRail />

      {/* Browser (client component) */}
      <SevasBrowser />

      <div className="relative z-10"><SiteFooter /></div>
    </div>
  );
}
