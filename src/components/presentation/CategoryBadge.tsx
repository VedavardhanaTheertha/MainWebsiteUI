import { categoryToneClassName } from "@/lib/category-tones";

export default function CategoryBadge({ category, code }: { category: string; code?: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider ${categoryToneClassName(code)}`}>
      {category}
    </span>
  );
}
