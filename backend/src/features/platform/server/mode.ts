import "server-only";

import { shouldEnforceProductionEnvironment } from "@/shared/config/env";

type DataMode = "auto" | "postgres" | "local-seed";

function getDataMode(): DataMode {
  const value = process.env.KRON_DATA_MODE?.trim().toLowerCase();

  if (!value) {
    return "auto";
  }

  if (value === "postgres" || value === "local-seed") {
    return value;
  }

  throw new Error(
    "KRON_DATA_MODE inválido. Use apenas auto, postgres ou local-seed.",
  );
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function shouldUseLocalSeedData() {
  const mode = getDataMode();
  const databaseConfigured = isDatabaseConfigured();

  if (shouldEnforceProductionEnvironment()) {
    if (mode === "local-seed") {
      throw new Error(
        "KRON_DATA_MODE=local-seed não é permitido em produção. Configure Postgres real antes de iniciar o app.",
      );
    }

    if (!databaseConfigured) {
      throw new Error(
        "DATABASE_URL é obrigatório em produção. O fallback silencioso para local-seed foi desabilitado.",
      );
    }
  }

  if (mode === "local-seed") {
    return true;
  }

  if (mode === "postgres") {
    if (!databaseConfigured) {
      throw new Error(
        "KRON_DATA_MODE=postgres exige DATABASE_URL configurado.",
      );
    }

    return false;
  }

  if (databaseConfigured) {
    return false;
  }

  return true;
}

export function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      shouldEnforceProductionEnvironment()
        ? "DATABASE_URL é obrigatório em produção. Configure o Postgres e execute as migrações antes de iniciar o app."
        : "Banco de dados não configurado. Defina a conexão do Postgres antes de iniciar o app em modo postgres.",
    );
  }

  return databaseUrl;
}
