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
  title: "Sobre a plataforma",
  path: "/sobre",
  description:
    "Entenda como a Kron Leilões organiza catálogo público, área restrita, pré-lance e validação operacional.",
});

const experienceLayers = [
  {
    title: "Catálogo público para leitura inicial",
    description:
      "A plataforma publica lotes, referências, status e contexto suficiente para que a análise comece dentro do ambiente digital.",
  },
  {
    title: "Área restrita para histórico e acompanhamento",
    description:
      "Interesses, movimentações e pré-lances ficam registrados na conta do usuário, o que reduz ruído e melhora a continuidade da jornada.",
  },
  {
    title: "Canal oficial para validação final",
    description:
      "Edital, documentação, disponibilidade, pagamento e retirada continuam confirmados nos canais institucionais e no momento correto do processo.",
  },
] as const;

export default function AboutPageRoute() {
  return (
    <>
      <PageHero
        aside={
          <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Posicionamento
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              A proposta pública da Kron Leilões é se comportar como plataforma de
              oportunidades com processo claro, não como um atalho desorganizado
              para atendimento.
            </p>
          </div>
        }
        description="A experiência foi reorganizada para deixar explícito o que o usuário consegue resolver no site, o que entra na área restrita e em que momento a operação oficial assume a validação."
        eyebrow="Sobre a plataforma"
        meta={["Catálogo público", "Área restrita", "Pré-lance", "Canal oficial"]}
        title="Como a Kron Leilões organiza produto, processo e legitimidade."
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
            Processo operacional
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            Da descoberta ao próximo passo oficial, sem misturar papéis.
          </h2>
          <p className="text-base leading-8 text-brand-muted">
            O fluxo abaixo mostra como o produto organiza consulta, acompanhamento
            e pré-lance antes da validação operacional definitiva.
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
          description="Esta camada organiza os dados públicos que sustentam legitimidade, responsabilidade institucional e transparência operacional."
          eyebrow="Base institucional"
          title="Dados públicos e regulatórios da operação"
        />

        <TrustPanel items={trustPillars.slice(0, 4)} />
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16">
        <CtaBox
          description="Explore as oportunidades com a confiança de uma estrutura que diferencia catálogo, área restrita e canal oficial sem diluir conversão."
          eyebrow="Próximo passo"
          primaryHref="/eventos"
          primaryLabel="Explorar oportunidades"
          secondaryHref="/cadastro"
          secondaryLabel="Criar cadastro"
          title="A experiência pública agora deixa mais claro onde o produto começa e onde a operação valida."
        />
      </Container>
    </>
  );
}
