import type { Metadata } from "next";
import LibraryCategoryPage from "@/components/library/LibraryCategoryPage";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = {
  ...content[defaultLang].page_metadata.library_shastra,
  description: content[defaultLang].library.shastra.desc,
};

export default function Page() {
  return <LibraryCategoryPage categoryKey="shastra" />;
}
