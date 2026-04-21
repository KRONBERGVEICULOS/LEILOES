import "server-only";

import type { FaqItem, Lot, MediaAsset } from "@/backend/features/auctions/types";
import { getLotStatusDefinition, isLotPubliclyVisible } from "@/backend/features/auctions/lib/lot-status";
import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import {
  requireDatabaseUrl,
  shouldUseLocalSeedData,
} from "@/backend/features/platform/server/mode";
import { lots as seedLots } from "@/backend/features/auctions/data/catalog";
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

function mapRowToLot(row: LotRow): Lot {
  const status = getLotStatusDefinition(row.status_key);

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
      currentValueCents: row.current_value_cents,
      currentValueLabel: formatCurrencyBRL(row.current_value_cents),
      minimumIncrementCents: row.minimum_increment_cents,
      minimumIncrementLabel: formatCurrencyBRL(row.minimum_increment_cents),
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

  requireDatabaseUrl();

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<LotRow[]>`
      select
        id,
        source_slug,
        slug,
        title,
        lot_code,
        event_slug,
        category,
        location,
        overview,
        details,
        observations,
        source_note,
        facts,
        highlights,
        faq,
        gallery,
        year,
        mileage,
        fuel,
        transmission,
        status_key,
        reference_value_cents,
        current_value_cents,
        minimum_increment_cents,
        is_featured,
        is_visible,
        sort_order,
        created_at,
        updated_at
      from platform_lots
      order by is_featured desc, sort_order asc, updated_at desc, created_at desc
    `;

    return rows.map(mapRowToLot);
  });
}

export async function listLots(options: ListLotsOptions = {}) {
  const lotsFromDatabase = await getDatabaseLots();

  return lotsFromDatabase.filter((lot) => {
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
}

export async function getLotBySlug(slug: string, options: { includeHidden?: boolean } = {}) {
  const allLots = await listLots({ includeHidden: true });
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
