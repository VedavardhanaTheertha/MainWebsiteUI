import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.terms;
const terms = content[defaultLang].pages.terms;

// TODO: Have legal counsel review and finalise all policy text before launch
export default function TermsPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl mb-2">
          Terms of Service
        </h1>
        <p className="font-body text-sm text-[var(--color-text-secondary)]/60 mb-10">
          Last updated: June 2026 {/* TODO: Update date before launch */}
        </p>

        <div className="prose prose-sm max-w-none font-body text-[var(--color-text-secondary)] leading-relaxed space-y-6">
          {/* TODO: Replace with legally reviewed terms of service */}
          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">1. Acceptance of Terms</h2>
            <p>
              {terms.acceptance}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">2. Seva Offerings & Donations</h2>
            <p>
              {terms.donations} Please refer to our{" "}
              <a href="/refund" className="text-[var(--color-text-brand)] hover:underline">
                Refund Policy
              </a>{" "}
              for information on refund eligibility.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">3. Intellectual Property</h2>
            <p>
              {terms.property}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">4. Disclaimer</h2>
            <p>
              {terms.disclaimer}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">5. Governing Law</h2>
            <p>
              These terms are governed by the laws of Karnataka, India. Any disputes shall be subject to the
              jurisdiction of courts in Udupi, Karnataka.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">6. Contact</h2>
            <p>
              For any questions regarding these terms, contact us at{" "}
              <a href="mailto:info@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                info@shiroormatha.org
              </a>
              . {/* TODO: Replace with real contact email */}
            </p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
