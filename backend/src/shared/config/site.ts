import { contentRepository } from "@/backend/features/content/data/repository";
import {
  readTrimmedEnv,
  shouldEnforceProductionEnvironment,
} from "@/shared/config/env";
import { getOfficialWhatsAppContact } from "@/shared/config/whatsapp";
import { buildWhatsAppLink } from "@/shared/lib/contact-links";

const company = contentRepository.getCompanyInfo();
const contactChannels = contentRepository.listContactChannels();
const emailContact =
  contactChannels.find((channel) => channel.kind === "email") ?? null;
const officialWhatsAppContact = getOfficialWhatsAppContact();

export const siteConfig = {
  name: company.brandName,
  legalName: company.legalName,
  taxId: company.taxId,
  description: company.shortDescription,
  longDescription: company.longDescription,
  defaultOgImage: company.seo.ogImage ?? "/media/lots/amarok-extreme/amarok.jpg",
  defaultKeywords: company.seo.keywords,
  whatsappNumber: officialWhatsAppContact.number,
  whatsappDisplay: officialWhatsAppContact.display,
  whatsappHref: officialWhatsAppContact.url,
  phoneNumber: officialWhatsAppContact.number,
  phoneDisplay: officialWhatsAppContact.display,
  phoneHref: officialWhatsAppContact.url,
  email: emailContact?.displayValue ?? "",
  emailHref: emailContact?.href ?? "",
  businessHours: company.businessHours,
  responseTime: company.responseTime,
  auctioneerName: company.auctioneerName,
  auctioneerRegistration: company.auctioneerRegistration,
  auctioneerBoard: company.auctioneerBoard,
  registrationNote: company.registrationNote,
  address: company.addressLines,
  city: company.city,
  state: company.state,
  country: company.country,
  serviceRegions: company.serviceRegions,
  footerDisclaimer: company.footerDisclaimer,
} as const;

export const mainNavigation = [
  { href: "/", label: "Início" },
  { href: "/eventos", label: "Oportunidades" },
  { href: "/sobre", label: "Como funciona" },
  { href: "/contato", label: "Contato" },
] as const;

export const legalNavigation = [{ href: "/privacidade", label: "Privacidade" }] as const;

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/$/, "");
}

function getRailwayDeploymentUrl() {
  const publicDomain = readTrimmedEnv("RAILWAY_PUBLIC_DOMAIN");
  return publicDomain ? normalizeSiteUrl(publicDomain) : undefined;
}

function getVercelDeploymentUrl() {
  const deploymentHost =
    process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;

  return deploymentHost ? normalizeSiteUrl(deploymentHost) : undefined;
}

export type SiteUrlDiagnostics = {
  configuredUrl: string | null;
  railwayPublicDomain: string | null;
  resolvedUrl: string;
  resolvedHost: string;
  source: "NEXT_PUBLIC_SITE_URL" | "RAILWAY_PUBLIC_DOMAIN" | "VERCEL_URL" | "localhost";
};

export function getSiteUrlDiagnostics(): SiteUrlDiagnostics {
  const explicitSiteUrl = readTrimmedEnv("NEXT_PUBLIC_SITE_URL");
  const railwayPublicDomain = readTrimmedEnv("RAILWAY_PUBLIC_DOMAIN");

  let resolvedUrl: string;
  let source: SiteUrlDiagnostics["source"];

  if (explicitSiteUrl) {
    resolvedUrl = normalizeSiteUrl(explicitSiteUrl);
    source = "NEXT_PUBLIC_SITE_URL";
  } else {
    const railwayDeploymentUrl = getRailwayDeploymentUrl();

    if (railwayDeploymentUrl) {
      resolvedUrl = railwayDeploymentUrl;
      source = "RAILWAY_PUBLIC_DOMAIN";
    } else {
      const vercelDeploymentUrl = getVercelDeploymentUrl();

      if (vercelDeploymentUrl) {
        resolvedUrl = vercelDeploymentUrl;
        source = "VERCEL_URL";
      } else {
        resolvedUrl = "http://localhost:3000";
        source = "localhost";
      }
    }
  }

  return {
    configuredUrl: explicitSiteUrl ? normalizeSiteUrl(explicitSiteUrl) : null,
    railwayPublicDomain: railwayPublicDomain ?? null,
    resolvedUrl,
    resolvedHost: new URL(resolvedUrl).host,
    source,
  };
}

export function getSiteUrl() {
  const diagnostics = getSiteUrlDiagnostics();

  if (shouldEnforceProductionEnvironment() && diagnostics.source === "localhost") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL ou RAILWAY_PUBLIC_DOMAIN é obrigatório em produção para metadata, canonical e sitemap.",
    );
  }

  return diagnostics.resolvedUrl;
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function getSiteHost() {
  return getSiteUrlDiagnostics().resolvedHost;
}

export function isPreviewDeployment() {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "preview"
  );
}

export function getMetadataRobots() {
  return isPreviewDeployment()
    ? {
        index: false,
        follow: false,
      }
    : {
        index: true,
        follow: true,
      };
}

export function createWhatsAppLink(message: string) {
  return buildWhatsAppLink(siteConfig.whatsappNumber, message, siteConfig.whatsappHref);
}

type LotContactContext = {
  title: string;
  lotCode: string;
  location: string;
};

export function createLotWhatsAppLink({
  title,
  lotCode,
  location,
}: LotContactContext) {
  return createWhatsAppLink(
    `Olá, tenho interesse no ${lotCode} - ${title}, em ${location}. Pode me passar mais detalhes e orientar pelo WhatsApp?`,
  );
}

export function createOfferWhatsAppLink({
  title,
  lotCode,
  location,
}: LotContactContext) {
  return createWhatsAppLink(
    `Olá, quero enviar uma proposta pelo lote ${lotCode} - ${title}, em ${location}.`,
  );
}
