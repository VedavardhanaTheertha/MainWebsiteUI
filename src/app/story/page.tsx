import LegacySection from "@/components/home/LegacySection";
import SignificanceSection from "@/components/home/SignificanceSection";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Know the Story — Shri Shiroor Matha",
  description: "The sacred history of Krishna Mutt, Shiroor Matha, Annadana, Go Pooja and the significance of Paryaya.",
};

export default function StoryPage() {
  return (
    <>
      <LegacySection />
      <SignificanceSection />
      <SiteFooter />
    </>
  );
}
