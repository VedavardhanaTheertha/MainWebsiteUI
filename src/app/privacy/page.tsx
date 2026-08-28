import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.privacy;

// TODO: Have legal counsel review and finalise before launch
export default function PrivacyPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl mb-2">
          Privacy Policy
        </h1>
        <p className="font-body text-sm text-[var(--color-text-secondary)]/60 mb-10">
          Last updated: June 2026 {/* TODO: Update date before launch */}
        </p>

        <div className="font-body text-[var(--color-text-secondary)] leading-relaxed space-y-6">
          {/* TODO: Replace with legally reviewed, complete privacy policy */}
          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">1. What We Collect</h2>
            <p>
              When you make a donation or seva offering, we collect your name, email address, phone number,
              and payment details (processed securely by our payment gateway). We do not store card details
              on our servers.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To process your donation or seva offering and send you a receipt</li>
              <li>{content[defaultLang].pages.detected.privacy_updates}</li>
              <li>To fulfil any legal or regulatory obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">3. Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal data with third parties, except as required for
              payment processing or by law.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">4. Cookies</h2>
            <p>
              This website uses essential cookies to function. No tracking or advertising cookies are used
              without your consent.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. Contact us at{" "}
              <a href="mailto:info@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                info@shiroormatha.org
              </a>{" "}
              to exercise these rights. {/* TODO: Confirm email */}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">6. Contact</h2>
            <p>
              For privacy concerns, email{" "}
              <a href="mailto:privacy@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                privacy@shiroormatha.org
              </a>{" "}
              {/* TODO: Set up real email */}
            </p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
