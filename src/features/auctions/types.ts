export type Category = {
  slug: string;
  name: string;
  summary: string;
  scope: string;
};

export type AuctionDocument = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Lot = {
  slug: string;
  title: string;
  lotCode: string;
  eventSlug: string;
  category: string;
  location: string;
  overview: string;
  condition: string;
  year: string;
  mileage: string;
  fuel: string;
  transmission?: string;
  sourceNote: string;
  facts: string[];
  highlights: string[];
  documents: AuctionDocument[];
  faq: FaqItem[];
  media: string[];
};

export type AuctionEvent = {
  slug: string;
  eyebrow: string;
  title: string;
  status: string;
  summary: string;
  intro: string;
  coverage: string;
  format: string;
  note: string;
  image: string;
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
