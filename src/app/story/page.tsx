import type { Metadata } from "next";
import StoryBrowser from "@/components/StoryBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.story;

export default function StoryPage() {
  return <StoryBrowser />;
}
