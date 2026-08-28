import LegacySection from "@/components/home/LegacySection";
import SignificanceSection from "@/components/home/SignificanceSection";
import SiteFooter from "@/components/SiteFooter";
import { content, defaultLang } from "@/gen/content";

export const metadata = content[defaultLang].page_metadata.story;

export default function StoryPage() {
  return (
    <>
      <LegacySection />
      <SignificanceSection />
      <SiteFooter />
    </>
  );
}
