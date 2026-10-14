import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MediaAlbumView from "@/components/media/MediaAlbumView";
import { content, defaultLang } from "@/gen/content";

const albums = content[defaultLang].media.albums;

export function generateStaticParams() {
  return albums.map((album) => ({ album: album.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ album: string }>;
}): Promise<Metadata> {
  const { album: albumId } = await params;
  const album = albums.find((entry) => entry.id === albumId);
  return album
    ? { title: album.title, description: album.description }
    : {};
}

export default async function Page({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const { album: albumId } = await params;
  if (!albums.some((album) => album.id === albumId)) notFound();

  return <MediaAlbumView albumId={albumId} />;
}
