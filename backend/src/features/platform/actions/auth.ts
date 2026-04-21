"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  loginFormSchema,
  signupFormSchema,
  type AuthActionState,
} from "@/backend/features/platform/forms";
import { normalizeInternalRedirect } from "@/backend/features/platform/lib/redirect";
import {
  createSession,
  destroyCurrentSession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/backend/features/platform/server/auth";
import { createUserRecord, findUserByEmail } from "@/backend/features/platform/server/repository";
import { isDatabaseConfigured } from "@/backend/features/platform/server/mode";
import {
  consumeRateLimit,
  getRequestFingerprint,
} from "@/backend/features/platform/server/rate-limit";

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  return normalizeInternalRedirect(value, "/area", {
    allowedPrefixes: ["/area", "/eventos", "/lotes"],
  });
}

export async function registerUserAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = signupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city") || undefined,
    password: formData.get("password"),
    privacyConsent: formData.get("privacyConsent"),
  });

  if (!validated.success) {
    return {
      status: "error",
      message: "Revise os campos destacados para concluir o cadastro.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: "error",
      message:
        "Cadastros estão indisponíveis neste ambiente. Configure DATABASE_URL para habilitar contas de usuário.",
    };
  }

  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
  const signupKey = await getRequestFingerprint([
    "signup",
    validated.data.email.trim().toLowerCase(),
  ]);
  const signupRateLimit = await consumeRateLimit({
    scope: "auth:signup",
    key: signupKey,
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!signupRateLimit.allowed) {
    return {
      status: "error",
      message: "Muitas tentativas de cadastro neste momento. Aguarde alguns minutos e tente de novo.",
    };
  }

  const existingUser = await findUserByEmail(validated.data.email);

  if (existingUser) {
    return {
      status: "error",
      message: "Já existe uma conta com este e-mail. Faça login para continuar.",
    };
  }

  const passwordHash = await hashPassword(validated.data.password);
  const user = await createUserRecord({
    name: validated.data.name,
    email: validated.data.email,
    phone: validated.data.phone,
    city: validated.data.city,
    passwordHash,
  });

  await createSession(user.id);
  revalidatePath("/");
  redirect(redirectTo);
}

export async function loginUserAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      status: "error",
      message: "Preencha e-mail e senha para continuar.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: "error",
      message:
        "Login está indisponível neste ambiente. Configure DATABASE_URL para habilitar contas de usuário.",
    };
  }

  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
  const loginKey = await getRequestFingerprint([
    "login",
    validated.data.email.trim().toLowerCase(),
  ]);
  const loginRateLimit = await consumeRateLimit({
    scope: "auth:login",
    key: loginKey,
    maxAttempts: 8,
    windowMs: 15 * 60 * 1000,
  });

  if (!loginRateLimit.allowed) {
    return {
      status: "error",
      message: "Muitas tentativas de login neste momento. Aguarde alguns minutos e tente novamente.",
    };
  }

  const user = await findUserByEmail(validated.data.email);

  if (!user) {
    return {
      status: "error",
      message: "E-mail ou senha inválidos.",
    };
  }

  const passwordMatches = await verifyPassword(
    validated.data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return {
      status: "error",
      message: "E-mail ou senha inválidos.",
    };
  }

  await createSession(user.id);
  revalidatePath("/");
  redirect(redirectTo);
}

export async function logoutUserAction() {
  await destroyCurrentSession();
  revalidatePath("/");
  redirect("/");
}

export async function redirectAuthenticatedUser(redirectTo = "/area") {
  const user = await getCurrentUser();

  if (user) {
    redirect(redirectTo);
  }
}
