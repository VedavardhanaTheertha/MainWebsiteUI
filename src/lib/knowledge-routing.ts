import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { librarySections } from "@/gen/library/data";
import { defaultLang } from "@/gen/content";
import { articleHref, localizeArticle } from "./knowledge";

export function knowledgeArticleParams(prefix: string) {
  return librarySections
    .filter((section) => section.route.startsWith(`${prefix}/`))
    .flatMap((section) => section.items.map((item) => ({
      section: section.route.slice(prefix.length + 1),
      article: item.id,
    })));
}

export function findKnowledgeArticle(route: string, id: string) {
  const section = librarySections.find((entry) => entry.route === route);
  const article = section?.items.find((entry) => entry.id === id);
  if (!section || !article) notFound();
  return { section, article };
}

export function knowledgeArticleMetadata(route: string, id: string): Metadata {
  const { section, article } = findKnowledgeArticle(route, id);
  const localized = localizeArticle(article, defaultLang);
  return {
    title: localized.title,
    description: localized.summary,
    alternates: { canonical: articleHref(section, id) },
  };
}
