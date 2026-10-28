"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { siteConfig } from "@/gen/content";
import { getParentPath, isHomePage } from "@/lib/back-navigation";

export default function BackNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { tr } = useLang();

  useEffect(() => {
    try {
      const count = Number(sessionStorage.getItem("site_nav_count") || "0");
      sessionStorage.setItem("site_nav_count", String(count + 1));
    } catch {
      // sessionStorage may fail in private mode or sandboxed contexts
    }
  }, [pathname]);

  if (isHomePage(pathname, siteConfig.basePath)) {
    return null;
  }

  const parentHref = getParentPath(pathname);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      const count = Number(sessionStorage.getItem("site_nav_count") || "0");
      if (count > 0 && typeof window !== "undefined" && window.history.length > 1) {
        e.preventDefault();
        router.back();
      }
    } catch {
      // Fall back to default link navigation to parentHref
    }
  };

  return (
    <nav
      aria-label={tr.ui.back}
      className="back-navigation w-full border-b border-[var(--color-line)]/60 bg-[var(--color-parchment)]/80 backdrop-blur-xs"
    >
      <div className="mx-auto flex max-w-7xl items-center px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <Link
          href={parentHref}
          onClick={handleBack}
          className="inline-flex min-h-9 items-center gap-2 rounded-md font-body text-ui font-semibold text-[var(--color-text-brand)] transition-colors hover:text-[var(--color-saffron-700)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{tr.ui.back}</span>
        </Link>
      </div>
    </nav>
  );
}
