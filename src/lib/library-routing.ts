import type { Metadata } from "next";
import {
  librarySections,
  type LibrarySection,
} from "@/gen/library/data";

export function getSectionsForPrefix(prefix: string): LibrarySection[] {
  const prefixParts = prefix.split("/").filter(Boolean);
  return librarySections.filter((section) => {
    const routeParts = section.route.split("/").filter(Boolean);
    return routeParts.length === prefixParts.length + 1
      && prefixParts.every((part, index) => routeParts[index] === part);
  });
}

export function getSectionByRoute(route: string): LibrarySection | undefined {
  return librarySections.find((section) => section.route === route);
}

export function getSectionMetadata(section: LibrarySection): Metadata {
  return {
    title: section.metadataTitle,
    description: section.metadataDescription,
    alternates: { canonical: section.route },
  };
}
