import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LibrarySectionBrowser from "@/components/library/LibrarySectionBrowser";
import {
  getSectionByRoute,
  getSectionMetadata,
  getSectionsForPrefix,
} from "@/lib/library-routing";

export function generateStaticParams() {
  return getSectionsForPrefix("/history").map((section) => ({
    section: section.route.split("/").at(-1),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const record = getSectionByRoute(`/history/${section}`);
  return record ? getSectionMetadata(record) : {};
}

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const record = getSectionByRoute(`/history/${section}`);
  if (!record) notFound();

  return <LibrarySectionBrowser sectionId={record.id} />;
}
