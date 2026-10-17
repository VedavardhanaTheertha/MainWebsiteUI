import type { Metadata } from "next";
import SectionHub from "@/components/SectionHub";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.library;

export default function LibraryPage() {
  return <SectionHub hubKey="library" />;
}
