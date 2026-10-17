export type KnowledgeText = Record<string, string>;
export interface KnowledgeDetails {
  author?: KnowledgeText;
  reviewer?: KnowledgeText;
  publishedOn?: string;
  reviewedOn?: string;
  references?: { label: KnowledgeText; url: string }[];
  related?: string[];
  themes?: KnowledgeText[];
  readMinutes?: number;
  glossary?: { term: KnowledgeText; definition: KnowledgeText }[];
  project?: {
    status: "planned" | "active" | "completed";
    milestones?: { text: KnowledgeText; date: string }[];
    updates?: { text: KnowledgeText; date: string }[];
    outcomes?: { text: KnowledgeText; date: string }[];
  };
  mantra?: Partial<Record<"original" | "transliteration" | "meaning" | "guidance", KnowledgeText>> & {
    audio?: { src: string; label: KnowledgeText };
  };
  illustration?: {
    src: string;
    alt: KnowledgeText;
    annotations: { x: number; y: number; label: KnowledgeText; explanation: KnowledgeText }[];
  };
  editorial?: { reviewer: KnowledgeText; reviewedOn: string };
  practical?: Partial<Record<"directions" | "hours" | "accessibility" | "customs" | "meals" | "accommodation" | "contacts", KnowledgeText>>;
  verifiedOn?: string;
}
