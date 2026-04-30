import "server-only";

import { lots } from "@/backend/features/auctions/data/catalog";
import { normalizeLotStatusKey } from "@/backend/features/auctions/lib/lot-status";
import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import { shouldUseLocalSeedData } from "@/backend/features/platform/server/mode";

type PlatformQuery = {
  (template: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
};

const seedBaseDate = Date.UTC(2026, 3, 11, 18, 10, 0);

const globalForPlatformCatalogSeed = globalThis as typeof globalThis & {
  __kronPlatformCatalogReady?: Promise<void>;
};

async function seedLotAvailability(sql: PlatformQuery) {
  for (const [index, lot] of lots.entries()) {
    const createdAt = new Date(seedBaseDate - index * 1000 * 60 * 90).toISOString();

    await sql`
      insert into platform_activities (
        id,
        kind,
        lot_slug,
        dedupe_key,
        created_at
      )
      values (
        ${`lot-available-${lot.slug}`},
        'lot_available',
        ${lot.slug},
        ${`lot_available:${lot.slug}`},
        ${createdAt}
      )
      on conflict (dedupe_key) do nothing
    `;
  }
}

async function seedPlatformLots(sql: PlatformQuery) {
  for (const [index, lot] of lots.entries()) {
    const createdAt = new Date(seedBaseDate - index * 1000 * 60 * 90).toISOString();

    await sql`
      insert into platform_lots (
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
        maximum_pre_bid_amount_cents,
        is_featured,
        is_visible,
        sort_order,
        created_at,
        updated_at
      )
      values (
        ${`seed:${lot.slug}`},
        ${lot.slug},
        ${lot.slug},
        ${lot.title},
        ${lot.lotCode},
        ${lot.eventSlug},
        ${lot.category},
        ${lot.location},
        ${lot.overview},
        ${JSON.stringify(lot.details)}::jsonb,
        ${lot.operationalDisclaimer},
        ${lot.sourceNote},
        ${JSON.stringify(lot.facts)}::jsonb,
        ${JSON.stringify(lot.highlights)}::jsonb,
        ${JSON.stringify(lot.faq)}::jsonb,
        ${JSON.stringify(lot.media)}::jsonb,
        ${lot.year},
        ${lot.mileage},
        ${lot.fuel},
        ${lot.transmission ?? null},
        ${normalizeLotStatusKey(lot.statusKey)},
        ${lot.pricing.referenceValueCents},
        ${lot.pricing.currentValueCents},
        ${lot.pricing.minimumIncrementCents},
        ${null},
        ${lot.isFeatured},
        ${lot.isVisible},
        ${index + 1},
        ${createdAt},
        ${createdAt}
      )
      on conflict (id) do nothing
    `;
  }
}

export async function ensurePlatformCatalogSeed() {
  if (shouldUseLocalSeedData()) {
    return;
  }

  if (!globalForPlatformCatalogSeed.__kronPlatformCatalogReady) {
    globalForPlatformCatalogSeed.__kronPlatformCatalogReady = withPlatformDatabase(
      async (sql) => {
        await sql.begin(async (transaction) => {
          await seedPlatformLots(transaction);
          await seedLotAvailability(transaction);
        });
      },
    ).catch((error) => {
      globalForPlatformCatalogSeed.__kronPlatformCatalogReady = undefined;
      throw error;
    });
  }

  return globalForPlatformCatalogSeed.__kronPlatformCatalogReady;
}
