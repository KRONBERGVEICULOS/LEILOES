"use server";

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
    statusKey: readString(formData, "statusKey"),
    isFeatured: readString(formData, "isFeatured"),
    isVisible: readString(formData, "isVisible"),
  } satisfies Record<string, string | undefined>;
}

function revalidateLotPaths(result: AdminLotMutationResult) {
  revalidatePath("/admin");
  revalidatePath("/admin/lotes");
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
  const validated = adminLotSchema.safeParse(rawValues);

  if (!validated.success) {
    return {
      status: "error",
      message: "Revise os campos destacados antes de salvar o lote.",
      errors: validated.error.flatten().fieldErrors,
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
  const parsedGallery = parseGalleryLines(validated.data.gallery ?? "");
  const details = splitLines(validated.data.details);
  const highlights = splitLines(validated.data.highlights);
  const facts = splitLines(validated.data.facts ?? "");

  if (!referenceValueCents || !currentValueCents || !minimumIncrementCents) {
    return {
      status: "error",
      message: "Os campos de preço precisam ter valores monetários válidos.",
      errors: {
        ...(!referenceValueCents
          ? { referencePrice: ["Informe um preço de referência válido."] }
          : {}),
        ...(!currentValueCents ? { currentPrice: ["Informe um preço atual válido."] } : {}),
        ...(!minimumIncrementCents
          ? { minimumIncrement: ["Informe um incremento mínimo válido."] }
          : {}),
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

  if (!details.length || !highlights.length || !parsedGallery.gallery.length) {
    return {
      status: "error",
      message: "Preencha descrição detalhada, destaques e galeria antes de salvar.",
      errors: {
        ...(!details.length ? { details: ["Adicione ao menos uma linha de descrição."] } : {}),
        ...(!highlights.length
          ? { highlights: ["Adicione ao menos um destaque para o lote."] }
          : {}),
        ...(!parsedGallery.gallery.length
          ? { gallery: ["Cadastre ao menos uma imagem com URL e texto alternativo."] }
          : {}),
      },
      values: rawValues,
    };
  }

  try {
    const result = await saveAdminLot({
      id: readString(formData, "id") || undefined,
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
      gallery: parsedGallery.gallery,
      year: validated.data.year || undefined,
      mileage: validated.data.mileage || undefined,
      fuel: validated.data.fuel || undefined,
      transmission: validated.data.transmission || undefined,
      referenceValueCents,
      currentValueCents,
      minimumIncrementCents,
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
