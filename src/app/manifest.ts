import type { MetadataRoute } from "next";
import { content, defaultLang, siteConfig } from "@/gen/content";
import { imagePaths } from "@/lib/images";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = siteConfig.basePath;
  const root = basePath ? `${basePath}/` : "/";
  const favicon = imagePaths.favicon.startsWith("http")
    ? imagePaths.favicon
    : `${basePath}${imagePaths.favicon}`;

  return {
    name: content[defaultLang].meta_title,
    short_name: content[defaultLang].site_name,
    description: content[defaultLang].meta_description,
    start_url: root,
    scope: root,
    display: "standalone",
    background_color: "#fef3c7",
    theme_color: "#ea580c",
    lang: defaultLang,
    icons: [
      {
        src: favicon,
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}