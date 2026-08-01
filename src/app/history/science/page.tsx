import type { Metadata } from "next";
import StoryPage from "@/components/StoryPage";

export const metadata: Metadata = {
  title: "Hindu Science & Philosophy | Shri Shiroor Matha",
  description: "Where the wisdom of the Vedas meets enquiry and reason.",
};

export default function Page() {
  return <StoryPage storyKey="science" />;
}
