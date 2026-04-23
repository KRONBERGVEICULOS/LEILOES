"use server";

import { redirect } from "next/navigation";

import { adminLoginSchema, initialAdminActionState, type AdminActionState } from "@/backend/features/admin/forms";
import {
  areAdminCredentialsConfigured,
  createAdminSession,
  destroyAdminSession,
  validateAdminCredentials,
} from "@/backend/features/admin/server/auth";

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/admin";
  }

  return value.startsWith("/admin") ? value : "/admin";
}

export async function loginAdminAction(
  previousState: AdminActionState = initialAdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  const username = typeof formData.get("username") === "string" ? String(formData.get("username")) : "";
  const validated = adminLoginSchema.safeParse({
    username,
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      status: "error",
      message: "Informe usuário e senha do administrador.",
      errors: validated.error.flatten().fieldErrors,
      values: {
        username,
      },
    };
  }

  if (!areAdminCredentialsConfigured()) {
    return {
      status: "error",
      message: "Credenciais administrativas não configuradas neste ambiente.",
      values: {
        username: validated.data.username,
      },
    };
  }

  const isValid = validateAdminCredentials(
    validated.data.username,
    validated.data.password,
  );

  if (!isValid) {
    return {
      status: "error",
      message: "Usuário ou senha do administrador inválidos.",
      values: {
        username: validated.data.username,
      },
    };
  }

  await createAdminSession();
  redirect(getSafeRedirectPath(formData.get("redirectTo")));
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect("/admin/login?logout=1");
}
