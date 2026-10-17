import type { Metadata } from "next";
import MediaAlbumsBrowser from "@/components/media/MediaAlbumsBrowser";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = {
  title: content[defaultLang].media.title,
  description: content[defaultLang].media.description,
};

export default function AlbumsPage() {
  return <MediaAlbumsBrowser />;
}
