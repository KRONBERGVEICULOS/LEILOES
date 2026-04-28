import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { MediaAsset } from "@/backend/features/auctions/types";
import {
  assertInsideDirectory,
  buildLotUploadPublicPath,
  getLotUploadStorageConfig,
  lotUploadPublicSegment,
} from "@/shared/lib/upload-storage";
import { uploadObjectToR2 } from "@/shared/storage/r2";

export type PreparedLotImageUpload = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  originalFileName: string;
  size: number;
};

type SaveLotImagesInput = {
  files: PreparedLotImageUpload[];
  lotStorageKey: string;
  title: string;
};

function sanitizePathSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function sanitizeFileStem(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/\.[^.]+$/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "imagem"
  );
}

function buildSafeImageFileName(upload: PreparedLotImageUpload, index: number) {
  const timestamp = Date.now() + index;

  return `${timestamp}-${sanitizeFileStem(upload.originalFileName)}.${upload.extension}`;
}

function buildAltText(title: string, index: number) {
  return `${title} - imagem ${index + 1}`;
}

async function saveLotImagesToFileSystem(input: SaveLotImagesInput) {
  const safeLotKey = sanitizePathSegment(input.lotStorageKey) || `lote-${Date.now()}`;
  const storage = getLotUploadStorageConfig();

  if (storage.mode === "r2") {
    throw new Error("Storage local de uploads está desabilitado quando UPLOAD_STORAGE_MODE=r2.");
  }

  const lotDirectory = path.resolve(storage.lotDirectory, safeLotKey);

  assertInsideDirectory(storage.lotDirectory, lotDirectory);

  try {
    await mkdir(lotDirectory, { recursive: true });
  } catch {
    throw new Error("Não foi possível preparar a pasta de imagens do lote.");
  }

  const savedImages: MediaAsset[] = [];

  for (const [index, upload] of input.files.entries()) {
    const fileName = buildSafeImageFileName(upload, index);
    const targetPath = path.resolve(lotDirectory, fileName);

    assertInsideDirectory(lotDirectory, targetPath);

    try {
      await writeFile(targetPath, upload.buffer, { flag: "wx" });
    } catch {
      throw new Error("Não foi possível salvar uma das imagens enviadas.");
    }

    savedImages.push({
      alt: buildAltText(input.title, index),
      contentType: upload.contentType,
      objectKey: `${lotUploadPublicSegment}/${safeLotKey}/${fileName}`,
      size: upload.size,
      src: buildLotUploadPublicPath({
        fileName,
        lotStorageKey: safeLotKey,
      }),
      storage: storage.mode,
    });
  }

  return savedImages;
}

async function saveLotImagesToR2(input: SaveLotImagesInput) {
  const safeLotKey = sanitizePathSegment(input.lotStorageKey) || `lote-${Date.now()}`;
  const savedImages: MediaAsset[] = [];

  for (const [index, upload] of input.files.entries()) {
    const fileName = buildSafeImageFileName(upload, index);
    const objectKey = `${lotUploadPublicSegment}/${safeLotKey}/${fileName}`;
    const result = await uploadObjectToR2({
      body: upload.buffer,
      contentType: upload.contentType,
      objectKey,
    });

    savedImages.push({
      alt: buildAltText(input.title, index),
      contentType: result.contentType,
      objectKey: result.objectKey,
      size: result.size,
      src: result.publicUrl,
      storage: "r2",
    });
  }

  return savedImages;
}

export async function saveLotImagesToStorage(input: SaveLotImagesInput) {
  if (!input.files.length) {
    return [];
  }

  const storage = getLotUploadStorageConfig();

  if (storage.mode === "r2") {
    return saveLotImagesToR2(input);
  }

  return saveLotImagesToFileSystem(input);
}
