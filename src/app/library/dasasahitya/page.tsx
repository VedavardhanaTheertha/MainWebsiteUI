import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import DasaSahityaBrowser, { type DasaSahityaItem } from "@/components/library/DasaSahityaBrowser";

export const metadata: Metadata = {
  title: "Dasa Sahitya | Shri Shiroor Matha",
  description: "Search and read Kannada devotional compositions from the Haridasa tradition.",
};

interface CatalogItem extends Omit<DasaSahityaItem, "html"> {
  contentFile: string;
}

interface Catalog {
  items: CatalogItem[];
}

function loadDasaSahitya(): DasaSahityaItem[] {
  const collectionRoot = path.join(process.cwd(), "src", "generated", "dasasahitya");
  const catalog = JSON.parse(readFileSync(path.join(collectionRoot, "index.json"), "utf8")) as Catalog;

  return catalog.items.map(({ contentFile, ...item }) => ({
    ...item,
    html: readFileSync(path.join(collectionRoot, contentFile), "utf8"),
  }));
}

export default function DasaSahityaPage() {
  return <DasaSahityaBrowser items={loadDasaSahitya()} />;
}
