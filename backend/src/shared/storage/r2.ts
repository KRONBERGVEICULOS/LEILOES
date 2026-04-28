import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { readTrimmedEnv } from "@/shared/config/env";

type R2StorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
  endpoint: string;
};

type R2UploadInput = {
  body: Buffer;
  contentType: string;
  objectKey: string;
};

export type R2UploadResult = {
  contentType: string;
  objectKey: string;
  publicUrl: string;
  size: number;
};

const requiredR2EnvKeys = [
  "CLOUDFLARE_R2_ACCOUNT_ID",
  "CLOUDFLARE_R2_ACCESS_KEY_ID",
  "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  "CLOUDFLARE_R2_BUCKET",
  "CLOUDFLARE_R2_PUBLIC_BASE_URL",
] as const;

const globalForR2Storage = globalThis as typeof globalThis & {
  __kronR2Client?: S3Client;
  __kronR2ClientKey?: string;
};

function isTruthyEnvValue(value?: string) {
  return ["1", "true", "yes"].includes(value?.trim().toLowerCase() ?? "");
}

function normalizePublicBaseUrl(value: string) {
  const normalized = value.trim().replace(/\/+$/g, "");

  try {
    const parsed = new URL(normalized);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }

    return parsed.toString().replace(/\/+$/g, "");
  } catch {
    throw new Error("CLOUDFLARE_R2_PUBLIC_BASE_URL deve ser uma URL http(s) válida.");
  }
}

function assertSafeObjectKey(objectKey: string) {
  if (
    !objectKey ||
    objectKey.startsWith("/") ||
    objectKey.includes("\\") ||
    objectKey.includes("..") ||
    objectKey.includes("\0")
  ) {
    throw new Error("Chave de objeto R2 inválida.");
  }
}

export function getR2StorageConfigurationIssue() {
  if (!isTruthyEnvValue(readTrimmedEnv("CLOUDFLARE_R2_ENABLED"))) {
    return "Defina CLOUDFLARE_R2_ENABLED=true para habilitar upload em R2.";
  }

  const missingKeys = requiredR2EnvKeys.filter((key) => !readTrimmedEnv(key));

  if (missingKeys.length) {
    return `Configuração R2 incompleta. Defina: ${missingKeys.join(", ")}.`;
  }

  try {
    normalizePublicBaseUrl(readTrimmedEnv("CLOUDFLARE_R2_PUBLIC_BASE_URL") ?? "");
  } catch (error) {
    return error instanceof Error ? error.message : "Configuração R2 inválida.";
  }

  return null;
}

export function getR2StorageConfig(): R2StorageConfig {
  const issue = getR2StorageConfigurationIssue();

  if (issue) {
    throw new Error(issue);
  }

  const accountId = readTrimmedEnv("CLOUDFLARE_R2_ACCOUNT_ID")!;

  return {
    accountId,
    accessKeyId: readTrimmedEnv("CLOUDFLARE_R2_ACCESS_KEY_ID")!,
    secretAccessKey: readTrimmedEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")!,
    bucket: readTrimmedEnv("CLOUDFLARE_R2_BUCKET")!,
    publicBaseUrl: normalizePublicBaseUrl(
      readTrimmedEnv("CLOUDFLARE_R2_PUBLIC_BASE_URL")!,
    ),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  };
}

function getR2Client(config: R2StorageConfig) {
  const clientKey = `${config.endpoint}:${config.accessKeyId}:${config.bucket}`;

  if (
    globalForR2Storage.__kronR2Client &&
    globalForR2Storage.__kronR2ClientKey === clientKey
  ) {
    return globalForR2Storage.__kronR2Client;
  }

  globalForR2Storage.__kronR2Client = new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    region: "auto",
  });
  globalForR2Storage.__kronR2ClientKey = clientKey;

  return globalForR2Storage.__kronR2Client;
}

export async function uploadObjectToR2(input: R2UploadInput): Promise<R2UploadResult> {
  assertSafeObjectKey(input.objectKey);

  const config = getR2StorageConfig();
  const client = getR2Client(config);

  await client.send(
    new PutObjectCommand({
      Body: input.body,
      Bucket: config.bucket,
      CacheControl: "public, max-age=31536000, immutable",
      ContentType: input.contentType,
      Key: input.objectKey,
    }),
  );

  return {
    contentType: input.contentType,
    objectKey: input.objectKey,
    publicUrl: `${config.publicBaseUrl}/${input.objectKey}`,
    size: input.body.length,
  };
}
