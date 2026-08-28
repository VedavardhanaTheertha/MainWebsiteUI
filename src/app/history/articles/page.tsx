import type { Metadata } from "next";
import StoryPage from "@/components/StoryPage";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.history_articles;

export default function Page() {
  return <StoryPage storyKey="articles" />;
}
