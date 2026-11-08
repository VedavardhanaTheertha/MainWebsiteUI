import type { Metadata } from "next";
import StoryBrowser from "@/components/StoryBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = {
  title: content[defaultLang].pages.parampara.title,
  description: content[defaultLang].pages.parampara.intro,
};

export default function Page() {
  return <StoryBrowser initialTab="parampara" />;
}
