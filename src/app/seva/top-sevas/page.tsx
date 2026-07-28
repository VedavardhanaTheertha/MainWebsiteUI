"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { SevaBrowser } from "@/components/seva/SevaBrowser";

export default function TopSevasPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.seva.heading} subheading={tr.seva.intro} />
      <SevaBrowser featuredOnly />
    </div>
  );
}
