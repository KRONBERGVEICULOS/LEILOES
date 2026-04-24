import { siteConfig } from "@/shared/config/site";
import { createOgImage, ogContentType, ogSize } from "@/shared/lib/og";

export const contentType = ogContentType;
export const size = ogSize;
export const alt = "Kron Leilões";

export default function Image() {
  return createOgImage({
    eyebrow: siteConfig.name,
    title: "Plataforma de oportunidades e pré-lance online",
    description:
      "Catálogo público, área restrita, atividade rastreável e base institucional para analisar lotes com clareza.",
    meta: [
      "Catálogo público",
      "Área restrita",
      "Base institucional",
      "Canal oficial",
    ],
  });
}
