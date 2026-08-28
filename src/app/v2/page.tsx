"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/LanguageContext";

// ─── DATA ────────────────────────────────────────────────────

const sevasMenu = [
  "Panchamrita Abhisheka",
  "Pushpa Seva",
  "Brahmakalasha Seva",
  "Utsava Deepa Seva",
  "Annadaana Seva",
];

const baseBlogMenu = [
  "Krishna Mutt History",
  "Know Our Swamiji",
  "Significance of Pooja",
  "Events",
  "Milestones",
];

const contactMenu = [
  { icon: "📞", label: "Call Direct" },
  { icon: "📸", label: "Instagram" },
  { icon: "👍", label: "Facebook" },
  { icon: "💬", label: "WhatsApp" },
  { icon: "📍", label: "Address" },
];

const baseSlides = [
  {
    id: "krishna", bg: "/krishna.jpg",
    label: "UDUPI SRI KRISHNA MATHA",
    headline: "The Divine Abode of Lord Krishna",
    body: "A 750-year-old seat of Madhwa philosophy, unbroken worship, and bhakti, established by Jagadguru Sri Madhwacharya.",
    link: "Explore the Matha",
  },
  {
    id: "swamiji", bg: "/swamiji.jpg",
    label: "HIS HOLINESS SWAMIJI",
    headline: "Wisdom for the Modern Soul",
    body: "“True devotion is not in words alone, but in selfless service to God and humanity. May Sri Krishna’s grace illuminate every step.”",
    link: "Meet Swamiji",
    isQuote: true,
  },
];

const AUTO_MS = 5500;

// ─── TOP BAR ─────────────────────────────────────────────────

function TopBarV2() {
  return (
    <div className="w-full bg-[#1a1108] text-[var(--color-text-brand)]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-10 flex items-center gap-4">
        {/* Lang — leftmost */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button className="text-[10px] font-bold px-1 py-0.5 rounded text-white bg-white/15">E</button>
          <span className="text-[var(--color-text-brand)]/25 text-[9px]">/</span>
          <button className="text-[10px] font-bold px-1 py-0.5 rounded text-[var(--color-text-brand)]/50 hover:text-[var(--color-text-brand)]">ಕ</button>
        </div>

        {/* Sloka — centre (flex-1) */}
        <p className="flex-1 font-display text-[11px] sm:text-[12px] text-[var(--color-text-brand)] font-semibold tracking-wide whitespace-nowrap text-center">
          ॥ ಶ್ರೀ ವಿಠ್ಠಲೋ ವಿಜಯತೇ ॥
        </p>

        {/* Right: icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Instagram */}
          <div className="relative group/tip">
            <a href="#" aria-label="Instagram" className="flex items-center justify-center w-5 h-5 text-[var(--color-text-brand)]/60 hover:text-[var(--color-text-brand)] transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-[var(--color-paper)] text-[var(--color-text-brand)] text-[11px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-lg">Follow on Instagram</span>
          </div>

          {/* YouTube Subscribe */}
          <div className="relative group/tip">
            <a href="#" aria-label="Subscribe on YouTube" className="flex items-center justify-center w-5 h-5 text-[var(--color-text-brand)]/60 hover:text-[var(--color-text-brand)] transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" opacity="0.85"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1a1108"/>
              </svg>
            </a>
            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-[var(--color-paper)] text-[var(--color-text-brand)] text-[11px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-lg">Subscribe on YouTube</span>
          </div>

          {/* Volunteer */}
          <div className="relative group/tip">
            <a href="#" aria-label="Volunteer" className="flex items-center justify-center w-5 h-5 text-[var(--color-text-brand)]/60 hover:text-[var(--color-text-brand)] transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </a>
            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-[var(--color-paper)] text-[var(--color-text-brand)] text-[11px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-lg">Click to serve as Volunteer</span>
          </div>

          {/* Donate */}
          <div className="relative group/tip">
            <a href="#" aria-label="Donate" className="flex items-center justify-center w-5 h-5 text-[var(--color-text-brand)]/60 hover:text-[var(--color-text-brand)] transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </a>
            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-[var(--color-paper)] text-[var(--color-text-brand)] text-[11px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 shadow-lg">Donate Now — Support the Matha</span>
          </div>
        </div>{/* end right group */}
      </div>
    </div>
  );
}

// ─── HEADER with dropdowns ────────────────────────────────────

function Chevron() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function HeaderV2() {
  const { tr } = useLang();
  const blogMenu = [baseBlogMenu[0], baseBlogMenu[1], tr.pages.v2.menu_story, ...baseBlogMenu.slice(2)];
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-parchment)]/96 backdrop-blur-sm border-b border-[var(--color-saffron-600)]">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/v2" className="flex items-center gap-3 shrink-0">
          <Image src="/main-logo.png" alt={tr.pages.v2.header_name} width={40} height={40} className="object-contain" />
          <div className="leading-tight hidden sm:block">
            <p className="font-display font-semibold text-[14px] text-[var(--color-text-primary)]">{tr.pages.v2.header_name}</p>
            <p className="font-body text-[10px] text-[var(--color-text-secondary)]">{tr.pages.v2.header_tagline}</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          <Link href="/v2" className="px-3.5 py-2 rounded-full font-body text-[14px] font-medium text-[var(--color-text-brand)] bg-[var(--color-saffron-100)]">Home</Link>

          {/* Sevas */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3.5 py-2 rounded-full font-body text-[14px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-saffron-600)]/60 hover:text-[var(--color-text-primary)] transition-colors">
              Sevas <Chevron />
            </button>
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-[var(--color-saffron-600)] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {sevasMenu.map((s) => (
                <a key={s} href="#" className="block px-4 py-2.5 font-body text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-saffron-100)] hover:text-[var(--color-text-brand)] transition-colors">{s}</a>
              ))}
              <div className="border-t border-[var(--color-saffron-600)] mt-1 pt-1">
                <a href="#" className="block px-4 py-2.5 font-body text-[13px] font-semibold text-[var(--color-text-brand)] hover:bg-[var(--color-saffron-100)] transition-colors">View All Sevas →</a>
              </div>
            </div>
          </div>

          {/* Blog */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3.5 py-2 rounded-full font-body text-[14px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-saffron-600)]/60 hover:text-[var(--color-text-primary)] transition-colors">
              Blog <Chevron />
            </button>
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-[var(--color-saffron-600)] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {blogMenu.map((s) => (
                <a key={s} href="#" className="block px-4 py-2.5 font-body text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-saffron-100)] hover:text-[var(--color-text-brand)] transition-colors">{s}</a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3.5 py-2 rounded-full font-body text-[14px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-saffron-600)]/60 hover:text-[var(--color-text-primary)] transition-colors">
              Contact <Chevron />
            </button>
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-[var(--color-saffron-600)] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {contactMenu.map((c) => (
                <a key={c.label} href="#" className="flex items-center gap-3 px-4 py-2.5 font-body text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-saffron-100)] hover:text-[var(--color-text-brand)] transition-colors">
                  <span>{c.icon}</span>{c.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="hidden lg:block px-4 py-2 rounded-full font-body text-[13px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-saffron-600)] hover:border-[var(--color-saffron-600)] hover:text-[var(--color-text-brand)] transition-colors">
            Scan QR
          </button>
          <a href="#" className="flex items-center gap-1.5 px-4 lg:px-5 py-2 rounded-full bg-gradient-to-r from-[var(--color-saffron-600)] to-[var(--color-saffron-600)] text-white font-body text-[13px] font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.874L.057 23.5l5.803-1.521A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.873 9.873 0 0 1-5.036-1.378l-.361-.214-3.742.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.118 12C2.118 6.54 6.54 2.118 12 2.118S21.882 6.54 21.882 12 17.46 21.882 12 21.882z"/>
            </svg>
            <span className="hidden sm:inline">Join WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── HERO CAROUSEL ────────────────────────────────────────────

function HeroV2() {
  const { tr } = useLang();
  const slides = useMemo(() => [...baseSlides, {
    id: "institution", bg: "/shiroor-mutt.jpg",
    label: tr.pages.v2.slide_label,
    headline: tr.pages.v2.slide_headline,
    body: tr.pages.v2.slide_body,
    link: tr.pages.v2.slide_link,
  }], [tr.pages.v2]);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNext = useCallback(() => setActive((p) => (p + 1) % slides.length), [slides.length]);
  const goPrev = useCallback(() => setActive((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    timerRef.current = setTimeout(goNext, AUTO_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, goNext]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "calc(100svh - 104px)", minHeight: "520px" }}>
      {slides.map((s, i) => {
        const isActive = i === active;
        return (
          <div key={s.id} className="absolute inset-0" style={{ opacity: isActive ? 1 : 0, transition: "opacity 1.2s ease", zIndex: isActive ? 2 : 1 }}>
            {/* Full-bleed background image */}
            <img
              src={s.bg} alt="" aria-hidden="true"
              className="w-full h-full object-cover"
              style={{ transform: isActive ? "scale(1.04)" : "scale(1.0)", transition: "transform 7s ease-out" }}
            />

            {/* Soft overall dim so image doesn't overpower text */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Chakra mandala — very subtle, full centre */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <img
                src="/chakra.png" alt=""
                style={{ width: "500px", height: "500px", opacity: 0.06, animation: "mandala-spin 40s linear infinite", objectFit: "contain" }}
              />
            </div>

            {/* Centred frosted-glass text panel */}
            <div className="absolute inset-0 flex items-center justify-center px-5">
              <div
                className="w-full max-w-[520px] text-center px-6 sm:px-10 py-7 sm:py-9"
                style={{
                  background: "rgba(20, 10, 0, 0.22)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(22px)",
                  transition: "opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s",
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="block w-6 h-px bg-[var(--color-saffron-600)]" />
                  <span className="font-body text-[10px] tracking-[0.28em] uppercase text-[var(--color-text-brand)] font-semibold">{s.label}</span>
                  <span className="block w-6 h-px bg-[var(--color-saffron-600)]" />
                </div>
                <h2
                  className="font-display font-bold text-white leading-tight mb-4"
                  style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)" }}
                >
                  {s.headline}
                </h2>
                <p className={`font-body text-white/75 text-[14px] lg:text-[16px] leading-relaxed mb-8 ${s.isQuote ? "italic" : ""}`}>
                  {s.body}
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 font-body text-[13px] font-bold text-white bg-[var(--color-saffron-600)] hover:bg-[var(--color-saffron-700)] px-7 py-3 rounded-full transition-colors duration-200"
                  >
                    {s.link}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                  <a href="#" className="inline-flex items-center gap-2 font-body text-[13px] font-medium text-white/80 hover:text-white transition-colors">
                    Know More
                    <span className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next arrows */}
      <button onClick={goPrev} aria-label="Prev"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 border border-white/25 flex items-center justify-center text-white hover:bg-black/50 transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button onClick={goNext} aria-label="Next"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 border border-white/25 flex items-center justify-center text-white hover:bg-black/50 transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Progress dots — bottom left */}
      <div className="absolute bottom-6 left-7 lg:left-16 xl:left-24 z-10 flex items-center gap-2">
        {slides.map((sl, i) => (
          <button key={sl.id} onClick={() => setActive(i)} aria-label={`Slide ${i + 1}`}
            className="relative h-[3px] rounded-full overflow-hidden bg-white/30 transition-all duration-300"
            style={{ width: i === active ? "36px" : "14px" }}>
            {i === active && <span className="absolute inset-0 bg-[var(--color-saffron-600)] origin-left" style={{ animation: `prog ${AUTO_MS}ms linear forwards` }} />}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes prog { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes mandala-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

// ─── CARD GRID (fixed 4 cards, no scroll) ────────────────────

const baseGridCards = [
  {
    title: "Wanna Volunteer?",
    sub: "",
    btn: "Get Involved",
    img: "/swamiji.jpg",
  },
  {
    title: "Krishna Mantra Lekhana Yajna",
    sub: "Write “Shri Krishnaya Namaha” and align your sankalpa with the sacred presence of Shri Krishna at Udupi.",
    btn: "Join the Yajna",
    img: "/krishna.jpg",
  },
  {
    title: "Veda Parayana Seva",
    sub: "Support the sacred recitation of the Vedas at our Matha. Your offering helps sustain continuous Veda chanting, preserves timeless spiritual wisdom, and blesses the entire community.",
    btn: "Offer Seva",
    img: "/shiroor-mutt.jpg",
  },
];

function CardGrid() {
  const { tr } = useLang();
  const gridCards = [
    { ...baseGridCards[0], sub: tr.pages.v2.volunteer_sub },
    ...baseGridCards.slice(1),
    { title: tr.pages.v2.heritage_title, sub: tr.pages.v2.heritage_sub, btn: "Know More", img: "/fb.JPG" },
  ];
  return (
    <div className="w-full bg-[#F5ECD8] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5">
        {gridCards.map((card) => (
          <div key={card.title} className="bg-white flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300">
            {/* Photo — top */}
            <div className="w-full h-[160px] sm:h-[200px] lg:h-[220px] overflow-hidden">
              <img
                src={card.img}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Content — bottom */}
            <div className="flex flex-col flex-1 px-4 lg:px-5 pt-4 pb-5 gap-2">
              <p className="font-display font-bold text-[var(--color-text-primary)] text-[14px] lg:text-[16px] leading-snug">{card.title}</p>
              <p className="font-body text-[var(--color-text-secondary)]/70 text-[12px] lg:text-[13px] leading-relaxed flex-1">{card.sub}</p>
              <a
                href="#"
                className="mt-3 inline-block text-center font-body text-[12px] lg:text-[13px] font-semibold text-white bg-[#C4520A] hover:bg-[#A34009] px-4 py-2.5 transition-colors duration-200"
              >
                {card.btn}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────

export default function V2Page() {
  return (
    <div className="fixed inset-0 z-[200] bg-[var(--color-paper)] overflow-y-auto flex flex-col">
      <TopBarV2 />
      <HeaderV2 />
      <HeroV2 />
      <CardGrid />
    </div>
  );
}
