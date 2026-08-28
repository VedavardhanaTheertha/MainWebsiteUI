import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SevaDetailClient from "@/components/SevaDetailClient";

export const metadata: Metadata = {
  title: "Maha Annadaana Seva | Shri Shiroor Matha",
  description: "Offer the sacred Maha Annadaana Seva at Shri Shiroor Matha — feed thousands of devotees in the name of the Divine.",
};

const seva = {
  name: "Maha Annadaana Seva",
  category: "Annadaana",
  tagline: "Feed thousands in the name of the Divine",
  price: 5000,
  image: "/slide/KRAJ0835.JPG",
  significance: [
    "Annadaana — the gift of food — is considered the highest form of charity in the Vedic tradition. The scriptures declare: 'Annam Brahma' — food itself is Brahman.",
    "By sponsoring the Maha Annadaana Seva at Shri Shiroor Matha, you participate in feeding thousands of pilgrims, devotees, scholars, and the needy who visit the Matha during Paryaya 2026-2028.",
    "Each meal is prepared with devotion by trained volunteers, offered first to the Lord, and then distributed as prasada. Your contribution directly sustains this sacred tradition.",
  ],
  benefits: [
    "Fulfills the highest form of daana (charity)",
    "Earns the blessings of all who receive the meal",
    "Prasada distributed in your family name",
    "Certificate of seva participation sent by post",
  ],
  upiId: "shiroor.matha@upi",
  phone: "+91 00000 00000",
  email: "seva@shiroormatha.org",
};

export default function Top1SevaPage() {
  return (
    <div className="bg-[var(--color-cream)] min-h-screen">

      {/* Hero — rounded bottom like home carousel */}
      <div
        className="relative w-full h-[55vw] max-h-[480px] min-h-[260px] overflow-hidden"
        style={{ borderRadius: "0 0 50% 50% / 0 0 18% 18%" }}
      >
        <Image
          src={seva.image}
          alt={seva.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,17,8,0.94) 25%, rgba(26,17,8,0.38) 60%, transparent 100%)" }} />

        {/* Back breadcrumb */}
        <Link
          href="/sevas"
          className="absolute top-4 left-4 flex items-center gap-1.5 font-body text-[11px] text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All Sevas
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <span className="inline-block font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-primary)] bg-[#FFAE6E] rounded-full px-3 py-0.5 mb-2">
            {seva.category}
          </span>
          <h1 className="font-display font-bold text-white text-2xl lg:text-4xl leading-tight mb-1">{seva.name}</h1>
          <p className="font-body text-white/70 text-sm">{seva.tagline}</p>
        </div>
      </div>

      {/* Content — single col mobile, 2-col desktop */}
      <div className="max-w-6xl mx-auto px-4 lg:px-10 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start">

          {/* Left — Significance + Benefits */}
          <div className="space-y-8 mb-8 lg:mb-0">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 rounded-full bg-[var(--color-saffron-600)]" />
                <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl">Significance</h2>
              </div>
              <div className="space-y-3">
                {seva.significance.map((para, i) => (
                  <p key={i} className="font-body text-[var(--color-text-secondary)] text-sm leading-relaxed">{para}</p>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[var(--color-saffron-600)] px-5 py-4">
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-base mb-3">What you receive</h3>
              <ul className="space-y-2">
                {seva.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FFAE6E" }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="font-body text-[var(--color-text-secondary)] text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </section>

            <p className="font-body text-[11px] text-[var(--color-text-secondary)]/50 italic hidden lg:block">
              * All seva bookings are subject to availability and confirmation by Matha administration.
            </p>
          </div>

          {/* Right — Booking (sticky on desktop) */}
          <div className="lg:sticky lg:top-20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 rounded-full bg-[var(--color-saffron-600)]" />
              <h2 className="font-display font-bold text-[var(--color-text-primary)] text-xl">Book Seva</h2>
            </div>
            <SevaDetailClient
              price={seva.price}
              upiId={seva.upiId}
              phone={seva.phone}
              email={seva.email}
              sevaName={seva.name}
            />
            <p className="font-body text-[11px] text-[var(--color-text-secondary)]/50 text-center italic mt-4 lg:hidden">
              * All seva bookings are subject to availability and confirmation by Matha administration.
            </p>
          </div>

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
