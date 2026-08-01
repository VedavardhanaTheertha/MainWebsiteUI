import SiteFooter from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect with Matha | Shri Shiroor Matha",
};

const socials = [
  {
    name: "Facebook",
    handle: "@shrishiroormuttudupi",
    audience: "11K+",
    href: "https://www.facebook.com/shrishiroormuttudupi",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        <circle cx="18" cy="18" r="18" fill="#1877F2"/>
        <path d="M23.5 18H20v-2c0-.9.5-1.1 1.1-1.1H23V12h-2.7C17.2 12 16 14 16 16.3V18h-2v3h2v9h4v-9h2.8l.7-3z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "@shiroormatha_official",
    audience: "29K+",
    href: "https://www.instagram.com/shiroormatha_official",
    color: "#C13584",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        <circle cx="18" cy="18" r="18" fill="url(#igGrad)"/>
        <defs>
          <radialGradient id="igGrad" cx="30%" cy="100%" r="120%">
            <stop offset="0%" stopColor="#FFDC80"/>
            <stop offset="30%" stopColor="#FCAF45"/>
            <stop offset="55%" stopColor="#F77737"/>
            <stop offset="70%" stopColor="#F56040"/>
            <stop offset="80%" stopColor="#FD1D1D"/>
            <stop offset="100%" stopColor="#833AB4"/>
          </radialGradient>
        </defs>
        <rect x="11" y="11" width="14" height="14" rx="4" stroke="white" strokeWidth="1.8" fill="none"/>
        <circle cx="18" cy="18" r="3.5" stroke="white" strokeWidth="1.8" fill="none"/>
        <circle cx="22.5" cy="13.5" r="1" fill="white"/>
      </svg>
    ),
  },
  {
    name: "YouTube",
    handle: "@Shiroormatha",
    audience: "7K+",
    href: "https://www.youtube.com/@Shiroormatha",
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        <circle cx="18" cy="18" r="18" fill="#FF0000"/>
        <rect x="9" y="13" width="18" height="11" rx="3" fill="white"/>
        <polygon points="15,15.5 15,21.5 22,18.5" fill="#FF0000"/>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    handle: "Shiroor Matha Channel",
    audience: "6K+",
    href: "https://chat.whatsapp.com/PLACEHOLDER",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        <circle cx="18" cy="18" r="18" fill="#25D366"/>
        <path d="M18 9C13.03 9 9 13.03 9 18c0 1.77.49 3.43 1.34 4.85L9 27l4.29-1.31A8.94 8.94 0 0018 27c4.97 0 9-4.03 9-9s-4.03-9-9-9zm4.44 12.26c-.19.53-1.1 1.02-1.51 1.07-.38.05-.86.07-1.38-.09-.32-.1-.73-.23-1.25-.46-2.19-.94-3.62-3.15-3.73-3.3-.11-.14-.88-1.17-.88-2.23 0-1.06.55-1.58.75-1.8.2-.22.43-.27.57-.27h.41c.13 0 .31-.05.48.37.19.45.64 1.57.7 1.68.06.11.1.24.02.38-.08.14-.12.23-.24.35-.12.12-.25.27-.35.37-.12.12-.25.25-.11.49.14.24.64 1.05 1.37 1.7.94.84 1.73 1.1 1.97 1.22.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.38.65 1.62.77.24.12.4.18.46.28.06.1.06.56-.13 1.09z" fill="white"/>
      </svg>
    ),
  },
];

export default function ConnectPage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-12">
        <p className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-brand)] font-semibold mb-2">REACH US</p>
        <h1 className="font-display font-bold text-[var(--color-text-primary)] text-2xl lg:text-4xl mb-3">Connect with Matha</h1>
        <p className="font-body text-[var(--color-text-secondary)] text-base mb-10">We are always here to serve. Reach out through any of the channels below.</p>

        {/* Contact + Branches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
          <div id="contacts" className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-xl p-6">
            <h2 className="font-display font-bold text-[var(--color-text-primary)] text-lg mb-4">Contacts</h2>
            <div className="space-y-3 font-body text-sm text-[var(--color-text-secondary)]">
              <p><strong className="text-[var(--color-text-primary)]">Address:</strong><br/>Shri Shiroor Matha, Car Street, Udupi, Karnataka - 576101</p>
              <p><strong className="text-[var(--color-text-primary)]">Phone:</strong> +91 820 252 0000</p>
              <p><strong className="text-[var(--color-text-primary)]">Email:</strong> shiroormutt@gmail.com</p>
              <p><strong className="text-[var(--color-text-primary)]">Office Hours:</strong> 6:00 AM — 8:00 PM (all days)</p>
            </div>
          </div>

          <div id="branches" className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-xl p-6">
            <h2 className="font-display font-bold text-[var(--color-text-primary)] text-lg mb-4">Branches</h2>
            <div className="space-y-3 font-body text-sm text-[var(--color-text-secondary)]">
              {[
                { city: "Udupi (Main)", addr: "Car Street, Udupi - 576101" },
                { city: "Bengaluru", addr: "Rajajinagar, Bengaluru - 560010" },
                { city: "Mumbai", addr: "Matunga, Mumbai - 400019" },
                { city: "Delhi", addr: "Hauz Khas, New Delhi - 110016" },
              ].map((b) => (
                <div key={b.city} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-saffron-600)] shrink-0" />
                  <div><strong className="text-[var(--color-text-primary)]">{b.city}:</strong> {b.addr}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connect With Us — social cards */}
        <div id="links" className="mb-14">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-2xl text-center mb-2">Connect With Us</h2>
          <p className="font-body text-[var(--color-text-secondary)] text-sm text-center mb-8 max-w-lg mx-auto">
            Join our growing spiritual community on social media for daily updates, live sessions, and sacred teachings.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 bg-white border border-[var(--color-saffron-600)] rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-sm">
                  {s.icon}
                </div>
                <p className="font-body font-bold text-[var(--color-text-primary)] text-sm">{s.name}</p>
                <p className="font-body text-[11px] text-center" style={{ color: s.color }}>{s.handle}</p>
                <div className="mt-1 text-center">
                  <p className="font-display font-bold text-[var(--color-text-primary)] text-2xl leading-none">{s.audience}</p>
                  <p className="font-body text-[10px] tracking-widest uppercase text-[var(--color-text-secondary)]/50 mt-1">Audience</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div id="subscriptions" className="bg-[var(--color-paper)] border border-[var(--color-saffron-600)] rounded-xl p-6">
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-lg mb-2">Newsletter</h2>
          <p className="font-body text-[var(--color-text-secondary)] text-sm mb-4">Subscribe to receive updates, newsletters, and daily slokas from Shri Shiroor Matha.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-3 py-2 text-sm border border-[var(--color-saffron-600)] rounded-lg font-body text-[var(--color-text-primary)] focus:outline-[var(--color-saffron-600)] focus:outline-2 bg-white"
            />
            <button className="px-4 py-2 bg-[var(--color-saffron-600)] text-white text-sm font-semibold font-body rounded-lg hover:bg-[var(--color-saffron-700)] transition-colors">
              Subscribe
            </button>
          </div>
        </div>

      </div>
      <SiteFooter />
    </>
  );
}
