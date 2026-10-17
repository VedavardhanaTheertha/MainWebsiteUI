import SectionHub from "@/components/SectionHub";
import { content, defaultLang } from "@/gen/content";

export const metadata = content[defaultLang].page_metadata.story;

export default function StoryPage() {
  return <SectionHub hubKey="story" />;
}
