"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
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
  saveAdminLot,
  setAdminLotFeatured,
  setAdminLotVisibility,
  type AdminLotMutationResult,
} from "@/backend/features/admin/server/repository";
import { parseCurrencyInput } from "@/backend/features/platform/forms";

const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const imageExtensionByMimeType = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maximumImageUploadSizeBytes = 8 * 1024 * 1024;

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

function validateImageUploads(files: File[]) {
  const errors: string[] = [];

  files.forEach((file) => {
    if (!allowedImageMimeTypes.has(file.type)) {
      errors.push(`${file.name}: use apenas imagens JPEG, PNG ou WebP.`);
    }

    if (file.size > maximumImageUploadSizeBytes) {
      errors.push(`${file.name}: limite de 8 MB por imagem.`);
    }
  });

  return errors;
}

function assertInsideDirectory(parent: string, target: string) {
  const relativePath = path.relative(parent, target);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Caminho de upload inválido.");
  }
}

async function saveLocalLotImages(input: {
  files: File[];
  lotStorageKey: string;
  title: string;
}) {
  if (!input.files.length) {
    return [];
  }

  const safeLotKey = sanitizePathSegment(input.lotStorageKey) || `lote-${Date.now()}`;
  const mediaRoot = path.resolve(process.cwd(), "public", "media", "lotes");
  const lotDirectory = path.resolve(mediaRoot, safeLotKey);

  assertInsideDirectory(mediaRoot, lotDirectory);
  await mkdir(lotDirectory, { recursive: true });

  const savedImages: MediaAsset[] = [];

  for (const [index, file] of input.files.entries()) {
    const extension = imageExtensionByMimeType.get(file.type);

    if (!extension) {
      throw new Error(`${file.name}: formato de imagem não permitido.`);
    }

    const fileName = [
      Date.now(),
      index + 1,
      randomUUID().slice(0, 8),
      sanitizeFileStem(file.name),
    ].join("-") + `.${extension}`;
    const targetPath = path.resolve(lotDirectory, fileName);

    assertInsideDirectory(lotDirectory, targetPath);
    await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

    savedImages.push({
      src: `/media/lotes/${safeLotKey}/${fileName}`,
      alt: `${input.title} - imagem ${index + 1}`,
    });
  }

  return savedImages;
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

  const imageUploadErrors = validateImageUploads(imageUploads);

  if (imageUploadErrors.length) {
    return {
      status: "error",
      message: "Revise os arquivos selecionados antes de salvar o lote.",
      errors: {
        imageUploads: imageUploadErrors,
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
    const uploadedGallery = await saveLocalLotImages({
      files: imageUploads,
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
