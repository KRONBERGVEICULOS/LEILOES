import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { absoluteUrl, siteConfig } from "@/config/site";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: `${siteConfig.name} | Catálogo institucional de leilões`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "leilões",
    "catálogo de lotes",
    "leilão judicial",
    "leilão extrajudicial",
    "veículos",
    "máquinas",
    "manifestação de interesse",
  ],
  openGraph: {
    title: `${siteConfig.name} | Catálogo institucional de leilões`,
    description: siteConfig.longDescription,
    type: "website",
    locale: "pt_BR",
    url: absoluteUrl(),
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - catálogo institucional`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Catálogo institucional de leilões`,
    description: siteConfig.longDescription,
    images: [siteConfig.defaultOgImage],
  },
  alternates: {
    canonical: absoluteUrl(),
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-brand-cream text-brand-ink">
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand-ink"
          href="#conteudo"
        >
          Ir para o conteúdo
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1" id="conteudo">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
