import type { Metadata } from "next";

import { Container } from "@/frontend/components/site/container";
import { ContentPage } from "@/frontend/components/site/content-page";
import { InstitutionalDataPanel } from "@/frontend/components/site/institutional-data-panel";
import { cookiesPage } from "@/backend/features/content/data/site-content";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Cookies",
  path: "/cookies",
  description:
    "Conheça a política de uso de cookies e tecnologias técnicas deste site.",
});

export default function CookiesRoute() {
  return (
    <>
      <ContentPage page={cookiesPage} />
      <Container className="grid gap-8 border-t border-brand-line/80 py-16">
        <InstitutionalDataPanel
          description="Qualquer evolução de cookies, métricas ou integrações precisa permanecer vinculada à base institucional pública e a uma política atualizada com o uso real do ambiente."
          eyebrow="Governança técnica"
          title="Base institucional para recursos técnicos"
        />
      </Container>
    </>
  );
}
