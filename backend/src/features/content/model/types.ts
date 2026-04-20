import type { z } from "zod";

import type {
  assetCategorySchema,
  auctionEventSchema,
  auctionLotSchema,
  companyInfoSchema,
  contactChannelSchema,
  ctaSchema,
  documentAssetSchema,
  faqEntrySchema,
  institutionalPageSchema,
  institutionalPageSectionSchema,
  mediaAssetSchema,
  platformContentSeedSchema,
  seoMetadataSchema,
  siteExperienceSchema,
} from "@/backend/features/content/model/schemas";

export type SeoMetadata = z.infer<typeof seoMetadataSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type ContactChannel = z.infer<typeof contactChannelSchema>;
export type CallToAction = z.infer<typeof ctaSchema>;
export type AssetCategory = z.infer<typeof assetCategorySchema>;
export type DocumentAsset = z.infer<typeof documentAssetSchema>;
export type FAQEntry = z.infer<typeof faqEntrySchema>;
export type InstitutionalPageSection = z.infer<
  typeof institutionalPageSectionSchema
>;
export type InstitutionalPage = z.infer<typeof institutionalPageSchema>;
export type CompanyInfo = z.infer<typeof companyInfoSchema>;
export type AuctionEvent = z.infer<typeof auctionEventSchema>;
export type AuctionLot = z.infer<typeof auctionLotSchema>;
export type SiteExperience = z.infer<typeof siteExperienceSchema>;
export type PlatformContentSeed = z.infer<typeof platformContentSeedSchema>;

export type ResolvedDocumentAsset = DocumentAsset & {
  cta?: CallToAction;
};

export type ResolvedInstitutionalPage = InstitutionalPage & {
  faq: FAQEntry[];
  primaryCta?: CallToAction;
  secondaryCta?: CallToAction;
};

export type ResolvedAuctionEvent = AuctionEvent & {
  categories: AssetCategory[];
  documents: ResolvedDocumentAsset[];
  faq: FAQEntry[];
  lots: AuctionLot[];
  primaryCta?: CallToAction;
};

export type ResolvedAuctionLot = AuctionLot & {
  categoryEntity: AssetCategory;
  ctas: CallToAction[];
  documents: ResolvedDocumentAsset[];
  event: AuctionEvent;
  faq: FAQEntry[];
};
