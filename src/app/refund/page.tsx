import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.refund;

// TODO: Have legal counsel review and finalise before launch
export default function RefundPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl mb-2">
          Refund Policy
        </h1>
        <p className="font-body text-sm text-[var(--color-text-secondary)]/60 mb-10">
          Last updated: June 2026 {/* TODO: Update date before launch */}
        </p>

        <div className="font-body text-[var(--color-text-secondary)] leading-relaxed space-y-6">
          {/* TODO: Replace with legally reviewed refund policy */}
          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              1. Donations (General)
            </h2>
            <p>
              {content[defaultLang].pages.detected.refund_donations}
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">2. Seva Offerings</h2>
            <p>
              If a booked seva cannot be performed due to circumstances at the Matha (e.g., unavailability
              on the requested date), the amount will be refunded in full or the seva will be rescheduled
              at the devotee&apos;s preference.
            </p>
            <p className="mt-3">
              Refund requests for seva bookings must be submitted at least 48 hours before the scheduled
              date. Requests received after this window will not be eligible for a refund.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              3. How to Request a Refund
            </h2>
            <p>
              Email us at{" "}
              <a href="mailto:refund@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                refund@shiroormatha.org
              </a>{" "}
              with your name, transaction ID, and reason for the request. {/* TODO: Set up real email */}
              We aim to respond within 2 business days.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              4. Processing Time
            </h2>
            <p>
              Approved refunds will be credited to the original payment method within 7–10 business days.
              Bank processing times may vary.
            </p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
