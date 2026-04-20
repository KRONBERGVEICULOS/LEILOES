import type { Lot } from "@/backend/features/auctions/types";
import {
  auctionEvents,
  getLotsByEventSlug,
  lots,
} from "@/backend/features/auctions/data/catalog";

type ParamValue = string | string[] | undefined;

export type EventCatalogFilters = {
  query: string;
  status: string;
  format: string;
  category: string;
};

export type LotCatalogFilters = {
  query: string;
  category: string;
};

function readParam(value: ParamValue) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function normalizeValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function uniqueValues(items: string[]) {
  return [...new Set(items)].sort((left, right) =>
    left.localeCompare(right, "pt-BR"),
  );
}

export function normalizeEventCatalogFilters(params: Record<string, ParamValue>) {
  return {
    query: readParam(params.q),
    status: readParam(params.status),
    format: readParam(params.formato),
    category: readParam(params.categoria),
  } satisfies EventCatalogFilters;
}

export function normalizeLotCatalogFilters(params: Record<string, ParamValue>) {
  return {
    query: readParam(params.q),
    category: readParam(params.categoria),
  } satisfies LotCatalogFilters;
}

export function isEventCatalogFiltered(filters: EventCatalogFilters) {
  return Boolean(
    filters.query || filters.status || filters.format || filters.category,
  );
}

export function isLotCatalogFiltered(filters: LotCatalogFilters) {
  return Boolean(filters.query || filters.category);
}

export function getEventStatusOptions() {
  return uniqueValues(auctionEvents.map((event) => event.status));
}

export function getEventFormatOptions() {
  return uniqueValues(auctionEvents.map((event) => event.format));
}

export function getEventCategoryOptions() {
  return uniqueValues(lots.map((lot) => lot.category));
}

export function getLotCategoryOptions(items: Pick<Lot, "category">[]) {
  return uniqueValues(items.map((item) => item.category));
}

export function filterEvents(filters: EventCatalogFilters) {
  const normalizedQuery = normalizeValue(filters.query);
  const normalizedStatus = normalizeValue(filters.status);
  const normalizedFormat = normalizeValue(filters.format);
  const normalizedCategory = normalizeValue(filters.category);

  return auctionEvents.filter((event) => {
    const eventLots = getLotsByEventSlug(event.slug);
    const searchableText = normalizeValue(
      [
        event.title,
        event.summary,
        event.coverage,
        event.format,
        event.status,
        eventLots.map((lot) => lot.title).join(" "),
        eventLots.map((lot) => lot.lotCode).join(" "),
        eventLots.map((lot) => lot.category).join(" "),
      ].join(" "),
    );

    const matchesQuery = normalizedQuery
      ? searchableText.includes(normalizedQuery)
      : true;
    const matchesStatus = normalizedStatus
      ? normalizeValue(event.status) === normalizedStatus
      : true;
    const matchesFormat = normalizedFormat
      ? normalizeValue(event.format) === normalizedFormat
      : true;
    const matchesCategory = normalizedCategory
      ? eventLots.some(
          (lot) => normalizeValue(lot.category) === normalizedCategory,
        )
      : true;

    return matchesQuery && matchesStatus && matchesFormat && matchesCategory;
  });
}

export function filterLots(items: Lot[], filters: LotCatalogFilters) {
  const normalizedQuery = normalizeValue(filters.query);
  const normalizedCategory = normalizeValue(filters.category);

  return items.filter((lot) => {
    const searchableText = normalizeValue(
      [
        lot.title,
        lot.lotCode,
        lot.category,
        lot.location,
        lot.overview,
        lot.highlights.join(" "),
      ].join(" "),
    );

    const matchesQuery = normalizedQuery
      ? searchableText.includes(normalizedQuery)
      : true;
    const matchesCategory = normalizedCategory
      ? normalizeValue(lot.category) === normalizedCategory
      : true;

    return matchesQuery && matchesCategory;
  });
}
