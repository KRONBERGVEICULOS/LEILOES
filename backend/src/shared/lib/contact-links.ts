export function normalizeWhatsAppNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, "");
}

export function buildWhatsAppBaseUrl(phoneNumber: string) {
  return `https://wa.me/${normalizeWhatsAppNumber(phoneNumber)}`;
}

export function buildWhatsAppLink(
  phoneNumber: string,
  message: string,
  baseUrl = buildWhatsAppBaseUrl(phoneNumber),
) {
  const url = new URL(baseUrl);
  url.searchParams.set("text", message);
  return url.toString();
}
