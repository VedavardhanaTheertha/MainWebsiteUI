import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import DonationPanel from "@/components/seva/DonationPanel";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.donations;

export default function DonationsPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-10">
        <p className="font-body text-[10.5px] tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold">Donation — Dhana Seva</p>
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] mt-1 mb-6">Support the Matha</h1>
        <DonationPanel />
      </div>
      <SiteFooter />
    </>
  );
}
