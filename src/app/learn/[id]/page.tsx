import { notFound } from "next/navigation";
import LearningDetailPage from "@/components/LearningDetailPage";
import { content, defaultLang } from "@/gen/content";

export function generateStaticParams() {
  return content[defaultLang].learn.flatMap((item) => item.id ? [{ id: item.id }] : []);
}

export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!content[defaultLang].learn.some((item) => item.id === id)) notFound();
  return <LearningDetailPage id={id} />;
}
