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
    allowedPrefixes: ["/area", "/eventos", "/lotes", "/oportunidades"],
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

function buildAuthenticationUnavailableState(kind: "login" | "signup"): AuthActionState {
  return {
    status: "error",
    message:
      kind === "signup"
        ? "Cadastro temporariamente indisponível. Tente novamente em instantes."
        : "Login temporariamente indisponível. Tente novamente em instantes.",
  };
}

async function consumeAuthRateLimits(input: {
  scope: "auth:login" | "auth:signup";
  identifier: string;
  maxAccountAttempts: number;
  maxGlobalAttempts: number;
}) {
  const [globalKey, accountKey] = await Promise.all([
    getRequestFingerprint([input.scope]),
    getRequestFingerprint([input.scope, input.identifier]),
  ]);

  const globalLimit = await consumeRateLimit({
    scope: `${input.scope}:global`,
    key: globalKey,
    maxAttempts: input.maxGlobalAttempts,
    windowMs: 15 * 60 * 1000,
  });

  const accountLimit = await consumeRateLimit({
    scope: input.scope,
    key: accountKey,
    maxAttempts: input.maxAccountAttempts,
    windowMs: 15 * 60 * 1000,
  });

  return {
    allowed: globalLimit.allowed && accountLimit.allowed,
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
  let existingUser: Awaited<ReturnType<typeof findUserByEmail>> = null;
  let existingCpfOwner: Awaited<ReturnType<typeof findUserByCpf>> = null;

  try {
    const signupRateLimit = await consumeAuthRateLimits({
      scope: "auth:signup",
      identifier: validated.data.email,
      maxAccountAttempts: 5,
      maxGlobalAttempts: 20,
    });

    if (!signupRateLimit.allowed) {
      return {
        status: "error",
        message: "Muitas tentativas de cadastro neste momento. Aguarde alguns minutos e tente de novo.",
      };
    }

    [existingUser, existingCpfOwner] = await Promise.all([
      findUserByEmail(validated.data.email),
      findUserByCpf(validated.data.cpf),
    ]);
  } catch {
    return buildAuthenticationUnavailableState("signup");
  }

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
  let user: Awaited<ReturnType<typeof findUserByEmail>> = null;

  try {
    const loginRateLimit = await consumeAuthRateLimits({
      scope: "auth:login",
      identifier: validated.data.email,
      maxAccountAttempts: 8,
      maxGlobalAttempts: 40,
    });

    if (!loginRateLimit.allowed) {
      return {
        status: "error",
        message: "Muitas tentativas de login neste momento. Aguarde alguns minutos e tente novamente.",
      };
    }

    user = await findUserByEmail(validated.data.email);
  } catch {
    return buildAuthenticationUnavailableState("login");
  }

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

  try {
    await createSession(user.id);
  } catch {
    return {
      status: "error",
      message: "Login validado, mas não foi possível iniciar sua sessão agora. Tente novamente em instantes.",
    };
  }

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
