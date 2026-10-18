import type { Metadata } from "next";
import LearnPage from "@/components/LearnPage";
import { content, defaultLang } from "@/gen/content";

const copy = content[defaultLang].pages.learn;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.intro,
};

export default function Page() {
  return <LearnPage />;
}
