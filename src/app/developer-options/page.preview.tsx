import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DeveloperOptionsPage from "@/components/DeveloperOptionsPage";
import { content, defaultLang, developerOptions } from "@/gen/content";

export const metadata: Metadata = {
  title: content[defaultLang].developer_options.title,
  description: content[defaultLang].developer_options.description,
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!developerOptions.enabled) notFound();
  return <DeveloperOptionsPage />;
}
