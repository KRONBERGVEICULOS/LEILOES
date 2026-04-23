import "server-only";

type DataMode = "auto" | "postgres" | "local-seed";

function getDataMode(): DataMode {
  const value = process.env.KRON_DATA_MODE?.trim().toLowerCase();

  if (value === "postgres" || value === "local-seed") {
    return value;
  }

  return "auto";
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function shouldUseLocalSeedData() {
  if (isDatabaseConfigured()) {
    return false;
  }

  return getDataMode() !== "postgres";
}

export function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "Banco de dados não configurado. Defina a conexão do Postgres antes de iniciar o app.",
    );
  }

  return databaseUrl;
}
