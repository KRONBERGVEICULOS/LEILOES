import { contentRepository } from "@/backend/features/content/data/repository";
import {
  readTrimmedEnv,
  shouldEnforceProductionEnvironment,
} from "@/shared/config/env";
import { buildWhatsAppLink } from "@/shared/lib/contact-links";

const company = contentRepository.getCompanyInfo();
const contactChannels = contentRepository.listContactChannels();
const primaryContactChannel = contentRepository.getPrimaryContactChannel();
const phoneContact =
  contactChannels.find((channel) => channel.kind === "phone") ?? null;
const emailContact =
  contactChannels.find((channel) => channel.kind === "email") ?? null;

export const siteConfig = {
  name: company.brandName,
  legalName: company.legalName,
  taxId: company.taxId,
  description: company.shortDescription,
  longDescription: company.longDescription,
  defaultOgImage: company.seo.ogImage ?? "/media/lots/amarok-extreme/amarok.jpg",
  defaultKeywords: company.seo.keywords,
  whatsappNumber: primaryContactChannel.value,
  whatsappDisplay: primaryContactChannel.displayValue,
  phoneNumber: phoneContact?.value ?? primaryContactChannel.value,
  phoneDisplay: phoneContact?.displayValue ?? primaryContactChannel.displayValue,
  phoneHref: phoneContact?.href ?? primaryContactChannel.href,
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
  return value.replace(/\/$/, "");
}

function getVercelDeploymentUrl() {
  const deploymentHost =
    process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;

  return deploymentHost ? `https://${deploymentHost}` : undefined;
}

export function getSiteUrl() {
  const explicitSiteUrl = readTrimmedEnv("NEXT_PUBLIC_SITE_URL");

  if (shouldEnforceProductionEnvironment() && !explicitSiteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL é obrigatório em produção para metadata, canonical e sitemap.",
    );
  }

  return normalizeSiteUrl(
    explicitSiteUrl || getVercelDeploymentUrl() || "http://localhost:3000",
  );
}

export function absoluteUrl(path = "/") {
  return `${getSiteUrl()}${path}`;
}

export function getSiteHost() {
  return new URL(getSiteUrl()).host;
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
  return buildWhatsAppLink(siteConfig.whatsappNumber, message);
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
