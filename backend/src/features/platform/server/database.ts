import "server-only";

import postgres, { type Sql } from "postgres";

import { lots } from "@/backend/features/auctions/data/catalog";
import {
  requireDatabaseUrl,
  shouldUseLocalSeedData,
} from "@/backend/features/platform/server/mode";

type PlatformSql = Sql<Record<string, unknown>>;

const schemaSql = `
  create sequence if not exists platform_public_alias_seq start 201;

  create or replace function platform_is_valid_cpf(input text)
  returns boolean
  language plpgsql
  immutable
  as $$
  declare
    digits text;
    idx integer;
    digits_sum integer;
    first_digit integer;
    second_digit integer;
  begin
    if input is null then
      return false;
    end if;

    digits := regexp_replace(input, '\\D', '', 'g');

    if digits !~ '^[0-9]{11}$' then
      return false;
    end if;

    if digits ~ '^([0-9])\\1{10}$' then
      return false;
    end if;

    digits_sum := 0;

    for idx in 1..9 loop
      digits_sum := digits_sum + cast(substr(digits, idx, 1) as integer) * (11 - idx);
    end loop;

    first_digit := (digits_sum * 10) % 11;

    if first_digit = 10 then
      first_digit := 0;
    end if;

    digits_sum := 0;

    for idx in 1..10 loop
      digits_sum := digits_sum + cast(substr(digits, idx, 1) as integer) * (12 - idx);
    end loop;

    second_digit := (digits_sum * 10) % 11;

    if second_digit = 10 then
      second_digit := 0;
    end if;

    return digits = substr(digits, 1, 9) || first_digit::text || second_digit::text;
  end;
  $$;

  create table if not exists platform_lots (
    id text primary key,
    source_slug text,
    slug text not null unique,
    title text not null,
    lot_code text not null,
    event_slug text not null,
    category text not null,
    location text not null,
    overview text not null,
    details jsonb not null default '[]'::jsonb,
    observations text not null default '',
    source_note text not null default '',
    facts jsonb not null default '[]'::jsonb,
    highlights jsonb not null default '[]'::jsonb,
    faq jsonb not null default '[]'::jsonb,
    gallery jsonb not null default '[]'::jsonb,
    year text not null default '',
    mileage text not null default '',
    fuel text not null default '',
    transmission text,
    status_key text not null,
    reference_value_cents integer not null check (reference_value_cents > 0),
    current_value_cents integer not null check (current_value_cents > 0),
    minimum_increment_cents integer not null check (minimum_increment_cents > 0),
    is_featured boolean not null default false,
    is_visible boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create index if not exists platform_lots_event_idx
    on platform_lots (event_slug, is_visible, sort_order asc, updated_at desc);

  create index if not exists platform_lots_public_idx
    on platform_lots (is_visible, is_featured desc, sort_order asc, updated_at desc);

  create table if not exists platform_users (
    id text primary key,
    public_alias text not null unique,
    email text not null unique,
    cpf text not null,
    name text not null,
    phone text not null,
    city text,
    password_hash text not null,
    created_at timestamptz not null default now()
  );

  alter table if exists platform_users
    add column if not exists cpf text;

  create table if not exists platform_sessions (
    id text primary key,
    user_id text not null references platform_users(id) on delete cascade,
    token_hash text not null unique,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null
  );

  create index if not exists platform_sessions_user_idx
    on platform_sessions (user_id, expires_at desc);

  create table if not exists platform_interests (
    id text primary key,
    user_id text not null references platform_users(id) on delete cascade,
    lot_slug text not null,
    created_at timestamptz not null default now(),
    unique (user_id, lot_slug)
  );

  create index if not exists platform_interests_lot_idx
    on platform_interests (lot_slug, created_at desc);

  create table if not exists platform_pre_bids (
    id text primary key,
    user_id text not null references platform_users(id) on delete cascade,
    lot_slug text not null,
    amount_cents integer not null check (amount_cents > 0),
    note text,
    created_at timestamptz not null default now()
  );

  create index if not exists platform_pre_bids_lot_value_idx
    on platform_pre_bids (lot_slug, amount_cents desc, created_at desc);

  create index if not exists platform_pre_bids_user_lot_idx
    on platform_pre_bids (user_id, lot_slug, created_at desc);

  create table if not exists platform_activities (
    id text primary key,
    kind text not null,
    lot_slug text,
    actor_user_id text references platform_users(id) on delete set null,
    actor_public_alias text,
    amount_cents integer,
    dedupe_key text unique,
    title text,
    description text,
    source text not null default 'system',
    audience text not null default 'public',
    created_at timestamptz not null default now()
  );

  create index if not exists platform_activities_created_idx
    on platform_activities (created_at desc);

  create index if not exists platform_activities_lot_idx
    on platform_activities (lot_slug, created_at desc);

  create index if not exists platform_activities_actor_idx
    on platform_activities (actor_user_id, created_at desc);

  create index if not exists platform_activities_audience_idx
    on platform_activities (audience, created_at desc);

  alter table if exists platform_activities
    add column if not exists title text;

  alter table if exists platform_activities
    add column if not exists description text;

  alter table if exists platform_activities
    add column if not exists source text not null default 'system';

  alter table if exists platform_activities
    add column if not exists audience text not null default 'public';

  do $$
  begin
    if exists (
      select 1
      from pg_constraint
      where conname = 'platform_activities_kind_check'
    ) then
      alter table platform_activities
        drop constraint platform_activities_kind_check;
    end if;
  end $$;

  create table if not exists platform_rate_limit_events (
    id text primary key,
    scope text not null,
    key_hash text not null,
    created_at timestamptz not null default now()
  );

  create index if not exists platform_rate_limit_scope_idx
    on platform_rate_limit_events (scope, key_hash, created_at desc);
`;

const seedBaseDate = Date.UTC(2026, 3, 11, 18, 10, 0);

function getDatabaseSslMode() {
  return process.env.DATABASE_SSL_MODE?.trim().toLowerCase() === "disable"
    ? undefined
    : "require";
}

function createPlatformSql(): PlatformSql {
  return postgres(requireDatabaseUrl(), {
    max: process.env.NODE_ENV === "production" ? 5 : 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: getDatabaseSslMode(),
  });
}

const globalForPlatformDatabase = globalThis as typeof globalThis & {
  __kronPlatformSql?: PlatformSql;
  __kronPlatformReady?: Promise<void>;
};

function getPlatformSql() {
  if (!globalForPlatformDatabase.__kronPlatformSql) {
    globalForPlatformDatabase.__kronPlatformSql = createPlatformSql();
  }

  return globalForPlatformDatabase.__kronPlatformSql;
}

function getIssueDescription(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

async function auditLegacyPlatformUsers(sql: PlatformSql) {
  const [
    missingCpfRows,
    invalidCpfRows,
    duplicateCpfRows,
    duplicateEmailRows,
    invalidPhoneRows,
  ] =
    await Promise.all([
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_users
        where cpf is null
          or btrim(cpf) = ''
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_users
        where cpf is not null
          and btrim(cpf) <> ''
          and not platform_is_valid_cpf(cpf)
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count
        from (
          select regexp_replace(cpf, '\\D', '', 'g')
          from platform_users
          where cpf is not null
            and btrim(cpf) <> ''
          group by 1
          having count(*) > 1
        ) as duplicated_cpfs
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count
        from (
          select lower(btrim(email))
          from platform_users
          group by 1
          having count(*) > 1
        ) as duplicated_emails
      `,
      sql<{ count: number }[]>`
        select count(*)::int as count
        from platform_users
        where phone is null
          or regexp_replace(phone, '\\D', '', 'g') !~ '^[0-9]{10,13}$'
      `,
    ]);

  const issues: string[] = [];
  const missingCpfCount = missingCpfRows[0]?.count ?? 0;
  const invalidCpfCount = invalidCpfRows[0]?.count ?? 0;
  const duplicateCpfCount = duplicateCpfRows[0]?.count ?? 0;
  const duplicateEmailCount = duplicateEmailRows[0]?.count ?? 0;
  const invalidPhoneCount = invalidPhoneRows[0]?.count ?? 0;

  if (missingCpfCount > 0) {
    issues.push(
      getIssueDescription(
        missingCpfCount,
        "usuário legado sem CPF",
        "usuários legados sem CPF",
      ),
    );
  }

  if (invalidCpfCount > 0) {
    issues.push(
      getIssueDescription(
        invalidCpfCount,
        "usuário legado com CPF inválido",
        "usuários legados com CPF inválido",
      ),
    );
  }

  if (duplicateCpfCount > 0) {
    issues.push(
      getIssueDescription(
        duplicateCpfCount,
        "CPF duplicado após normalização",
        "CPFs duplicados após normalização",
      ),
    );
  }

  if (duplicateEmailCount > 0) {
    issues.push(
      getIssueDescription(
        duplicateEmailCount,
        "e-mail duplicado após normalização",
        "e-mails duplicados após normalização",
      ),
    );
  }

  if (invalidPhoneCount > 0) {
    issues.push(
      getIssueDescription(
        invalidPhoneCount,
        "usuário legado com telefone inválido",
        "usuários legados com telefone inválido",
      ),
    );
  }

  if (issues.length > 0) {
    throw new Error(
      `A tabela platform_users contém inconsistências legadas: ${issues.join(", ")}. Corrija esses registros antes de iniciar o app em modo postgres.`,
    );
  }
}

async function normalizePlatformUsers(sql: PlatformSql) {
  await sql`
    update platform_users
    set
      name = regexp_replace(btrim(name), '\\s+', ' ', 'g'),
      email = lower(btrim(email)),
      cpf = regexp_replace(cpf, '\\D', '', 'g'),
      phone = regexp_replace(phone, '\\D', '', 'g'),
      city = nullif(regexp_replace(btrim(coalesce(city, '')), '\\s+', ' ', 'g'), '')
  `;
}

async function ensurePlatformUserConstraints(sql: PlatformSql) {
  await sql`
    drop index if exists platform_users_cpf_idx
  `;

  await sql`
    create unique index platform_users_cpf_idx
      on platform_users (cpf)
  `;

  await sql`
    alter table platform_users
      alter column cpf set not null
  `;

  await sql`
    do $$
    begin
      if not exists (
        select 1
        from pg_constraint
        where conname = 'platform_users_email_normalized_check'
      ) then
        alter table platform_users
          add constraint platform_users_email_normalized_check
          check (email = lower(btrim(email)));
      end if;

      if not exists (
        select 1
        from pg_constraint
        where conname = 'platform_users_cpf_digits_check'
      ) then
        alter table platform_users
          add constraint platform_users_cpf_digits_check
          check (cpf ~ '^[0-9]{11}$');
      end if;

      if not exists (
        select 1
        from pg_constraint
        where conname = 'platform_users_cpf_valid_check'
      ) then
        alter table platform_users
          add constraint platform_users_cpf_valid_check
          check (platform_is_valid_cpf(cpf));
      end if;

      if not exists (
        select 1
        from pg_constraint
        where conname = 'platform_users_phone_digits_check'
      ) then
        alter table platform_users
          add constraint platform_users_phone_digits_check
          check (phone ~ '^[0-9]{10,13}$');
      end if;
    end $$;
  `;

  await sql`
    alter table platform_users
      validate constraint platform_users_email_normalized_check
  `;

  await sql`
    alter table platform_users
      validate constraint platform_users_cpf_digits_check
  `;

  await sql`
    alter table platform_users
      validate constraint platform_users_cpf_valid_check
  `;

  await sql`
    alter table platform_users
      validate constraint platform_users_phone_digits_check
  `;
}

async function seedLotAvailability(sql: PlatformSql) {
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

async function seedPlatformLots(sql: PlatformSql) {
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
        ${lot.statusKey},
        ${lot.pricing.referenceValueCents},
        ${lot.pricing.currentValueCents},
        ${lot.pricing.minimumIncrementCents},
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

async function bootstrapPlatformDatabase(sql: PlatformSql) {
  await sql.unsafe(schemaSql);
  await auditLegacyPlatformUsers(sql);
  await normalizePlatformUsers(sql);
  await ensurePlatformUserConstraints(sql);
  await seedPlatformLots(sql);
  await seedLotAvailability(sql);
}

export async function ensurePlatformDatabase() {
  if (!globalForPlatformDatabase.__kronPlatformReady) {
    const sql = getPlatformSql();
    globalForPlatformDatabase.__kronPlatformReady = bootstrapPlatformDatabase(sql);
  }

  return globalForPlatformDatabase.__kronPlatformReady;
}

export async function withPlatformDatabase<T>(
  callback: (sql: PlatformSql) => Promise<T>,
) {
  await ensurePlatformDatabase();

  return callback(getPlatformSql());
}

export async function pingPlatformDatabase() {
  if (shouldUseLocalSeedData()) {
    return {
      ok: true as const,
      driver: "local-seed",
    };
  }

  return withPlatformDatabase(async (sql) => {
    await sql`select 1`;

    return {
      ok: true as const,
      driver: "postgres",
    };
  });
}
