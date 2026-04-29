import type { Metadata } from "next";

import { Breadcrumbs } from "@/frontend/components/site/breadcrumbs";
import { CtaBox } from "@/frontend/components/site/cta-box";
import { Container } from "@/frontend/components/site/container";
import { FaqList } from "@/frontend/components/site/faq-list";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { PageHero } from "@/frontend/components/site/page-hero";
import { SectionHeading } from "@/frontend/components/site/section-heading";
import { siteConfig } from "@/shared/config/site";
import {
  contactChecklist,
  faqItems,
  finalCta,
  howItWorksSteps,
  trustPillars,
} from "@/backend/features/content/data/site-content";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Como participar",
  path: "/como-participar",
  description:
    "Entenda o fluxo do comprador: edital, habilitação, arrematação, pagamento e retirada.",
});

const participationFaq = faqItems.filter((item) =>
  /(cadastro|habilita|pagamento|retirada|edital|particip)/i.test(
    `${item.question} ${item.answer}`,
  ),
).slice(0, 4);

export default function HowToParticipateRoute() {
  return (
    <>
      <section className="border-b border-brand-line/80 bg-brand-paper">
        <Container className="py-6">
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: "Como participar" },
            ]}
          />
        </Container>
      </section>

      <PageHero
        aside={
          <div className="rounded-xl border border-brand-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Canal oficial
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Antes de participar, confirme edital, habilitação, pagamento,
              visitação e retirada com a equipe no canal oficial.
            </p>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              {siteConfig.businessHours} • {siteConfig.whatsappDisplay}
            </p>
            <InterestActions
              className="mt-5"
              primaryHref={finalCta.primaryHref}
              primaryLabel="Solicitar atendimento"
              secondaryHref="/contato"
              secondaryLabel="Ir para contato"
            />
          </div>
        }
        description="A jornada abaixo mostra o que precisa ser conferido antes da participação e o que muda depois da arrematação."
        eyebrow="Como participar"
        meta={["Consulta inicial", "Edital", "Pagamento", "Retirada"]}
        title="Passo a passo direto para entrar em um leilão de veículos sem improviso."
      />

      <Container className="grid gap-10 py-16">
        <SectionHeading
          description="A consulta inicial organiza a análise do lote. A confirmação formal sempre passa pelo edital do evento e pelo atendimento da equipe."
          eyebrow="Etapas"
          title="Da consulta inicial ao pagamento e retirada."
        />

        <div className="grid gap-4 xl:grid-cols-4">
          {howItWorksSteps.map((step) => (
            <article
              key={step.step}
              className="rounded-xl border border-brand-line bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                Etapa
              </p>
              <p className="mt-3 text-4xl font-semibold leading-none text-brand-navy">
                {step.step}
              </p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-brand-ink">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </Container>

      <Container className="grid gap-8 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-xl border border-brand-line bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            O que você precisa ter
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink">
            Organize as informações básicas antes do primeiro contato.
          </h2>
          <ul className="mt-6 grid gap-3 text-sm leading-7 text-brand-muted">
            {contactChecklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-brand-line bg-brand-paper p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Regras importantes
          </p>
          <div className="mt-5 space-y-0">
            {trustPillars.map((item) => (
              <article
                key={item.title}
                className="border-t border-brand-line py-4 first:border-t-0 first:pt-0"
              >
                <h3 className="text-lg font-semibold text-brand-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Dúvidas comuns
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink">
              Antes de pedir edital ou avançar na participação.
            </h2>
          </div>
          <FaqList items={participationFaq} />
        </section>

        <div className="space-y-6">
          <CtaBox
            description="Quando já houver evento, lote ou praça definidos, o caminho mais curto é solicitar atendimento e pedir o documento aplicável."
            eyebrow="Próximo passo"
            primaryHref={finalCta.primaryHref}
            primaryLabel="Falar com a equipe"
            secondaryHref="/oportunidades"
            secondaryLabel="Ver eventos"
            title="Ainda precisa validar edital, habilitação ou retirada?"
          />

          <div className="rounded-xl border border-brand-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Referência institucional
            </p>
            <dl className="mt-4 grid gap-0">
              <div className="border-t border-brand-line py-4 first:border-t-0 first:pt-0">
                <dt className="text-sm font-semibold text-brand-ink">Atendimento</dt>
                <dd className="mt-1 text-sm leading-6 text-brand-muted">
                  {siteConfig.businessHours}
                </dd>
              </div>
              <div className="border-t border-brand-line py-4">
                <dt className="text-sm font-semibold text-brand-ink">WhatsApp oficial</dt>
                <dd className="mt-1 text-sm leading-6 text-brand-muted">
                  <a
                    className="font-semibold text-brand-navy transition hover:text-brand-ink"
                    href={siteConfig.whatsappHref}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {siteConfig.whatsappDisplay}
                  </a>
                </dd>
              </div>
              <div className="border-t border-brand-line py-4">
                <dt className="text-sm font-semibold text-brand-ink">Praças</dt>
                <dd className="mt-1 text-sm leading-6 text-brand-muted">
                  {siteConfig.serviceRegions.join(" • ")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </>
  );
}
