import type { Metadata } from "next";
import PanchangaPage from "@/components/PanchangaPage";
import { content, defaultLang } from "@/gen/content";

const copy = content[defaultLang].pages.local_copy;

export const metadata: Metadata = {
  title: copy.panchanga_title,
  description: copy.panchanga_notice,
};

export default function Page() {
  return <PanchangaPage />;
}
