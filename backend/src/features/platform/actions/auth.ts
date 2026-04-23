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
import {
  createUserRecord,
  findUserByCpf,
  findUserByEmail,
  UserRegistrationConflictError,
} from "@/backend/features/platform/server/repository";
import {
  isDatabaseConfigured,
  shouldUseLocalSeedData,
} from "@/backend/features/platform/server/mode";
import {
  consumeRateLimit,
  getRequestFingerprint,
} from "@/backend/features/platform/server/rate-limit";

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  return normalizeInternalRedirect(value, "/area", {
    allowedPrefixes: ["/area", "/eventos", "/lotes"],
  });
}

function buildAuthFieldErrorState(
  field: string,
  message: string,
): AuthActionState {
  return {
    status: "error",
    message: "Revise os campos destacados para concluir o cadastro.",
    errors: {
      [field]: [message],
    },
  };
}

export async function registerUserAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = signupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    cpf: formData.get("cpf"),
    phone: formData.get("phone"),
    city: formData.get("city"),
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

  if (!isDatabaseConfigured() || shouldUseLocalSeedData()) {
    return {
      status: "error",
      message: "Cadastros estão indisponíveis neste ambiente.",
    };
  }

  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
  const signupKey = await getRequestFingerprint([
    "signup",
    validated.data.email,
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

  const [existingUser, existingCpfOwner] = await Promise.all([
    findUserByEmail(validated.data.email),
    findUserByCpf(validated.data.cpf),
  ]);

  if (existingUser) {
    return buildAuthFieldErrorState(
      "email",
      "Já existe uma conta com este e-mail. Faça login para continuar.",
    );
  }

  if (existingCpfOwner) {
    return buildAuthFieldErrorState(
      "cpf",
      "Já existe uma conta cadastrada com este CPF.",
    );
  }

  let user: Awaited<ReturnType<typeof createUserRecord>>;

  try {
    const passwordHash = await hashPassword(validated.data.password);
    user = await createUserRecord({
      name: validated.data.name,
      email: validated.data.email,
      cpf: validated.data.cpf,
      phone: validated.data.phone,
      city: validated.data.city,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof UserRegistrationConflictError) {
      return buildAuthFieldErrorState(error.field, error.message);
    }

    return {
      status: "error",
      message: "Não foi possível concluir o cadastro agora. Tente novamente em instantes.",
    };
  }

  try {
    await createSession(user.id);
  } catch {
    return {
      status: "success",
      message:
        "Cadastro concluído, mas não foi possível iniciar sua sessão automaticamente. Entre com seu e-mail e senha para continuar.",
    };
  }

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

  if (!isDatabaseConfigured() || shouldUseLocalSeedData()) {
    return {
      status: "error",
      message: "Login está indisponível neste ambiente.",
    };
  }

  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
  const loginKey = await getRequestFingerprint([
    "login",
    validated.data.email,
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
