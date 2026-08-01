import type { Metadata } from "next";
import LibraryCategoryPage from "@/components/library/LibraryCategoryPage";

export const metadata: Metadata = {
  title: "Mantra Nāda | Library | Shri Shiroor Matha",
  description: "Sacred chants and their meanings — to be heard, learned and recited.",
};

export default function Page() {
  return <LibraryCategoryPage categoryKey="mantra" />;
}
