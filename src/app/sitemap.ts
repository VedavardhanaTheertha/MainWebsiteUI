import type { MetadataRoute } from "next";
import { content, defaultLang, routes, siteConfig } from "@/gen/content";
import { librarySections } from "@/gen/library/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const libraryRoutes = librarySections.flatMap((section) => [
    section.route,
    ...section.items.map((item) => `${section.route}/${item.id}`),
  ]);
  const albumRoutes = content[defaultLang].media.albums.map(
    (album) => `/albums/${album.id}`,
  );
  const sitemapRoutes = [...new Set([...routes, ...libraryRoutes, ...albumRoutes])].sort();

  return sitemapRoutes.map((route) => ({
    url: new URL(route, siteConfig.productionUrl).toString(),
  }));
}