import type { Metadata } from "next";
import ParamparaBrowser from "@/components/ParamparaBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = {
  title: content[defaultLang].pages.parampara.title,
  description: content[defaultLang].pages.parampara.intro,
};

export default function Page() {
  return <ParamparaBrowser />;
}
