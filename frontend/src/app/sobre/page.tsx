import type { Metadata } from "next";

import { CtaBox } from "@/frontend/components/site/cta-box";
import { Container } from "@/frontend/components/site/container";
import { InstitutionalDataPanel } from "@/frontend/components/site/institutional-data-panel";
import { PageHero } from "@/frontend/components/site/page-hero";
import { TrustPanel } from "@/frontend/components/site/trust-panel";
import { createPageMetadata } from "@/shared/lib/metadata";
import {
  howItWorksSteps,
  trustPillars,
} from "@/backend/features/content/data/site-content";

export const metadata: Metadata = createPageMetadata({
  title: "Como funciona",
  path: "/sobre",
  description:
    "Entenda como a Kron Leilões organiza catálogo, área do comprador, pré-lance e atendimento oficial.",
});

const experienceLayers = [
  {
    title: "Catálogo público para consulta inicial",
    description:
      "Os lotes publicados reúnem fotos, referência, status e informações essenciais para começar sua análise.",
  },
  {
    title: "Área do comprador para acompanhamento",
    description:
      "Interesses, movimentações e pré-lances ficam registrados na sua conta, facilitando a retomada da análise.",
  },
  {
    title: "Atendimento oficial para confirmação",
    description:
      "Edital, documentação, disponibilidade, pagamento e retirada devem ser confirmados pelos canais oficiais.",
  },
] as const;

export default function AboutPageRoute() {
  return (
    <>
      <PageHero
        aside={
          <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Jornada do comprador
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              A Kron Leilões organiza consulta, acompanhamento e atendimento para
              que cada etapa avance com informação clara.
            </p>
          </div>
        }
        description="Entenda o que você consulta no site, o que fica salvo na área do comprador e quando o atendimento oficial entra para confirmar as condições do evento."
        eyebrow="Como funciona"
        meta={["Catálogo público", "Área do comprador", "Pré-lance", "Atendimento oficial"]}
        title="Consulta, acompanhamento e confirmação em uma jornada clara."
      />

      <Container className="grid gap-8 py-16 lg:grid-cols-3">
        {experienceLayers.map((item) => (
          <article
            key={item.title}
            className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]"
          >
            <h2 className="text-2xl font-semibold leading-tight text-brand-ink">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              {item.description}
            </p>
          </article>
        ))}
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Processo de participação
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            Da descoberta ao próximo passo oficial.
          </h2>
          <p className="text-base leading-8 text-brand-muted">
            O fluxo abaixo mostra como consultar oportunidades, solicitar documentos
            e confirmar as condições antes de participar.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {howItWorksSteps.map((step) => (
            <article
              key={step.step}
              className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_20px_52px_-44px_rgba(26,36,48,0.34)]"
            >
              <p className="text-4xl font-semibold leading-none text-brand-brass">
                {step.step}
              </p>
              <h3 className="mt-5 text-xl font-semibold text-brand-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </Container>

      <Container className="grid gap-6 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <InstitutionalDataPanel
          description="Informações institucionais e canais oficiais reunidos para facilitar a conferência antes da participação."
          eyebrow="Base institucional"
          title="Dados públicos e regulatórios da operação"
        />

        <TrustPanel items={trustPillars.slice(0, 4)} />
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16">
        <CtaBox
          description="Explore as oportunidades, acompanhe os lotes de interesse e confirme as condições oficiais antes de avançar."
          eyebrow="Próximo passo"
          primaryHref="/oportunidades"
          primaryLabel="Explorar oportunidades"
          secondaryHref="/cadastro"
          secondaryLabel="Criar cadastro"
          title="Comece pelo catálogo e siga com o atendimento quando precisar confirmar regras."
        />
      </Container>
    </>
  );
}
