import type { Metadata } from "next";
import { Marcellus, Montserrat, Noto_Sans_Kannada, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import { siteConfig, defaultLang, content } from "@/gen/content";
import { LanguageProvider } from "@/context/LanguageContext";
import TopBar from "@/components/TopBar";
import SiteHeader from "@/components/SiteHeader";
import MobileHeader from "@/components/MobileHeader";
import SiteFooter from "@/components/SiteFooter";
import QRModal from "@/components/QRModal";
import VolunteerModal from "@/components/VolunteerModal";
import DonateModal from "@/components/DonateModal";
import YajnaAnnouncement from "@/components/YajnaAnnouncement";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const notoKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-kannada",
  display: "swap",
});

const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

// Non-production environments must never appear in search results, where they
// would compete with the live site. `indexable` comes from config/site.yml, so
// this behaviour is changed by editing configuration rather than code.
// See docs/ARCHITECTURE.md §6.2.
export const metadata: Metadata = {
  // Title and description come from content so they are placeholder-substituted
  // in dev too — otherwise the real name would leak into dev page titles and
  // search results, which is exactly what §6.2 exists to prevent.
  title: content[defaultLang].meta_title,
  description: content[defaultLang].meta_description,
  keywords: content[defaultLang].meta_keywords,
  icons: { icon: "/favicon.ico" },
  // Resolves relative page metadata against the intended production origin.
  // Per-route canonicals are normalized from exported paths by the build pipeline.
  metadataBase: new URL(siteConfig.productionUrl),
  robots: siteConfig.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      // Server-rendered with the default language; LanguageProvider updates this
      // on the client once a stored preference is read.
      lang={defaultLang}
      className={`${marcellus.variable} ${montserrat.variable} ${notoKannada.variable} ${notoDevanagari.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-cream text-text-primary">
        <LanguageProvider>
          {/* Top utility bar — language switcher, centre sloka, social icons */}
          <TopBar />
          {/* Desktop sticky header */}
          <SiteHeader />
          {/* Mobile hamburger header */}
          <MobileHeader />

          <main className="flex-1">{children}</main>

          <SiteFooter />

          {/* Modals */}
          <QRModal />
          <VolunteerModal />
          <DonateModal />
          <YajnaAnnouncement />
        </LanguageProvider>
      </body>
    </html>
  );
}
