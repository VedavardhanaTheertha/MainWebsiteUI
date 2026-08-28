import Link from "next/link";
import { Image as ImageIcon, Video } from "lucide-react";

export default function MediaLinks() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-8 max-w-md">
      <Link href="/media/photos" className="flex flex-col items-center gap-2 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] py-5 shadow-[var(--shadow-xs)] hover:border-[var(--color-saffron-300)] transition-colors">
        <ImageIcon size={22} className="text-[var(--color-saffron-600)]" />
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Photos</span>
      </Link>
      <Link href="/media/videos" className="flex flex-col items-center gap-2 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-[8px] py-5 shadow-[var(--shadow-xs)] hover:border-[var(--color-saffron-300)] transition-colors">
        <Video size={22} className="text-[var(--color-saffron-600)]" />
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Videos</span>
      </Link>
    </div>
  );
}
