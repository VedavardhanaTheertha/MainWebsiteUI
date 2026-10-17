import type { Metadata } from "next";
import ImageListCards from "@/components/ImageListCards";
import LocalizedCopy from "@/components/LocalizedCopy";
import { content, defaultLang } from "@/gen/content";
import { actionDestinations } from "@/gen/settings/actions";

export const metadata: Metadata = content[defaultLang].page_metadata.volunteer;

const roles = ["📦", "🤝", "📸", "🍽️", "📚", "🧒"];
const whyVolunteer = ["🙏", "🌐", "✨"];

export default function VolunteerPage() {
  return (
    <div>
      {/* Page hero */}
      <div className="bg-[var(--color-parchment)] pt-4 pb-3 lg:pt-7 lg:pb-6 text-center px-5">
        <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-3">
          <LocalizedCopy path={["pages", "local_copy", "volunteer_eyebrow"]} />
        </p>
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-4xl sm:text-5xl lg:text-6xl mb-3">
          <LocalizedCopy path={["pages", "local_copy", "volunteer_title"]} />
        </h1>
        <p className="font-body text-[var(--color-text-brand)]/75 text-base max-w-xl mx-auto">
          <LocalizedCopy path={["vol_subtitle"]} />
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
        {/* Why volunteer */}
        <section aria-labelledby="why-heading" className="mb-14">
          <h2
            id="why-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-8 text-center"
          >
            <LocalizedCopy path={["pages", "local_copy", "volunteer_why_title"]} />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whyVolunteer.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-[18px] p-6 border border-[var(--color-saffron-600)] shadow-[0_4px_18px_rgba(60,7,83,0.08)] text-center"
              >
                <span className="text-4xl block mb-3" aria-hidden="true">{item}</span>
                <h3 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-2"><LocalizedCopy path={["pages", "local_copy", `volunteer_reason_${index}_title`]} /></h3>
                <p className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {index === 0
                    ? <LocalizedCopy path={["pages", "detected", "volunteer_why"]} />
                    : <LocalizedCopy path={["pages", "local_copy", `volunteer_reason_${index}_body`]} />}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Volunteer Opportunities — matches the design reference's VolunteerScreen list */}
        <section aria-labelledby="opportunities-heading" className="mb-14">
          <h2 id="opportunities-heading" className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-8">
            <LocalizedCopy path={["pages", "local_copy", "volunteer_opportunities"]} />
          </h2>
          <ImageListCards contentKey="volunteer_ops" />
        </section>

        {/* Roles */}
        <section aria-labelledby="roles-heading" className="mb-14">
          <h2
            id="roles-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-8"
          >
            <LocalizedCopy path={["pages", "local_copy", "volunteer_roles"]} />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {roles.map((role, index) => (
              <article
                key={index}
                className="bg-white rounded-[18px] p-6 border border-[var(--color-saffron-600)] shadow-[0_4px_18px_rgba(60,7,83,0.08)] flex gap-4"
                aria-labelledby={`role-${index}`}
              >
                <span className="text-3xl shrink-0 mt-0.5" aria-hidden="true">{role}</span>
                <div>
                  <h3
                    id={`role-${index}`}
                    className="font-display font-semibold text-[var(--color-text-primary)] text-lg mb-1"
                  >
                    <LocalizedCopy path={["pages", "local_copy", `volunteer_role_${index}_title`]} />
                  </h3>
                  <p className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed mb-3">
                    {index === roles.length - 1
                      ? <LocalizedCopy path={["pages", "detected", "volunteer_role"]} />
                      : <LocalizedCopy path={["pages", "local_copy", `volunteer_role_${index}_description`]} />}
                  </p>
                  <span className="inline-block font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-brand)] bg-[var(--color-saffron-100)] rounded-full px-3 py-1">
                    <LocalizedCopy path={["pages", "local_copy", `volunteer_role_${index}_commitment`]} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sign-up CTA */}
        <section
          aria-labelledby="signup-heading"
          className="bg-[var(--color-paper)] rounded-[20px] p-8 lg:p-12 text-center"
        >
          <h2
            id="signup-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-2xl sm:text-xl lg:text-3xl mb-4"
          >
            <LocalizedCopy path={["pages", "local_copy", "volunteer_ready"]} />
          </h2>
          <p className="font-body text-[var(--color-text-brand)]/75 text-base mb-6 max-w-xl mx-auto">
            <LocalizedCopy path={["vol_ready_body"]} />
          </p>

          <a
            href={actionDestinations.volunteer}
            className="inline-flex items-center gap-2 font-body font-semibold text-white bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-full px-8 py-3.5 text-base hover:shadow-lg hover:scale-[1.02] transition-all focus-visible:outline-white focus-visible:outline-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LocalizedCopy path={["pages", "local_copy", "volunteer_register"]} />
            <span aria-hidden="true">→</span>
          </a>

          <p className="font-body text-xs text-[var(--color-text-brand)]/40 mt-4">
            {/* TODO: Replace with real contact info from management */}
            <LocalizedCopy path={["pages", "volunteer_question"]} />
          </p>
        </section>
      </div>

    </div>
  );
}
