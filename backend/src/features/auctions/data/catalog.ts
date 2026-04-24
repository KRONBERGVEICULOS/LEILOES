import type { AuctionDocument, AuctionEvent, Category, Lot } from "@/backend/features/auctions/types";
import { getLotMarketConfig } from "@/backend/features/auctions/data/lot-market";
import { contentRepository } from "@/backend/features/content/data/repository";
import type {
  ResolvedAuctionEvent,
  ResolvedAuctionLot,
  ResolvedDocumentAsset,
} from "@/backend/features/content/model/types";
import { formatCurrencyBRL } from "@/shared/lib/utils";

function toDocumentTypeLabel(document: ResolvedDocumentAsset) {
  switch (document.documentType) {
    case "edital":
      return "Edital";
    case "ficha":
      return "Ficha";
    case "orientacao":
      return "Orientação";
    case "politica":
      return "Política";
    case "termo":
      return "Termo";
    default:
      return "Documento";
  }
}

function toDocumentSourceLabel(document: ResolvedDocumentAsset) {
  switch (document.documentType) {
    case "edital":
      return "Documento base do evento";
    case "ficha":
      return "Ficha consolidada do lote";
    case "orientacao":
      return "Orientação operacional complementar";
    case "politica":
      return "Política institucional";
    case "termo":
      return "Termo ou condição complementar";
    default:
      return "Documento de apoio";
  }
}

function toDocumentStatus(document: ResolvedDocumentAsset) {
  switch (document.accessMode) {
    case "download":
      return {
        label: "Arquivo público",
        description:
          "O documento pode ser acessado diretamente. Confira se ele corresponde ao evento e ao lote consultado.",
      };
    case "external":
      return {
        label: "Link externo",
        description:
          "O documento está em um canal externo. Confirme versão e vigência antes de usar como referência.",
      };
    case "request":
    default:
      return {
        label: "Disponível sob solicitação",
        description:
          "Solicite o material pelo canal oficial conforme o evento, o lote e a etapa da sua análise.",
      };
  }
}

function toScheduleLabel(event: ResolvedAuctionEvent) {
  if (event.schedule.startsAt && event.schedule.endsAt) {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: event.schedule.timezone,
    });

    return `${formatter.format(new Date(event.schedule.startsAt))} a ${formatter.format(
      new Date(event.schedule.endsAt),
    )}`;
  }

  if (event.schedule.startsAt) {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: event.schedule.timezone,
    });

    return formatter.format(new Date(event.schedule.startsAt));
  }

  return event.schedule.isToBeConfirmed
    ? "Cronograma informado no edital"
    : "Cronograma sob consulta";
}

function toDocumentViewModel(document: ResolvedDocumentAsset): AuctionDocument {
  const status = toDocumentStatus(document);

  return {
    documentType: document.documentType,
    accessMode: document.accessMode,
    kind: toDocumentTypeLabel(document),
    title: document.title,
    description: document.summary,
    ctaLabel: document.cta?.label ?? "Solicitar atendimento",
    ctaHref: document.cta?.href ?? "/contato",
    sourceLabel: toDocumentSourceLabel(document),
    statusLabel: status.label,
    statusDescription: status.description,
  };
}

function toEventViewModel(event: ResolvedAuctionEvent): AuctionEvent {
  return {
    slug: event.slug,
    eyebrow: event.eyebrow,
    title: event.title,
    status: event.statusLabel,
    schedule: toScheduleLabel(event),
    summary: event.summary,
    intro: event.intro,
    coverage: event.coverage,
    format: event.journeyModeLabel,
    note: event.note,
    image: {
      src: event.heroImage.url,
      alt: event.heroImage.alt,
    },
    highlights: event.highlightBullets,
    documents: event.documents.map(toDocumentViewModel),
    faq: event.faq.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
    lotSlugs: event.lots.map((lot) => lot.slug),
  };
}

function toLotViewModel(lot: ResolvedAuctionLot, isFeatured: boolean): Lot {
  const market = getLotMarketConfig(lot.slug);

  return {
    id: lot.id,
    slug: lot.slug,
    title: lot.title,
    lotCode: lot.referenceCode,
    statusKey: lot.statusKey,
    status: lot.statusLabel,
    isFeatured,
    isVisible: true,
    eventSlug: lot.event.slug,
    category: lot.segmentLabel,
    location: lot.location.display,
    overview: lot.shortDescription,
    details: lot.longDescription,
    operationalDisclaimer: lot.observations.commercialDisclaimer,
    year: lot.technicalMetadata.yearModel,
    mileage: lot.technicalMetadata.usageMetric,
    fuel: lot.technicalMetadata.fuel,
    transmission: lot.technicalMetadata.transmission,
    onlineStatusLabel: market.onlineStatusLabel,
    onlineTeaserLabel: market.teaserLabel,
    pricing: {
      referenceValueCents: market.referenceValueCents,
      referenceValueLabel: formatCurrencyBRL(market.referenceValueCents),
      currentValueCents: market.referenceValueCents,
      currentValueLabel: formatCurrencyBRL(market.referenceValueCents),
      minimumIncrementCents: market.minimumIncrementCents,
      minimumIncrementLabel: formatCurrencyBRL(market.minimumIncrementCents),
      supportLabel: market.supportLabel,
    },
    sourceNote: lot.observations.sourceNote,
    facts: lot.observations.operationalNotes,
    highlights: lot.highlightBullets,
    documents: lot.documents.map(toDocumentViewModel),
    faq: lot.faq.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
    media: lot.gallery.map((image) => ({
      src: image.url,
      alt: image.alt,
    })),
  };
}

export const categories: Category[] = contentRepository
  .listAssetCategories()
  .map((category) => ({
    slug: category.slug,
    name: category.label,
    summary: category.summary,
    scope: category.scope,
  }));

const resolvedEvents = contentRepository.listResolvedAuctionEvents();
const resolvedLots = contentRepository.listResolvedAuctionLots();
const featuredLotIdSet = new Set(contentRepository.getSiteExperience().featuredLotIds);

export const auctionEvents: AuctionEvent[] = resolvedEvents.map(toEventViewModel);
export const lots: Lot[] = resolvedLots.map((lot) =>
  toLotViewModel(lot, featuredLotIdSet.has(lot.id)),
);

export const featuredLotSlugs = contentRepository
  .getSiteExperience()
  .featuredLotIds.map((id) => {
    const lot = resolvedLots.find((candidate) => candidate.id === id);

    if (!lot) {
      throw new Error(`Featured lot "${id}" was not found in the local seed.`);
    }

    return lot.slug;
  });

export function getEventBySlug(slug: string) {
  return auctionEvents.find((event) => event.slug === slug);
}

export function getLotBySlug(slug: string) {
  return lots.find((lot) => lot.slug === slug);
}

export function getLotsByEventSlug(eventSlug: string) {
  return lots.filter((lot) => lot.eventSlug === eventSlug);
}
