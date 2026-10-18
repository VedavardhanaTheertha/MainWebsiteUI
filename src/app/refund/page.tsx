import type { Metadata } from "next";
import LocalizedCopy from "@/components/LocalizedCopy";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.refund;

export default function RefundPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl mb-2">
          <LocalizedCopy path={["pages", "local_copy", "refund_title"]} />
        </h1>
        <p className="font-body text-sm text-[var(--color-text-secondary)]/60 mb-10">
          <LocalizedCopy path={["pages", "local_copy", "legal_updated"]} />
        </p>

        <div className="font-body text-[var(--color-text-secondary)] leading-relaxed space-y-6">
          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              <LocalizedCopy path={["pages", "local_copy", "refund_heading_1"]} />
            </h2>
            <p>
              <LocalizedCopy path={["pages", "detected", "refund_donations"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "refund_heading_2"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "refund_seva"]} />
            </p>
            <p className="mt-3">
              <LocalizedCopy path={["pages", "local_copy", "refund_window"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              <LocalizedCopy path={["pages", "local_copy", "refund_heading_3"]} />
            </h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "refund_contact_before"]} />{" "}
              <a href="mailto:refund@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                <LocalizedCopy path={["pages", "local_copy", "refund_email"]} />
              </a>{" "}
              <LocalizedCopy path={["pages", "local_copy", "refund_contact_after"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              <LocalizedCopy path={["pages", "local_copy", "refund_heading_4"]} />
            </h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "refund_processing"]} />
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
