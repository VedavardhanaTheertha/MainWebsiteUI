import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import ContactRows from "@/components/ContactRows";

export const metadata: Metadata = {
  title: "Contact & Branches | Shri Shiroor Matha, Udupi",
  description:
    "Contact information and branch locations for Shri Shiroor Matha.",
};

// TODO: Verify all contact details and branch locations with management
const branches = [
  {
    name: "Shri Shiroor Matha — Main Campus",
    type: "Main",
    address: "Car Street, Udupi — 576 101, Karnataka, India",
    phone: "+91-820-2520-XXX", // TODO: Replace with real number
    email: "info@shiroormatha.org", // TODO: Replace with real email
    hours: "6:00 AM – 12:30 PM · 5:00 PM – 9:00 PM",
    mapLink: "#", // TODO: Replace with real Google Maps link
  },
  {
    name: "Shri Shiroor Matha — Bengaluru Branch",
    type: "Branch",
    address: "JP Nagar, Bengaluru — 560 078, Karnataka, India", // TODO: Verify address
    phone: "+91-80-XXXX-XXXX", // TODO: Replace
    email: "bangalore@shiroormatha.org", // TODO
    hours: "7:00 AM – 11:00 AM · 6:00 PM – 8:00 PM",
    mapLink: "#",
  },
  {
    name: "Shri Shiroor Matha — Mumbai Branch",
    type: "Branch",
    address: "Matunga (West), Mumbai — 400 016, Maharashtra, India", // TODO: Verify
    phone: "+91-22-XXXX-XXXX", // TODO
    email: "mumbai@shiroormatha.org", // TODO
    hours: "7:00 AM – 11:00 AM · 6:00 PM – 8:00 PM",
    mapLink: "#",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Page hero */}
      <div className="bg-[var(--color-parchment)] pt-4 pb-3 lg:pt-7 lg:pb-6 text-center px-5">
        <p className="font-body text-[11px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-3">
          Find Us
        </p>
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-4xl sm:text-5xl lg:text-6xl mb-3">
          Contact & Branches
        </h1>
        <p className="font-body text-[var(--color-text-brand)]/75 text-base max-w-xl mx-auto">
          Reach out to us — we&apos;re here to help with sevas, volunteering, events, and general enquiries.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
        {/* Reach Shri Shiroor Matha — matches the design reference's .m-contact rows */}
        <section aria-labelledby="reach-heading" className="mb-14 max-w-md">
          <h2 id="reach-heading" className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-6">
            Reach Shri Shiroor Matha
          </h2>
          <ContactRows />
        </section>

        {/* Branches */}
        <section aria-labelledby="branches-heading" className="mb-14">
          <h2
            id="branches-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-xl lg:text-3xl mb-8"
          >
            Our Locations
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {branches.map((branch) => (
              <article
                key={branch.name}
                className="bg-white rounded-[18px] p-6 border border-[var(--color-saffron-600)] shadow-[0_4px_18px_rgba(60,7,83,0.08)] flex flex-col gap-4"
                aria-labelledby={`branch-${branch.name}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`font-body text-[10px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 shrink-0 ${
                      branch.type === "Main"
                        ? "bg-[var(--color-saffron-100)] text-[var(--color-text-brand)]"
                        : "bg-[var(--color-saffron-600)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {branch.type}
                  </span>
                </div>

                <div>
                  <h3
                    id={`branch-${branch.name}`}
                    className="font-display font-semibold text-[var(--color-text-primary)] text-xl mb-3"
                  >
                    {branch.name}
                  </h3>

                  <div className="space-y-2.5 font-body text-sm text-[var(--color-text-secondary)]">
                    <p>
                      <span className="text-[var(--color-text-primary)] font-medium">Address: </span>
                      {branch.address}
                    </p>
                    <p>
                      <span className="text-[var(--color-text-primary)] font-medium">Phone: </span>
                      <a href={`tel:${branch.phone}`} className="hover:text-[var(--color-text-brand)] transition-colors">
                        {branch.phone}
                      </a>
                    </p>
                    <p>
                      <span className="text-[var(--color-text-primary)] font-medium">Email: </span>
                      <a
                        href={`mailto:${branch.email}`}
                        className="hover:text-[var(--color-text-brand)] transition-colors break-all"
                      >
                        {branch.email}
                      </a>
                    </p>
                    <p>
                      <span className="text-[var(--color-text-primary)] font-medium">Hours: </span>
                      {branch.hours}
                    </p>
                  </div>
                </div>

                <a
                  href={branch.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 font-body text-xs font-semibold text-[var(--color-text-brand)] border border-[var(--color-saffron-600)] rounded-full px-4 py-2 hover:bg-[var(--color-saffron-100)] transition-colors focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
                >
                  View on Map
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
          <p className="font-body text-xs text-[var(--color-text-secondary)]/50 mt-4 italic">
            * Contact details are placeholders — to be confirmed with management before launch.
          </p>
        </section>

        {/* General enquiry */}
        <section
          aria-labelledby="enquiry-heading"
          className="bg-[var(--color-paper)] rounded-[20px] p-8 lg:p-12"
        >
          <h2
            id="enquiry-heading"
            className="font-display font-bold text-[var(--color-text-primary)] text-2xl sm:text-3xl mb-4"
          >
            Send Us a Message
          </h2>
          <p className="font-body text-[var(--color-text-brand)]/70 text-sm mb-6">
            For seva bookings, volunteering, donations, or any other enquiry, write to us at:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:info@shiroormatha.org" /* TODO: Real email */
              className="inline-flex items-center gap-2 font-body font-semibold text-white bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] rounded-full px-7 py-3 text-sm hover:shadow-lg transition-all focus-visible:outline-white focus-visible:outline-2"
            >
              Email Us
            </a>
            <a
              href="tel:+918202520000" /* TODO: Real phone */
              className="inline-flex items-center gap-2 font-body font-semibold text-[var(--color-text-brand)] border border-white/20 rounded-full px-7 py-3 text-sm hover:border-[var(--color-saffron-600)] hover:text-[var(--color-text-brand)] transition-all focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
            >
              Call Us
            </a>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
