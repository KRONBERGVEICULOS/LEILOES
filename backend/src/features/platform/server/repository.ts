import "server-only";

import { randomUUID } from "node:crypto";

import { createOfferWhatsAppLink, createWhatsAppLink } from "@/shared/config/site";
import { getLotStatusDefinition } from "@/backend/features/auctions/lib/lot-status";
import { lots as seedLots } from "@/backend/features/auctions/data/catalog";
import { getLotBySlug } from "@/backend/features/auctions/server/catalog";
import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import {
  invalidatePublicActivityCache,
  readPublicCache,
  writePublicCache,
} from "@/backend/features/platform/server/public-cache";
import { shouldUseLocalSeedData } from "@/backend/features/platform/server/mode";
import { formatCurrencyBRL } from "@/shared/lib/utils";
import type {
  ActivityFeedItem,
  AuthenticatedUser,
  DashboardInterest,
  DashboardPreBid,
  LotPlatformSnapshot,
  PlatformActivity,
  UserDashboard,
} from "@/backend/features/platform/types";

type DatabaseUserRow = {
  id: string;
  public_alias: string;
  cpf: string | null;
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

  const baselineCurrentValue = Math.max(
    lot.pricing.currentValueCents,
    lot.pricing.referenceValueCents,
  );
  const currentValueCents = Math.max(topBidAmountCents ?? 0, baselineCurrentValue);
  const nextAllowedAmountCents = currentValueCents + lot.pricing.minimumIncrementCents;
  const status = getLotStatusDefinition(lot.statusKey);

  return {
    status,
    lot,
    baselineCurrentValue,
    currentValueCents,
    nextAllowedAmountCents,
  };
}

async function getTopLotBidAmount(lotSlug: string) {
  if (shouldUseLocalSeedData()) {
    void lotSlug;
    return null;
  }

  return withPlatformDatabase(async (sql) => {
    const [row] = await sql<{ amount_cents: number }[]>`
      select amount_cents
      from platform_pre_bids
      where lot_slug = ${lotSlug}
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
        cpf,
        name,
        email,
        phone,
        city,
        password_hash,
        created_at
      from platform_users
      where email = ${email.trim().toLowerCase()}
      limit 1
    `;

    return row ? mapUserRowWithPassword(row) : null;
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
        cpf,
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
      "Configure DATABASE_URL para criar cadastros e persistir usuários.",
    );
  }

  const normalizedEmail = input.email.trim().toLowerCase();

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
            ${input.name},
            ${normalizedEmail},
            ${input.cpf},
            ${input.phone},
            ${input.city ?? null},
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
          name: input.name,
          email: normalizedEmail,
          phone: input.phone,
          ...(input.city ? { city: input.city } : {}),
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
        throw new Error("Já existe uma conta cadastrada com este CPF.");
      }

      throw new Error("Já existe uma conta com este e-mail.");
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

  const cachedActivity = await readPublicCache<ActivityFeedItem[]>("activity", [
    "public",
    String(limit),
  ]);

  if (cachedActivity) {
    return cachedActivity;
  }

  return withPlatformDatabase(async (sql) => {
    const rows = await sql<DatabaseActivityRow[]>`
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
      limit ${limit}
    `;

    const items = await Promise.all(rows.map((row) => createActivityItem(row, "public")));
    await writePublicCache("activity", ["public", String(limit)], items, 45);

    return items;
  });
}

export async function getLotPlatformSnapshot(
  lotSlug: string,
  viewerUserId?: string,
): Promise<LotPlatformSnapshot> {
  const lot = await requireLot(lotSlug);

  if (shouldUseLocalSeedData()) {
    const status = getLotStatusDefinition(lot.statusKey);
    const currentValueCents = Math.max(
      lot.pricing.currentValueCents,
      lot.pricing.referenceValueCents,
    );
    const nextAllowedAmountCents =
      currentValueCents + lot.pricing.minimumIncrementCents;
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
      visibleValueCents: lot.pricing.referenceValueCents,
      visibleValueLabel: lot.pricing.referenceValueLabel,
      visibleValueKind: "reference",
      minimumIncrementCents: lot.pricing.minimumIncrementCents,
      minimumIncrementLabel: lot.pricing.minimumIncrementLabel,
      nextAllowedAmountCents,
      nextAllowedAmountLabel: formatCurrencyBRL(nextAllowedAmountCents),
      viewerIsAuthenticated: false,
      interestEnabled: status.interestEnabled,
      viewerHasInterest: false,
      preBidEnabled: status.preBidEnabled,
      preBidMessage:
        "Configure DATABASE_URL para habilitar interesse e pré-lance online.",
      recentActivity: [seedActivity],
    };
  }

  return withPlatformDatabase(async (sql) => {
    const [topBidRow, activityRows, viewerInterestRow, viewerPreBidRow] = await Promise.all([
      sql<{ amount_cents: number }[]>`
        select amount_cents
        from platform_pre_bids
        where lot_slug = ${lotSlug}
        order by amount_cents desc, created_at desc
        limit 1
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
        where lot_slug = ${lotSlug}
          and audience = 'public'
        order by created_at desc
        limit 5
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
            order by amount_cents desc, created_at desc
            limit 1
          `
        : Promise.resolve([]),
    ]);

    const topBidAmountCents = topBidRow[0]?.amount_cents ?? null;
    const { status, currentValueCents, nextAllowedAmountCents } = getLotCurrentState(
      topBidAmountCents,
      lot,
    );
    const viewerHighestPreBidAmount = viewerPreBidRow[0]?.amount_cents ?? null;

    return {
      lotSlug,
      onlineStatusLabel: lot.onlineStatusLabel,
      teaserLabel: lot.onlineTeaserLabel,
      supportLabel: lot.pricing.supportLabel,
      referenceValueCents: lot.pricing.referenceValueCents,
      referenceValueLabel: lot.pricing.referenceValueLabel,
      visibleValueCents: viewerUserId ? currentValueCents : lot.pricing.referenceValueCents,
      visibleValueLabel: formatCurrencyBRL(
        viewerUserId ? currentValueCents : lot.pricing.referenceValueCents,
      ),
      visibleValueKind:
        viewerUserId && currentValueCents !== lot.pricing.referenceValueCents
          ? "prebid"
          : "reference",
      minimumIncrementCents: lot.pricing.minimumIncrementCents,
      minimumIncrementLabel: lot.pricing.minimumIncrementLabel,
      nextAllowedAmountCents,
      nextAllowedAmountLabel: formatCurrencyBRL(nextAllowedAmountCents),
      viewerIsAuthenticated: Boolean(viewerUserId),
      interestEnabled: status.interestEnabled,
      viewerHasInterest: Boolean(viewerInterestRow[0]),
      preBidEnabled: status.preBidEnabled,
      preBidMessage: status.preBidEnabled
        ? "O pré-lance online segue liberado para este lote."
        : `No momento este lote está com status "${status.label.toLowerCase()}".`,
      ...(viewerHighestPreBidAmount !== null
        ? {
            viewerHighestPreBidCents: viewerHighestPreBidAmount,
            viewerHighestPreBidLabel: formatCurrencyBRL(viewerHighestPreBidAmount),
          }
        : {}),
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
      "Configure DATABASE_URL para registrar interesses nesta oportunidade.",
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
      "Configure DATABASE_URL para registrar pré-lances nesta oportunidade.",
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

      const [topBidRow] = await transaction<{ amount_cents: number }[]>`
        select amount_cents
        from platform_pre_bids
        where lot_slug = ${lotSlug}
        order by amount_cents desc, created_at desc
        limit 1
      `;

      const { currentValueCents, nextAllowedAmountCents } = getLotCurrentState(
        topBidRow?.amount_cents ?? null,
        lot,
      );

      if (amountCents < nextAllowedAmountCents) {
        throw new Error(
          `O próximo pré-lance precisa ser a partir de ${formatCurrencyBRL(nextAllowedAmountCents)}.`,
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

  await invalidatePublicActivityCache();

  return result;
}

export async function getUserDashboard(userId: string): Promise<UserDashboard> {
  if (shouldUseLocalSeedData()) {
    void userId;
    throw new Error("Configure DATABASE_URL para acessar a área do usuário.");
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
