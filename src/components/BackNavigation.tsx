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
      className="back-navigation pointer-events-none absolute inset-x-0 top-0 z-20"
    >
      <div className="mx-auto flex max-w-7xl items-center px-4 pt-3.5 sm:px-6 sm:pt-4 lg:px-8">
        <Link
          href={parentHref}
          onClick={handleBack}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)]/60 bg-[var(--color-paper)]/80 px-2.5 py-1 font-body text-ui font-semibold text-[var(--color-text-brand)] backdrop-blur-xs shadow-2xs transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-saffron-700)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-saffron-600)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{tr.ui.back}</span>
        </Link>
      </div>
    </nav>
  );
}
