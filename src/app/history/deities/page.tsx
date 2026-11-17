import type { Metadata } from "next";
import StoryBrowser from "@/components/StoryBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.deities;

export default function Page() {
  return <StoryBrowser initialTab="deities" />;
}
