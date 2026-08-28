import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import AllSevaBrowser from "@/components/seva/AllSevaBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.all_sevas;

export default function AllSevasPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-10">
        <p className="font-body text-[10.5px] tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold">Seva — Tanu · Mana · Dhana</p>
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] mt-1 mb-2">Offer Your Seva</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{content[defaultLang].page_metadata.all_sevas.description}</p>
        <AllSevaBrowser />
      </div>
      <SiteFooter />
    </>
  );
}
