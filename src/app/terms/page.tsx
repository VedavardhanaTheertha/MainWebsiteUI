import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service | Shri Shiroor Matha",
};

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
              By accessing or using the Shri Shiroor Matha website (shiroormatha.org), you agree to these
              Terms of Service. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">2. Seva Offerings & Donations</h2>
            <p>
              All seva offerings and donations made through this website are voluntary contributions to Shri
              Krishna Matha Paryaya Shri Shiroor Matha, a religious institution. Payments are processed
              securely. Please refer to our{" "}
              <a href="/refund" className="text-[var(--color-text-brand)] hover:underline">
                Refund Policy
              </a>{" "}
              for information on refund eligibility.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">3. Intellectual Property</h2>
            <p>
              All content on this website — including text, images, logos, and design — is the property of
              Shri Shiroor Matha or used with permission. You may not reproduce, distribute, or create
              derivative works without written permission.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">4. Disclaimer</h2>
            <p>
              This website is provided &ldquo;as is&rdquo; without warranties of any kind. Shri Shiroor Matha
              does not guarantee the accuracy of all content and reserves the right to update information at any time.
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
