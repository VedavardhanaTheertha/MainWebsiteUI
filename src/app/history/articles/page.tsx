import type { Metadata } from "next";
import StoryPage from "@/components/StoryPage";

export const metadata: Metadata = {
  title: "Blogs & Articles | Shri Shiroor Matha",
  description: "Reflections, news and reading from Shri Shiroor Matha.",
};

export default function Page() {
  return <StoryPage storyKey="articles" />;
}
