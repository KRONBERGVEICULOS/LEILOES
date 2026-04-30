"use server";

import { randomUUID } from "node:crypto";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import type { MediaAsset } from "@/backend/features/auctions/types";
import { adminLotSchema, initialAdminActionState, type AdminActionState } from "@/backend/features/admin/forms";
import { requireAdminSession } from "@/backend/features/admin/server/auth";
import {
  duplicateAdminLot,
  getAdminReferenceData,
  archiveAdminLot,
  saveAdminLot,
  setAdminLotFeatured,
  setAdminLotVisibility,
  type AdminLotMutationResult,
} from "@/backend/features/admin/server/repository";
import { parseCurrencyInput } from "@/backend/features/platform/forms";
import { resolveMaximumPreBidAmountCents } from "@/shared/lib/pre-bid-policy";
import { getLotImageMaxMegabytes } from "@/shared/lib/upload-storage";
import {
  saveLotImagesToStorage,
  type PreparedLotImageUpload,
} from "@/shared/storage/lot-images";

const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const blockedImageFileNameExtensions = new Set([
  "svg",
  "txt",
  "html",
  "htm",
  "js",
  "mjs",
  "php",
  "exe",
]);
const imageExtensionByMimeType = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maximumImageUploadCount = 8;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readSafeAdminPath(formData: FormData, key: string, fallback: string) {
  const value = readString(formData, key);
  return value.startsWith("/admin") ? value : fallback;
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSafeDisplayFileName(value: string) {
  return value.replace(/[\r\n\t]/g, " ").trim().slice(0, 120) || "arquivo";
}

function getFileExtension(value: string) {
  return path.extname(value).replace(".", "").toLowerCase();
}

function getFileNameExtensions(value: string) {
  return value
    .split(".")
    .slice(1)
    .map((extension) => extension.trim().toLowerCase())
    .filter(Boolean);
}

function isUploadedFile(value: FormDataEntryValue): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value &&
    "type" in value
  );
}

function readImageUploads(formData: FormData) {
  return formData
    .getAll("imageUploads")
    .filter(isUploadedFile)
    .filter((file) => file.size > 0 && file.name.trim().length > 0);
}

function detectImageMimeType(buffer: Buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function formatMegabyteLimit(value: number) {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  })} MB`;
}

async function prepareImageUploads(files: File[]) {
  const errors: string[] = [];
  const preparedUploads: PreparedLotImageUpload[] = [];
  let maximumImageUploadSizeMegabytes: number;

  try {
    maximumImageUploadSizeMegabytes = getLotImageMaxMegabytes();
  } catch (error) {
    return {
      errors: [
        error instanceof Error
          ? error.message
          : "Configuração de limite de upload inválida.",
      ],
      uploads: [],
    };
  }

  const maximumImageUploadSizeBytes =
    Math.floor(maximumImageUploadSizeMegabytes * 1024 * 1024);
  const maximumImageUploadTotalSizeBytes =
    maximumImageUploadCount * maximumImageUploadSizeBytes;

  if (files.length > maximumImageUploadCount) {
    errors.push(`Envie no máximo ${maximumImageUploadCount} imagens por lote.`);
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > maximumImageUploadTotalSizeBytes) {
    errors.push(
      `O envio total de imagens ultrapassa ${formatMegabyteLimit(
        maximumImageUploadCount * maximumImageUploadSizeMegabytes,
      )}.`,
    );
  }

  for (const file of files) {
    const safeName = getSafeDisplayFileName(file.name);
    const originalExtension = getFileExtension(file.name);
    const fileNameExtensions = getFileNameExtensions(file.name);

    if (!allowedImageMimeTypes.has(file.type)) {
      errors.push(`${safeName}: use apenas imagens JPEG, PNG ou WebP.`);
      continue;
    }

    if (
      fileNameExtensions.some((extension) =>
        blockedImageFileNameExtensions.has(extension),
      )
    ) {
      errors.push(`${safeName}: nome de arquivo com extensão bloqueada.`);
      continue;
    }

    if (!allowedImageExtensions.has(originalExtension)) {
      errors.push(`${safeName}: extensão de arquivo não permitida.`);
      continue;
    }

    if (file.size > maximumImageUploadSizeBytes) {
      errors.push(
        `${safeName}: limite de ${formatMegabyteLimit(
          maximumImageUploadSizeMegabytes,
        )} por imagem.`,
      );
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedMimeType = detectImageMimeType(buffer);

    if (!detectedMimeType || detectedMimeType !== file.type) {
      errors.push(`${safeName}: o conteúdo não corresponde a JPEG, PNG ou WebP válido.`);
      continue;
    }

    const extension = imageExtensionByMimeType.get(detectedMimeType);

    if (!extension) {
      errors.push(`${safeName}: formato de imagem não permitido.`);
      continue;
    }

    preparedUploads.push({
      buffer,
      contentType: detectedMimeType,
      extension,
      originalFileName: file.name,
      size: file.size,
    });
  }

  return {
    errors,
    uploads: errors.length ? [] : preparedUploads,
  };
}

function parseGalleryLines(value: string) {
  const items = splitLines(value);
  const gallery: MediaAsset[] = [];
  const invalidLineNumbers: number[] = [];

  for (const [index, item] of items.entries()) {
    const [src, ...altParts] = item.split("|");
    const normalizedSrc = src?.trim();

    if (!normalizedSrc) {
      invalidLineNumbers.push(index + 1);
      continue;
    }

    gallery.push({
      src: normalizedSrc,
      alt: altParts.join("|").trim() || `Imagem ${index + 1} do lote`,
    });
  }

  return {
    gallery,
    invalidLineNumbers,
  };
}

function collectLotFormValues(formData: FormData) {
  return {
    title: readString(formData, "title"),
    slug: readString(formData, "slug"),
    lotCode: readString(formData, "lotCode"),
    eventSlug: readString(formData, "eventSlug"),
    category: readString(formData, "category"),
    location: readString(formData, "location"),
    overview: readString(formData, "overview"),
    details: readString(formData, "details"),
    observations: readString(formData, "observations"),
    sourceNote: readString(formData, "sourceNote"),
    highlights: readString(formData, "highlights"),
    facts: readString(formData, "facts"),
    gallery: readString(formData, "gallery"),
    year: readString(formData, "year"),
    mileage: readString(formData, "mileage"),
    fuel: readString(formData, "fuel"),
    transmission: readString(formData, "transmission"),
    referencePrice: readString(formData, "referencePrice"),
    currentPrice: readString(formData, "currentPrice"),
    minimumIncrement: readString(formData, "minimumIncrement"),
    maximumPreBid: readString(formData, "maximumPreBid"),
    statusKey: readString(formData, "statusKey"),
    isFeatured: readString(formData, "isFeatured"),
    isVisible: readString(formData, "isVisible"),
  } satisfies Record<string, string | undefined>;
}

function revalidateLotPaths(result: AdminLotMutationResult) {
  revalidatePath("/admin");
  revalidatePath("/admin/lotes");
  revalidatePath("/admin/pre-lances");
  revalidatePath("/admin/interesses");
  revalidatePath(`/admin/lotes/${result.id}/editar`);
  revalidatePath("/");
  revalidatePath("/eventos");
  revalidatePath(`/eventos/${result.eventSlug}`);
  revalidatePath(`/lotes/${result.slug}`);

  if (result.previousSlug && result.previousSlug !== result.slug) {
    revalidatePath(`/lotes/${result.previousSlug}`);
  }
}

export async function saveAdminLotAction(
  previousState: AdminActionState = initialAdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  await requireAdminSession("/admin/lotes");

  const rawValues = collectLotFormValues(formData);
  const imageUploads = readImageUploads(formData);
  const validated = adminLotSchema.safeParse(rawValues);

  if (!validated.success) {
    return {
      status: "error",
      message: "Revise os campos destacados antes de salvar o lote.",
      errors: validated.error.flatten().fieldErrors,
      values: rawValues,
    };
  }

  const preparedImageUploads = await prepareImageUploads(imageUploads);

  if (preparedImageUploads.errors.length) {
    return {
      status: "error",
      message: "Revise os arquivos selecionados antes de salvar o lote.",
      errors: {
        imageUploads: preparedImageUploads.errors,
      },
      values: rawValues,
    };
  }

  const allowedEventSlugs = new Set(
    getAdminReferenceData().events.map((event) => event.slug),
  );

  if (!allowedEventSlugs.has(validated.data.eventSlug)) {
    return {
      status: "error",
      message: "Selecione um evento válido antes de salvar o lote.",
      errors: {
        eventSlug: ["Escolha um evento existente na operação."],
      },
      values: rawValues,
    };
  }

  const referenceValueCents = parseCurrencyInput(validated.data.referencePrice);
  const currentValueCents = parseCurrencyInput(validated.data.currentPrice);
  const minimumIncrementCents = parseCurrencyInput(validated.data.minimumIncrement);
  const maximumPreBidAmountCents = validated.data.maximumPreBid
    ? parseCurrencyInput(validated.data.maximumPreBid)
    : null;
  const parsedGallery = parseGalleryLines(validated.data.gallery ?? "");
  const details = splitLines(validated.data.details);
  const highlights = splitLines(validated.data.highlights);
  const facts = splitLines(validated.data.facts ?? "");

  if (
    !referenceValueCents ||
    !currentValueCents ||
    !minimumIncrementCents ||
    (validated.data.maximumPreBid && !maximumPreBidAmountCents)
  ) {
    return {
      status: "error",
      message: "Os campos de preço precisam ter valores monetários válidos.",
      errors: {
        ...(!referenceValueCents
          ? { referencePrice: ["Informe um preço de referência válido."] }
          : {}),
        ...(!currentValueCents ? { currentPrice: ["Informe um valor separado válido."] } : {}),
        ...(!minimumIncrementCents
          ? { minimumIncrement: ["Informe um incremento mínimo válido."] }
          : {}),
        ...(validated.data.maximumPreBid && !maximumPreBidAmountCents
          ? { maximumPreBid: ["Informe um teto de pré-lance válido."] }
          : {}),
      },
      values: rawValues,
    };
  }

  if (
    maximumPreBidAmountCents &&
    maximumPreBidAmountCents < referenceValueCents + minimumIncrementCents
  ) {
    return {
      status: "error",
      message: "O teto manual precisa permitir pelo menos o próximo incremento do lote.",
      errors: {
        maximumPreBid: [
          "Informe um teto maior que a referência somada ao incremento mínimo.",
        ],
      },
      values: rawValues,
    };
  }

  const effectiveMaximumPreBidAmountCents = resolveMaximumPreBidAmountCents({
    referenceValueCents,
    maximumPreBidAmountCents,
  });

  if (currentValueCents > effectiveMaximumPreBidAmountCents) {
    return {
      status: "error",
      message: "O valor separado não pode ficar acima do teto operacional do lote.",
      errors: {
        currentPrice: [
          "Ajuste o valor separado para ficar dentro do teto de pré-lance.",
        ],
      },
      values: rawValues,
    };
  }

  if (parsedGallery.invalidLineNumbers.length) {
    const invalidLinesLabel = parsedGallery.invalidLineNumbers.join(", ");
    const lineLabel =
      parsedGallery.invalidLineNumbers.length === 1 ? "A linha" : "As linhas";
    const verbLabel =
      parsedGallery.invalidLineNumbers.length === 1 ? "está" : "estão";

    return {
      status: "error",
      message: "Revise a galeria antes de salvar o lote.",
      errors: {
        gallery: [
          `${lineLabel} ${invalidLinesLabel} ${verbLabel} sem URL da imagem. Use o formato "URL | texto alternativo".`,
        ],
      },
      values: rawValues,
    };
  }

  const hasGalleryImage = parsedGallery.gallery.length > 0 || imageUploads.length > 0;

  if (!details.length || !highlights.length || !hasGalleryImage) {
    return {
      status: "error",
      message: "Preencha descrição detalhada, destaques e galeria antes de salvar.",
      errors: {
        ...(!details.length ? { details: ["Adicione ao menos uma linha de descrição."] } : {}),
        ...(!highlights.length
          ? { highlights: ["Adicione ao menos um destaque para o lote."] }
          : {}),
        ...(!hasGalleryImage
          ? { gallery: ["Cadastre uma imagem por URL ou selecione um arquivo para upload."] }
          : {}),
      },
      values: rawValues,
    };
  }

  try {
    const targetId = readString(formData, "id") || randomUUID();
    const uploadedGallery = await saveLotImagesToStorage({
      files: preparedImageUploads.uploads,
      lotStorageKey: targetId,
      title: validated.data.title,
    });
    const mergedGallery = [...parsedGallery.gallery, ...uploadedGallery];

    const result = await saveAdminLot({
      id: targetId,
      title: validated.data.title,
      slug: validated.data.slug || validated.data.title,
      lotCode: validated.data.lotCode,
      eventSlug: validated.data.eventSlug,
      category: validated.data.category,
      location: validated.data.location,
      overview: validated.data.overview,
      details,
      observations: validated.data.observations,
      sourceNote: validated.data.sourceNote ?? "",
      highlights,
      facts,
      gallery: mergedGallery,
      year: validated.data.year || undefined,
      mileage: validated.data.mileage || undefined,
      fuel: validated.data.fuel || undefined,
      transmission: validated.data.transmission || undefined,
      referenceValueCents,
      currentValueCents,
      minimumIncrementCents,
      maximumPreBidAmountCents,
      statusKey: validated.data.statusKey as Parameters<typeof saveAdminLot>[0]["statusKey"],
      isFeatured: validated.data.isFeatured === "on",
      isVisible: validated.data.isVisible === "on",
    });

    revalidateLotPaths(result);
    redirect(
      `/admin/lotes/${result.id}/editar?saved=${readString(formData, "id") ? "updated" : "created"}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Não foi possível salvar o lote agora.",
      values: rawValues,
    };
  }
}

export async function duplicateAdminLotAction(formData: FormData) {
  await requireAdminSession("/admin/lotes");

  const id = readString(formData, "id");

  if (!id) {
    redirect(readSafeAdminPath(formData, "returnTo", "/admin/lotes"));
  }

  const result = await duplicateAdminLot(id);
  revalidateLotPaths(result);
  redirect(`/admin/lotes/${result.id}/editar?saved=duplicated`);
}

export async function toggleAdminLotVisibilityAction(formData: FormData) {
  await requireAdminSession("/admin/lotes");

  const id = readString(formData, "id");
  const mode = readString(formData, "mode");

  if (!id || !["show", "hide"].includes(mode)) {
    redirect(readSafeAdminPath(formData, "returnTo", "/admin/lotes"));
  }

  const result = await setAdminLotVisibility(id, mode === "show");
  revalidateLotPaths(result);
  redirect(
    `${readSafeAdminPath(formData, "returnTo", "/admin/lotes")}?saved=${mode === "show" ? "shown" : "hidden"}`,
  );
}

export async function toggleAdminLotFeaturedAction(formData: FormData) {
  await requireAdminSession("/admin/lotes");

  const id = readString(formData, "id");
  const mode = readString(formData, "mode");

  if (!id || !["feature", "unfeature"].includes(mode)) {
    redirect(readSafeAdminPath(formData, "returnTo", "/admin/lotes"));
  }

  const result = await setAdminLotFeatured(id, mode === "feature");
  revalidateLotPaths(result);
  redirect(
    `${readSafeAdminPath(formData, "returnTo", "/admin/lotes")}?saved=${mode === "feature" ? "featured" : "unfeatured"}`,
  );
}

export async function archiveAdminLotAction(formData: FormData) {
  await requireAdminSession("/admin/lotes");

  const id = readString(formData, "id");

  if (!id) {
    redirect(readSafeAdminPath(formData, "returnTo", "/admin/lotes"));
  }

  const result = await archiveAdminLot(id);
  revalidateLotPaths(result);
  redirect(`${readSafeAdminPath(formData, "returnTo", "/admin/lotes")}?saved=archived`);
}
