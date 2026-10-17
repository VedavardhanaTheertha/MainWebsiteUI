import KnowledgeArticlePage from "@/components/library/KnowledgeArticlePage";
import { getSectionByRoute } from "@/lib/library-routing";
import { findKnowledgeArticle, knowledgeArticleMetadata } from "@/lib/knowledge-routing";

export const dynamicParams = false;
export function generateStaticParams() {
  return getSectionByRoute("/projects")?.items.map(({ id }) => ({ article: id })) ?? [];
}
type Props = { params: Promise<{ article: string }> };
export async function generateMetadata({ params }: Props) {
  const { article } = await params;
  return knowledgeArticleMetadata("/projects", article);
}
export default async function Page({ params }: Props) {
  const { article } = await params;
  const record = findKnowledgeArticle("/projects", article);
  return <KnowledgeArticlePage sectionId={record.section.id} articleId={article} />;
}
