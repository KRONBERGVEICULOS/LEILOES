import type { Metadata } from "next";

import { ErrorState } from "@/frontend/components/site/error-state";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Página não encontrada",
  path: "/404",
  description:
    "A página solicitada não foi encontrada. Volte ao início ou continue a navegação pelo catálogo principal.",
  keywords: ["404", "página não encontrada", "erro de rota"],
});

export default function NotFound() {
  return (
    <ErrorState
      description="O endereço informado não corresponde a uma página disponível neste momento. Use os atalhos abaixo para voltar ao catálogo principal ou retomar a navegação."
      primaryHref="/"
      primaryLabel="Voltar ao início"
      secondaryHref="/eventos"
      secondaryLabel="Ver eventos"
      title="A página procurada não está disponível neste site."
    />
  );
}
