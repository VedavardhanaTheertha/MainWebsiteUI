import { siteConfig, defaultLang, content, languages } from "@/gen/content";

export default function StructuredData() {
  const primaryName = content[defaultLang].site_name;
  const alternateNames = languages
    .filter(({ code }) => code !== defaultLang)
    .map(({ code }) => (content as Record<string, { site_name: string } | undefined>)[code]?.site_name)
    .filter(Boolean) as string[];
  const description = content[defaultLang].meta_description;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["HinduTemple", "Organization"],
        "@id": `${siteConfig.productionUrl}/#organization`,
        name: primaryName,
        alternateName: alternateNames.length > 0 ? alternateNames : undefined,
        description,
        url: siteConfig.productionUrl,
        logo: `${siteConfig.productionUrl}/main-logo.png`,
        image: `${siteConfig.productionUrl}/main-logo.png`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Udupi",
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.productionUrl}/#website`,
        url: siteConfig.productionUrl,
        name: primaryName,
        inLanguage: languages.map(({ code }) => code),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
