import type { Metadata } from "next";
import LocalizedCopy from "@/components/LocalizedCopy";
import { content, defaultLang } from "@/gen/content";

export const metadata: Metadata = content[defaultLang].page_metadata.privacy;

export default function PrivacyPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-3xl sm:text-4xl mb-2">
          <LocalizedCopy path={["pages", "local_copy", "privacy_title"]} />
        </h1>
        <p className="font-body text-sm text-[var(--color-text-secondary)]/60 mb-10">
          <LocalizedCopy path={["pages", "local_copy", "legal_updated"]} />
        </p>

        <div className="font-body text-[var(--color-text-secondary)] leading-relaxed space-y-6">
          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "privacy_heading_1"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "privacy_collect"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "privacy_heading_2"]} /></h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><LocalizedCopy path={["pages", "local_copy", "privacy_process"]} /></li>
              <li><LocalizedCopy path={["pages", "detected", "privacy_updates"]} /></li>
              <li><LocalizedCopy path={["pages", "local_copy", "privacy_obligations"]} /></li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "privacy_heading_3"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "privacy_sharing"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "privacy_heading_4"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "privacy_cookies"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "privacy_heading_5"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "privacy_rights_before"]} />{" "}
              <a href="mailto:info@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                <LocalizedCopy path={["pages", "local_copy", "legal_info_email"]} />
              </a>{" "}
              <LocalizedCopy path={["pages", "local_copy", "privacy_rights_after"]} />
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"><LocalizedCopy path={["pages", "local_copy", "privacy_heading_6"]} /></h2>
            <p>
              <LocalizedCopy path={["pages", "local_copy", "privacy_contact"]} />{" "}
              <a href="mailto:privacy@shiroormatha.org" className="text-[var(--color-text-brand)] hover:underline">
                <LocalizedCopy path={["pages", "local_copy", "privacy_email"]} />
              </a>{" "}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
