import { notFound } from "next/navigation";
import LibrarySectionBrowser from "@/components/library/LibrarySectionBrowser";
import { getSectionByRoute, getSectionMetadata } from "@/lib/library-routing";

const route = "/projects";
const section = getSectionByRoute(route);

export const metadata = section ? getSectionMetadata(section) : {};

export default function ProjectsPage() {
  if (!section) notFound();
  return <LibrarySectionBrowser sectionId={section.id} />;
}
