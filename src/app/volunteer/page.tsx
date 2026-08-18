import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import ImageListCards from "@/components/ImageListCards";

export const metadata: Metadata = {
  title: "Volunteer | Shri Shiroor Matha, Udupi",
  description:
    "Join the volunteer family of Shri Shiroor Matha during Paryaya 2026–2028. Offer your time and skills to the Divine.",
};

// TODO: Confirm roles, contact details, and form link with management
const roles = [
  {
    icon: "📦",
    title: "Logistics & Operations",
    description:
      "Coordinate crowd management, prasada distribution, material movement, and day-to-day operations during events and utsavas.",
    commitment: "Flexible — event-based or continuous",
  },
  {
    icon: "🤝",
    title: "Guest Services & Reception",
    description:
      "Welcome devotees, assist with navigation, answer questions, and ensure a warm, dignified experience for all visitors.",
    commitment: "Weekend shifts available",
  },
  {
    icon: "📸",
    title: "Digital Media & Documentation",
    description:
      "Photography, videography, social media content creation, and live-streaming of poojas and events for the global community.",
    commitment: "Project-based",
  },
  {
    icon: "🍽️",
    title: "Annadaana Support",
    description:
      "Assist in the Bhojana Shala — serving meals, preparation support, and clean-up during mass feeding events.",
    commitment: "Daily or event-based",
  },
  {
    icon: "📚",
    title: "Translation & Content",
    description:
      "Translate devotional content into regional languages, help document the Matha's history, or write for the website and newsletters.",
    commitment: "Remote-friendly",
  },
  {
    icon: "🧒",
    title: "Youth Engagement",
    description:
      "Run cultural programs, teach children about the tradition, and involve the next generation in the Paryaya celebrations.",
    commitment: "Weekends",
  },
];

const whyVolunteer = [
  {
    icon: "🙏",
    title: "Sacred Service",
    body: "Volunteering at the Matha during Paryaya is seva — not work. You carry forward an 800-year tradition with every hour you give.",
  },
  {
    icon: "🌐",
    title: "Global Community",
    body: "Join thousands of volunteers from across India and the world who come together for this once-in-twelve-years event.",
  },
  {
    icon: "✨",
    title: "Transformative Experience",
    body: "Many volunteers describe the experience as life-changing — a deepening of faith and a renewed sense of purpose.",
  },
];

export default function VolunteerPage() {
  return (
    <>
      {/* Page hero */}
      <div className="bg-[var(--color-parchment)] pt-4 pb-3 lg:pt-7 lg:pb-6 text-center px-5">
        <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-3">
          Give Your Time
        </p>
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-4xl sm:text-5xl lg:text-6xl mb-3">
          Become a Volunteer
        </h1>
        <p className="font-body text-[var(--color-text-brand)]/75 text-base max-w-xl mx-auto">
          The Paryaya needs more than donations — it needs willing hands, warm hearts, and dedicated souls.
          Join us.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
        {/* Why volunteer */}
        <section aria-labelledby="why-heading" className="mb-14">
          <h2
            id="why-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-8 text-center"
          >
            Why Volunteer?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whyVolunteer.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-[18px] p-6 border border-[var(--color-saffron-600)] shadow-[0_4px_18px_rgba(60,7,83,0.08)] text-center"
              >
                <span className="text-4xl block mb-3" aria-hidden="true">{item.icon}</span>
                <h3 className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-2">{item.title}</h3>
                <p className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Volunteer Opportunities — matches the design reference's VolunteerScreen list */}
        <section aria-labelledby="opportunities-heading" className="mb-14">
          <h2 id="opportunities-heading" className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-8">
            Volunteer Opportunities
          </h2>
          <ImageListCards contentKey="volunteer_ops" />
        </section>

        {/* Roles */}
        <section aria-labelledby="roles-heading" className="mb-14">
          <h2
            id="roles-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-8"
          >
            Volunteer Roles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {roles.map((role) => (
              <article
                key={role.title}
                className="bg-white rounded-[18px] p-6 border border-[var(--color-saffron-600)] shadow-[0_4px_18px_rgba(60,7,83,0.08)] flex gap-4"
                aria-labelledby={`role-${role.title}`}
              >
                <span className="text-3xl shrink-0 mt-0.5" aria-hidden="true">{role.icon}</span>
                <div>
                  <h3
                    id={`role-${role.title}`}
                    className="font-display font-semibold text-[var(--color-text-primary)] text-lg mb-1"
                  >
                    {role.title}
                  </h3>
                  <p className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed mb-3">
                    {role.description}
                  </p>
                  <span className="inline-block font-body text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-brand)] bg-[var(--color-saffron-100)] rounded-full px-3 py-1">
                    {role.commitment}
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
            Ready to Serve?
          </h2>
          <p className="font-body text-[var(--color-text-brand)]/75 text-base mb-6 max-w-xl mx-auto">
            Fill out the volunteer registration form and our team will reach out within 48 hours. All backgrounds,
            ages, and skill levels are welcome.
          </p>

          {/* TODO: Replace href with actual volunteer registration form link from management */}
          <a
            href="#"
            className="inline-flex items-center gap-2 font-body font-semibold text-white bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-full px-8 py-3.5 text-base hover:shadow-lg hover:scale-[1.02] transition-all focus-visible:outline-white focus-visible:outline-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Register as Volunteer
            <span aria-hidden="true">→</span>
          </a>

          <p className="font-body text-xs text-[var(--color-text-brand)]/40 mt-4">
            {/* TODO: Replace with real contact info from management */}
            Questions? Email us at volunteer@shiroor.matha.in
          </p>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
