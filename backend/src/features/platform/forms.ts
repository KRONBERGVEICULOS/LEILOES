import { z } from "zod";

import { isValidCpf, normalizeCpf } from "@/shared/lib/cpf";
import {
  isValidPhone,
  normalizeEmail,
  normalizeOptionalText,
  normalizePhone,
  normalizeWhitespace,
} from "@/backend/features/platform/lib/user-normalization";

export type FormFieldErrors = Record<string, string[] | undefined>;

export type AuthActionState = {
  status: "idle" | "success" | "error";
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

function getFormTextValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

const formTextSchema = z.preprocess(getFormTextValue, z.string());

export const signupFormSchema = z.object({
  name: formTextSchema.pipe(
    z
      .string()
      .trim()
      .min(1, "Informe seu nome completo.")
      .transform(normalizeWhitespace)
      .refine((value) => value.length >= 3, "Informe seu nome completo."),
  ),
  email: formTextSchema.pipe(
    z
      .string()
      .trim()
      .min(1, "Informe seu e-mail.")
      .email("Digite um e-mail válido.")
      .transform(normalizeEmail),
  ),
  cpf: formTextSchema.pipe(
    z
      .string()
      .trim()
      .min(1, "Informe seu CPF.")
      .transform(normalizeCpf)
      .refine((value) => value.length === 11, "Informe um CPF com 11 dígitos.")
      .refine(isValidCpf, "Informe um CPF válido."),
  ),
  phone: formTextSchema.pipe(
    z
      .string()
      .trim()
      .min(1, "Informe um telefone com DDD.")
      .transform(normalizePhone)
      .refine(isValidPhone, "Informe um telefone com DDD válido."),
  ),
  city: formTextSchema.pipe(
    z
      .string()
      .transform(normalizeOptionalText)
      .refine((value) => value === undefined || value.length <= 60, "Cidade muito longa."),
  ),
  password: formTextSchema.pipe(
    z
      .string()
      .min(1, "Informe uma senha.")
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .regex(/[A-Za-z]/, "A senha deve ter pelo menos uma letra.")
      .regex(/\d/, "A senha deve ter pelo menos um número."),
  ),
  privacyConsent: formTextSchema.pipe(
    z
      .string()
      .refine(
        (value) => value === "on",
        "Você precisa concordar com a política de privacidade.",
      ),
  ),
});

export const loginFormSchema = z.object({
  email: formTextSchema.pipe(
    z
      .string()
      .trim()
      .min(1, "Informe seu e-mail.")
      .email("Digite um e-mail válido.")
      .transform(normalizeEmail),
  ),
  password: formTextSchema.pipe(z.string().min(1, "Digite sua senha.")),
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
