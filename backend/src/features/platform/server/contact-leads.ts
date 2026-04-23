import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import {
  isValidPhone,
  normalizeEmail,
  normalizeOptionalText,
  normalizePhone,
  normalizeWhitespace,
} from "@/backend/features/platform/lib/user-normalization";
import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import { shouldUseLocalSeedData } from "@/backend/features/platform/server/mode";

export class ContactLeadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactLeadValidationError";
  }
}

export class ContactLeadPersistenceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactLeadPersistenceUnavailableError";
  }
}

const optionalEmailSchema = z
  .union([
    z.literal(""),
    z.string().trim().email("Digite um e-mail válido."),
  ])
  .transform((value) => (value ? normalizeEmail(value) : undefined));

const contactLeadSchema = z.object({
  origin: z.string().trim().min(1).max(120),
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome válido.")
    .transform(normalizeWhitespace),
  phone: z
    .string()
    .trim()
    .min(1, "Informe um telefone com DDD.")
    .transform(normalizePhone)
    .refine(isValidPhone, "Informe um telefone com DDD válido."),
  email: optionalEmailSchema.optional().default(""),
  reference: z
    .string()
    .transform((value) => normalizeOptionalText(value))
    .optional(),
  message: z
    .string()
    .transform((value) => normalizeOptionalText(value))
    .optional(),
  payload: z.record(z.string(), z.string()),
});

export type ContactLeadInput = z.infer<typeof contactLeadSchema>;

export function parseContactLead(input: ContactLeadInput) {
  const validated = contactLeadSchema.safeParse(input);

  if (!validated.success) {
    const firstIssue = validated.error.issues[0]?.message ?? "Lead inválido.";
    throw new ContactLeadValidationError(firstIssue);
  }

  return validated.data;
}

export async function persistContactLead(input: ContactLeadInput) {
  if (shouldUseLocalSeedData()) {
    throw new ContactLeadPersistenceUnavailableError(
      "Persistência de leads exige PostgreSQL configurado. O modo local-seed fica restrito ao desenvolvimento.",
    );
  }

  const lead = parseContactLead(input);

  try {
    return await withPlatformDatabase(async (sql) => {
      const createdAt = new Date().toISOString();

      await sql`
        insert into platform_contact_leads (
          id,
          name,
          phone,
          origin,
          email,
          reference,
          message,
          payload,
          created_at
        )
        values (
          ${randomUUID()},
          ${lead.name},
          ${lead.phone},
          ${lead.origin},
          ${lead.email ?? null},
          ${lead.reference ?? null},
          ${lead.message ?? null},
          ${JSON.stringify(lead.payload)}::jsonb,
          ${createdAt}
        )
      `;

      return {
        createdAt,
        origin: lead.origin,
      };
    });
  } catch (error) {
    throw new ContactLeadPersistenceUnavailableError(
      error instanceof Error
        ? error.message
        : "Persistência de leads indisponível no momento.",
    );
  }
}
