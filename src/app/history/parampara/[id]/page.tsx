import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParamparaDetailPage from "@/components/ParamparaDetailPage";
import { content, defaultLang } from "@/gen/content";
import { paramparaByLanguage } from "@/gen/parampara/data";

const gurus = paramparaByLanguage[defaultLang] ?? [];

export function generateStaticParams() {
  return gurus.map((guru) => ({ id: guru.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const guru = gurus.find((item) => item.id === id);
  const siteTitle = content[defaultLang].meta_title;

  if (!guru) return { title: siteTitle };

  return {
    title: `${guru.name} | ${siteTitle}`,
    description: guru.summary,
    alternates: { canonical: `/history/parampara/${id}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!gurus.some((guru) => guru.id === id)) notFound();

  return <ParamparaDetailPage id={id} />;
}