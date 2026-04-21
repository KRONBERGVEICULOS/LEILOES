"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { initialAdminActionState, manualActivitySchema, type AdminActionState } from "@/backend/features/admin/forms";
import { requireAdminSession } from "@/backend/features/admin/server/auth";
import {
  createManualAdminActivity,
  getAdminLotById,
} from "@/backend/features/admin/server/repository";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readSafeAdminPath(formData: FormData, key: string, fallback: string) {
  const value = readString(formData, key);
  return value.startsWith("/admin") ? value : fallback;
}

export async function createManualActivityAction(
  previousState: AdminActionState = initialAdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  await requireAdminSession("/admin/atividade");

  const rawValues = {
    lotId: readString(formData, "lotId"),
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    audience: readString(formData, "audience") || "admin",
  };

  const validated = manualActivitySchema.safeParse(rawValues);

  if (!validated.success) {
    return {
      status: "error",
      message: "Revise o registro manual antes de salvar a atividade.",
      errors: validated.error.flatten().fieldErrors,
      values: rawValues,
    };
  }

  try {
    const lot = validated.data.lotId ? await getAdminLotById(validated.data.lotId) : null;

    await createManualAdminActivity({
      lotId: validated.data.lotId || undefined,
      title: validated.data.title,
      description: validated.data.description,
      audience: validated.data.audience,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/atividade");

    if (lot) {
      revalidatePath(`/admin/lotes/${lot.id}/editar`);
      revalidatePath(`/lotes/${lot.slug}`);
      revalidatePath(`/eventos/${lot.eventSlug}`);
    }

    if (validated.data.audience === "public") {
      revalidatePath("/");
      revalidatePath("/eventos");
    }

    redirect(`${readSafeAdminPath(formData, "returnTo", "/admin/atividade")}?saved=activity`);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a atividade manual.",
      values: rawValues,
    };
  }
}
