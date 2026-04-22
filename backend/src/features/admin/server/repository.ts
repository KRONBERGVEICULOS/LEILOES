import "server-only";

import { randomUUID } from "node:crypto";

import type { FaqItem, Lot, MediaAsset } from "@/backend/features/auctions/types";
import {
  getLotStatusDefinition,
  isLotPubliclyVisible,
  lotStatusDefinitions,
  type LotStatusKey,
} from "@/backend/features/auctions/lib/lot-status";
import { auctionEvents, categories } from "@/backend/features/auctions/data/catalog";
import { getLotById, listLots } from "@/backend/features/auctions/server/catalog";
import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import { invalidatePublicExperienceCache } from "@/backend/features/platform/server/public-cache";
import { isDatabaseConfigured } from "@/backend/features/platform/server/mode";
import { formatCurrencyBRL, formatDateTimeBR, slugify } from "@/shared/lib/utils";

type InterestRow = {
  id: string;
  lot_slug: string;
  user_id: string;
  public_alias: string;
  created_at: string | Date;
};

type PreBidRow = {
  id: string;
  lot_slug: string;
  user_id: string;
  public_alias: string;
  amount_cents: number;
  created_at: string | Date;
};

type ActivityRow = {
  id: string;
  kind: string;
  lot_slug: string | null;
  actor_public_alias: string | null;
  amount_cents: number | null;
  title: string | null;
  description: string | null;
  source: string;
  audience: string;
  created_at: string | Date;
};

type StoredLotUpdatePayload = {
  id?: string;
  title: string;
  slug: string;
  lotCode: string;
  eventSlug: string;
  category: string;
  location: string;
  overview: string;
  details: string[];
  observations: string;
  sourceNote: string;
  highlights: string[];
  facts: string[];
  gallery: MediaAsset[];
  year?: string;
  mileage?: string;
  fuel?: string;
  transmission?: string;
  referenceValueCents: number;
  currentValueCents: number;
  minimumIncrementCents: number;
  statusKey: LotStatusKey;
  isFeatured: boolean;
  isVisible: boolean;
};

export type AdminDashboardData = {
  totalLots: number;
  activeLots: number;
  inactiveLots: number;
  totalInterests: number;
  totalPreBids: number;
  recentActivity: AdminActivityItem[];
};

export type AdminLotListItem = {
  id: string;
  slug: string;
  title: string;
  lotCode: string;
  location: string;
  statusKey: string;
  statusLabel: string;
  isFeatured: boolean;
  isVisible: boolean;
  referenceValueLabel: string;
  currentValueLabel: string;
  updatedAt?: string;
};

export type AdminInterestItem = {
  id: string;
  lotSlug: string;
  lotTitle: string;
  lotCode: string;
  statusKey: string;
  statusLabel: string;
  userAlias: string;
  createdAt: string;
};

export type AdminPreBidItem = {
  id: string;
  lotSlug: string;
  lotTitle: string;
  lotCode: string;
  statusKey: string;
  statusLabel: string;
  userAlias: string;
  amountLabel: string;
  createdAt: string;
};

export type AdminActivityItem = {
  id: string;
  kind: string;
  title: string;
  description: string;
  audience: string;
  source: string;
  lotSlug?: string;
  lotTitle?: string;
  lotCode?: string;
  actorAlias?: string;
  amountLabel?: string;
  createdAt: string;
  createdAtLabel: string;
};

export type AdminLotFilters = {
  query?: string;
  status?: string;
  visibility?: string;
  sort?: string;
};

export type AdminRecordFilters = {
  lotSlug?: string;
  status?: string;
  from?: string;
  to?: string;
};

export type AdminActivityFilters = AdminRecordFilters & {
  type?: string;
  audience?: string;
};

export type AdminLotMutationResult = {
  id: string;
  slug: string;
  previousSlug?: string;
  eventSlug: string;
  isVisible: boolean;
};

function assertDatabaseConfigured() {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "Configure DATABASE_URL para usar a persistência real do painel administrativo.",
    );
  }
}

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeQuery(value?: string) {
  return value
    ?.normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function normalizeDateRange(value?: string, endOfDay = false) {
  if (!value) {
    return null;
  }

  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const timestamp = new Date(`${value}${suffix}`);

  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

function parseDateWithinRange(value: string, from?: string, to?: string) {
  const createdAt = new Date(value).getTime();
  const fromDate = normalizeDateRange(from);
  const toDate = normalizeDateRange(to, true);

  if (fromDate && createdAt < fromDate.getTime()) {
    return false;
  }

  if (toDate && createdAt > toDate.getTime()) {
    return false;
  }

  return true;
}

function buildActivityTitle(kind: string, lot?: Lot | null) {
  switch (kind) {
    case "user_registered":
      return "Novo cadastro";
    case "interest_registered":
      return lot ? `Novo interesse em ${lot.lotCode}` : "Novo interesse";
    case "prebid_registered":
      return lot ? `Novo pré-lance em ${lot.lotCode}` : "Novo pré-lance";
    case "lot_created":
      return lot ? `${lot.lotCode} criado` : "Lote criado";
    case "lot_updated":
      return lot ? `${lot.lotCode} atualizado` : "Lote atualizado";
    case "lot_status_changed":
      return lot ? `Status atualizado em ${lot.lotCode}` : "Status atualizado";
    case "lot_available":
      return lot ? `${lot.lotCode} na vitrine` : "Lote publicado";
    default:
      return "Atualização operacional";
  }
}

function buildActivityDescription(row: ActivityRow, lot?: Lot | null) {
  if (row.description) {
    return row.description;
  }

  switch (row.kind) {
    case "user_registered":
      return "Novo usuário cadastrado na plataforma.";
    case "interest_registered":
      return row.actor_public_alias
        ? `${row.actor_public_alias} marcou interesse neste lote.`
        : "Um usuário marcou interesse neste lote.";
    case "prebid_registered":
      return row.actor_public_alias && row.amount_cents
        ? `${row.actor_public_alias} registrou ${formatCurrencyBRL(row.amount_cents)}.`
        : "Um novo pré-lance foi registrado neste lote.";
    case "lot_created":
      return lot
        ? "Novo lote criado e sincronizado com a vitrine operacional."
        : "Novo lote criado pela operação.";
    case "lot_updated":
      return "Conteúdo e dados operacionais do lote foram atualizados.";
    case "lot_status_changed":
      return lot
        ? `O lote agora está com status "${getLotStatusDefinition(lot.statusKey).label}".`
        : "O status operacional do lote foi alterado.";
    case "lot_available":
      return "Lote publicado na vitrine para consulta comercial.";
    default:
      return "Atualização operacional registrada pelo painel.";
  }
}

async function getLotMap() {
  const lots = await listLots({ includeHidden: true });
  return new Map(lots.map((lot) => [lot.slug, lot]));
}

async function insertActivity(
  transaction: {
    (template: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  },
  input: {
    kind: string;
    lotSlug?: string;
    actorPublicAlias?: string;
    amountCents?: number;
    title?: string;
    description?: string;
    source?: string;
    audience?: "admin" | "public";
  },
) {
  await transaction`
    insert into platform_activities (
      id,
      kind,
      lot_slug,
      actor_public_alias,
      amount_cents,
      title,
      description,
      source,
      audience,
      created_at
    )
    values (
      ${randomUUID()},
      ${input.kind},
      ${input.lotSlug ?? null},
      ${input.actorPublicAlias ?? null},
      ${input.amountCents ?? null},
      ${input.title ?? null},
      ${input.description ?? null},
      ${input.source ?? "admin"},
      ${input.audience ?? "admin"},
      ${new Date().toISOString()}
    )
  `;
}

async function ensureUniqueSlug(desiredSlug: string, currentLotId?: string) {
  const baseSlug = slugify(desiredSlug) || `lote-${Date.now()}`;
  const lots = await listLots({ includeHidden: true });
  const usedSlugs = new Set(
    lots
      .filter((lot) => lot.id !== currentLotId)
      .map((lot) => lot.slug),
  );

  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let sequence = 2;

  while (usedSlugs.has(`${baseSlug}-${sequence}`)) {
    sequence += 1;
  }

  return `${baseSlug}-${sequence}`;
}

export function getAdminReferenceData() {
  return {
    events: auctionEvents.map((event) => ({
      slug: event.slug,
      title: event.title,
    })),
    categories: categories.map((category) => category.name),
    statuses: lotStatusDefinitions.map((status) => ({
      value: status.key,
      label: status.label,
    })),
  };
}

export async function getAdminDashboard() {
  assertDatabaseConfigured();

  const [lots, recentActivity] = await Promise.all([
    listLots({ includeHidden: true }),
    listAdminActivity({}),
  ]);

  return withPlatformDatabase(async (sql) => {
    const [interestsCount, preBidsCount] = await Promise.all([
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_interests
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_pre_bids
      `,
    ]);

    return {
      totalLots: lots.length,
      activeLots: lots.filter((lot) => isLotPubliclyVisible(lot.statusKey, lot.isVisible)).length,
      inactiveLots: lots.filter((lot) => !isLotPubliclyVisible(lot.statusKey, lot.isVisible)).length,
      totalInterests: interestsCount[0]?.count ?? 0,
      totalPreBids: preBidsCount[0]?.count ?? 0,
      recentActivity: recentActivity.slice(0, 8),
    } satisfies AdminDashboardData;
  });
}

export async function listAdminLots(filters: AdminLotFilters) {
  assertDatabaseConfigured();

  const normalizedSearch = normalizeQuery(filters.query);
  const lots = await listLots({ includeHidden: true });

  const filtered = lots.filter((lot) => {
    if (filters.status && lot.statusKey !== filters.status) {
      return false;
    }

    if (filters.visibility === "visible" && !lot.isVisible) {
      return false;
    }

    if (filters.visibility === "hidden" && lot.isVisible) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchable = normalizeQuery(
      [lot.title, lot.lotCode, lot.location, lot.slug, lot.category].join(" "),
    );

    return searchable?.includes(normalizedSearch) ?? false;
  });

  const sorted = [...filtered].sort((left, right) => {
    switch (filters.sort) {
      case "title":
        return left.title.localeCompare(right.title, "pt-BR");
      case "reference":
        return right.pricing.referenceValueCents - left.pricing.referenceValueCents;
      case "created":
        return new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime();
      case "status":
        return getLotStatusDefinition(left.statusKey).label.localeCompare(
          getLotStatusDefinition(right.statusKey).label,
          "pt-BR",
        );
      case "updated":
      default:
        return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
    }
  });

  return sorted.map(
    (lot) =>
      ({
        id: lot.id,
        slug: lot.slug,
        title: lot.title,
        lotCode: lot.lotCode,
        location: lot.location,
        statusKey: lot.statusKey,
        statusLabel: getLotStatusDefinition(lot.statusKey).label,
        isFeatured: lot.isFeatured,
        isVisible: lot.isVisible,
        referenceValueLabel: lot.pricing.referenceValueLabel,
        currentValueLabel: lot.pricing.currentValueLabel,
        updatedAt: lot.updatedAt,
      }) satisfies AdminLotListItem,
  );
}

export async function getAdminLotById(id: string) {
  assertDatabaseConfigured();
  return getLotById(id);
}

export async function saveAdminLot(input: StoredLotUpdatePayload) {
  assertDatabaseConfigured();

  const targetId = input.id ?? randomUUID();
  const previousLot = input.id ? await getLotById(input.id) : null;
  const nextSlug = await ensureUniqueSlug(input.slug || input.title, input.id);

  const result = await withPlatformDatabase((sql) =>
    sql.begin(async (transaction) => {
      const now = new Date().toISOString();
      const wasPubliclyVisible = previousLot
        ? isLotPubliclyVisible(previousLot.statusKey, previousLot.isVisible)
        : false;
      const isNowPubliclyVisible = isLotPubliclyVisible(input.statusKey, input.isVisible);

      await transaction`
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
          is_featured,
          is_visible,
          updated_at,
          created_at
        )
        values (
          ${targetId},
          ${previousLot?.slug ?? nextSlug},
          ${nextSlug},
          ${input.title},
          ${input.lotCode},
          ${input.eventSlug},
          ${input.category},
          ${input.location},
          ${input.overview},
          ${JSON.stringify(input.details)}::jsonb,
          ${input.observations},
          ${input.sourceNote},
          ${JSON.stringify(input.facts)}::jsonb,
          ${JSON.stringify(input.highlights)}::jsonb,
          ${JSON.stringify([] as FaqItem[])}::jsonb,
          ${JSON.stringify(input.gallery)}::jsonb,
          ${input.year ?? ""},
          ${input.mileage ?? ""},
          ${input.fuel ?? ""},
          ${input.transmission ?? null},
          ${input.statusKey},
          ${input.referenceValueCents},
          ${input.currentValueCents},
          ${input.minimumIncrementCents},
          ${input.isFeatured},
          ${input.isVisible},
          ${now},
          ${previousLot?.createdAt ?? now}
        )
        on conflict (id) do update
        set
          slug = excluded.slug,
          title = excluded.title,
          lot_code = excluded.lot_code,
          event_slug = excluded.event_slug,
          category = excluded.category,
          location = excluded.location,
          overview = excluded.overview,
          details = excluded.details,
          observations = excluded.observations,
          source_note = excluded.source_note,
          facts = excluded.facts,
          highlights = excluded.highlights,
          gallery = excluded.gallery,
          year = excluded.year,
          mileage = excluded.mileage,
          fuel = excluded.fuel,
          transmission = excluded.transmission,
          status_key = excluded.status_key,
          reference_value_cents = excluded.reference_value_cents,
          current_value_cents = excluded.current_value_cents,
          minimum_increment_cents = excluded.minimum_increment_cents,
          is_featured = excluded.is_featured,
          is_visible = excluded.is_visible,
          updated_at = excluded.updated_at
      `;

      if (previousLot && previousLot.slug !== nextSlug) {
        await transaction`
          update platform_interests
          set lot_slug = ${nextSlug}
          where lot_slug = ${previousLot.slug}
        `;

        await transaction`
          update platform_pre_bids
          set lot_slug = ${nextSlug}
          where lot_slug = ${previousLot.slug}
        `;

        await transaction`
          update platform_activities
          set lot_slug = ${nextSlug}
          where lot_slug = ${previousLot.slug}
        `;
      }

      await insertActivity(transaction, {
        kind: previousLot ? "lot_updated" : "lot_created",
        lotSlug: nextSlug,
        title: previousLot
          ? `${input.lotCode} atualizado`
          : `${input.lotCode} criado no painel`,
        description: previousLot
          ? "Dados operacionais do lote foram atualizados pelo admin."
          : "Novo lote criado e liberado para a operação básica do site.",
        audience: previousLot ? "admin" : isNowPubliclyVisible ? "public" : "admin",
      });

      if (previousLot && previousLot.statusKey !== input.statusKey) {
        await insertActivity(transaction, {
          kind: "lot_status_changed",
          lotSlug: nextSlug,
          title: `${input.lotCode} mudou para ${getLotStatusDefinition(input.statusKey).label}`,
          description: `O status operacional do lote foi alterado para ${getLotStatusDefinition(input.statusKey).label.toLowerCase()}.`,
          audience: "admin",
        });
      }

      if (isNowPubliclyVisible && !wasPubliclyVisible) {
        await insertActivity(transaction, {
          kind: "lot_available",
          lotSlug: nextSlug,
          title: `${input.lotCode} publicado na vitrine`,
          description: "O lote entrou na vitrine pública com acompanhamento online liberado.",
          audience: "public",
        });
      }

      return {
        id: targetId,
        slug: nextSlug,
        previousSlug: previousLot?.slug,
        eventSlug: input.eventSlug,
        isVisible: input.isVisible,
      } satisfies AdminLotMutationResult;
    }),
  );

  await invalidatePublicExperienceCache({
    activity: true,
    catalog: true,
  });

  return result;
}

export async function duplicateAdminLot(id: string) {
  assertDatabaseConfigured();

  const existing = await getLotById(id);

  if (!existing) {
    throw new Error("Lote não encontrado para duplicação.");
  }

  return saveAdminLot({
    title: `${existing.title} (cópia)`,
    slug: `${existing.slug}-copia`,
    lotCode: `${existing.lotCode}-COPY`,
    eventSlug: existing.eventSlug,
    category: existing.category,
    location: existing.location,
    overview: existing.overview,
    details: existing.details,
    observations: existing.operationalDisclaimer,
    sourceNote: existing.sourceNote,
    highlights: existing.highlights,
    facts: existing.facts,
    gallery: existing.media,
    year: existing.year,
    mileage: existing.mileage,
    fuel: existing.fuel,
    transmission: existing.transmission,
    referenceValueCents: existing.pricing.referenceValueCents,
    currentValueCents: existing.pricing.currentValueCents,
    minimumIncrementCents: existing.pricing.minimumIncrementCents,
    statusKey: existing.statusKey as LotStatusKey,
    isFeatured: false,
    isVisible: false,
  });
}

export async function setAdminLotVisibility(id: string, isVisible: boolean) {
  assertDatabaseConfigured();
  const lot = await getLotById(id);

  if (!lot) {
    throw new Error("Lote não encontrado.");
  }

  const result = await withPlatformDatabase((sql) =>
    sql.begin(async (transaction) => {
      await transaction`
        update platform_lots
        set
          is_visible = ${isVisible},
          updated_at = ${new Date().toISOString()}
        where id = ${id}
      `;

      await insertActivity(transaction, {
        kind: "lot_status_changed",
        lotSlug: lot.slug,
        title: `${lot.lotCode} ${isVisible ? "reexibido" : "ocultado"}`,
        description: isVisible
          ? "O lote voltou para a vitrine pública."
          : "O lote foi retirado da vitrine pública.",
        audience: "admin",
      });

      if (isVisible && isLotPubliclyVisible(lot.statusKey, isVisible)) {
        await insertActivity(transaction, {
          kind: "lot_available",
          lotSlug: lot.slug,
          title: `${lot.lotCode} voltou para a vitrine`,
          description: "O lote ficou visível novamente para o público.",
          audience: "public",
        });
      }

      return {
        id: lot.id,
        slug: lot.slug,
        eventSlug: lot.eventSlug,
        isVisible,
      } satisfies AdminLotMutationResult;
    }),
  );

  await invalidatePublicExperienceCache({
    activity: true,
    catalog: true,
  });

  return result;
}

export async function setAdminLotFeatured(id: string, isFeatured: boolean) {
  assertDatabaseConfigured();
  const lot = await getLotById(id);

  if (!lot) {
    throw new Error("Lote não encontrado.");
  }

  const result = await withPlatformDatabase((sql) =>
    sql.begin(async (transaction) => {
      await transaction`
        update platform_lots
        set
          is_featured = ${isFeatured},
          updated_at = ${new Date().toISOString()}
        where id = ${id}
      `;

      await insertActivity(transaction, {
        kind: "lot_updated",
        lotSlug: lot.slug,
        title: `${lot.lotCode} ${isFeatured ? "marcado como destaque" : "removeu destaque"}`,
        description: isFeatured
          ? "O lote passou a aparecer como destaque da vitrine."
          : "O lote deixou de aparecer como destaque da vitrine.",
        audience: "admin",
      });

      return {
        id: lot.id,
        slug: lot.slug,
        eventSlug: lot.eventSlug,
        isVisible: lot.isVisible,
      } satisfies AdminLotMutationResult;
    }),
  );

  await invalidatePublicExperienceCache({
    activity: false,
    catalog: true,
  });

  return result;
}

export async function listAdminInterests(filters: AdminRecordFilters) {
  assertDatabaseConfigured();

  const lotMap = await getLotMap();

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<InterestRow[]>`
      select
        interests.id,
        interests.lot_slug,
        interests.user_id,
        users.public_alias,
        interests.created_at
      from platform_interests as interests
      inner join platform_users as users
        on users.id = interests.user_id
      order by interests.created_at desc
    `;

    return rows
      .map((row) => {
        const lot = lotMap.get(row.lot_slug);

        if (!lot) {
          return null;
        }

        return {
          id: row.id,
          lotSlug: lot.slug,
          lotTitle: lot.title,
          lotCode: lot.lotCode,
          statusKey: lot.statusKey,
          statusLabel: getLotStatusDefinition(lot.statusKey).label,
          userAlias: row.public_alias,
          createdAt: toIsoString(row.created_at),
        } satisfies AdminInterestItem;
      })
      .filter((item): item is AdminInterestItem => Boolean(item))
      .filter((item) => {
        if (filters.lotSlug && item.lotSlug !== filters.lotSlug) {
          return false;
        }

        if (filters.status && item.statusKey !== filters.status) {
          return false;
        }

        return parseDateWithinRange(item.createdAt, filters.from, filters.to);
      });
  });
}

export async function listAdminPreBids(filters: AdminRecordFilters) {
  assertDatabaseConfigured();

  const lotMap = await getLotMap();

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<PreBidRow[]>`
      select
        pre_bids.id,
        pre_bids.lot_slug,
        pre_bids.user_id,
        users.public_alias,
        pre_bids.amount_cents,
        pre_bids.created_at
      from platform_pre_bids as pre_bids
      inner join platform_users as users
        on users.id = pre_bids.user_id
      order by pre_bids.created_at desc
    `;

    return rows
      .map((row) => {
        const lot = lotMap.get(row.lot_slug);

        if (!lot) {
          return null;
        }

        return {
          id: row.id,
          lotSlug: lot.slug,
          lotTitle: lot.title,
          lotCode: lot.lotCode,
          statusKey: lot.statusKey,
          statusLabel: getLotStatusDefinition(lot.statusKey).label,
          userAlias: row.public_alias,
          amountLabel: formatCurrencyBRL(row.amount_cents),
          createdAt: toIsoString(row.created_at),
        } satisfies AdminPreBidItem;
      })
      .filter((item): item is AdminPreBidItem => Boolean(item))
      .filter((item) => {
        if (filters.lotSlug && item.lotSlug !== filters.lotSlug) {
          return false;
        }

        if (filters.status && item.statusKey !== filters.status) {
          return false;
        }

        return parseDateWithinRange(item.createdAt, filters.from, filters.to);
      });
  });
}

export async function listAdminActivity(filters: AdminActivityFilters) {
  assertDatabaseConfigured();

  const lotMap = await getLotMap();

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<ActivityRow[]>`
      select
        id,
        kind,
        lot_slug,
        actor_public_alias,
        amount_cents,
        title,
        description,
        source,
        audience,
        created_at
      from platform_activities
      order by created_at desc
      limit 200
    `;

    return rows
      .map((row) => {
        const lot = row.lot_slug ? lotMap.get(row.lot_slug) : null;
        const createdAt = toIsoString(row.created_at);

        return {
          id: row.id,
          kind: row.kind,
          title: row.title ?? buildActivityTitle(row.kind, lot),
          description: buildActivityDescription(row, lot),
          audience: row.audience,
          source: row.source,
          lotSlug: lot?.slug,
          lotTitle: lot?.title,
          lotCode: lot?.lotCode,
          actorAlias: row.actor_public_alias ?? undefined,
          amountLabel: row.amount_cents ? formatCurrencyBRL(row.amount_cents) : undefined,
          createdAt,
          createdAtLabel: formatDateTimeBR(createdAt),
        } satisfies AdminActivityItem;
      })
      .filter((item) => {
        if (filters.type && item.kind !== filters.type) {
          return false;
        }

        if (filters.audience && item.audience !== filters.audience) {
          return false;
        }

        if (filters.lotSlug && item.lotSlug !== filters.lotSlug) {
          return false;
        }

        if (filters.status && item.lotSlug) {
          const lot = lotMap.get(item.lotSlug);

          if (!lot || lot.statusKey !== filters.status) {
            return false;
          }
        }

        return parseDateWithinRange(item.createdAt, filters.from, filters.to);
      });
  });
}

export async function createManualAdminActivity(input: {
  lotId?: string;
  title: string;
  description: string;
  audience: "admin" | "public";
}) {
  assertDatabaseConfigured();

  const lot = input.lotId ? await getLotById(input.lotId) : null;

  return withPlatformDatabase((sql) =>
    sql.begin(async (transaction) => {
      await insertActivity(transaction, {
        kind: "operational_note",
        lotSlug: lot?.slug,
        title: input.title,
        description: input.description,
        audience: input.audience,
      });
    }),
  );
}
