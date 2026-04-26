"use server";

import { redirect } from "next/navigation";

import { adminLoginSchema, initialAdminActionState, type AdminActionState } from "@/backend/features/admin/forms";
import {
  areAdminCredentialsConfigured,
  createAdminSession,
  destroyAdminSession,
  getAdminCredentialsIssue,
  validateAdminCredentials,
} from "@/backend/features/admin/server/auth";
import {
  consumeRateLimit,
  getRequestFingerprint,
} from "@/backend/features/platform/server/rate-limit";
import {
  isDatabaseConfigured,
  shouldUseLocalSeedData,
} from "@/backend/features/platform/server/mode";

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/admin";
  }

  return value.startsWith("/admin") ? value : "/admin";
}

async function consumeAdminLoginRateLimits(username: string) {
  const [globalKey, accountKey] = await Promise.all([
    getRequestFingerprint(["admin-login"]),
    getRequestFingerprint(["admin-login", username]),
  ]);

  const globalLimit = await consumeRateLimit({
    scope: "admin:login:global",
    key: globalKey,
    maxAttempts: 20,
    windowMs: 15 * 60 * 1000,
  });

  const accountLimit = await consumeRateLimit({
    scope: "admin:login",
    key: accountKey,
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
  });

  return {
    allowed: globalLimit.allowed && accountLimit.allowed,
  };
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
      message:
        getAdminCredentialsIssue() ??
        "Credenciais administrativas não configuradas neste ambiente.",
      values: {
        username: validated.data.username,
      },
    };
  }

  if (!isDatabaseConfigured() || shouldUseLocalSeedData()) {
    return {
      status: "error",
      message:
        "O painel administrativo exige PostgreSQL configurado. O modo local-seed não habilita a operação do admin.",
      values: {
        username: validated.data.username,
      },
    };
  }

  try {
    const loginRateLimit = await consumeAdminLoginRateLimits(
      validated.data.username,
    );

    if (!loginRateLimit.allowed) {
      return {
        status: "error",
        message:
          "Muitas tentativas de login administrativo. Aguarde alguns minutos antes de tentar novamente.",
        values: {
          username: validated.data.username,
        },
      };
    }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível validar o acesso administrativo agora.",
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
