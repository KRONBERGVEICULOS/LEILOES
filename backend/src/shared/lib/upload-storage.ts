import "server-only";

import path from "node:path";

import { readTrimmedEnv, shouldEnforceProductionEnvironment } from "@/shared/config/env";

export const lotUploadPublicSegment = "lotes";

const defaultPublicBasePath = "/media/uploads";
const allowedUploadStorageModes = new Set(["local", "volume"]);

export type UploadStorageMode = "local" | "volume";

export type LotUploadStorageConfig = {
  lotDirectory: string;
  mode: UploadStorageMode;
  publicBasePath: string;
};

function normalizePublicBasePath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("UPLOAD_PUBLIC_BASE_PATH não pode ficar vazio.");
  }

  if (!trimmed.startsWith("/") || trimmed.includes("..") || trimmed.includes("\\")) {
    throw new Error("UPLOAD_PUBLIC_BASE_PATH deve ser um caminho público absoluto, como /media/uploads.");
  }

  return trimmed.replace(/\/+$/g, "") || "/";
}

function getConfiguredUploadMode(): UploadStorageMode | undefined {
  const rawMode = readTrimmedEnv("UPLOAD_STORAGE_MODE");

  if (!rawMode) {
    return undefined;
  }

  if (!allowedUploadStorageModes.has(rawMode)) {
    throw new Error("UPLOAD_STORAGE_MODE deve ser local ou volume.");
  }

  return rawMode as UploadStorageMode;
}

function getDefaultLocalLotDirectory() {
  return path.join(/* turbopackIgnore: true */ process.cwd(), ".uploads", "lotes");
}

function normalizeUploadDirectory(value: string) {
  return path.isAbsolute(value)
    ? path.normalize(value)
    : path.join(/* turbopackIgnore: true */ process.cwd(), value);
}

function getUploadConfigurationIssue(mode: UploadStorageMode | undefined) {
  if (shouldEnforceProductionEnvironment() && mode !== "volume") {
    return "Defina UPLOAD_STORAGE_MODE=volume para salvar uploads em produção.";
  }

  if (mode === "volume" && !readTrimmedEnv("UPLOAD_VOLUME_DIR")) {
    return "Defina UPLOAD_VOLUME_DIR com o caminho do Railway Volume para salvar uploads.";
  }

  if (shouldEnforceProductionEnvironment() && !readTrimmedEnv("UPLOAD_PUBLIC_BASE_PATH")) {
    return "Defina UPLOAD_PUBLIC_BASE_PATH com o caminho público dos uploads.";
  }

  return null;
}

export function getLotUploadStorageConfig(): LotUploadStorageConfig {
  const configuredMode = getConfiguredUploadMode();
  const issue = getUploadConfigurationIssue(configuredMode);

  if (issue) {
    throw new Error(issue);
  }

  const mode = configuredMode ?? "local";
  const configuredDirectory = readTrimmedEnv("UPLOAD_VOLUME_DIR");

  if (mode === "volume" && configuredDirectory && !path.isAbsolute(configuredDirectory)) {
    throw new Error("UPLOAD_VOLUME_DIR deve ser um caminho absoluto.");
  }

  const lotDirectory =
    mode === "volume"
      ? path.normalize(configuredDirectory ?? "")
      : normalizeUploadDirectory(configuredDirectory ?? getDefaultLocalLotDirectory());

  return {
    lotDirectory,
    mode,
    publicBasePath: normalizePublicBasePath(
      readTrimmedEnv("UPLOAD_PUBLIC_BASE_PATH") ?? defaultPublicBasePath,
    ),
  };
}

export function buildLotUploadPublicPath(input: {
  fileName: string;
  lotStorageKey: string;
}) {
  const config = getLotUploadStorageConfig();

  return [
    config.publicBasePath,
    lotUploadPublicSegment,
    input.lotStorageKey,
    input.fileName,
  ].join("/");
}

export function assertInsideDirectory(parent: string, target: string) {
  const relativePath = path.relative(parent, target);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Caminho de upload inválido.");
  }
}
