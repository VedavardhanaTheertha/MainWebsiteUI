import type { Metadata } from "next";
import LibraryCategoryPage from "@/components/library/LibraryCategoryPage";

export const metadata: Metadata = {
  title: "Jnāna Kosha | Library | Shri Shiroor Matha",
  description: "A treasury of knowledge, glossary and reference.",
};

export default function Page() {
  return <LibraryCategoryPage categoryKey="jnana" />;
}
