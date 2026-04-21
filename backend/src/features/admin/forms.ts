import { z } from "zod";

import { lotStatusDefinitions } from "@/backend/features/auctions/lib/lot-status";
import type { FormFieldErrors } from "@/backend/features/platform/forms";

export type AdminActionState = {
  status: "idle" | "error";
  message?: string;
  errors?: FormFieldErrors;
  values?: Record<string, string | undefined>;
};

export const initialAdminActionState: AdminActionState = {
  status: "idle",
};

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Informe o usuário administrador."),
  password: z.string().min(1, "Informe a senha do administrador."),
});

export const adminLotSchema = z.object({
  title: z.string().trim().min(3, "Informe um título com pelo menos 3 caracteres."),
  slug: z.string().trim().optional(),
  lotCode: z.string().trim().min(2, "Informe um código curto para o lote."),
  eventSlug: z.string().trim().min(1, "Selecione o evento relacionado."),
  category: z.string().trim().min(2, "Informe a categoria comercial do lote."),
  location: z.string().trim().min(2, "Informe a localização do lote."),
  overview: z.string().trim().min(12, "Escreva uma descrição curta do lote."),
  details: z.string().trim().min(12, "Escreva uma descrição mais completa do lote."),
  observations: z.string().trim().min(4, "Informe as observações operacionais."),
  sourceNote: z.string().trim().optional(),
  highlights: z.string().trim().min(1, "Adicione pelo menos um destaque."),
  facts: z.string().trim().optional(),
  gallery: z.string().trim().min(1, "Informe pelo menos uma imagem da galeria."),
  year: z.string().trim().optional(),
  mileage: z.string().trim().optional(),
  fuel: z.string().trim().optional(),
  transmission: z.string().trim().optional(),
  referencePrice: z.string().trim().min(1, "Informe o preço de referência."),
  currentPrice: z.string().trim().min(1, "Informe o preço atual."),
  minimumIncrement: z.string().trim().min(1, "Informe o incremento mínimo."),
  statusKey: z
    .string()
    .trim()
    .min(1, "Escolha o status do lote.")
    .refine(
      (value) => lotStatusDefinitions.some((status) => status.key === value),
      "Escolha um status válido.",
    ),
  isFeatured: z.string().optional(),
  isVisible: z.string().optional(),
});

export const manualActivitySchema = z.object({
  lotId: z.string().trim().optional(),
  title: z.string().trim().min(3, "Informe um título curto para a atividade."),
  description: z.string().trim().min(6, "Descreva o evento operacional."),
  audience: z.enum(["admin", "public"]).default("admin"),
});
