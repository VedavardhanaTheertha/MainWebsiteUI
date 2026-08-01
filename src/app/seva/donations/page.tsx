import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import DonationPanel from "@/components/seva/DonationPanel";

export const metadata: Metadata = {
  title: "Donations | Shri Shiroor Matha, Udupi",
  description: "Support Shri Shiroor Matha with a monetary donation or by offering materials — rice, ghee, oil, and more.",
};

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
