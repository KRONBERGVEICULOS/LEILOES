import "server-only";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL não configurada. Defina a conexão do Postgres/Supabase antes de iniciar o app.",
    );
  }

  return databaseUrl;
}
