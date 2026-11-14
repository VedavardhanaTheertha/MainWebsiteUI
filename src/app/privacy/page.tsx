import type { Metadata } from "next";
import LocalizedCopy from "@/components/LocalizedCopy";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.privacy;

export default function PrivacyPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 pt-3.5 pb-8 sm:pt-4 sm:pb-12 lg:px-8">
        <header className="mx-auto max-w-2xl px-12 text-center sm:px-16 lg:px-0 mb-6 sm:mb-8">
          <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl mb-2">
            <LocalizedCopy path={["pages", "local_copy", "privacy_title"]} />
          </h1>
          <p className="font-body text-sm text-[var(--color-text-secondary)]/60">
            <LocalizedCopy path={["pages", "local_copy", "legal_updated"]} />
          </p>
        </header>

        <div className="font-body text-[var(--color-text-secondary)] leading-relaxed space-y-6">
          <p>
            <LocalizedCopy path={["pages", "local_copy", "privacy_intro"]} />
          </p>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              <LocalizedCopy path={["pages", "local_copy", "privacy_heading_1"]} />
            </h2>
            <div className="space-y-3">
              <p>
                <strong className="text-[var(--color-text-primary)]">
                  <LocalizedCopy path={["pages", "local_copy", "privacy_collect_personal_label"]} />
                </strong>
                <LocalizedCopy path={["pages", "local_copy", "privacy_collect_personal"]} />
              </p>
              <p>
                <strong className="text-[var(--color-text-primary)]">
                  <LocalizedCopy path={["pages", "local_copy", "privacy_collect_transaction_label"]} />
                </strong>
                <LocalizedCopy path={["pages", "local_copy", "privacy_collect_transaction"]} />
              </p>
              <p>
                <strong className="text-[var(--color-text-primary)]">
                  <LocalizedCopy path={["pages", "local_copy", "privacy_collect_technical_label"]} />
                </strong>
                <LocalizedCopy path={["pages", "local_copy", "privacy_collect_technical"]} />
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              <LocalizedCopy path={["pages", "local_copy", "privacy_heading_2"]} />
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <LocalizedCopy path={["pages", "local_copy", "privacy_use_1"]} />
              </li>
              <li>
                <LocalizedCopy path={["pages", "local_copy", "privacy_use_2"]} />
              </li>
              <li>
                <LocalizedCopy path={["pages", "local_copy", "privacy_use_3"]} />
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              <LocalizedCopy path={["pages", "local_copy", "privacy_heading_3"]} />
            </h2>
            <div className="space-y-3">
              <p>
                <LocalizedCopy path={["pages", "local_copy", "privacy_security_1"]} />
              </p>
              <p>
                <LocalizedCopy path={["pages", "local_copy", "privacy_security_2"]} />
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              <LocalizedCopy path={["pages", "local_copy", "privacy_heading_4"]} />
            </h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "privacy_localization"]} />
            </p>
          </section>

          <section className="pt-4 border-t border-[var(--color-border-subtle)]">
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3">
              <LocalizedCopy path={["pages", "local_copy", "legal_contact_heading"]} />
            </h2>
            <p className="mb-2">
              <LocalizedCopy path={["pages", "local_copy", "legal_contact_intro"]} />
            </p>
            <div className="text-sm space-y-1 text-[var(--color-text-secondary)]">
              <p className="font-medium text-[var(--color-text-primary)]">
                <LocalizedCopy path={["pages", "local_copy", "legal_contact_name"]} />
              </p>
              <p>
                <LocalizedCopy path={["pages", "local_copy", "legal_contact_address"]} />
              </p>
              <p>
                <LocalizedCopy path={["pages", "local_copy", "legal_contact_email_label"]} />
                <a href="mailto:support@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                  <LocalizedCopy path={["pages", "local_copy", "legal_support_email"]} />
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
