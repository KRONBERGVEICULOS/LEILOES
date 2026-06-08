import { readTrimmedEnv } from "@/shared/config/env";
import {
  buildWhatsAppBaseUrl,
  normalizeWhatsAppNumber,
} from "@/shared/lib/contact-links";

const defaultWhatsAppNumber = "5511947270227";
const defaultWhatsAppDisplay = "+55 11 994727-0227";

function normalizeWhatsAppUrl(value: string | undefined, phoneNumber: string) {
  if (!value) {
    return buildWhatsAppBaseUrl(phoneNumber);
  }

  const parsed = new URL(value);

  if (
    parsed.protocol !== "https:" ||
    (parsed.hostname !== "wa.me" && !parsed.hostname.endsWith(".whatsapp.com"))
  ) {
    throw new Error("WHATSAPP_URL deve apontar para uma URL https do WhatsApp.");
  }

  return parsed.toString().replace(/\/$/, "");
}

export function getOfficialWhatsAppContact() {
  const configuredNumber = readTrimmedEnv("WHATSAPP_NUMBER");
  const number = normalizeWhatsAppNumber(configuredNumber ?? defaultWhatsAppNumber);

  if (!number) {
    throw new Error("WHATSAPP_NUMBER deve conter apenas um número válido com DDI e DDD.");
  }

  return {
    display: readTrimmedEnv("WHATSAPP_DISPLAY") ?? defaultWhatsAppDisplay,
    number,
    url: normalizeWhatsAppUrl(readTrimmedEnv("WHATSAPP_URL"), number),
  };
}
