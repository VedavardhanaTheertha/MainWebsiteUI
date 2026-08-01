import type { Metadata } from "next";
import LibraryCategoryPage from "@/components/library/LibraryCategoryPage";

export const metadata: Metadata = {
  title: "Dharma Vidhi | Library | Shri Shiroor Matha",
  description: "Rituals, observances and the way of dharma.",
};

export default function Page() {
  return <LibraryCategoryPage categoryKey="dharma" />;
}
