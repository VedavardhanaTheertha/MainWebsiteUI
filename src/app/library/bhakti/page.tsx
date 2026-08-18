import type { Metadata } from "next";
import LibraryCategoryPage from "@/components/library/LibraryCategoryPage";

export const metadata: Metadata = {
  title: "Bhakti Gāna | Library | Shri Shiroor Matha",
  description: "Devotional songs of the Haridāsa tradition.",
};

export default function Page() {
  return <LibraryCategoryPage categoryKey="bhakti" />;
}
