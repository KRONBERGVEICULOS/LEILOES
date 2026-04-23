import { siteConfig } from "@/shared/config/site";
import { createOgImage, ogContentType, ogSize } from "@/shared/lib/og";

export const contentType = ogContentType;
export const size = ogSize;
export const alt = "Kron Leilões";

export default function Image() {
  return createOgImage({
    eyebrow: siteConfig.name,
    title: "Oportunidades, cadastro e pré-lance online",
    description:
      "Branding institucional forte, área restrita simples e atendimento humano para levar a negociação adiante.",
    meta: [
      "Cadastro simples",
      "Área restrita",
      "Atendimento humano",
    ],
  });
}
