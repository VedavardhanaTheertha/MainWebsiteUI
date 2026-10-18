import KnowledgeArticlePage from "@/components/library/KnowledgeArticlePage";
import { findKnowledgeArticle, knowledgeArticleMetadata, knowledgeArticleParams } from "@/lib/knowledge-routing";

export const dynamicParams = false;
export function generateStaticParams() {
  return knowledgeArticleParams("/history");
}
type Props = { params: Promise<{ section: string; article: string }> };
export async function generateMetadata({ params }: Props) {
  const { section, article } = await params;
  return knowledgeArticleMetadata(`/history/${section}`, article);
}
export default async function Page({ params }: Props) {
  const { section, article } = await params;
  const record = findKnowledgeArticle(`/history/${section}`, article);
  return <KnowledgeArticlePage sectionId={record.section.id} articleId={article} />;
}
