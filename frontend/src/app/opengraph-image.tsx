import { siteConfig } from "@/shared/config/site";
import { createOgImage, ogContentType, ogSize } from "@/shared/lib/og";

export const contentType = ogContentType;
export const size = ogSize;
export const alt = "Kron Leilões";

export default function Image() {
  return createOgImage({
    eyebrow: siteConfig.name,
    title: "Oportunidades de leilão e pré-lance online",
    description:
      "Catálogo público, área do comprador e atendimento oficial para analisar lotes com clareza.",
    meta: [
      "Catálogo público",
      "Área do comprador",
      "Pré-lance online",
      "Atendimento oficial",
    ],
  });
}
