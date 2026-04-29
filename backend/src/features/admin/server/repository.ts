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
import {
  isDatabaseConfigured,
  shouldUseLocalSeedData,
} from "@/backend/features/platform/server/mode";
import { formatCpf } from "@/shared/lib/cpf";
import { resolveMaximumPreBidAmountCents } from "@/shared/lib/pre-bid-policy";
import { formatCurrencyBRL, formatDateTimeBR, formatPhoneBR, slugify } from "@/shared/lib/utils";

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
  user_name: string;
  user_email: string;
  user_cpf: string;
  user_phone: string;
  amount_cents: number;
  note: string | null;
  lot_pre_bid_count: number;
  created_at: string | Date;
};

type AdminUserRow = {
  id: string;
  public_alias: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  city: string | null;
  created_at: string | Date;
  interests_count: number;
  pre_bids_count: number;
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

type ContactLeadRow = {
  id: string;
  name: string;
  phone: string;
  origin: string;
  email: string | null;
  reference: string | null;
  message: string | null;
  created_at: string | Date;
};

type DashboardSeriesRow = {
  kind: "lead" | "preBid" | "user" | "lot";
  created_at: string | Date;
};

type DashboardPreBidActivityRow = {
  id: string;
  lot_slug: string;
  public_alias: string;
  amount_cents: number;
  created_at: string | Date;
};

type DashboardUserActivityRow = {
  id: string;
  public_alias: string;
  created_at: string | Date;
};

type DashboardLotActivityRow = {
  id: string;
  slug: string;
  lot_code: string;
  title: string;
  created_at: string | Date;
  updated_at: string | Date;
};

type LotMovementRow = {
  lot_slug: string;
  pre_bids_count: number;
  top_amount_cents: number | null;
  last_pre_bid_at: string | Date | null;
};

type LotInterestMovementRow = {
  lot_slug: string;
  interests_count: number;
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
  maximumPreBidAmountCents?: number | null;
  statusKey: LotStatusKey;
  isFeatured: boolean;
  isVisible: boolean;
};

export type AdminDashboardPeriod = "today" | "week" | "month" | "year";

export type AdminDashboardMetric = {
  label: string;
  value: string;
  helper: string;
  tone: "orange" | "blue" | "purple" | "green";
};

export type AdminDashboardActivityPoint = {
  key: string;
  label: string;
  leads: number;
  preBids: number;
  users: number;
  lots: number;
  total: number;
};

export type AdminDashboardRecentItem = {
  id: string;
  type: "lead" | "pre-bid" | "user" | "lot" | "interest" | "system";
  title: string;
  description: string;
  createdAt: string;
  createdAtLabel: string;
  href?: string;
};

export type AdminDashboardLotMovement = {
  slug: string;
  title: string;
  lotCode: string;
  statusLabel: string;
  preBidsCount: number;
  interestsCount: number;
  score: number;
  topAmountLabel?: string;
  lastMovementLabel?: string;
};

export type AdminDashboardData = {
  period: AdminDashboardPeriod;
  periodLabel: string;
  totalLots: number;
  activeLots: number;
  inactiveLots: number;
  featuredLots: number;
  totalUsers: number;
  totalLeads: number;
  totalInterests: number;
  totalPreBids: number;
  referenceValueCents: number;
  referenceValueLabel: string;
  activitySeries: AdminDashboardActivityPoint[];
  recentMovements: AdminDashboardRecentItem[];
  topMovingLots: AdminDashboardLotMovement[];
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
  preBidCount: number;
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
  userName: string;
  userCpf: string;
  userPhone: string;
  userEmail: string;
  amountLabel: string;
  maximumAllowedAmountLabel: string;
  isAboveOperationalLimit: boolean;
  note?: string;
  lotPreBidCount: number;
  createdAt: string;
  createdAtLabel: string;
};

export type AdminUserItem = {
  id: string;
  publicAlias: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  city?: string;
  statusLabel: string;
  interestsCount: number;
  preBidsCount: number;
  createdAt: string;
  createdAtLabel: string;
};

export type AdminContactLeadItem = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  origin: string;
  reference?: string;
  message?: string;
  createdAt: string;
  createdAtLabel: string;
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

export type AdminUserFilters = {
  query?: string;
  from?: string;
  to?: string;
};

export type AdminLeadFilters = {
  query?: string;
  origin?: string;
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
  if (!isDatabaseConfigured() || shouldUseLocalSeedData()) {
    throw new Error("Banco de dados do painel administrativo não configurado.");
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

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalDateKey(value: Date) {
  return [
    value.getFullYear(),
    padDatePart(value.getMonth() + 1),
    padDatePart(value.getDate()),
  ].join("-");
}

function formatLocalHourKey(value: Date) {
  return `${formatLocalDateKey(value)}-${padDatePart(value.getHours())}`;
}

function formatLocalMonthKey(value: Date) {
  return `${value.getFullYear()}-${padDatePart(value.getMonth() + 1)}`;
}

function addDays(value: Date, amount: number) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate() + amount,
  );
}

function addMonths(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

function getAdminDashboardPeriod(value?: string): AdminDashboardPeriod {
  if (value === "today" || value === "week" || value === "month" || value === "year") {
    return value;
  }

  return "month";
}

function getPeriodConfig(period: AdminDashboardPeriod) {
  const now = new Date();

  if (period === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = addDays(start, 1);
    const points = Array.from({ length: 24 }, (_, hour) => ({
      key: `${formatLocalDateKey(start)}-${padDatePart(hour)}`,
      label: `${padDatePart(hour)}h`,
    }));

    return {
      start,
      end,
      periodLabel: "Hoje",
      bucket: "hour" as const,
      points,
    };
  }

  if (period === "week") {
    const start = addDays(
      new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      -6,
    );
    const end = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), 1);
    const points = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);

      return {
        key: formatLocalDateKey(date),
        label: new Intl.DateTimeFormat("pt-BR", {
          weekday: "short",
          day: "2-digit",
        }).format(date),
      };
    });

    return {
      start,
      end,
      periodLabel: "Semana",
      bucket: "day" as const,
      points,
    };
  }

  if (period === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    const points = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), index, 1);

      return {
        key: formatLocalMonthKey(date),
        label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date),
      };
    });

    return {
      start,
      end,
      periodLabel: String(now.getFullYear()),
      bucket: "month" as const,
      points,
    };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = addMonths(start, 1);
  const dayCount = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  const points = Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(start, index);

    return {
      key: formatLocalDateKey(date),
      label: padDatePart(date.getDate()),
    };
  });

  return {
    start,
    end,
    periodLabel: new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(start),
    bucket: "day" as const,
    points,
  };
}

function getSeriesKey(value: string | Date, bucket: "hour" | "day" | "month") {
  const date = value instanceof Date ? value : new Date(value);

  if (bucket === "hour") {
    return formatLocalHourKey(date);
  }

  if (bucket === "month") {
    return formatLocalMonthKey(date);
  }

  return formatLocalDateKey(date);
}

function buildDashboardSeries(
  rows: DashboardSeriesRow[],
  period: AdminDashboardPeriod,
) {
  const config = getPeriodConfig(period);
  const series = new Map(
    config.points.map((point) => [
      point.key,
      {
        ...point,
        leads: 0,
        preBids: 0,
        users: 0,
        lots: 0,
        total: 0,
      } satisfies AdminDashboardActivityPoint,
    ]),
  );

  rows.forEach((row) => {
    const key = getSeriesKey(row.created_at, config.bucket);
    const point = series.get(key);

    if (!point) {
      return;
    }

    if (row.kind === "lead") {
      point.leads += 1;
    } else if (row.kind === "preBid") {
      point.preBids += 1;
    } else if (row.kind === "user") {
      point.users += 1;
    } else {
      point.lots += 1;
    }

    point.total += 1;
  });

  return Array.from(series.values());
}

function buildLeadDescription(row: ContactLeadRow) {
  return [
    row.reference ? `Referência: ${row.reference}` : null,
    row.message ? row.message : null,
  ].filter(Boolean).join(" · ") || `Origem ${row.origin}`;
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

export async function getAdminDashboardSummary(periodInput?: string) {
  assertDatabaseConfigured();

  const period = getAdminDashboardPeriod(periodInput);
  const periodConfig = getPeriodConfig(period);
  const lots = await listLots({ includeHidden: true });
  const lotMap = new Map(lots.map((lot) => [lot.slug, lot]));
  const activeLots = lots.filter((lot) =>
    isLotPubliclyVisible(lot.statusKey, lot.isVisible),
  );

  return withPlatformDatabase(async (sql) => {
    const [
      usersCount,
      interestsCount,
      preBidsCount,
      leadsCount,
      seriesRows,
      recentLeads,
      recentPreBids,
      recentUsers,
      recentLots,
      recentSystemActivity,
      movementRows,
      movementInterestRows,
    ] = await Promise.all([
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_users
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_interests
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_pre_bids
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_contact_leads
      `,
      sql<DashboardSeriesRow[]>`
        select 'lead' as kind, created_at
        from platform_contact_leads
        where created_at >= ${periodConfig.start.toISOString()}
          and created_at < ${periodConfig.end.toISOString()}
        union all
        select 'preBid' as kind, created_at
        from platform_pre_bids
        where created_at >= ${periodConfig.start.toISOString()}
          and created_at < ${periodConfig.end.toISOString()}
        union all
        select 'user' as kind, created_at
        from platform_users
        where created_at >= ${periodConfig.start.toISOString()}
          and created_at < ${periodConfig.end.toISOString()}
        union all
        select 'lot' as kind, created_at
        from platform_lots
        where created_at >= ${periodConfig.start.toISOString()}
          and created_at < ${periodConfig.end.toISOString()}
      `,
      sql<ContactLeadRow[]>`
        select
          id,
          name,
          phone,
          origin,
          email,
          reference,
          message,
          created_at
        from platform_contact_leads
        order by created_at desc
        limit 8
      `,
      sql<DashboardPreBidActivityRow[]>`
        select
          pre_bids.id,
          pre_bids.lot_slug,
          users.public_alias,
          pre_bids.amount_cents,
          pre_bids.created_at
        from platform_pre_bids as pre_bids
        inner join platform_users as users
          on users.id = pre_bids.user_id
        order by pre_bids.created_at desc
        limit 8
      `,
      sql<DashboardUserActivityRow[]>`
        select
          id,
          public_alias,
          created_at
        from platform_users
        order by created_at desc
        limit 8
      `,
      sql<DashboardLotActivityRow[]>`
        select
          id,
          slug,
          lot_code,
          title,
          created_at,
          updated_at
        from platform_lots
        order by greatest(created_at, updated_at) desc
        limit 8
      `,
      sql<ActivityRow[]>`
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
        limit 8
      `,
      sql<LotMovementRow[]>`
        select
          lot_slug,
          count(*)::int as pre_bids_count,
          max(amount_cents)::int as top_amount_cents,
          max(created_at) as last_pre_bid_at
        from platform_pre_bids
        group by lot_slug
      `,
      sql<LotInterestMovementRow[]>`
        select
          lot_slug,
          count(*)::int as interests_count
        from platform_interests
        group by lot_slug
      `,
    ]);

    const interestMovementMap = new Map(
      movementInterestRows.map((row) => [row.lot_slug, row.interests_count]),
    );
    const topMovingLots = movementRows
      .map((row) => {
        const lot = lotMap.get(row.lot_slug);

        if (!lot) {
          return null;
        }

        const interestsCount = interestMovementMap.get(row.lot_slug) ?? 0;
        const score = row.pre_bids_count * 3 + interestsCount;

        return {
          slug: lot.slug,
          title: lot.title,
          lotCode: lot.lotCode,
          statusLabel: getLotStatusDefinition(lot.statusKey).label,
          preBidsCount: row.pre_bids_count,
          interestsCount,
          score,
          ...(row.top_amount_cents
            ? { topAmountLabel: formatCurrencyBRL(row.top_amount_cents) }
            : {}),
          ...(row.last_pre_bid_at
            ? { lastMovementLabel: formatDateTimeBR(row.last_pre_bid_at) }
            : {}),
        } satisfies AdminDashboardLotMovement;
      })
      .filter((item): item is AdminDashboardLotMovement => Boolean(item))
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);

    const recentMovements = [
      ...recentLeads.map((lead) => ({
        id: `lead:${lead.id}`,
        type: "lead" as const,
        title: "Novo lead recebido",
        description: buildLeadDescription(lead),
        createdAt: toIsoString(lead.created_at),
        createdAtLabel: formatDateTimeBR(lead.created_at),
        href: "/admin/leads",
      })),
      ...recentPreBids.map((preBid) => {
        const lot = lotMap.get(preBid.lot_slug);

        return {
          id: `pre-bid:${preBid.id}`,
          type: "pre-bid" as const,
          title: lot ? `Pré-lance em ${lot.lotCode}` : "Novo pré-lance registrado",
          description: `${preBid.public_alias} registrou ${formatCurrencyBRL(preBid.amount_cents)}.`,
          createdAt: toIsoString(preBid.created_at),
          createdAtLabel: formatDateTimeBR(preBid.created_at),
          href: `/admin/pre-lances?lotSlug=${encodeURIComponent(preBid.lot_slug)}`,
        };
      }),
      ...recentUsers.map((user) => ({
        id: `user:${user.id}`,
        type: "user" as const,
        title: "Novo usuário cadastrado",
        description: `${user.public_alias} criou uma conta na plataforma.`,
        createdAt: toIsoString(user.created_at),
        createdAtLabel: formatDateTimeBR(user.created_at),
        href: "/admin/usuarios",
      })),
      ...recentLots.map((lot) => ({
        id: `lot:${lot.id}`,
        type: "lot" as const,
        title: `${lot.lot_code} atualizado`,
        description: lot.title,
        createdAt: toIsoString(lot.updated_at ?? lot.created_at),
        createdAtLabel: formatDateTimeBR(lot.updated_at ?? lot.created_at),
        href: "/admin/lotes",
      })),
      ...recentSystemActivity.map((activity) => {
        const lot = activity.lot_slug ? lotMap.get(activity.lot_slug) : null;

        return {
          id: `system:${activity.id}`,
          type: activity.kind === "interest_registered"
            ? ("interest" as const)
            : ("system" as const),
          title: activity.title ?? buildActivityTitle(activity.kind, lot),
          description: buildActivityDescription(activity, lot),
          createdAt: toIsoString(activity.created_at),
          createdAtLabel: formatDateTimeBR(activity.created_at),
          href: lot?.slug ? `/admin/lotes` : "/admin/atividade",
        };
      }),
    ]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )
      .slice(0, 12);

    const referenceValueCents = activeLots.reduce(
      (total, lot) => total + lot.pricing.referenceValueCents,
      0,
    );

    return {
      period,
      periodLabel: periodConfig.periodLabel,
      totalLots: lots.length,
      activeLots: activeLots.length,
      inactiveLots: lots.length - activeLots.length,
      featuredLots: lots.filter((lot) => lot.isFeatured).length,
      totalUsers: usersCount[0]?.count ?? 0,
      totalLeads: leadsCount[0]?.count ?? 0,
      totalInterests: interestsCount[0]?.count ?? 0,
      totalPreBids: preBidsCount[0]?.count ?? 0,
      referenceValueCents,
      referenceValueLabel: formatCurrencyBRL(referenceValueCents),
      activitySeries: buildDashboardSeries(seriesRows, period),
      recentMovements,
      topMovingLots,
      recentActivity: recentSystemActivity.map((row) => {
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
      }),
    } satisfies AdminDashboardData;
  });
}

export async function getAdminDashboard(periodInput?: string) {
  return getAdminDashboardSummary(periodInput);
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
  const preBidCountRows = await withPlatformDatabase((sql) =>
    sql<{ lot_slug: string; count: number }[]>`
      select lot_slug, count(*)::int as count
      from platform_pre_bids
      group by lot_slug
    `,
  );
  const preBidCounts = new Map(
    preBidCountRows.map((row) => [row.lot_slug, row.count]),
  );

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
        preBidCount: preBidCounts.get(lot.slug) ?? 0,
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
          maximum_pre_bid_amount_cents,
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
          ${input.maximumPreBidAmountCents ?? null},
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
          maximum_pre_bid_amount_cents = excluded.maximum_pre_bid_amount_cents,
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
    maximumPreBidAmountCents: existing.pricing.maximumPreBidAmountCents,
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
        users.name as user_name,
        users.email as user_email,
        users.cpf as user_cpf,
        users.phone as user_phone,
        pre_bids.amount_cents,
        pre_bids.note,
        count(*) over (partition by pre_bids.lot_slug)::int as lot_pre_bid_count,
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

        const maximumAllowedAmountCents = resolveMaximumPreBidAmountCents({
          referenceValueCents: lot.pricing.referenceValueCents,
          maximumPreBidAmountCents: lot.pricing.maximumPreBidAmountCents,
        });

        return {
          id: row.id,
          lotSlug: lot.slug,
          lotTitle: lot.title,
          lotCode: lot.lotCode,
          statusKey: lot.statusKey,
          statusLabel: getLotStatusDefinition(lot.statusKey).label,
          userAlias: row.public_alias,
          userName: row.user_name,
          userCpf: formatCpf(row.user_cpf),
          userPhone: formatPhoneBR(row.user_phone),
          userEmail: row.user_email,
          amountLabel: formatCurrencyBRL(row.amount_cents),
          maximumAllowedAmountLabel: formatCurrencyBRL(maximumAllowedAmountCents),
          isAboveOperationalLimit: row.amount_cents > maximumAllowedAmountCents,
          ...(row.note ? { note: row.note } : {}),
          lotPreBidCount: row.lot_pre_bid_count,
          createdAt: toIsoString(row.created_at),
          createdAtLabel: formatDateTimeBR(row.created_at),
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

export async function listAdminUsers(filters: AdminUserFilters) {
  assertDatabaseConfigured();

  const normalizedSearch = normalizeQuery(filters.query);

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<AdminUserRow[]>`
      select
        users.id,
        users.public_alias,
        users.name,
        users.email,
        users.cpf,
        users.phone,
        users.city,
        users.created_at,
        coalesce(interests.count, 0)::int as interests_count,
        coalesce(pre_bids.count, 0)::int as pre_bids_count
      from platform_users as users
      left join (
        select user_id, count(*)::int as count
        from platform_interests
        group by user_id
      ) as interests on interests.user_id = users.id
      left join (
        select user_id, count(*)::int as count
        from platform_pre_bids
        group by user_id
      ) as pre_bids on pre_bids.user_id = users.id
      order by users.created_at desc
    `;

    return rows
      .map((row) => {
        const createdAt = toIsoString(row.created_at);

        return {
          id: row.id,
          publicAlias: row.public_alias,
          name: row.name,
          email: row.email,
          cpf: formatCpf(row.cpf),
          phone: formatPhoneBR(row.phone),
          ...(row.city ? { city: row.city } : {}),
          statusLabel: "Conta ativa",
          interestsCount: row.interests_count,
          preBidsCount: row.pre_bids_count,
          createdAt,
          createdAtLabel: formatDateTimeBR(createdAt),
        } satisfies AdminUserItem;
      })
      .filter((item) => {
        if (normalizedSearch) {
          const searchable = normalizeQuery(
            [
              item.name,
              item.email,
              item.cpf,
              item.cpf.replace(/\D/g, ""),
              item.phone,
              item.phone.replace(/\D/g, ""),
              item.publicAlias,
              item.city ?? "",
            ].join(" "),
          );

          if (!searchable?.includes(normalizedSearch)) {
            return false;
          }
        }

        return parseDateWithinRange(item.createdAt, filters.from, filters.to);
      });
  });
}

export async function listAdminContactLeads(filters: AdminLeadFilters) {
  assertDatabaseConfigured();

  const normalizedSearch = normalizeQuery(filters.query);
  const normalizedOrigin = normalizeQuery(filters.origin);

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<ContactLeadRow[]>`
      select
        id,
        name,
        phone,
        origin,
        email,
        reference,
        message,
        created_at
      from platform_contact_leads
      order by created_at desc
      limit 400
    `;

    return rows
      .map((row) => {
        const createdAt = toIsoString(row.created_at);

        return {
          id: row.id,
          name: row.name,
          phone: formatPhoneBR(row.phone),
          ...(row.email ? { email: row.email } : {}),
          origin: row.origin,
          ...(row.reference ? { reference: row.reference } : {}),
          ...(row.message ? { message: row.message } : {}),
          createdAt,
          createdAtLabel: formatDateTimeBR(createdAt),
        } satisfies AdminContactLeadItem;
      })
      .filter((lead) => {
        if (normalizedSearch) {
          const searchable = normalizeQuery(
            [
              lead.name,
              lead.phone,
              lead.phone.replace(/\D/g, ""),
              lead.email ?? "",
              lead.origin,
              lead.reference ?? "",
              lead.message ?? "",
            ].join(" "),
          );

          if (!searchable?.includes(normalizedSearch)) {
            return false;
          }
        }

        if (normalizedOrigin) {
          const origin = normalizeQuery(lead.origin);

          if (!origin?.includes(normalizedOrigin)) {
            return false;
          }
        }

        return parseDateWithinRange(lead.createdAt, filters.from, filters.to);
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
