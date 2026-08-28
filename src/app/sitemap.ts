import type { MetadataRoute } from "next";
import { routes, siteConfig } from "@/gen/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: new URL(route, siteConfig.productionUrl).toString(),
  }));
}