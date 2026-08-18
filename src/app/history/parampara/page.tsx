import type { Metadata } from "next";
import StoryPage from "@/components/StoryPage";

export const metadata: Metadata = {
  title: "Guru Paramparā | Shri Shiroor Matha",
  description: "The unbroken lineage of gurus from Madhvāchārya to the present Swamiji of Shiroor Matha.",
};

export default function Page() {
  return <StoryPage storyKey="parampara" />;
}
