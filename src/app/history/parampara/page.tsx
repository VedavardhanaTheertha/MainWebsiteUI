import type { Metadata } from "next";
import ParamparaBrowser from "@/components/ParamparaBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = {
  title: content[defaultLang].stories.parampara.title,
  description: content[defaultLang].stories.parampara.intro,
};

export default function Page() {
  return <ParamparaBrowser />;
}
