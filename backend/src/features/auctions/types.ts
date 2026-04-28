export type DocumentType = "edital" | "ficha" | "orientacao" | "politica" | "termo";
export type DocumentAccessMode = "request" | "download" | "external";

export type Category = {
  slug: string;
  name: string;
  summary: string;
  scope: string;
};

export type MediaAsset = {
  src: string;
  alt: string;
  storage?: "manual" | "local" | "volume" | "r2";
  objectKey?: string;
  contentType?: string;
  size?: number;
};

export type AuctionDocument = {
  documentType: DocumentType;
  accessMode: DocumentAccessMode;
  kind: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  sourceLabel: string;
  statusLabel: string;
  statusDescription: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type LotPricing = {
  referenceValueCents: number;
  referenceValueLabel: string;
  currentValueCents: number;
  currentValueLabel: string;
  minimumIncrementCents: number;
  minimumIncrementLabel: string;
  maximumPreBidAmountCents?: number;
  maximumPreBidAmountLabel?: string;
  supportLabel: string;
};

export type Lot = {
  id: string;
  slug: string;
  title: string;
  lotCode: string;
  statusKey: string;
  status: string;
  isFeatured: boolean;
  isVisible: boolean;
  eventSlug: string;
  category: string;
  location: string;
  overview: string;
  details: string[];
  operationalDisclaimer: string;
  year: string;
  mileage: string;
  fuel: string;
  transmission?: string;
  onlineStatusLabel: string;
  onlineTeaserLabel: string;
  pricing: LotPricing;
  sourceNote: string;
  facts: string[];
  highlights: string[];
  documents: AuctionDocument[];
  faq: FaqItem[];
  media: MediaAsset[];
  createdAt?: string;
  updatedAt?: string;
};

export type AuctionEvent = {
  slug: string;
  eyebrow: string;
  title: string;
  status: string;
  schedule: string;
  summary: string;
  intro: string;
  coverage: string;
  format: string;
  note: string;
  image: MediaAsset;
  highlights: string[];
  documents: AuctionDocument[];
  faq: FaqItem[];
  lotSlugs: string[];
};

export type ContentSection = {
  title: string;
  body: string[];
  bullets?: string[];
};

export type ContentPage = {
  eyebrow: string;
  title: string;
  description: string;
  sections: ContentSection[];
};
