import type { Metadata } from "next";
import StoryPage from "@/components/StoryPage";

export const metadata: Metadata = {
  title: "Pilgrim Site Info | Shri Shiroor Matha",
  description: "Everything you need to plan your darshan at Udupi.",
};

export default function Page() {
  return <StoryPage storyKey="pilgrim" />;
}
