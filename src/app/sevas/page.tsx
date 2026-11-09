import type { Metadata } from "next";
import LocalizedCopy from "@/components/LocalizedCopy";
import SevasBrowser from "@/components/SevasBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.sevas;

export default function SevasPage() {
  return (
    <>
      <header className="bg-transparent px-16 pt-3.5 pb-2 text-center sm:px-20 sm:pt-4 sm:pb-3 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-brand)]"><LocalizedCopy path={["sevas_label"]} /></p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--color-text-primary)] lg:text-5xl"><LocalizedCopy path={["sevas_title"]} /></h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-[var(--color-text-brand)]/75"><LocalizedCopy path={["sevas_subtitle"]} /></p>
      </header>
      <SevasBrowser />
    </>
  );
}
