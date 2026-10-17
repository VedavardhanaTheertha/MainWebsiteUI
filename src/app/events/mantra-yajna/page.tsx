import MantraYajnaPageContent from "@/components/MantraYajnaPageContent";
import { content, defaultLang } from "@/gen/content";

export const metadata = content[defaultLang].page_metadata.yajna;

export default function MantraYajnaPage() {
  return <MantraYajnaPageContent />;
}
