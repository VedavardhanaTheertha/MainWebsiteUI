import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Marcellus, Montserrat, Noto_Sans_Kannada, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import "./collection-experiments.css";
import "./home-experiments.css";
import "./carousel-emphasis.css";
import { siteConfig, defaultLang, content, languages } from "@/gen/content";
import { commonSettings } from "@/gen/settings/common";
import { LanguageProvider } from "@/context/LanguageContext";
import TopBar from "@/components/TopBar";
import SiteHeader from "@/components/SiteHeader";
import MobileHeader from "@/components/MobileHeader";
import SiteFooter from "@/components/SiteFooter";
import QRModal from "@/components/QRModal";
import DonateModal from "@/components/DonateModal";
import YajnaAnnouncement from "@/components/YajnaAnnouncement";
import DeveloperPreferences from "@/components/DeveloperPreferences";
import HorizontalScrollSupport from "@/components/HorizontalScrollSupport";
import BackNavigation from "@/components/BackNavigation";
import StructuredData from "@/components/StructuredData";
import { UiSettingsProvider } from "@/context/UiSettingsContext";

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

const languageAlternates: Record<string, string> = {
  ...Object.fromEntries(
    languages.map(({ code }) => [
      code,
      code === defaultLang ? `${siteConfig.productionUrl}/` : `${siteConfig.productionUrl}/?lang=${code}`,
    ])
  ),
  "x-default": siteConfig.productionUrl,
};

// Non-production environments must never appear in search results, where they
// would compete with the live site. `indexable` comes from config/site.yml, so
// this behaviour is changed by editing configuration rather than code.
// See the Environments section in docs/ARCHITECTURE.md.
export const metadata: Metadata = {
  // Title and description come from content so they are placeholder-substituted
  // in dev too — otherwise the real name would leak into dev page titles and
  // search results.
  title: content[defaultLang].meta_title,
  description: content[defaultLang].meta_description,
  keywords: content[defaultLang].meta_keywords,
  icons: { icon: `${siteConfig.basePath}/favicon.ico` },
  // Resolves relative page metadata against the intended production origin.
  // Per-route canonicals are normalized from exported paths by the build pipeline.
  metadataBase: new URL(siteConfig.productionUrl),
  alternates: {
    canonical: siteConfig.productionUrl,
    languages: languageAlternates,
  },
  openGraph: {
    type: "website",
    locale: `${defaultLang}_IN`,
    alternateLocale: languages
      .filter(({ code }) => code !== defaultLang)
      .map(({ code }) => `${code}_IN`),
    url: siteConfig.productionUrl,
    siteName: content[defaultLang].site_name,
    title: content[defaultLang].meta_title,
    description: content[defaultLang].meta_description,
    images: [
      {
        url: `${siteConfig.productionUrl}/main-logo.png`,
        width: 1200,
        height: 630,
        alt: content[defaultLang].site_name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: content[defaultLang].meta_title,
    description: content[defaultLang].meta_description,
    images: [`${siteConfig.productionUrl}/main-logo.png`],
  },
  robots: siteConfig.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fontStyle: CSSProperties & { [key: `--${string}`]: string | undefined } = {
    "--font-localized": languages.find(({ code }) => code === defaultLang)?.font_family,
    "--font-display": commonSettings.fontFamily?.display ?? "var(--font-marcellus), 'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    "--font-body": commonSettings.fontFamily?.body ?? "var(--font-montserrat), system-ui, -apple-system, 'Segoe UI', sans-serif",
    "--font-sanskrit": commonSettings.fontFamily?.sanskrit ?? "var(--font-noto-devanagari), var(--font-marcellus), serif",
    "--font-kannada": commonSettings.fontFamily?.kannada ?? "var(--font-noto-kannada), var(--font-montserrat), sans-serif",
    "--font-mono": commonSettings.fontFamily?.mono ?? "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
    "--text-micro": commonSettings.fontSize?.micro ?? commonSettings.font?.micro ?? "12px",
    "--text-caption": commonSettings.fontSize?.caption ?? commonSettings.font?.caption ?? "13px",
    "--text-ui": commonSettings.fontSize?.ui ?? commonSettings.font?.ui ?? "14px",
    "--text-nav": commonSettings.fontSize?.nav ?? commonSettings.font?.nav ?? "15px",
    "--text-body": commonSettings.fontSize?.body ?? commonSettings.font?.body ?? "16px",
    "--text-badge": commonSettings.fontSize?.badge ?? commonSettings.font?.badge ?? "12px",
    "--text-form-label": commonSettings.fontSize?.formLabel ?? commonSettings.font?.formLabel ?? "13px",
    "--text-form-input": commonSettings.fontSize?.formInput ?? commonSettings.font?.formInput ?? "16px",
    "--text-action-button": commonSettings.fontSize?.actionButton ?? commonSettings.font?.actionButton ?? "14px",
    "--text-meta": commonSettings.fontSize?.meta ?? commonSettings.font?.meta ?? "13px",
  };
  return (
    <html
      // Server-rendered with the default language; LanguageProvider updates this
      // on the client once a stored preference is read.
      lang={defaultLang}
      style={fontStyle}
      className={`${marcellus.variable} ${montserrat.variable} ${notoKannada.variable} ${notoDevanagari.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://pub-40778d02c0624406be0340bf0ee4b2b4.r2.dev" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vedavardhanatheertha.github.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-40778d02c0624406be0340bf0ee4b2b4.r2.dev" />
        <link rel="dns-prefetch" href="https://vedavardhanatheertha.github.io" />
        <StructuredData />
      </head>
      <body className="min-h-screen flex flex-col bg-cream text-text-primary">
        <UiSettingsProvider>
          <LanguageProvider>
            <HorizontalScrollSupport />
            <DeveloperPreferences />
            {/* Top utility bar — language switcher, centre sloka, social icons */}
            <TopBar />
            {/* Desktop sticky header */}
            <SiteHeader />
            {/* Mobile hamburger header */}
            <MobileHeader />

            <main className="flex-1 relative isolate">
              {commonSettings.background?.backgroundImage ? (
                <div
                  aria-hidden="true"
                  className="common-background-image"
                  style={{
                    backgroundImage: `url("${commonSettings.background.backgroundImage}")`,
                    backgroundPosition: commonSettings.background.position ?? "center",
                    backgroundSize: commonSettings.background.size ?? "cover",
                    backgroundRepeat: commonSettings.background.repeat ?? "no-repeat",
                    opacity: commonSettings.background.opacity ?? 0.12,
                  }}
                />
              ) : null}
              <BackNavigation />
              {children}
            </main>

            <SiteFooter />

            {/* Modals */}
            <QRModal />
            <DonateModal />
            <YajnaAnnouncement />
          </LanguageProvider>
        </UiSettingsProvider>
      </body>
    </html>
  );
}
