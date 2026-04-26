import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

function normalizePublicBasePath(value) {
  const trimmed = value.trim();
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/g, "");
}

function getUploadLotDirectory() {
  const mode = process.env.UPLOAD_STORAGE_MODE ?? "local";
  const configuredDirectory = process.env.UPLOAD_VOLUME_DIR?.trim();

  if (mode === "volume" && !configuredDirectory) {
    throw new Error("UPLOAD_VOLUME_DIR is required when UPLOAD_STORAGE_MODE=volume.");
  }

  return path.resolve(configuredDirectory ?? path.join(process.cwd(), ".uploads", "lotes"));
}

async function assertStatus(url, expectedStatus) {
  const response = await fetch(url);

  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} from ${url}, received ${response.status}.`);
  }

  return response;
}

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
