import type { Metadata } from "next";

import { Container } from "@/frontend/components/site/container";
import { ContentPage } from "@/frontend/components/site/content-page";
import { InstitutionalDataPanel } from "@/frontend/components/site/institutional-data-panel";
import { termsPage } from "@/backend/features/content/data/site-content";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Termos de uso",
  path: "/termos-de-uso",
  description:
    "Regras de uso do site, limites da presença digital e responsabilidades do usuário.",
});

export default function TermsRoute() {
  return (
    <>
      <ContentPage page={termsPage} />
      <Container className="grid gap-8 border-t border-brand-line/80 py-16">
        <InstitutionalDataPanel
          description="Os termos de uso precisam caminhar junto com a identificação formal da operação e com a publicação dos dados regulatórios exigidos para uma presença pública de leilão no Brasil."
          eyebrow="Base jurídica"
          title="Identificação da operação"
        />
      </Container>
    </>
  );
}
