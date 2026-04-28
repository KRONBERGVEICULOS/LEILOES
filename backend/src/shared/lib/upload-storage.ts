import "server-only";

import path from "node:path";

import { readTrimmedEnv, shouldEnforceProductionEnvironment } from "@/shared/config/env";
import {
  getR2StorageConfig,
  getR2StorageConfigurationIssue,
} from "@/shared/storage/r2";

export const lotUploadPublicSegment = "lotes";

const defaultPublicBasePath = "/media/uploads";
const defaultLotImageMaxMb = 8;
const allowedUploadStorageModes = new Set(["local", "volume", "r2"]);

export type UploadStorageMode = "local" | "volume" | "r2";

export type FileSystemLotUploadStorageConfig = {
  lotDirectory: string;
  mode: "local" | "volume";
  publicBasePath: string;
};

export type R2LotUploadStorageConfig = {
  mode: "r2";
  publicBaseUrl: string;
};

export type LotUploadStorageConfig =
  | FileSystemLotUploadStorageConfig
  | R2LotUploadStorageConfig;

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
    throw new Error("UPLOAD_STORAGE_MODE deve ser local, volume ou r2.");
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
  if (shouldEnforceProductionEnvironment() && mode !== "r2") {
    return "Defina UPLOAD_STORAGE_MODE=r2 para salvar uploads em produção com Cloudflare R2.";
  }

  if (mode === "r2") {
    return getR2StorageConfigurationIssue();
  }

  if (mode === "volume" && !readTrimmedEnv("UPLOAD_VOLUME_DIR")) {
    return "Defina UPLOAD_VOLUME_DIR com o caminho do Railway Volume para salvar uploads.";
  }

  if (shouldEnforceProductionEnvironment() && !readTrimmedEnv("UPLOAD_PUBLIC_BASE_PATH")) {
    return "Defina UPLOAD_PUBLIC_BASE_PATH com o caminho público dos uploads.";
  }

  return null;
}

export function getLotImageMaxMegabytes() {
  const rawValue = readTrimmedEnv("LOT_IMAGE_MAX_MB");

  if (!rawValue) {
    return defaultLotImageMaxMb;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value <= 0 || value > defaultLotImageMaxMb) {
    throw new Error(`LOT_IMAGE_MAX_MB deve ser um número entre 1 e ${defaultLotImageMaxMb}.`);
  }

  return value;
}

export function getLotUploadStorageConfig(): LotUploadStorageConfig {
  const configuredMode = getConfiguredUploadMode();
  const issue = getUploadConfigurationIssue(configuredMode);

  if (issue) {
    throw new Error(issue);
  }

  const mode = configuredMode ?? "local";

  if (mode === "r2") {
    return {
      mode,
      publicBaseUrl: getR2StorageConfig().publicBaseUrl,
    };
  }

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

export function getFileSystemLotUploadStorageConfig() {
  const config = getLotUploadStorageConfig();

  if (config.mode === "r2") {
    throw new Error("Storage local de uploads está desabilitado quando UPLOAD_STORAGE_MODE=r2.");
  }

  return config;
}

export function buildLotUploadPublicPath(input: {
  fileName: string;
  lotStorageKey: string;
}) {
  const config = getFileSystemLotUploadStorageConfig();

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
