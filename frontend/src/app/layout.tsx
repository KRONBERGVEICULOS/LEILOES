import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";

import { AppChrome } from "@/frontend/components/site/app-chrome";
import { absoluteUrl, getMetadataRobots, siteConfig } from "@/shared/config/site";
import { getCurrentUser } from "@/backend/features/platform/server/auth";
import { listPublicActivity } from "@/backend/features/platform/server/repository";

import "@/frontend/styles/globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: `${siteConfig.name} | Plataforma de oportunidades de leilão`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Plataforma de oportunidades de leilão com catálogo público, área restrita para acompanhamento e pré-lance, e canais oficiais para validação operacional.",
  applicationName: siteConfig.name,
  keywords: [
    ...siteConfig.defaultKeywords,
    "plataforma de leilões",
    "catálogo público",
    "área restrita",
    "pré-lance online",
  ],
  creator: siteConfig.name,
  publisher: siteConfig.legalName,
  openGraph: {
    title: `${siteConfig.name} | Plataforma de oportunidades de leilão`,
    description:
      "Catálogo público, área restrita, atividade rastreável e pré-lance online com validação pelos canais oficiais.",
    type: "website",
    locale: "pt_BR",
    url: absoluteUrl(),
    siteName: siteConfig.name,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - plataforma de oportunidades de leilão`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Plataforma de oportunidades de leilão`,
    description:
      "Consulte oportunidades, acompanhe lotes e registre pré-lances com mais clareza operacional.",
    images: [absoluteUrl("/opengraph-image")],
  },
  alternates: {
    canonical: absoluteUrl(),
  },
  robots: getMetadataRobots(),
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  category: "business",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentUserResult, publicActivityResult] = await Promise.allSettled([
    getCurrentUser(),
    listPublicActivity(),
  ]);
  const currentUser =
    currentUserResult.status === "fulfilled" ? currentUserResult.value : null;
  const publicActivity =
    publicActivityResult.status === "fulfilled" ? publicActivityResult.value : [];

  return (
    <html
      data-scroll-behavior="smooth"
      lang="pt-BR"
      className={`${publicSans.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-brand-paper text-brand-ink">
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand-ink"
          href="#conteudo"
        >
          Ir para o conteúdo
        </a>
        <AppChrome currentUser={currentUser} publicActivity={publicActivity}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
