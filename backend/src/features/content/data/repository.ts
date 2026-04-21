import { localSeedContentSource } from "@/backend/features/content/data/local-seed";
import type { ContentSource } from "@/backend/features/content/data/source";
import type {
  AssetCategory,
  AuctionEvent,
  AuctionLot,
  CallToAction,
  CompanyInfo,
  ContactChannel,
  DocumentAsset,
  FAQEntry,
  InstitutionalPage,
  ResolvedAuctionEvent,
  ResolvedAuctionLot,
  ResolvedDocumentAsset,
  ResolvedInstitutionalPage,
  SiteExperience,
} from "@/backend/features/content/model/types";

export interface ContentRepository {
  getCompanyInfo(): CompanyInfo;
  getPrimaryContactChannel(): ContactChannel;
  listContactChannels(): ContactChannel[];
  getSiteExperience(): SiteExperience;
  listAssetCategories(): AssetCategory[];
  listAuctionEvents(): AuctionEvent[];
  listAuctionLots(): AuctionLot[];
  listGlobalFaq(): FAQEntry[];
  getCallToActionById(id: string): CallToAction | undefined;
  getInstitutionalPageBySlug(slug: string): InstitutionalPage | undefined;
  getResolvedInstitutionalPageBySlug(
    slug: string,
  ): ResolvedInstitutionalPage | undefined;
  getAuctionEventBySlug(slug: string): AuctionEvent | undefined;
  getResolvedAuctionEventBySlug(slug: string): ResolvedAuctionEvent | undefined;
  getAuctionLotBySlug(slug: string): AuctionLot | undefined;
  getResolvedAuctionLotBySlug(slug: string): ResolvedAuctionLot | undefined;
  listResolvedAuctionEvents(): ResolvedAuctionEvent[];
  listResolvedAuctionLots(): ResolvedAuctionLot[];
  getAuctionLotsByEventId(eventId: string): AuctionLot[];
}

function createIdMap<T extends { id: string }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}

function createSlugMap<T extends { slug: string }>(items: T[]) {
  return new Map(items.map((item) => [item.slug, item]));
}

export function createContentRepository(source: ContentSource): ContentRepository {
  const content = source.content;

  class SeedBackedContentRepository implements ContentRepository {
    private readonly ctaById = createIdMap(content.ctas);
    private readonly categoryById = createIdMap(content.categories);
    private readonly contactChannelById = createIdMap(content.contactChannels);
    private readonly documentById = createIdMap(content.documents);
    private readonly eventById = createIdMap(content.auctionEvents);
    private readonly eventBySlug = createSlugMap(content.auctionEvents);
    private readonly faqById = createIdMap(content.faq);
    private readonly lotById = createIdMap(content.lots);
    private readonly lotBySlug = createSlugMap(content.lots);
    private readonly pageBySlug = createSlugMap(content.pages);

    getCompanyInfo() {
      return content.company;
    }

    getPrimaryContactChannel() {
      return this.getRequired(
        this.contactChannelById,
        content.company.primaryContactChannelId,
        "contactChannels",
      );
    }

    listContactChannels() {
      return content.contactChannels;
    }

    getSiteExperience() {
      return content.siteExperience;
    }

    listAssetCategories() {
      return content.categories;
    }

    listAuctionEvents() {
      return content.auctionEvents;
    }

    listAuctionLots() {
      return content.lots;
    }

    listGlobalFaq() {
      return content.faq.filter((item) => item.scope === "global");
    }

    getCallToActionById(id: string) {
      return this.ctaById.get(id);
    }

    getInstitutionalPageBySlug(slug: string) {
      return this.pageBySlug.get(slug);
    }

    getResolvedInstitutionalPageBySlug(slug: string) {
      const page = this.getInstitutionalPageBySlug(slug);

      return page ? this.resolvePage(page) : undefined;
    }

    getAuctionEventBySlug(slug: string) {
      return this.eventBySlug.get(slug);
    }

    getResolvedAuctionEventBySlug(slug: string) {
      const event = this.getAuctionEventBySlug(slug);

      return event ? this.resolveEvent(event) : undefined;
    }

    getAuctionLotBySlug(slug: string) {
      return this.lotBySlug.get(slug);
    }

    getResolvedAuctionLotBySlug(slug: string) {
      const lot = this.getAuctionLotBySlug(slug);

      return lot ? this.resolveLot(lot) : undefined;
    }

    listResolvedAuctionEvents() {
      return content.auctionEvents.map((event) => this.resolveEvent(event));
    }

    listResolvedAuctionLots() {
      return content.lots.map((lot) => this.resolveLot(lot));
    }

    getAuctionLotsByEventId(eventId: string) {
      return content.lots.filter((lot) => lot.eventId === eventId);
    }

    private getRequired<T>(index: Map<string, T>, id: string, collection: string) {
      const value = index.get(id);

      if (!value) {
        throw new Error(`Missing ${collection} reference: ${id}`);
      }

      return value;
    }

    private resolveDocument(document: DocumentAsset): ResolvedDocumentAsset {
      return {
        ...document,
        cta: document.ctaId
          ? this.getRequired(this.ctaById, document.ctaId, "ctas")
          : undefined,
      };
    }

    private resolvePage(page: InstitutionalPage): ResolvedInstitutionalPage {
      return {
        ...page,
        faq: page.relatedFaqIds.map((id) => this.getRequired(this.faqById, id, "faq")),
        primaryCta: page.primaryCtaId
          ? this.getRequired(this.ctaById, page.primaryCtaId, "ctas")
          : undefined,
        secondaryCta: page.secondaryCtaId
          ? this.getRequired(this.ctaById, page.secondaryCtaId, "ctas")
          : undefined,
      };
    }

    private resolveEvent(event: AuctionEvent): ResolvedAuctionEvent {
      return {
        ...event,
        categories: event.categoryIds.map((id) =>
          this.getRequired(this.categoryById, id, "categories"),
        ),
        documents: event.documentIds.map((id) =>
          this.resolveDocument(this.getRequired(this.documentById, id, "documents")),
        ),
        faq: event.faqIds.map((id) => this.getRequired(this.faqById, id, "faq")),
        lots: event.lotIds.map((id) => this.getRequired(this.lotById, id, "lots")),
        primaryCta: event.primaryCtaId
          ? this.getRequired(this.ctaById, event.primaryCtaId, "ctas")
          : undefined,
      };
    }

    private resolveLot(lot: AuctionLot): ResolvedAuctionLot {
      return {
        ...lot,
        categoryEntity: this.getRequired(this.categoryById, lot.categoryId, "categories"),
        ctas: lot.ctaIds.map((id) => this.getRequired(this.ctaById, id, "ctas")),
        documents: lot.documentIds.map((id) =>
          this.resolveDocument(this.getRequired(this.documentById, id, "documents")),
        ),
        event: this.getRequired(this.eventById, lot.eventId, "auctionEvents"),
        faq: lot.faqIds.map((id) => this.getRequired(this.faqById, id, "faq")),
      };
    }
  }

  return new SeedBackedContentRepository();
}

export const contentRepository = createContentRepository(localSeedContentSource);
