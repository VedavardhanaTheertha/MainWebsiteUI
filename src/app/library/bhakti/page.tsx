import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import BhaktiBrowser, { type BhaktiItem } from "@/components/library/BhaktiBrowser";
import { content, defaultLang } from "@/gen/content";

const pageContent = content[defaultLang].library.bhakti.page;

export const metadata: Metadata = {
  title: pageContent.metadata_title,
  description: pageContent.metadata_description,
};

interface CatalogItem extends Omit<BhaktiItem, "html"> {
  contentFile: string;
}

interface Catalog {
  items: CatalogItem[];
}

function loadBhakti(): BhaktiItem[] {
  const collectionRoot = path.join(process.cwd(), "src", "gen", "bhakti");
  const catalog = JSON.parse(readFileSync(path.join(collectionRoot, "index.json"), "utf8")) as Catalog;

  return catalog.items.map(({ contentFile, ...item }) => ({
    ...item,
    html: readFileSync(path.join(collectionRoot, contentFile), "utf8"),
  }));
}

export default function BhaktiPage() {
  return <BhaktiBrowser items={loadBhakti()} />;
}
