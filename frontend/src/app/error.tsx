"use client";

import { ErrorState } from "@/frontend/components/site/error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      description="A navegação pública continua disponível, mas algo falhou ao montar esta rota. Tente novamente ou retorne ao catálogo principal."
      onRetry={reset}
      secondaryHref="/eventos"
      secondaryLabel="Ver eventos"
      title="A página não conseguiu carregar como esperado."
    />
  );
}
