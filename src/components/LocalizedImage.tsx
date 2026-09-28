"use client";

import Image, { type ImageProps } from "next/image";
import { useLang } from "@/context/LanguageContext";
import { readContentPath, type ContentPathPart } from "@/lib/content-path";

type LocalizedImageProps = Omit<ImageProps, "alt"> & {
  altPath: readonly ContentPathPart[];
};

export default function LocalizedImage({ altPath, ...props }: LocalizedImageProps) {
  const { tr } = useLang();
  const alt = readContentPath(tr, altPath);
  return <Image {...props} alt={typeof alt === "string" ? alt : ""} />;
}