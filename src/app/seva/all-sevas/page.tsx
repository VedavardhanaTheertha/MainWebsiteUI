import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import AllSevaBrowser from "@/components/seva/AllSevaBrowser";

export const metadata: Metadata = {
  title: "All Sevas | Shri Shiroor Matha, Udupi",
  description: "Every form of service offered at Shri Shiroor Matha — body, mind and wealth. Browse all sevas by category.",
};

export default function AllSevasPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-10">
        <p className="font-body text-[10.5px] tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold">Seva — Tanu · Mana · Dhana</p>
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] mt-1 mb-2">Offer Your Seva</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">Every form of service offered at Shri Shiroor Matha — body, mind and wealth.</p>
        <AllSevaBrowser />
      </div>
      <SiteFooter />
    </>
  );
}
