import type { Metadata } from "next";

import { ContentPage } from "@/components/site/content-page";
import { Container } from "@/components/site/container";
import { InterestActions } from "@/components/site/interest-actions";
import { SectionHeading } from "@/components/site/section-heading";
import { TrustPanel } from "@/components/site/trust-panel";
import {
  finalCta,
  howItWorksSteps,
  howToParticipatePage,
  trustPillars,
} from "@/features/content/data/site-content";

export const metadata: Metadata = {
  title: "Como participar",
  description:
    "Entenda o fluxo de manifestação de interesse, validação documental e contato assistido da plataforma.",
};

export default function HowToParticipateRoute() {
  return (
    <>
      <ContentPage page={howToParticipatePage} />

      <Container className="grid gap-10 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <SectionHeading
            description="A sequência abaixo espelha a lógica real da operação e prepara o terreno para uma futura automação sem reescrever a jornada."
            eyebrow="Etapas do fluxo"
            title="Quatro passos para sair da curiosidade e chegar a uma consulta bem qualificada."
          />
        </div>
        <div className="grid gap-4">
          {howItWorksSteps.map((step) => (
            <article
              key={step.step}
              className="rounded-[2rem] border border-brand-line bg-white p-7 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)]"
            >
              <div className="grid gap-3 sm:grid-cols-[92px_minmax(0,1fr)]">
                <p className="text-4xl font-semibold leading-none text-brand-brass">
                  {step.step}
                </p>
                <div>
                  <h2 className="text-2xl font-semibold text-brand-ink">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-base leading-8 text-brand-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[2.4rem] bg-brand-ink px-8 py-10 text-white sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-sand">
            Próximo passo
          </p>
          <h2 className="mt-4 font-display text-5xl leading-none">
            Pronto para validar um lote ou pedir um edital?
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">
            O caminho mais seguro continua sendo iniciar pelo atendimento assistido,
            concentrando dúvidas, contexto documental e intenção de compra em uma única
            conversa.
          </p>
          <InterestActions
            className="mt-8"
            primaryHref={finalCta.primaryHref}
            primaryLabel={finalCta.primaryLabel}
            secondaryHref={finalCta.secondaryHref}
            secondaryLabel={finalCta.secondaryLabel}
          />
        </div>
        <TrustPanel items={trustPillars} />
      </Container>
    </>
  );
}
