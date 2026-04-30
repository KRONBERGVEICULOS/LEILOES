"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/backend/features/admin/server/auth";
import { cancelAdminPreBid } from "@/backend/features/admin/server/repository";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readSafeAdminPath(formData: FormData, key: string, fallback: string) {
  const value = readString(formData, key);
  return value.startsWith("/admin") ? value : fallback;
}

export async function cancelAdminPreBidAction(formData: FormData) {
  await requireAdminSession("/admin/pre-lances");

  const id = readString(formData, "id");
  const returnTo = readSafeAdminPath(formData, "returnTo", "/admin/pre-lances");

  if (!id) {
    redirect(returnTo);
  }

  const result = await cancelAdminPreBid(id);

  revalidatePath("/");
  revalidatePath("/eventos");
  if (result.eventSlug) {
    revalidatePath(`/eventos/${result.eventSlug}`);
  }
  revalidatePath(`/lotes/${result.lotSlug}`);
  revalidatePath("/area");
  revalidatePath("/admin");
  revalidatePath("/admin/lotes");
  revalidatePath("/admin/pre-lances");
  revalidatePath("/admin/usuarios");

  redirect(`${returnTo}?saved=cancelled`);
}
