import "server-only";

import postgres, { type Sql } from "postgres";

import { assertProductionEnvironmentReady } from "@/shared/config/env";
import {
  requireDatabaseUrl,
  shouldUseLocalSeedData,
} from "@/backend/features/platform/server/mode";

type PlatformSql = Sql<Record<string, unknown>>;

const requiredPlatformMigrationVersions = [
  "001_initial_platform_schema",
  "002_harden_platform_users",
  "003_contact_leads",
] as const;

const requiredPlatformTables = [
  "platform_schema_migrations",
  "platform_lots",
  "platform_users",
  "platform_sessions",
  "platform_interests",
  "platform_pre_bids",
  "platform_activities",
  "platform_rate_limit_events",
  "platform_contact_leads",
] as const;

function getDatabaseSslMode() {
  return process.env.DATABASE_SSL_MODE?.trim().toLowerCase() === "disable"
    ? undefined
    : "require";
}

function createPlatformSql(): PlatformSql {
  assertProductionEnvironmentReady();

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

function isDatabaseErrorCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

async function verifyAppliedMigrations(sql: PlatformSql) {
  try {
    const migrationRows = await sql<{ version: string }[]>`
      select version
      from platform_schema_migrations
    `;

    const appliedVersions = new Set(migrationRows.map((row) => row.version));
    const missingVersions = requiredPlatformMigrationVersions.filter(
      (version) => !appliedVersions.has(version),
    );

    if (missingVersions.length > 0) {
      throw new Error(
        `Banco ainda não migrou todas as versões obrigatórias. Execute "npm run migrate". Migrações ausentes: ${missingVersions.join(", ")}.`,
      );
    }
  } catch (error) {
    if (isDatabaseErrorCode(error, "42P01")) {
      throw new Error(
        'Banco ainda não migrado. Execute "npm run migrate" antes de iniciar o app em modo postgres.',
      );
    }

    throw error;
  }
}

async function verifyRequiredTables(sql: PlatformSql) {
  const tableRows = await sql<{ table_name: string }[]>`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
  `;

  const availableTables = new Set(tableRows.map((row) => row.table_name));
  const missingTables = requiredPlatformTables.filter(
    (tableName) => !availableTables.has(tableName),
  );

  if (missingTables.length > 0) {
    throw new Error(
      `Banco ainda não está pronto para a aplicação. Execute "npm run migrate". Tabelas ausentes: ${missingTables.join(", ")}.`,
    );
  }
}

async function verifyPlatformDatabase(sql: PlatformSql) {
  await verifyRequiredTables(sql);
  await verifyAppliedMigrations(sql);
}

export async function ensurePlatformDatabase() {
  if (shouldUseLocalSeedData()) {
    return;
  }

  if (!globalForPlatformDatabase.__kronPlatformReady) {
    const sql = getPlatformSql();
    globalForPlatformDatabase.__kronPlatformReady = verifyPlatformDatabase(sql).catch(
      (error) => {
        globalForPlatformDatabase.__kronPlatformReady = undefined;
        throw error;
      },
    );
  }

  return globalForPlatformDatabase.__kronPlatformReady;
}

export async function withPlatformDatabase<T>(
  callback: (sql: PlatformSql) => Promise<T>,
) {
  if (shouldUseLocalSeedData()) {
    throw new Error(
      "Postgres indisponível neste ambiente. Configure DATABASE_URL e use KRON_DATA_MODE=postgres para persistência real.",
    );
  }

  await ensurePlatformDatabase();

  return callback(getPlatformSql());
}

export async function pingPlatformDatabase() {
  if (shouldUseLocalSeedData()) {
    return {
      ok: false as const,
      driver: "local-seed",
      connected: false,
      migrated: false,
    };
  }

  const sql = getPlatformSql();
  await verifyPlatformDatabase(sql);
  await sql`select 1`;

  return {
    ok: true as const,
    driver: "postgres",
    connected: true,
    migrated: true,
  };
}
