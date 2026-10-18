import type { LearnItem } from "@/lib/content-types";

export function approvedLearningUrl(value?: string): string | null {
  if (typeof value !== "string" || !value || value.trim() !== value) return null;
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? value : null;
  } catch {
    return null;
  }
}

export function learningDestination(item: LearnItem): string | null {
  const supplied = approvedLearningUrl(item.href);
  if (supplied) return supplied;
  return typeof item.id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)
    ? `/learn/${item.id}`
    : null;
}
