import type { Metadata } from "next";
import StoryBrowser from "@/components/StoryBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.mathas;

export default function Page() {
  return <StoryBrowser initialTab="mathas" />;
}
