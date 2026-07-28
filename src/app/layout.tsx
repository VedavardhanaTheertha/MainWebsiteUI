import type { Metadata } from "next";
import { Marcellus, Montserrat, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { Header } from "@/components/layout/Header";
import { BottomBar } from "@/components/layout/BottomBar";
import { Footer } from "@/components/layout/Footer";

const displayFont = Marcellus({
  variable: "--font-display-latin",
  weight: "400",
  subsets: ["latin"],
});

const bodyFont = Montserrat({
  variable: "--font-body-latin",
  subsets: ["latin"],
});

const kannadaFont = Noto_Sans_Kannada({
  variable: "--font-body-kannada",
  subsets: ["kannada"],
});

export const metadata: Metadata = {
  title: "Shri Shiroor Matha",
  description: "Shri Shiroor Matha — a living Madhwa tradition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${kannadaFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <Header />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <Footer />
          <BottomBar />
        </LanguageProvider>
      </body>
    </html>
  );
}
