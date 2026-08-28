import type { Metadata } from "next";
import StoryPage from "@/components/StoryPage";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = {
  title: content[defaultLang].stories.pilgrim.title,
  description: content[defaultLang].stories.pilgrim.intro,
};

export default function Page() {
  return <StoryPage storyKey="pilgrim" />;
}
