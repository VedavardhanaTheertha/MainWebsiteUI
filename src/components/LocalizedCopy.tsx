"use client";

import { useLang } from "@/context/LanguageContext";
import { readContentPath, type ContentPathPart } from "@/lib/content-path";

export default function LocalizedCopy({ path }: { path: readonly ContentPathPart[] }) {
  const { tr } = useLang();
  const value = readContentPath(tr, path);
  return typeof value === "string" ? value : null;
}