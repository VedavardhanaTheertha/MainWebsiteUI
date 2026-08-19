import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import MediaGrid from "@/components/media/MediaGrid";

export const metadata: Metadata = {
  title: "Photos | Media | Shri Shiroor Matha",
  description: "Photo gallery of ceremonies, seva activities, and sacred moments at Shri Shiroor Matha.",
};

export default function MediaPhotosPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-10">
        <Link href="/media" className="inline-block font-body text-[var(--color-text-brand)] text-xs mb-4 hover:underline">
          ← Media
        </Link>
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] mb-5">Photos</h1>
        <MediaGrid type="photo" />
      </div>
      <SiteFooter />
    </>
  );
}
