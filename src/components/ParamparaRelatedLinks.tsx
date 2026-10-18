import { approvedLearningUrl } from "@/lib/learn";

export interface ParamparaLink { label: string; href: string }
export interface ParamparaRelatedContent {
  references?: ParamparaLink[];
  relatedPlaces?: ParamparaLink[];
  relatedWorks?: ParamparaLink[];
}

export default function ParamparaRelatedLinks({ guru, labels }: {
  guru: ParamparaRelatedContent;
  labels: { references: string; related_places: string; related_works: string };
}) {
  return ([
    ["references", labels.references],
    ["relatedPlaces", labels.related_places],
    ["relatedWorks", labels.related_works],
  ] as const).map(([key, title]) => {
    const links = guru[key]?.filter((link) => link.label.trim() && approvedLearningUrl(link.href));
    return links?.length ? <section key={key} className="mt-8 border-t border-[var(--color-line)] pt-5">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <ul className="mt-2">{links.map((link) => <li key={link.href}><a href={link.href} className="inline-flex min-h-11 items-center text-[var(--color-text-brand)] underline underline-offset-4">{link.label}</a></li>)}</ul>
    </section> : null;
  });
}
