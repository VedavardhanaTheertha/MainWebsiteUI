import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import LibraryGrid from "@/components/library/LibraryGrid";

export const metadata: Metadata = {
  title: "Library | Shri Shiroor Matha",
  description: "Sacred texts, chants, devotional songs, wisdom archives, and ritual guides from Shri Shiroor Matha.",
};

export default function LibraryPage() {
  return (
    <>
      <div className="text-center px-4 pt-5 pb-2">
        <p className="font-body text-[10.5px] tracking-[.18em] uppercase text-[var(--color-text-brand)] font-bold">Library</p>
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] mt-1">Sacred Knowledge</h1>
      </div>

      <div className="px-4 pb-12">
        <LibraryGrid />
      </div>

      {/* Open-source contribution notice */}
      <div className="border-t border-[var(--color-saffron-600)] bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-10 py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-body text-[11px] text-[var(--color-text-secondary)]/60">
            This library is open-source — want to add content or fix something?
          </span>
          <a href="https://github.com/shiroor-matha/library" target="_blank" rel="noopener noreferrer"
            className="font-body text-[11px] font-semibold text-[var(--color-text-brand)] hover:underline inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Contribute on GitHub
          </a>
          <span className="font-body text-[11px] text-[var(--color-text-secondary)]/40">or</span>
          <a href="mailto:seva@shiroormatha.org?subject=Library Contribution&body=I'd like to contribute to the library. Please send me the steps."
            className="font-body text-[11px] font-semibold text-[var(--color-text-brand)] hover:underline">
            email us for steps
          </a>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
