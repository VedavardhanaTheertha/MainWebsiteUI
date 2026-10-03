import type { Metadata } from "next";
import ConnectBrowser from "@/components/ConnectBrowser";
import SiteFooter from "@/components/SiteFooter";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.connect;

export default function ConnectPage() {
  return (
    <>
      <ConnectBrowser />
      <SiteFooter />
    </>
  );
}
