import { normalizeCpf } from "@/shared/lib/cpf";

const MULTIPLE_SPACES_PATTERN = /\s+/g;
const NON_DIGIT_PATTERN = /\D/g;
const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 13;

export function normalizeWhitespace(value: string) {
  return value.trim().replace(MULTIPLE_SPACES_PATTERN, " ");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(NON_DIGIT_PATTERN, "");
}

export function isValidPhone(value: string) {
  const digits = normalizePhone(value);

  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS;
}

export function normalizeOptionalText(value?: string | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = normalizeWhitespace(value);

  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeSignupInput(input: {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  city?: string;
}) {
  return {
    name: normalizeWhitespace(input.name),
    email: normalizeEmail(input.email),
    cpf: normalizeCpf(input.cpf),
    phone: normalizePhone(input.phone),
    city: normalizeOptionalText(input.city),
  };
}
