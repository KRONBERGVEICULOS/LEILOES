import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import postgres from "postgres";

const projectRoot = process.cwd();
const migrationDirectory = path.join(projectRoot, "backend", "migrations");

function getDatabaseSslMode() {
  return process.env.DATABASE_SSL_MODE?.trim().toLowerCase() === "disable"
    ? undefined
    : "require";
}

function normalizeEnvValue(rawValue) {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

async function loadEnvironmentFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");

      if (separatorIndex <= 0) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = normalizeEnvValue(line.slice(separatorIndex + 1));

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

async function loadEnvironmentFiles() {
  await loadEnvironmentFile(path.join(projectRoot, ".env"));
  await loadEnvironmentFile(path.join(projectRoot, ".env.local"));
  await loadEnvironmentFile(path.join(projectRoot, "frontend", ".env.local"));
}

async function ensureMigrationTable(sql) {
  await sql`
    create table if not exists platform_schema_migrations (
      version text primary key,
      checksum text not null,
      executed_at timestamptz not null default now()
    )
  `;
}

async function listMigrationFiles() {
  const entries = await fs.readdir(migrationDirectory, { withFileTypes: true });

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        /^\d{3}_.+\.(sql|mjs)$/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function readChecksum(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return createHash("sha256").update(content).digest("hex");
}

async function applySqlMigration(sql, filePath) {
  const content = await fs.readFile(filePath, "utf8");
  await sql.unsafe(content);
}

async function applyModuleMigration(sql, filePath) {
  const moduleUrl = pathToFileURL(filePath).href;
  const migration = await import(moduleUrl);

  if (typeof migration.up !== "function") {
    throw new Error(`Migração "${path.basename(filePath)}" não exporta a função "up".`);
  }

  await migration.up(sql);
}

async function runMigration(sql, fileName) {
  const filePath = path.join(migrationDirectory, fileName);
  const version = fileName.replace(/\.(sql|mjs)$/i, "");
  const checksum = await readChecksum(filePath);
  const [appliedMigration] = await sql`
    select version, checksum
    from platform_schema_migrations
    where version = ${version}
    limit 1
  `;

  if (appliedMigration) {
    if (appliedMigration.checksum !== checksum) {
      throw new Error(
        `A migração ${version} já foi aplicada com outro checksum. Não altere migrações antigas; crie uma nova versão.`,
      );
    }

    console.log(`skip ${version}`);
    return;
  }

  console.log(`apply ${version}`);

  await sql.begin(async (transaction) => {
    if (fileName.endsWith(".sql")) {
      await applySqlMigration(transaction, filePath);
    } else {
      await applyModuleMigration(transaction, filePath);
    }

    await transaction`
      insert into platform_schema_migrations (version, checksum)
      values (${version}, ${checksum})
    `;
  });
}

async function main() {
  await loadEnvironmentFiles();

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL é obrigatório para executar as migrações. Configure o Postgres antes de rodar \"npm run migrate\".",
    );
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: getDatabaseSslMode(),
  });

  try {
    await ensureMigrationTable(sql);

    const migrationFiles = await listMigrationFiles();

    for (const fileName of migrationFiles) {
      await runMigration(sql, fileName);
    }

    console.log("Migrations concluídas.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Falha inesperada ao aplicar migrações.",
  );
  process.exitCode = 1;
});
