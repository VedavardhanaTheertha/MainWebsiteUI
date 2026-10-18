import type { Metadata } from "next";
import Link from "next/link";
import LocalizedCopy from "@/components/LocalizedCopy";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.terms;

export default function TermsPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl mb-2">
          <LocalizedCopy path={["pages", "local_copy", "terms_title"]} />
        </h1>
        <p className="font-body text-sm text-[var(--color-text-secondary)]/60 mb-10">
          <LocalizedCopy path={["pages", "local_copy", "legal_updated"]} />
        </p>

        <div className="prose prose-sm max-w-none font-body text-[var(--color-text-secondary)] leading-relaxed space-y-6">
          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "terms_heading_1"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "terms", "acceptance"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "terms_heading_2"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "terms", "donations"]} />{" "}<LocalizedCopy path={["pages", "local_copy", "terms_refund_before"]} />{" "}
              <Link href="/refund" className="text-[var(--color-text-brand)] hover:underline">
                <LocalizedCopy path={["pages", "local_copy", "refund_title"]} />
              </Link>{" "}
              <LocalizedCopy path={["pages", "local_copy", "terms_refund_after"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "terms_heading_3"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "terms", "property"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "terms_heading_4"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "terms", "disclaimer"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "terms_heading_5"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "terms_law"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "terms_heading_6"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "terms_contact"]} />{" "}
              <a href="mailto:info@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                <LocalizedCopy path={["pages", "local_copy", "legal_info_email"]} />
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
