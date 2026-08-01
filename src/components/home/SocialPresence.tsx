"use client";

import { useLang } from "@/context/LanguageContext";

// TODO: Replace hrefs with real social media URLs from management
const socials = [
  {
    name: "Facebook",
    handle: "@shrishiroormuttudupi",
    audience: "11K+",
    href: "#",
    bg: "#1877F2",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "@shiroormatha_official",
    audience: "29K+",
    href: "#",
    bg: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="white" stroke="none" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    handle: "@Shiroormatha",
    audience: "7K+",
    href: "#",
    bg: "#FF0000",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#FF0000" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    handle: "Shiroor Matha Channel",
    audience: "6K+",
    href: "#",
    bg: "#25D366",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.874L.057 23.5l5.803-1.521A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.873 9.873 0 0 1-5.036-1.378l-.361-.214-3.742.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.118 12C2.118 6.54 6.54 2.118 12 2.118S21.882 6.54 21.882 12 17.46 21.882 12 21.882z" />
      </svg>
    ),
  },
];

export default function SocialPresence() {
  const { lang } = useLang();

  return (
    <section className="w-full bg-[var(--color-cream)] overflow-hidden flex flex-col lg:flex-row">

        {/* ── Left: text + cards ── */}
        <div className="flex-1 py-16 lg:py-24 px-5 lg:pl-16 lg:pr-12">
          <p className="font-body text-[11px] tracking-[0.25em] uppercase text-[var(--color-text-brand)] font-semibold mb-3">
            {lang === "kn" ? "ಸಮುದಾಯ" : "Community"}
          </p>
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-3xl lg:text-4xl mb-3">
            {lang === "kn" ? "ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ" : "Connect With Us"}
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] text-[15px] leading-relaxed mb-10 max-w-md">
            {lang === "kn"
              ? "ದೈನಂದಿನ ಅಪ್ಡೇಟ್‌ಗಳು, ಲೈವ್ ದರ್ಶನ ಮತ್ತು ಪವಿತ್ರ ಬೋಧನೆಗಳಿಗಾಗಿ ನಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಸಮುದಾಯವನ್ನು ಸೇರಿ."
              : "Join our growing spiritual community for daily updates, live darshan, and sacred teachings from Shri Shiroor Matha."}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-[var(--color-saffron-600)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-visible:outline-[var(--color-saffron-600)] focus-visible:outline-2"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: s.bg }}
                >
                  {s.svg}
                </div>
                <p className="font-body font-bold text-[var(--color-text-primary)] text-[13px] mb-0.5">{s.name}</p>
                <p className="font-body text-[var(--color-text-brand)] text-[11px] font-medium mb-3">{s.handle}</p>
                <p className="font-display font-bold text-[var(--color-text-primary)] text-xl leading-none">{s.audience}</p>
                <p className="font-body text-[9px] tracking-[0.18em] uppercase text-[var(--color-text-secondary)]/55 font-semibold mt-1">
                  {lang === "kn" ? "ಸದಸ್ಯರು" : "Audience"}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* ── Right: photo with rounded-left cut (like hero slides) ── */}
        <div
          className="hidden lg:block w-[45%] relative overflow-hidden"
          style={{ borderRadius: "45% 0 0 45% / 50% 0 0 50%" }}
        >
          <img
            src="/fb.JPG"
            alt="His Holiness Swamiji"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Mobile: photo with rounded top cut */}
        <div
          className="lg:hidden w-full h-64 overflow-hidden"
          style={{ borderRadius: "50% 50% 0 0 / 20% 20% 0 0" }}
        >
          <img
            src="/fb.JPG"
            alt="His Holiness Swamiji"
            className="w-full h-full object-cover object-center"
          />
        </div>

    </section>
  );
}
