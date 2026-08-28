"use client";

import Image from "next/image";
import { useLang } from "@/context/LanguageContext";

export default function GalleryGrid() {
  const { tr } = useLang();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
      {tr.media.gallery.map((src, i) => (
        <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden">
          <Image src={src} alt="" fill sizes="(max-width: 640px) 50vw, 250px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
