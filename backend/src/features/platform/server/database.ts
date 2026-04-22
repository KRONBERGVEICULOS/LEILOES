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

  create unique index if not exists platform_users_cpf_idx
    on platform_users (cpf)
    where cpf is not null;

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
