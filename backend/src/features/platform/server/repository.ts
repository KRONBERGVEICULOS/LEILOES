import "server-only";

import { randomUUID } from "node:crypto";

import { createOfferWhatsAppLink, createWhatsAppLink } from "@/shared/config/site";
import { isValidCpf, normalizeCpf } from "@/shared/lib/cpf";
import {
  DEFAULT_PRE_BID_MAX_MULTIPLIER_BASIS_POINTS,
  resolveMaximumPreBidAmountCents,
  resolvePreBidPolicy,
} from "@/shared/lib/pre-bid-policy";
import { getLotStatusDefinition } from "@/backend/features/auctions/lib/lot-status";
import { lots as seedLots } from "@/backend/features/auctions/data/catalog";
import { getLotBySlug } from "@/backend/features/auctions/server/catalog";
import {
  isValidPhone,
  normalizeEmail,
  normalizeSignupInput,
} from "@/backend/features/platform/lib/user-normalization";
import { ensurePlatformCatalogSeed } from "@/backend/features/platform/server/catalog-seed";
import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import {
  invalidatePublicActivityCache,
  invalidatePublicCatalogCache,
  readPublicCache,
  writePublicCache,
} from "@/backend/features/platform/server/public-cache";
import { shouldUseLocalSeedData } from "@/backend/features/platform/server/mode";
import { formatCurrencyBRL, formatDateTimeBR } from "@/shared/lib/utils";
import type {
  ActivityFeedItem,
  AuthenticatedUser,
  DashboardInterest,
  DashboardPreBid,
  LotPlatformSnapshot,
  PlatformActivity,
  PublicPreBidItem,
  UserDashboard,
} from "@/backend/features/platform/types";

type DatabaseUserRow = {
  id: string;
  public_alias: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  password_hash: string;
  created_at: string | Date;
};

type DatabaseActivityRow = {
  id: string;
  kind: PlatformActivity["kind"];
  lot_slug: string | null;
  actor_user_id: string | null;
  actor_public_alias: string | null;
  amount_cents: number | null;
  title: string | null;
  description: string | null;
  audience: string;
  created_at: string | Date;
};

type DatabaseInterestRow = {
  id: string;
  lot_slug: string;
  created_at: string | Date;
};

type DatabasePreBidRow = {
  id: string;
  lot_slug: string;
  amount_cents: number;
  created_at: string | Date;
};

type DatabasePublicPreBidRow = {
  id: string;
  bidder_name: string;
  amount_cents: number;
  created_at: string | Date;
};

export class UserRegistrationConflictError extends Error {
  constructor(
    readonly field: "email" | "cpf",
    message: string,
  ) {
    super(message);
    this.name = "UserRegistrationConflictError";
  }
}

async function requireLot(lotSlug: string) {
  const lot = await getLotBySlug(lotSlug, { includeHidden: true });

  if (!lot) {
    throw new Error("O lote informado não foi encontrado.");
  }

  return lot;
}

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapUserRowToAuthenticatedUser(row: DatabaseUserRow): AuthenticatedUser {
  return {
    id: row.id,
    publicAlias: row.public_alias,
    name: row.name,
    email: row.email,
    phone: row.phone,
    ...(row.city ? { city: row.city } : {}),
    createdAt: toIsoString(row.created_at),
  };
}

function mapUserRowWithPassword(row: DatabaseUserRow) {
  return {
    ...mapUserRowToAuthenticatedUser(row),
    passwordHash: row.password_hash,
  };
}

async function createActivityItem(
  activity: DatabaseActivityRow,
  visibility: "public" | "authenticated",
): Promise<ActivityFeedItem> {
  const lot = activity.lot_slug
    ? await getLotBySlug(activity.lot_slug, { includeHidden: true })
    : null;
  const createdAt = toIsoString(activity.created_at);

  if (activity.title && activity.description) {
    return {
      id: activity.id,
      createdAt,
      lotSlug: lot?.slug,
      lotCode: lot?.lotCode,
      title: activity.title,
      description: activity.description,
    };
  }

  switch (activity.kind) {
    case "lot_available":
      return {
        id: activity.id,
        createdAt,
        lotSlug: lot?.slug,
        lotCode: lot?.lotCode,
        title: lot ? `${lot.lotCode} entrou no radar online` : "Novo lote disponível",
        description: lot
          ? "Novo lote disponível para pré-lance com acompanhamento via cadastro."
          : "Uma nova oportunidade foi liberada para acompanhamento online.",
      };
    case "user_registered":
      return {
        id: activity.id,
        createdAt,
        title: "Novo cadastro liberado",
        description:
          "Mais um interessado agora acompanha oportunidades e atendimento dentro da plataforma.",
      };
    case "interest_registered":
      return {
        id: activity.id,
        createdAt,
        lotSlug: lot?.slug,
        lotCode: lot?.lotCode,
        title: lot ? `Novo interesse no ${lot.lotCode}` : "Novo interesse registrado",
        description:
          visibility === "authenticated" && activity.actor_public_alias
            ? `${activity.actor_public_alias} começou a acompanhar esta oportunidade.`
            : "Um usuário cadastrado começou a acompanhar esta oportunidade.",
      };
    case "prebid_registered":
      return {
        id: activity.id,
        createdAt,
        lotSlug: lot?.slug,
        lotCode: lot?.lotCode,
        title: lot ? `Pré-lance registrado no ${lot.lotCode}` : "Novo pré-lance registrado",
        description:
          visibility === "authenticated" &&
          activity.actor_public_alias &&
          activity.amount_cents
            ? `${activity.actor_public_alias} registrou ${formatCurrencyBRL(activity.amount_cents)} nesta oportunidade.`
            : "Um usuário cadastrado registrou um pré-lance nesta oportunidade.",
      };
    default:
      return {
        id: activity.id,
        createdAt,
        title: "Atualização da plataforma",
        description: "Houve uma atualização recente nesta oportunidade.",
      };
  }
}

function buildPublicAlias(aliasNumber: number) {
  return `Participante KR-${String(aliasNumber).padStart(3, "0")}`;
}

function maskBidderName(name: string) {
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  const firstCharacter = firstName[0]?.toLocaleUpperCase("pt-BR") ?? "P";
  const maskLength = Math.max(firstName.length - 1, 3);

  return `${firstCharacter}${"*".repeat(maskLength)}`;
}

function mapPublicPreBidRows(rows: DatabasePublicPreBidRow[]): PublicPreBidItem[] {
  return rows.map((row, index) => {
    const createdAt = toIsoString(row.created_at);

    return {
      id: row.id,
      position: index + 1,
      maskedName: maskBidderName(row.bidder_name),
      amountCents: row.amount_cents,
      amountLabel: formatCurrencyBRL(row.amount_cents),
      createdAt,
      createdAtLabel: formatDateTimeBR(createdAt),
    };
  });
}

function isDatabaseErrorCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

function getDatabaseErrorConstraint(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  if ("constraint_name" in error && typeof error.constraint_name === "string") {
    return error.constraint_name;
  }

  if ("constraint" in error && typeof error.constraint === "string") {
    return error.constraint;
  }

  return null;
}

function getLotCurrentState(
  topBidAmountCents: number | null,
  lot: Awaited<ReturnType<typeof getLotBySlug>>,
) {
  if (!lot) {
    throw new Error("O lote informado não foi encontrado.");
  }

  const baselineCurrentValue = lot.pricing.referenceValueCents;
  const currentValueCents = Math.max(topBidAmountCents ?? 0, baselineCurrentValue);
  const preBidPolicy = resolvePreBidPolicy({
    referenceValueCents: lot.pricing.referenceValueCents,
    currentValueCents,
    minimumIncrementCents: lot.pricing.minimumIncrementCents,
    maximumPreBidAmountCents: lot.pricing.maximumPreBidAmountCents,
  });
  const status = getLotStatusDefinition(lot.statusKey);

  return {
    status,
    lot,
    baselineCurrentValue,
    currentValueCents,
    nextAllowedAmountCents: preBidPolicy.nextAllowedAmountCents,
    maximumAllowedAmountCents: preBidPolicy.maximumAllowedAmountCents,
    maximumAllowedAmountSource: preBidPolicy.usesManualMaximum
      ? ("lot" as const)
      : ("global" as const),
  };
}

function getEffectiveMaximumPreBidAmountCents(
  lot: Awaited<ReturnType<typeof getLotBySlug>>,
) {
  if (!lot) {
    throw new Error("O lote informado não foi encontrado.");
  }

  return resolveMaximumPreBidAmountCents({
    referenceValueCents: lot.pricing.referenceValueCents,
    maximumPreBidAmountCents: lot.pricing.maximumPreBidAmountCents,
  });
}

async function getTopLotBidAmount(lotSlug: string) {
  if (shouldUseLocalSeedData()) {
    void lotSlug;
    return null;
  }

  const lot = await requireLot(lotSlug);
  const maximumAllowedAmountCents = getEffectiveMaximumPreBidAmountCents(lot);

  return withPlatformDatabase(async (sql) => {
    const [row] = await sql<{ amount_cents: number }[]>`
      select amount_cents
      from platform_pre_bids
      where lot_slug = ${lotSlug}
        and amount_cents <= ${maximumAllowedAmountCents}
      order by amount_cents desc, created_at desc
      limit 1
    `;

    return row?.amount_cents ?? null;
  });
}

export async function findUserByEmail(email: string) {
  if (shouldUseLocalSeedData()) {
    void email;
    return null;
  }

  return withPlatformDatabase(async (sql) => {
    const [row] = await sql<DatabaseUserRow[]>`
      select
        id,
        public_alias,
        name,
        email,
        phone,
        city,
        password_hash,
        created_at
      from platform_users
      where email = ${normalizeEmail(email)}
      limit 1
    `;

    return row ? mapUserRowWithPassword(row) : null;
  });
}

export async function findUserByCpf(cpf: string) {
  if (shouldUseLocalSeedData()) {
    void cpf;
    return null;
  }

  const normalizedCpf = normalizeCpf(cpf);

  return withPlatformDatabase(async (sql) => {
    const [row] = await sql<{ id: string }[]>`
      select id
      from platform_users
      where cpf = ${normalizedCpf}
      limit 1
    `;

    return row ?? null;
  });
}

export async function getUserById(userId: string) {
  if (shouldUseLocalSeedData()) {
    void userId;
    return null;
  }

  return withPlatformDatabase(async (sql) => {
    const [row] = await sql<DatabaseUserRow[]>`
      select
        id,
        public_alias,
        name,
        email,
        phone,
        city,
        password_hash,
        created_at
      from platform_users
      where id = ${userId}
      limit 1
    `;

    return row ? mapUserRowToAuthenticatedUser(row) : null;
  });
}

export async function createUserRecord(input: {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  city?: string;
  passwordHash: string;
}) {
  if (shouldUseLocalSeedData()) {
    void input;
    throw new Error(
      "Banco de dados não configurado para criar cadastros e persistir usuários.",
    );
  }

  const normalizedInput = normalizeSignupInput(input);

  if (normalizedInput.name.length < 3) {
    throw new Error("Nome de cadastro inválido.");
  }

  if (!isValidCpf(normalizedInput.cpf)) {
    throw new Error("CPF de cadastro inválido.");
  }

  if (!isValidPhone(normalizedInput.phone)) {
    throw new Error("Telefone de cadastro inválido.");
  }

  if (normalizedInput.city && normalizedInput.city.length > 60) {
    throw new Error("Cidade de cadastro inválida.");
  }

  try {
    const user = await withPlatformDatabase((sql) =>
      sql.begin(async (transaction) => {
        const [sequenceRow] = await transaction<{ alias_number: number }[]>`
          select nextval('platform_public_alias_seq')::int as alias_number
        `;

        const aliasNumber = sequenceRow?.alias_number ?? seedLots.length + 201;
        const userId = randomUUID();
        const publicAlias = buildPublicAlias(aliasNumber);
        const createdAt = new Date().toISOString();

        await transaction`
          insert into platform_users (
            id,
            public_alias,
            name,
            email,
            cpf,
            phone,
            city,
            password_hash,
            created_at
          )
          values (
            ${userId},
            ${publicAlias},
            ${normalizedInput.name},
            ${normalizedInput.email},
            ${normalizedInput.cpf},
            ${normalizedInput.phone},
            ${normalizedInput.city ?? null},
            ${input.passwordHash},
            ${createdAt}
          )
        `;

        await transaction`
          insert into platform_activities (
            id,
            kind,
            actor_user_id,
            actor_public_alias,
            created_at
          )
          values (
            ${randomUUID()},
            'user_registered',
            ${userId},
            ${publicAlias},
            ${createdAt}
          )
        `;

        return {
          id: userId,
          publicAlias,
          name: normalizedInput.name,
          email: normalizedInput.email,
          phone: normalizedInput.phone,
          ...(normalizedInput.city ? { city: normalizedInput.city } : {}),
          createdAt,
        };
      }),
    );

    await invalidatePublicActivityCache();

    return user;
  } catch (error) {
    if (isDatabaseErrorCode(error, "23505")) {
      const constraint = getDatabaseErrorConstraint(error);

      if (constraint?.includes("cpf")) {
        throw new UserRegistrationConflictError(
          "cpf",
          "Já existe uma conta cadastrada com este CPF.",
        );
      }

      throw new UserRegistrationConflictError(
        "email",
        "Já existe uma conta com este e-mail.",
      );
    }

    if (isDatabaseErrorCode(error, "23514")) {
      const constraint = getDatabaseErrorConstraint(error);

      if (constraint?.includes("cpf")) {
        throw new Error("O CPF informado não passou na validação do banco.");
      }
    }

    throw error;
  }
}

export async function listPublicActivity(limit = 6) {
  if (shouldUseLocalSeedData()) {
    const rows: DatabaseActivityRow[] = seedLots.slice(0, limit).map((lot, index) => ({
      id: `seed-lot-available-${lot.slug}`,
      kind: "lot_available",
      lot_slug: lot.slug,
      actor_user_id: null,
      actor_public_alias: null,
      amount_cents: null,
      title: null,
      description: null,
      audience: "public",
      created_at:
        lot.createdAt ??
        new Date(Date.UTC(2026, 3, 11, 18, 10, 0) - index * 1000 * 60 * 90).toISOString(),
    }));

    return Promise.all(rows.map((row) => createActivityItem(row, "public")));
  }

  await ensurePlatformCatalogSeed();

  const cachedActivity = await readPublicCache<ActivityFeedItem[]>("activity", [
    "valid-prebids-v2",
    "public",
    String(limit),
  ]);

  if (cachedActivity) {
    return cachedActivity;
  }

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<DatabaseActivityRow[]>`
      select
        activities.id,
        activities.kind,
        activities.lot_slug,
        activities.actor_user_id,
        activities.actor_public_alias,
        activities.amount_cents,
        activities.title,
        activities.description,
        activities.audience,
        activities.created_at
      from platform_activities as activities
      left join platform_lots as lots
        on lots.slug = activities.lot_slug
      where activities.audience = 'public'
        and (
          activities.kind <> 'prebid_registered'
          or activities.amount_cents <= coalesce(
            lots.maximum_pre_bid_amount_cents,
            round(lots.reference_value_cents::numeric * ${DEFAULT_PRE_BID_MAX_MULTIPLIER_BASIS_POINTS} / 10000)::int
          )
        )
      order by activities.created_at desc
      limit ${limit}
    `;

    const items = await Promise.all(rows.map((row) => createActivityItem(row, "public")));
    await writePublicCache(
      "activity",
      ["valid-prebids-v2", "public", String(limit)],
      items,
      45,
    );

    return items;
  });
}

export async function getLotPlatformSnapshot(
  lotSlug: string,
  viewerUserId?: string,
): Promise<LotPlatformSnapshot> {
  const lot = await requireLot(lotSlug);

  if (shouldUseLocalSeedData()) {
    const {
      status,
      currentValueCents,
      nextAllowedAmountCents,
      maximumAllowedAmountCents,
      maximumAllowedAmountSource,
    } = getLotCurrentState(null, lot);
    const seedActivity = await createActivityItem(
      {
        id: `seed-lot-available-${lot.slug}`,
        kind: "lot_available",
        lot_slug: lot.slug,
        actor_user_id: null,
        actor_public_alias: null,
        amount_cents: null,
        title: null,
        description: null,
        audience: "public",
        created_at:
          lot.createdAt ?? new Date(Date.UTC(2026, 3, 11, 18, 10, 0)).toISOString(),
      },
      "public",
    );

    return {
      lotSlug,
      onlineStatusLabel: lot.onlineStatusLabel,
      teaserLabel: lot.onlineTeaserLabel,
      supportLabel: lot.pricing.supportLabel,
      referenceValueCents: lot.pricing.referenceValueCents,
      referenceValueLabel: lot.pricing.referenceValueLabel,
      visibleValueCents: currentValueCents,
      visibleValueLabel: formatCurrencyBRL(currentValueCents),
      visibleValueKind:
        currentValueCents !== lot.pricing.referenceValueCents
          ? "prebid"
          : "reference",
      minimumIncrementCents: lot.pricing.minimumIncrementCents,
      minimumIncrementLabel: lot.pricing.minimumIncrementLabel,
      nextAllowedAmountCents,
      nextAllowedAmountLabel: formatCurrencyBRL(nextAllowedAmountCents),
      maximumAllowedAmountCents,
      maximumAllowedAmountLabel: formatCurrencyBRL(maximumAllowedAmountCents),
      maximumAllowedAmountSource,
      viewerIsAuthenticated: false,
      interestEnabled: status.interestEnabled,
      viewerHasInterest: false,
      preBidEnabled: status.preBidEnabled,
      preBidMessage:
        "Banco de dados não configurado para habilitar interesse e pré-lance online.",
      publicPreBids: [],
      recentActivity: [seedActivity],
    };
  }

  return withPlatformDatabase(async (sql) => {
    const publicPreBidMaximumAmountCents = getEffectiveMaximumPreBidAmountCents(lot);
    const [
      topBidRow,
      activityRows,
      publicPreBidRows,
      viewerInterestRow,
      viewerPreBidRow,
    ] = await Promise.all([
      sql<{ amount_cents: number }[]>`
        select amount_cents
        from platform_pre_bids
        where lot_slug = ${lotSlug}
          and amount_cents <= ${publicPreBidMaximumAmountCents}
        order by amount_cents desc, created_at desc
        limit 1
      `,
      sql<DatabaseActivityRow[]>`
        select
          activities.id,
          activities.kind,
          activities.lot_slug,
          activities.actor_user_id,
          activities.actor_public_alias,
          activities.amount_cents,
          activities.title,
          activities.description,
          activities.audience,
          activities.created_at
        from platform_activities as activities
        left join platform_lots as lots
          on lots.slug = activities.lot_slug
        where activities.lot_slug = ${lotSlug}
          and activities.audience = 'public'
          and (
            activities.kind <> 'prebid_registered'
            or activities.amount_cents <= coalesce(
              lots.maximum_pre_bid_amount_cents,
              round(lots.reference_value_cents::numeric * ${DEFAULT_PRE_BID_MAX_MULTIPLIER_BASIS_POINTS} / 10000)::int
            )
          )
        order by activities.created_at desc
        limit 5
      `,
      sql<DatabasePublicPreBidRow[]>`
        select
          pre_bids.id,
          users.name as bidder_name,
          pre_bids.amount_cents,
          pre_bids.created_at
        from platform_pre_bids as pre_bids
        inner join platform_users as users
          on users.id = pre_bids.user_id
        where pre_bids.lot_slug = ${lotSlug}
          and pre_bids.amount_cents <= ${publicPreBidMaximumAmountCents}
        order by pre_bids.amount_cents desc, pre_bids.created_at desc
        limit 8
      `,
      viewerUserId
        ? sql<{ id: string }[]>`
            select id
            from platform_interests
            where user_id = ${viewerUserId}
              and lot_slug = ${lotSlug}
            limit 1
          `
        : Promise.resolve([]),
      viewerUserId
        ? sql<{ amount_cents: number }[]>`
            select amount_cents
            from platform_pre_bids
            where user_id = ${viewerUserId}
              and lot_slug = ${lotSlug}
              and amount_cents <= ${publicPreBidMaximumAmountCents}
            order by amount_cents desc, created_at desc
            limit 1
          `
        : Promise.resolve([]),
    ]);

    const topBidAmountCents = topBidRow[0]?.amount_cents ?? null;
    const {
      status,
      currentValueCents,
      nextAllowedAmountCents,
      maximumAllowedAmountCents,
      maximumAllowedAmountSource,
    } = getLotCurrentState(topBidAmountCents, lot);
    const viewerHighestPreBidAmount = viewerPreBidRow[0]?.amount_cents ?? null;
    const preBidLimitReached =
      status.preBidEnabled && nextAllowedAmountCents > maximumAllowedAmountCents;

    return {
      lotSlug,
      onlineStatusLabel: lot.onlineStatusLabel,
      teaserLabel: lot.onlineTeaserLabel,
      supportLabel: lot.pricing.supportLabel,
      referenceValueCents: lot.pricing.referenceValueCents,
      referenceValueLabel: lot.pricing.referenceValueLabel,
      visibleValueCents: currentValueCents,
      visibleValueLabel: formatCurrencyBRL(currentValueCents),
      visibleValueKind:
        currentValueCents !== lot.pricing.referenceValueCents
          ? "prebid"
          : "reference",
      minimumIncrementCents: lot.pricing.minimumIncrementCents,
      minimumIncrementLabel: lot.pricing.minimumIncrementLabel,
      nextAllowedAmountCents,
      nextAllowedAmountLabel: formatCurrencyBRL(nextAllowedAmountCents),
      maximumAllowedAmountCents,
      maximumAllowedAmountLabel: formatCurrencyBRL(maximumAllowedAmountCents),
      maximumAllowedAmountSource,
      viewerIsAuthenticated: Boolean(viewerUserId),
      interestEnabled: status.interestEnabled,
      viewerHasInterest: Boolean(viewerInterestRow[0]),
      preBidEnabled: status.preBidEnabled && !preBidLimitReached,
      preBidMessage: preBidLimitReached
        ? `O limite operacional online deste lote foi atingido. Fale com a equipe para qualquer análise acima de ${formatCurrencyBRL(maximumAllowedAmountCents)}.`
        : status.preBidEnabled
        ? "O pré-lance online segue liberado para este lote."
        : `No momento este lote está com status "${status.label.toLowerCase()}".`,
      ...(viewerHighestPreBidAmount !== null
        ? {
            viewerHighestPreBidCents: viewerHighestPreBidAmount,
            viewerHighestPreBidLabel: formatCurrencyBRL(viewerHighestPreBidAmount),
          }
        : {}),
      publicPreBids: mapPublicPreBidRows(publicPreBidRows),
      recentActivity: await Promise.all(
        activityRows.map((row) =>
          createActivityItem(row, viewerUserId ? "authenticated" : "public"),
        ),
      ),
    };
  });
}

export async function registerInterest(userId: string, lotSlug: string) {
  if (shouldUseLocalSeedData()) {
    void userId;
    void lotSlug;
    throw new Error(
      "Banco de dados não configurado para registrar interesses nesta oportunidade.",
    );
  }

  const lot = await requireLot(lotSlug);
  const lotStatus = getLotStatusDefinition(lot.statusKey);

  if (!lot.isVisible || !lotStatus.interestEnabled) {
    throw new Error("Este lote não está disponível para acompanhamento no momento.");
  }

  const result = await withPlatformDatabase((sql) =>
    sql.begin(async (transaction) => {
      const [userRow] = await transaction<{ public_alias: string }[]>`
        select public_alias
        from platform_users
        where id = ${userId}
        limit 1
      `;

      if (!userRow) {
        throw new Error("Usuário não encontrado.");
      }

      const createdAt = new Date().toISOString();
      const insertedRows = await transaction<{ id: string }[]>`
        insert into platform_interests (
          id,
          user_id,
          lot_slug,
          created_at
        )
        values (
          ${randomUUID()},
          ${userId},
          ${lotSlug},
          ${createdAt}
        )
        on conflict (user_id, lot_slug) do nothing
        returning id
      `;

      if (!insertedRows[0]) {
        return {
          created: false,
          eventSlug: lot.eventSlug,
          whatsappHref: createWhatsAppLink(
            `Olá, já acompanho o ${lot.lotCode} e quero falar com o atendimento sobre essa oportunidade.`,
          ),
        };
      }

      await transaction`
        insert into platform_activities (
          id,
          kind,
          lot_slug,
          actor_user_id,
          actor_public_alias,
          created_at
        )
        values (
          ${randomUUID()},
          'interest_registered',
          ${lotSlug},
          ${userId},
          ${userRow.public_alias},
          ${createdAt}
        )
      `;

      return {
        created: true,
        eventSlug: lot.eventSlug,
        whatsappHref: createWhatsAppLink(
          `Olá, acabei de marcar interesse no ${lot.lotCode} e quero alinhar os próximos passos.`,
        ),
      };
    }),
  );

  await invalidatePublicActivityCache();

  return result;
}

export async function submitPreBid(
  userId: string,
  lotSlug: string,
  amountCents: number,
  note?: string,
) {
  if (shouldUseLocalSeedData()) {
    void userId;
    void lotSlug;
    void amountCents;
    void note;
    throw new Error(
      "Banco de dados não configurado para registrar pré-lances nesta oportunidade.",
    );
  }

  const lot = await requireLot(lotSlug);
  const lotStatus = getLotStatusDefinition(lot.statusKey);

  if (!lot.isVisible || !lotStatus.preBidEnabled) {
    throw new Error("O pré-lance online não está liberado para este lote agora.");
  }

  const result = await withPlatformDatabase((sql) =>
    sql.begin(async (transaction) => {
      const [userRow] = await transaction<{ public_alias: string }[]>`
        select public_alias
        from platform_users
        where id = ${userId}
        limit 1
      `;

      if (!userRow) {
        throw new Error("Usuário não encontrado.");
      }

      await transaction`
        select pg_advisory_xact_lock(hashtext(${`lot:${lotSlug}`}))
      `;

      const [latestUserPreBid] = await transaction<{ created_at: string | Date }[]>`
        select created_at
        from platform_pre_bids
        where user_id = ${userId}
          and lot_slug = ${lotSlug}
        order by created_at desc
        limit 1
      `;

      if (latestUserPreBid) {
        const lastAttemptAt = new Date(toIsoString(latestUserPreBid.created_at)).getTime();

        if (Date.now() - lastAttemptAt < 60_000) {
          throw new Error(
            "Aguarde pelo menos 1 minuto antes de enviar outro pré-lance nesta oportunidade.",
          );
        }
      }

      const maximumAllowedQueryAmountCents = getEffectiveMaximumPreBidAmountCents(lot);
      const [topBidRow] = await transaction<{ amount_cents: number }[]>`
        select amount_cents
        from platform_pre_bids
        where lot_slug = ${lotSlug}
          and amount_cents <= ${maximumAllowedQueryAmountCents}
        order by amount_cents desc, created_at desc
        limit 1
      `;

      const {
        currentValueCents,
        nextAllowedAmountCents,
        maximumAllowedAmountCents,
      } = getLotCurrentState(topBidRow?.amount_cents ?? null, lot);

      if (amountCents < nextAllowedAmountCents) {
        throw new Error(
          `O próximo pré-lance precisa ser a partir de ${formatCurrencyBRL(nextAllowedAmountCents)}.`,
        );
      }

      if (amountCents > maximumAllowedAmountCents) {
        throw new Error(
          `O valor informado está acima do limite operacional deste lote. Envie um pré-lance de até ${formatCurrencyBRL(maximumAllowedAmountCents)} ou fale com a equipe para análise.`,
        );
      }

      const createdAt = new Date().toISOString();

      await transaction`
        insert into platform_interests (
          id,
          user_id,
          lot_slug,
          created_at
        )
        values (
          ${randomUUID()},
          ${userId},
          ${lotSlug},
          ${createdAt}
        )
        on conflict (user_id, lot_slug) do nothing
      `;

      const [preBidRow] = await transaction<{ id: string }[]>`
        insert into platform_pre_bids (
          id,
          user_id,
          lot_slug,
          amount_cents,
          note,
          created_at
        )
        values (
          ${randomUUID()},
          ${userId},
          ${lotSlug},
          ${amountCents},
          ${note?.trim() ? note.trim() : null},
          ${createdAt}
        )
        returning id
      `;

      await transaction`
        insert into platform_activities (
          id,
          kind,
          lot_slug,
          actor_user_id,
          actor_public_alias,
          amount_cents,
          created_at
        )
        values (
          ${randomUUID()},
          'prebid_registered',
          ${lotSlug},
          ${userId},
          ${userRow.public_alias},
          ${amountCents},
          ${createdAt}
        )
      `;

      return {
        eventSlug: lot.eventSlug,
        preBid: {
          id: preBidRow?.id ?? randomUUID(),
        },
        previousValueCents: currentValueCents,
        whatsappHref: createOfferWhatsAppLink({
          title: lot.title,
          lotCode: lot.lotCode,
          location: lot.location,
        }),
      };
    }),
  );

  await Promise.all([
    invalidatePublicActivityCache(),
    invalidatePublicCatalogCache(),
  ]);

  return result;
}

export async function getUserDashboard(userId: string): Promise<UserDashboard> {
  if (shouldUseLocalSeedData()) {
    void userId;
    throw new Error("Banco de dados não configurado para acessar a área do usuário.");
  }

  return withPlatformDatabase(async (sql) => {
    const [userRow, interestRows, preBidRows, activityRows] = await Promise.all([
      sql<DatabaseUserRow[]>`
        select
          id,
          public_alias,
          name,
          email,
          phone,
          city,
          password_hash,
          created_at
        from platform_users
        where id = ${userId}
        limit 1
      `,
      sql<DatabaseInterestRow[]>`
        select id, lot_slug, created_at
        from platform_interests
        where user_id = ${userId}
        order by created_at desc
      `,
      sql<DatabasePreBidRow[]>`
        select id, lot_slug, amount_cents, created_at
        from platform_pre_bids
        where user_id = ${userId}
        order by created_at desc
      `,
      sql<DatabaseActivityRow[]>`
        select
          id,
          kind,
          lot_slug,
          actor_user_id,
          actor_public_alias,
          amount_cents,
          title,
          description,
          audience,
          created_at
        from platform_activities
        where audience = 'public'
        order by created_at desc
        limit 80
      `,
    ]);

    const user = userRow[0];

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    const relatedLotSlugs = new Set<string>(interestRows.map((row) => row.lot_slug));

    for (const row of preBidRows) {
      relatedLotSlugs.add(row.lot_slug);
    }

    const interests: DashboardInterest[] = await Promise.all(
      interestRows.map(async (interest) => {
        const lot = await requireLot(interest.lot_slug);
        const topLotBidAmount = await getTopLotBidAmount(interest.lot_slug);
        const lotState = getLotCurrentState(topLotBidAmount, lot);

        return {
          id: interest.id,
          lotSlug: lot.slug,
          lotCode: lot.lotCode,
          lotTitle: lot.title,
          location: lot.location,
          createdAt: toIsoString(interest.created_at),
          referenceValueLabel: lot.pricing.referenceValueLabel,
          visibleValueLabel: formatCurrencyBRL(lotState.currentValueCents),
        };
      }),
    );

    const preBids: DashboardPreBid[] = await Promise.all(
      preBidRows.map(async (preBid) => {
        const lot = await requireLot(preBid.lot_slug);
        const topLotBidAmount = await getTopLotBidAmount(preBid.lot_slug);
        const lotState = getLotCurrentState(topLotBidAmount, lot);

        return {
          id: preBid.id,
          lotSlug: lot.slug,
          lotCode: lot.lotCode,
          lotTitle: lot.title,
          location: lot.location,
          amountLabel: formatCurrencyBRL(preBid.amount_cents),
          createdAt: toIsoString(preBid.created_at),
          currentValueLabel: formatCurrencyBRL(lotState.currentValueCents),
        };
      }),
    );

    const activity = activityRows
      .filter(
        (row) =>
          row.actor_user_id === userId ||
          (row.lot_slug ? relatedLotSlugs.has(row.lot_slug) : false),
      )
      .slice(0, 8)
      .map((row) => createActivityItem(row, "authenticated"));

    return {
      user: mapUserRowToAuthenticatedUser(user),
      interests,
      preBids,
      activity: await Promise.all(activity),
    };
  });
}
