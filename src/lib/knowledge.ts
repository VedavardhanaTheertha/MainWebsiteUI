import { defaultLang } from "@/gen/content";
import { readingTimeSettings } from "@/gen/settings/ui-elements";
import type { LibraryArticle, LibrarySection } from "@/gen/library/data";
import type { KnowledgeDetails, KnowledgeText } from "./knowledge-types";

export type KnowledgeArticle = LibraryArticle & { knowledge?: KnowledgeDetails };
export type DisplayArticle = Omit<KnowledgeArticle, "title" | "summary" | "status" | "tags" | "html"> & {
  title: string;
  summary: string;
  status: string;
  tags: string[];
  html: string;
};

export function knowledgeText(value: KnowledgeText, lang: string): string {
  return value[lang] ?? value[defaultLang] ?? Object.values(value)[0] ?? "";
}

export function localizeArticle(item: KnowledgeArticle, lang: string): DisplayArticle {
  return {
    ...item,
    title: knowledgeText(item.title, lang),
    summary: knowledgeText(item.summary, lang),
    status: knowledgeText(item.status, lang),
    tags: item.tags.map((tag) => knowledgeText(tag, lang)),
    html: knowledgeText(item.html, lang),
  };
}

export function knowledgeReadingTime(
  article: Pick<DisplayArticle, "title" | "html" | "knowledge">,
): { minutes: number; estimated: boolean } {
  const supplied = article.knowledge?.readMinutes;
  if (typeof supplied === "number" && Number.isSafeInteger(supplied) && supplied > 0) {
    return { minutes: supplied, estimated: false };
  }
  const body = article.html
    .replace(/<!--[\s\S]*?-->/gu, " ")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/giu, " ")
    .replace(/<[^>]*>/gu, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z][\da-z]+);/giu, " ");
  const words = `${article.title} ${body}`.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’][\p{L}\p{M}\p{N}]+)*/gu);
  return { minutes: Math.max(1, Math.ceil((words?.length ?? 0) / readingTimeSettings.wordsPerMinute)), estimated: true };
}

export function articleHref(section: Pick<LibrarySection, "route">, id: string): string {
  return `${section.route}/${id}`;
}

export function relatedArticles(section: LibrarySection, article: KnowledgeArticle): KnowledgeArticle[] {
  const explicit = article.knowledge?.related;
  if (explicit) return explicit.flatMap((id) => section.items.filter((item) => item.id === id));
  const codes = new Set(article.tags.map((tag) => tag.code));
  return section.items
    .filter((item) => item.id !== article.id)
    .map((item) => ({ item, score: item.tags.filter((tag) => codes.has(tag.code)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .slice(0, 3)
    .map(({ item }) => item);
}
