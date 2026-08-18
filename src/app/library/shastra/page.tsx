import type { Metadata } from "next";
import LibraryCategoryPage from "@/components/library/LibraryCategoryPage";

export const metadata: Metadata = {
  title: "Shāstra Vidya | Library | Shri Shiroor Matha",
  description: "The scriptural knowledge of the Dvaita tradition.",
};

export default function Page() {
  return <LibraryCategoryPage categoryKey="shastra" />;
}
