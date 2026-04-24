export const minimumAdminPasswordLength = 12;

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizePublicSiteUrlCandidate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/$/, "");
}

function getProductionSiteUrlCandidate() {
  return normalizePublicSiteUrlCandidate(
    readTrimmedEnv("NEXT_PUBLIC_SITE_URL") ??
      readTrimmedEnv("RAILWAY_PUBLIC_DOMAIN") ??
      "",
  );
}

export function shouldEnforceProductionEnvironment() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  );
}

export function readTrimmedEnv(key: string) {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getAdminCredentialsValidationIssue() {
  const username = readTrimmedEnv("ADMIN_USERNAME");
  const password = process.env.ADMIN_PASSWORD;

  if (!username) {
    return "Defina ADMIN_USERNAME para habilitar o painel administrativo.";
  }

  if (!password?.trim()) {
    return "Defina ADMIN_PASSWORD para habilitar o painel administrativo.";
  }

  if (password.length < minimumAdminPasswordLength) {
    return `ADMIN_PASSWORD precisa ter pelo menos ${minimumAdminPasswordLength} caracteres.`;
  }

  return null;
}

export function getProductionEnvironmentIssues() {
  if (!shouldEnforceProductionEnvironment()) {
    return [];
  }

  const issues: string[] = [];

  if (!readTrimmedEnv("DATABASE_URL")) {
    issues.push("DATABASE_URL ausente");
  }

  const siteUrl = getProductionSiteUrlCandidate();

  if (!siteUrl) {
    issues.push("NEXT_PUBLIC_SITE_URL ausente e RAILWAY_PUBLIC_DOMAIN indisponível");
  } else if (!isHttpUrl(siteUrl)) {
    issues.push("NEXT_PUBLIC_SITE_URL inválida");
  }

  const adminIssue = getAdminCredentialsValidationIssue();

  if (adminIssue) {
    issues.push(adminIssue);
  }

  return issues;
}

export function assertProductionEnvironmentReady() {
  const issues = getProductionEnvironmentIssues();

  if (issues.length === 0) {
    return;
  }

  throw new Error(
    `Ambiente de produção inválido: ${issues.join("; ")}.`,
  );
}
