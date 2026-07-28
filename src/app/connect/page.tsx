"use client";

import { useLang } from "@/context/LanguageContext";
import { PageHero } from "@/components/shared/PageHero";
import { ContactRows } from "@/components/shared/ContactRows";

export default function ConnectPage() {
  const { tr } = useLang();
  return (
    <div className="pb-10">
      <PageHero heading={tr.connect.heading} subheading={tr.connect.intro} />
      <ContactRows rows={tr.connect.rows} />
    </div>
  );
}
