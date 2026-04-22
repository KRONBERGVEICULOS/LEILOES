import { z } from "zod";

import { isValidCpf, normalizeCpf } from "@/shared/lib/cpf";

export type FormFieldErrors = Record<string, string[] | undefined>;

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  errors?: FormFieldErrors;
};

export type OpportunityActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FormFieldErrors;
  whatsappHref?: string;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
};

export const initialOpportunityActionState: OpportunityActionState = {
  status: "idle",
};

export const signupFormSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.string().trim().email("Digite um e-mail válido."),
  cpf: z
    .string()
    .trim()
    .transform(normalizeCpf)
    .refine((value) => value.length === 11, "Informe um CPF com 11 dígitos.")
    .refine(isValidCpf, "Informe um CPF válido."),
  phone: z
    .string()
    .trim()
    .min(10, "Informe um telefone com DDD.")
    .max(20, "Telefone inválido."),
  city: z.string().trim().max(60, "Cidade muito longa.").optional(),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .regex(/[A-Za-z]/, "A senha deve ter pelo menos uma letra.")
    .regex(/\d/, "A senha deve ter pelo menos um número."),
  privacyConsent: z
    .string()
    .refine((value) => value === "on", "Você precisa concordar com a política de privacidade."),
});

export const loginFormSchema = z.object({
  email: z.string().trim().email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
});

export const interestFormSchema = z.object({
  lotSlug: z.string().trim().min(1),
});

export const preBidFormSchema = z.object({
  lotSlug: z.string().trim().min(1),
  amount: z.string().trim().min(1, "Informe um valor."),
  note: z.string().trim().max(280, "Use no máximo 280 caracteres.").optional(),
});

export function parseCurrencyInput(rawValue: string) {
  const normalized = rawValue.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const numeric = Number(
    normalized
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1"),
  );

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return Math.round(numeric * 100);
}
