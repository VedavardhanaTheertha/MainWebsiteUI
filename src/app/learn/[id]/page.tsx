import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LearningDetailPage from "@/components/LearningDetailPage";
import { content, defaultLang } from "@/gen/content";

export function generateStaticParams() {
  return content[defaultLang].learn.flatMap((item) => item.id ? [{ id: item.id }] : []);
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = content[defaultLang].learn.find((entry) => entry.id === id);
  if (!item) notFound();
  return {
    title: item.title,
    description: item.description || item.sub,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!content[defaultLang].learn.some((item) => item.id === id)) notFound();
  return <LearningDetailPage id={id} />;
}
