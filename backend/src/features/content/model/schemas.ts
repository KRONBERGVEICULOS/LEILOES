import { z } from "zod";

const idSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/);

const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/);

const pathSchema = z.string().min(1);
const optionalOperationalTextSchema = z.string().trim().min(1).nullable().default(null);

const publicationStateSchema = z.enum(["draft", "published", "archived"]);

const entityIdentitySchema = z.object({
  id: idSchema,
  slug: slugSchema,
  locale: z.string().default("pt-BR"),
  publicationState: publicationStateSchema.default("published"),
});

export const seoMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  canonicalPath: pathSchema,
  keywords: z.array(z.string().min(1)).default([]),
  ogImage: pathSchema.optional(),
});

export const mediaAssetSchema = z.object({
  id: idSchema,
  url: pathSchema,
  alt: z.string().min(1),
  kind: z.enum(["image"]).default("image"),
});

export const contactChannelSchema = entityIdentitySchema.extend({
  kind: z.enum(["whatsapp", "phone", "email"]),
  label: z.string().min(1),
  value: z.string().min(1),
  displayValue: z.string().min(1),
  href: z.string().min(1),
  description: z.string().min(1),
  isPrimary: z.boolean().default(false),
});

export const ctaSchema = entityIdentitySchema.extend({
  actionType: z.enum(["contact", "navigate", "download", "request-document"]),
  title: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
  contactChannelId: idSchema.optional(),
});

export const assetCategorySchema = entityIdentitySchema.extend({
  label: z.string().min(1),
  summary: z.string().min(1),
  scope: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  seo: seoMetadataSchema,
});

export const documentAssetSchema = entityIdentitySchema.extend({
  title: z.string().min(1),
  summary: z.string().min(1),
  documentType: z.enum([
    "edital",
    "ficha",
    "orientacao",
    "politica",
    "termo",
  ]),
  accessMode: z.enum(["request", "download", "external"]),
  ctaId: idSchema.optional(),
  relatedEntityIds: z.array(idSchema).default([]),
});

export const faqEntrySchema = entityIdentitySchema.extend({
  question: z.string().min(1),
  answer: z.string().min(1),
  scope: z.enum(["global", "event", "lot", "page"]).default("global"),
  relatedEntityIds: z.array(idSchema).default([]),
  tags: z.array(z.string().min(1)).default([]),
});

export const institutionalPageSectionSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  body: z.array(z.string().min(1)).min(1),
  bullets: z.array(z.string().min(1)).default([]),
});

export const institutionalPageSchema = entityIdentitySchema.extend({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  sections: z.array(institutionalPageSectionSchema).min(1),
  relatedFaqIds: z.array(idSchema).default([]),
  primaryCtaId: idSchema.optional(),
  secondaryCtaId: idSchema.optional(),
  seo: seoMetadataSchema,
});

export const companyInfoSchema = entityIdentitySchema.extend({
  brandName: z.string().min(1),
  legalName: z.string().min(1),
  taxId: optionalOperationalTextSchema,
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  addressLines: z.array(z.string().min(1)).min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  businessHours: z.string().min(1),
  responseTime: z.string().min(1),
  auctioneerName: optionalOperationalTextSchema,
  auctioneerRegistration: optionalOperationalTextSchema,
  auctioneerBoard: optionalOperationalTextSchema,
  registrationNote: z.string().min(1),
  serviceRegions: z.array(z.string().min(1)).default([]),
  footerDisclaimer: z.string().min(1),
  primaryContactChannelId: idSchema,
  seo: seoMetadataSchema,
});

export const auctionEventScheduleSchema = z.object({
  timezone: z.string().default("America/Sao_Paulo"),
  startsAt: z.string().datetime({ offset: true }).nullable().default(null),
  endsAt: z.string().datetime({ offset: true }).nullable().default(null),
  isToBeConfirmed: z.boolean().default(true),
});

export const auctionEventSchema = entityIdentitySchema.extend({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  intro: z.string().min(1),
  coverage: z.string().min(1),
  statusKey: z.enum([
    "catalogo-em-consulta",
    "consulta-qualificada",
    "catalogo-tecnico",
  ]),
  statusLabel: z.string().min(1),
  journeyModeKey: z.enum([
    "manifestacao-assistida",
    "atendimento-consultivo",
    "pacote-ou-lote",
  ]),
  journeyModeLabel: z.string().min(1),
  note: z.string().min(1),
  heroImage: mediaAssetSchema,
  highlightBullets: z.array(z.string().min(1)).default([]),
  categoryIds: z.array(idSchema).default([]),
  documentIds: z.array(idSchema).default([]),
  faqIds: z.array(idSchema).default([]),
  lotIds: z.array(idSchema).default([]),
  primaryCtaId: idSchema.optional(),
  schedule: auctionEventScheduleSchema,
  seo: seoMetadataSchema,
});

export const lotLocationSchema = z.object({
  city: z.string().min(1),
  state: z.string().min(1),
  display: z.string().min(1),
});

export const lotTechnicalMetadataSchema = z.object({
  yearModel: z.string().min(1),
  usageMetric: z.string().min(1),
  fuel: z.string().min(1),
  transmission: z.string().min(1).optional(),
});

export const lotObservationsSchema = z.object({
  sourceNote: z.string().min(1),
  commercialDisclaimer: z.string().min(1),
  operationalNotes: z.array(z.string().min(1)).default([]),
});

export const auctionLotSchema = entityIdentitySchema.extend({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  referenceCode: z.string().min(1),
  eventId: idSchema,
  categoryId: idSchema,
  segmentLabel: z.string().min(1),
  location: lotLocationSchema,
  statusKey: z.enum([
    "em-catalogo",
    "sob-consulta",
    "em-validacao",
    "encerrado",
  ]),
  statusLabel: z.string().min(1),
  shortDescription: z.string().min(1),
  longDescription: z.array(z.string().min(1)).min(1),
  gallery: z.array(mediaAssetSchema).min(1),
  documentIds: z.array(idSchema).default([]),
  faqIds: z.array(idSchema).default([]),
  technicalMetadata: lotTechnicalMetadataSchema,
  observations: lotObservationsSchema,
  highlightBullets: z.array(z.string().min(1)).default([]),
  ctaIds: z.array(idSchema).default([]),
  tags: z.array(z.string().min(1)).default([]),
  seo: seoMetadataSchema,
});

export const trustPillarSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

export const participationStepSchema = z.object({
  id: idSchema,
  step: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const siteExperienceSchema = z.object({
  featuredLotIds: z.array(idSchema).default([]),
  finalCtaId: idSchema,
  contactReasonCtaIds: z.array(idSchema).default([]),
  contactChecklist: z.array(z.string().min(1)).default([]),
  trustPillars: z.array(trustPillarSchema).default([]),
  participationSteps: z.array(participationStepSchema).default([]),
});

export const platformContentSeedSchema = z.object({
  company: companyInfoSchema,
  contactChannels: z.array(contactChannelSchema).min(1),
  ctas: z.array(ctaSchema).default([]),
  categories: z.array(assetCategorySchema).default([]),
  documents: z.array(documentAssetSchema).default([]),
  faq: z.array(faqEntrySchema).default([]),
  pages: z.array(institutionalPageSchema).default([]),
  auctionEvents: z.array(auctionEventSchema).default([]),
  lots: z.array(auctionLotSchema).default([]),
  siteExperience: siteExperienceSchema,
});
