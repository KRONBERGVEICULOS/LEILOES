import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

function readEnv(key) {
  const value = process.env[key]?.trim();
  return value || null;
}

function requireEnv(key) {
  const value = readEnv(key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function normalizePublicBasePath(value) {
  const trimmed = value.trim();
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/g, "");
}

function normalizePublicBaseUrl(value) {
  const normalized = value.trim().replace(/\/+$/g, "");
  const parsed = new URL(normalized);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("CLOUDFLARE_R2_PUBLIC_BASE_URL must be an http(s) URL.");
  }

  return parsed.toString().replace(/\/+$/g, "");
}

function getStorageMode() {
  return readEnv("UPLOAD_STORAGE_MODE") ?? "local";
}

function getUploadLotDirectory() {
  const mode = getStorageMode();
  const configuredDirectory = readEnv("UPLOAD_VOLUME_DIR");

  if (mode === "volume" && !configuredDirectory) {
    throw new Error("UPLOAD_VOLUME_DIR is required when UPLOAD_STORAGE_MODE=volume.");
  }

  return path.resolve(configuredDirectory ?? path.join(process.cwd(), ".uploads", "lotes"));
}

function getR2Config() {
  const enabled = ["1", "true", "yes"].includes(
    readEnv("CLOUDFLARE_R2_ENABLED")?.toLowerCase() ?? "",
  );

  if (!enabled) {
    throw new Error("CLOUDFLARE_R2_ENABLED=true is required when UPLOAD_STORAGE_MODE=r2.");
  }

  const accountId = requireEnv("CLOUDFLARE_R2_ACCOUNT_ID");

  return {
    accountId,
    accessKeyId: requireEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    bucket: requireEnv("CLOUDFLARE_R2_BUCKET"),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    publicBaseUrl: normalizePublicBaseUrl(requireEnv("CLOUDFLARE_R2_PUBLIC_BASE_URL")),
    secretAccessKey: requireEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
  };
}

async function assertStatus(url, expectedStatus) {
  const response = await fetch(url);

  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} from ${url}, received ${response.status}.`);
  }

  return response;
}

async function validateFileSystemUploadStorage() {
  const baseUrl = new URL(process.argv[2] ?? process.env.SMOKE_BASE_URL ?? "http://localhost:3000");
  const publicBasePath = normalizePublicBasePath(
    process.env.UPLOAD_PUBLIC_BASE_PATH ?? "/media/uploads",
  );
  const lotDirectory = getUploadLotDirectory();
  const validationLotKey = "_validation";
  const fileName = `upload-storage-${Date.now()}.png`;
  const validationDirectory = path.join(lotDirectory, validationLotKey);
  const validationFile = path.join(validationDirectory, fileName);

  await mkdir(validationDirectory, { recursive: true });
  await writeFile(validationFile, tinyPng, { flag: "wx" });

  try {
    const imageUrl = new URL(
      `${publicBasePath}/lotes/${validationLotKey}/${fileName}`,
      baseUrl,
    ).toString();
    const imageResponse = await assertStatus(imageUrl, 200);
    const contentType = imageResponse.headers.get("content-type") ?? "";

    if (!contentType.startsWith("image/png")) {
      throw new Error(`Expected image/png content type, received ${contentType || "empty"}.`);
    }

    await assertStatus(
      new URL(`${publicBasePath}/lotes/${validationLotKey}/missing.png`, baseUrl).toString(),
      404,
    );
    await assertStatus(
      new URL(`${publicBasePath}/lotes/%2e%2e/package.json`, baseUrl).toString(),
      404,
    );

    console.log(`Upload storage validation passed: ${imageUrl}`);
  } finally {
    await rm(validationFile, { force: true });
  }
}

async function validateR2UploadStorage() {
  const config = getR2Config();
  const objectKey = `lotes/_validation/upload-storage-${Date.now()}.png`;
  const publicUrl = `${config.publicBaseUrl}/${objectKey}`;
  const client = new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    region: "auto",
  });

  await client.send(
    new PutObjectCommand({
      Body: tinyPng,
      Bucket: config.bucket,
      CacheControl: "public, max-age=300",
      ContentType: "image/png",
      Key: objectKey,
    }),
  );

  try {
    const imageResponse = await assertStatus(publicUrl, 200);
    const contentType = imageResponse.headers.get("content-type") ?? "";

    if (!contentType.startsWith("image/png")) {
      throw new Error(`Expected image/png content type, received ${contentType || "empty"}.`);
    }

    console.log(`R2 upload storage validation passed: ${publicUrl}`);
  } finally {
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
      }),
    );
  }
}

switch (getStorageMode()) {
  case "local":
  case "volume":
    await validateFileSystemUploadStorage();
    break;
  case "r2":
    await validateR2UploadStorage();
    break;
  default:
    throw new Error("UPLOAD_STORAGE_MODE must be local, volume, or r2.");
}
