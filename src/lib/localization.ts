import { defaultLang } from "@/gen/content";

export function localized<T>(value: Record<string, T> | undefined, lang: string): T | undefined {
  return value?.[lang] ?? value?.[defaultLang];
}

export function localizedText(value: Record<string, string> | undefined, lang: string): string {
  return localized(value, lang) ?? "";
}
