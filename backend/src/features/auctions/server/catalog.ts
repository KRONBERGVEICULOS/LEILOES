import "server-only";

import type { FaqItem, Lot, MediaAsset } from "@/backend/features/auctions/types";
import { getLotStatusDefinition, isLotPubliclyVisible } from "@/backend/features/auctions/lib/lot-status";
import { ensurePlatformCatalogSeed } from "@/backend/features/platform/server/catalog-seed";
import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import { readPublicCache, writePublicCache } from "@/backend/features/platform/server/public-cache";
import { shouldUseLocalSeedData } from "@/backend/features/platform/server/mode";
import { lots as seedLots } from "@/backend/features/auctions/data/catalog";
import { resolveMaximumPreBidAmountCents } from "@/shared/lib/pre-bid-policy";
import { formatCurrencyBRL } from "@/shared/lib/utils";

type LotRow = {
  id: string;
  source_slug: string | null;
  slug: string;
  title: string;
  lot_code: string;
  event_slug: string;
  category: string;
  location: string;
  overview: string;
  details: unknown;
  observations: string;
  source_note: string;
  facts: unknown;
  highlights: unknown;
  faq: unknown;
  gallery: unknown;
  year: string;
  mileage: string;
  fuel: string;
  transmission: string | null;
  status_key: string;
  reference_value_cents: number;
  current_value_cents: number;
  minimum_increment_cents: number;
  maximum_pre_bid_amount_cents: number | null;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at: string | Date;
  updated_at: string | Date;
};

type ListLotsOptions = {
  eventSlug?: string;
  includeHidden?: boolean;
  onlyFeatured?: boolean;
};

const CATALOG_CACHE_VERSION = "reference-price-v2";

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getSanitizedCurrentValueCents(row: LotRow) {
  const minimumCurrentValueCents = Math.max(
    row.current_value_cents,
    row.reference_value_cents,
  );
  const maximumAllowedPreBidAmountCents = resolveMaximumPreBidAmountCents({
    referenceValueCents: row.reference_value_cents,
    maximumPreBidAmountCents: row.maximum_pre_bid_amount_cents,
  });

  return minimumCurrentValueCents > maximumAllowedPreBidAmountCents
    ? row.reference_value_cents
    : minimumCurrentValueCents;
}

function mapRowToLot(row: LotRow): Lot {
  const status = getLotStatusDefinition(row.status_key);
  const currentValueCents = getSanitizedCurrentValueCents(row);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    lotCode: row.lot_code,
    statusKey: row.status_key,
    status: status.label,
    isFeatured: row.is_featured,
    isVisible: row.is_visible,
    eventSlug: row.event_slug,
    category: row.category,
    location: row.location,
    overview: row.overview,
    details: parseJsonArray<string>(row.details),
    operationalDisclaimer: row.observations,
    year: row.year,
    mileage: row.mileage,
    fuel: row.fuel,
    transmission: row.transmission ?? undefined,
    onlineStatusLabel: status.onlineStatusLabel,
    onlineTeaserLabel: status.teaserLabel,
    pricing: {
      referenceValueCents: row.reference_value_cents,
      referenceValueLabel: formatCurrencyBRL(row.reference_value_cents),
      currentValueCents,
      currentValueLabel: formatCurrencyBRL(currentValueCents),
      minimumIncrementCents: row.minimum_increment_cents,
      minimumIncrementLabel: formatCurrencyBRL(row.minimum_increment_cents),
      ...(row.maximum_pre_bid_amount_cents
        ? {
            maximumPreBidAmountCents: row.maximum_pre_bid_amount_cents,
            maximumPreBidAmountLabel: formatCurrencyBRL(
              row.maximum_pre_bid_amount_cents,
            ),
          }
        : {}),
      supportLabel: status.supportLabel,
    },
    sourceNote: row.source_note,
    facts: parseJsonArray<string>(row.facts),
    highlights: parseJsonArray<string>(row.highlights),
    documents: [],
    faq: parseJsonArray<FaqItem>(row.faq),
    media: parseJsonArray<MediaAsset>(row.gallery),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

async function getDatabaseLots() {
  if (shouldUseLocalSeedData()) {
    return seedLots;
  }

  await ensurePlatformCatalogSeed();

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<LotRow[]>`
      select
        lots.id,
        lots.source_slug,
        lots.slug,
        lots.title,
        lots.lot_code,
        lots.event_slug,
        lots.category,
        lots.location,
        lots.overview,
        lots.details,
        lots.observations,
        lots.source_note,
        lots.facts,
        lots.highlights,
        lots.faq,
        lots.gallery,
        lots.year,
        lots.mileage,
        lots.fuel,
        lots.transmission,
        lots.status_key,
        lots.reference_value_cents,
        lots.current_value_cents,
        lots.minimum_increment_cents,
        lots.maximum_pre_bid_amount_cents,
        lots.is_featured,
        lots.is_visible,
        lots.sort_order,
        lots.created_at,
        lots.updated_at
      from platform_lots as lots
      order by lots.is_featured desc, lots.sort_order asc, lots.updated_at desc, lots.created_at desc
    `;

    return rows.map(mapRowToLot);
  });
}

export async function listLots(options: ListLotsOptions = {}) {
  const usePublicCache = !options.includeHidden && !shouldUseLocalSeedData();

  if (usePublicCache) {
    const cacheKey = [
      CATALOG_CACHE_VERSION,
      options.onlyFeatured ? "featured" : "all",
      options.eventSlug ?? "all-events",
    ];
    const cachedLots = await readPublicCache<Lot[]>("catalog", cacheKey);

    if (cachedLots) {
      return cachedLots;
    }
  }

  const lotsFromDatabase = await getDatabaseLots();
  const filteredLots = lotsFromDatabase.filter((lot) => {
    if (options.onlyFeatured && !lot.isFeatured) {
      return false;
    }

    if (options.eventSlug && lot.eventSlug !== options.eventSlug) {
      return false;
    }

    if (!options.includeHidden && !isLotPubliclyVisible(lot.statusKey, lot.isVisible)) {
      return false;
    }

    return true;
  });

  if (usePublicCache) {
    await writePublicCache(
      "catalog",
      [
        CATALOG_CACHE_VERSION,
        options.onlyFeatured ? "featured" : "all",
        options.eventSlug ?? "all-events",
      ],
      filteredLots,
      90,
    );
  }

  return filteredLots;
}

export async function getLotBySlug(slug: string, options: { includeHidden?: boolean } = {}) {
  const allLots = await listLots({
    includeHidden: options.includeHidden,
  });
  const lot = allLots.find((candidate) => candidate.slug === slug);

  if (!lot) {
    return null;
  }

  if (!options.includeHidden && !isLotPubliclyVisible(lot.statusKey, lot.isVisible)) {
    return null;
  }

  return lot;
}

export async function getLotById(id: string) {
  const allLots = await listLots({ includeHidden: true });
  return allLots.find((candidate) => candidate.id === id) ?? null;
}

export async function listFeaturedLots(limit = 3) {
  const items = await listLots({
    onlyFeatured: true,
  });

  return items.slice(0, limit);
}

export async function getLotsByEventSlug(eventSlug: string) {
  return listLots({ eventSlug });
}
