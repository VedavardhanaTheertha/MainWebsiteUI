import type { Metadata } from "next";
import LibraryCategoryPage from "@/components/library/LibraryCategoryPage";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = {
  title: content[defaultLang].library.dharma.title,
  description: content[defaultLang].library.dharma.desc,
};

export default function Page() {
  return <LibraryCategoryPage categoryKey="dharma" />;
}
