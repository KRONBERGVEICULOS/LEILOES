"use server";

import { revalidatePath } from "next/cache";

import {
  interestFormSchema,
  parseCurrencyInput,
  preBidFormSchema,
  type OpportunityActionState,
} from "@/backend/features/platform/forms";
import { getCurrentUser } from "@/backend/features/platform/server/auth";
import {
  getLotPlatformSnapshot,
  registerInterest,
  submitPreBid,
} from "@/backend/features/platform/server/repository";
import { consumeRateLimit } from "@/backend/features/platform/server/rate-limit";

function getLotPath(lotSlug: string) {
  return `/lotes/${lotSlug}`;
}

export async function registerInterestAction(
  _prevState: OpportunityActionState,
  formData: FormData,
): Promise<OpportunityActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Faça login para acompanhar esta oportunidade.",
    };
  }

  const validated = interestFormSchema.safeParse({
    lotSlug: formData.get("lotSlug"),
  });

  if (!validated.success) {
    return {
      status: "error",
      message: "Não foi possível identificar o lote selecionado.",
    };
  }

  try {
    const interestRateLimit = await consumeRateLimit({
      scope: "opportunity:interest",
      key: `${user.id}:${validated.data.lotSlug}`,
      maxAttempts: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!interestRateLimit.allowed) {
      return {
        status: "error",
        message: "Muitas tentativas para acompanhar este lote. Aguarde um pouco e tente novamente.",
      };
    }

    const result = await registerInterest(user.id, validated.data.lotSlug);

    revalidatePath("/");
    revalidatePath("/eventos");
    revalidatePath("/area");
    revalidatePath(getLotPath(validated.data.lotSlug));

    return {
      status: "success",
      message: result.created
        ? "O lote foi adicionado à sua área para acompanhamento."
        : "Você já acompanha esta oportunidade na sua área.",
      whatsappHref: result.whatsappHref,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível registrar seu interesse agora.",
    };
  }
}

export async function submitPreBidAction(
  _prevState: OpportunityActionState,
  formData: FormData,
): Promise<OpportunityActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Faça login para registrar um pré-lance online.",
    };
  }

  const validated = preBidFormSchema.safeParse({
    lotSlug: formData.get("lotSlug"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
  });

  if (!validated.success) {
    return {
      status: "error",
      message: "Revise o valor e a observação antes de enviar.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const amountCents = parseCurrencyInput(validated.data.amount);

  if (!amountCents) {
    return {
      status: "error",
      message: "Digite um valor válido para o pré-lance.",
      errors: {
        amount: ["Digite um valor válido para o pré-lance."],
      },
    };
  }

  try {
    const preBidRateLimit = await consumeRateLimit({
      scope: "opportunity:prebid",
      key: `${user.id}:${validated.data.lotSlug}`,
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!preBidRateLimit.allowed) {
      return {
        status: "error",
        message: "Você atingiu o limite temporário de pré-lances neste lote. Aguarde alguns minutos antes de tentar novamente.",
      };
    }

    const result = await submitPreBid(
      user.id,
      validated.data.lotSlug,
      amountCents,
      validated.data.note,
    );
    const snapshot = await getLotPlatformSnapshot(validated.data.lotSlug, user.id);

    revalidatePath("/");
    revalidatePath("/eventos");
    revalidatePath("/area");
    revalidatePath(getLotPath(validated.data.lotSlug));

    return {
      status: "success",
      message: `Pré-lance registrado. A referência atual da área logada está em ${snapshot.visibleValueLabel}.`,
      whatsappHref: result.whatsappHref,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível registrar o pré-lance agora.",
    };
  }
}
