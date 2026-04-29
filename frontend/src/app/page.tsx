import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ActivityFeed } from "@/frontend/components/site/activity-feed";
import { Container } from "@/frontend/components/site/container";
import { CtaBox } from "@/frontend/components/site/cta-box";
import { FaqList } from "@/frontend/components/site/faq-list";
import { InstitutionalDataPanel } from "@/frontend/components/site/institutional-data-panel";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { LotCard } from "@/frontend/components/site/lot-card";
import { SectionHeading } from "@/frontend/components/site/section-heading";
import { StructuredData } from "@/frontend/components/site/structured-data";
import { TrustPanel } from "@/frontend/components/site/trust-panel";
import { absoluteUrl, siteConfig } from "@/shared/config/site";
import { listFeaturedLots } from "@/backend/features/auctions/server/catalog";
import type { FaqItem } from "@/backend/features/auctions/types";
import {
  howItWorksSteps,
  trustPillars,
} from "@/backend/features/content/data/site-content";
import { getCurrentUser } from "@/backend/features/platform/server/auth";
import { listPublicActivity } from "@/backend/features/platform/server/repository";
import { createPageMetadata } from "@/shared/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Início",
  path: "/",
  description:
    "Oportunidades de leilão com catálogo público, área do comprador, pré-lance online e atendimento oficial da Kron Leilões.",
  keywords: [
    "leilões de veículos",
    "catálogo de oportunidades",
    "pré-lance online",
    "lotes de veículos e equipamentos",
  ],
});

const heroHighlights = [
  {
    label: "Lotes publicados",
    value:
      "Fotos, código, praça, referência de valor e status comercial reunidos para sua análise inicial.",
  },
  {
    label: "Área do comprador",
    value:
      "Salve oportunidades, acompanhe movimentações e registre pré-lances com histórico da sua conta.",
  },
  {
    label: "Atendimento oficial",
    value:
      "Confirme edital, disponibilidade, pagamento, comissão e retirada antes de avançar.",
  },
] as const;

const platformLayers = [
  {
    badge: "Catálogo",
    title: "Consulte oportunidades com contexto",
    description:
      "Compare lotes por fotos, localização, código, referência de valor e informações úteis para decidir se vale aprofundar a análise.",
  },
  {
    badge: "Cadastro",
    title: "Acompanhe o que interessa",
    description:
      "Com cadastro, seus interesses e pré-lances ficam organizados em uma área própria, com histórico para retomar a conversa com a equipe.",
  },
  {
    badge: "Atendimento",
    title: "Confirme as condições oficiais",
    description:
      "Use os canais oficiais para edital, documentos, comissão, pagamento, visitação, retirada e demais condições do evento.",
  },
] as const;

const operationalSignals = [
  {
    label: "Praças atendidas",
    items: [{ value: siteConfig.serviceRegions.join(" • ") }],
  },
  {
    label: "Horário institucional",
    items: [{ value: siteConfig.businessHours }],
  },
  {
    label: "Contato oficial",
    items: [
      {
        label: "WhatsApp oficial",
        value: siteConfig.whatsappDisplay,
        href: siteConfig.whatsappHref,
      },
      {
        label: "E-mail",
        value: siteConfig.email,
        href: siteConfig.emailHref,
      },
    ],
  },
] as const;

const faqPreview: FaqItem[] = [
  {
    question: "Por que criar cadastro?",
    answer:
      "O cadastro libera a área do comprador para acompanhar lotes, registrar interesse, ver valores disponíveis para usuários logados e enviar pré-lances online.",
  },
  {
    question: "Registrar interesse é a mesma coisa que dar pré-lance?",
    answer:
      "Não. Registrar interesse apenas adiciona o lote à sua área para acompanhamento. O pré-lance registra uma intenção comercial com valor, mas não fecha compra automaticamente.",
  },
  {
    question: "O pré-lance garante reserva, arrematação ou disponibilidade?",
    answer:
      "Não. O pré-lance registra sua intenção comercial, mas aceite, documentação, pagamento, comissão e retirada seguem sujeitos ao edital e à validação oficial.",
  },
  {
    question: "Quando eu preciso falar com a equipe?",
    answer:
      "Quando chegar a hora de confirmar edital, disponibilidade, anexos, visitação, pagamento, retirada ou qualquer condição que dependa do atendimento oficial.",
  },
] as const;

const homeStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl(),
    description:
      "Kron Leilões reúne catálogo público, área do comprador, acompanhamento e pré-lance online para oportunidades de leilão.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phoneNumber,
      email: siteConfig.email,
      contactType: "customer support",
      availableLanguage: ["pt-BR"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl(),
    inLanguage: "pt-BR",
  },
];

export default async function Home() {
  const [currentUserResult, publicActivityResult, featuredLotsResult] =
    await Promise.allSettled([
    getCurrentUser(),
    listPublicActivity(4),
    listFeaturedLots(3),
  ]);
  const currentUser =
    currentUserResult.status === "fulfilled" ? currentUserResult.value : null;
  const publicActivity =
    publicActivityResult.status === "fulfilled" ? publicActivityResult.value : [];
  const featuredLots =
    featuredLotsResult.status === "fulfilled" ? featuredLotsResult.value : [];

  const dashboardHref = currentUser ? "/area" : "/cadastro";
  const dashboardLabel = currentUser ? "Abrir minha área" : "Criar cadastro";
  const closingPrimaryHref = currentUser ? "/area" : "/cadastro";
  const closingPrimaryLabel = currentUser
    ? "Abrir minha área"
    : "Criar cadastro para acompanhar";

  return (
    <>
      <StructuredData data={homeStructuredData} />

      <section className="relative overflow-hidden border-b border-brand-line bg-brand-navy-deep text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,139,27,0.24),transparent_34%),linear-gradient(160deg,#0d2034_8%,#173452_64%,#0d2034_100%)]" />
        <Container className="relative grid gap-10 py-14 sm:py-20 lg:min-h-[calc(100svh-84px)] lg:grid-cols-[minmax(0,0.94fr)_minmax(480px,1.06fr)] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-sand">
                Leilões de veículos e ativos
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-balance sm:text-5xl lg:text-6xl">
                Oportunidades de leilão para analisar com segurança.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                Consulte lotes publicados, acompanhe oportunidades na sua área e
                fale com a equipe para confirmar edital, documentação, pagamento
                e retirada antes de participar.
              </p>
            </div>

            <InterestActions
              primaryHref="/oportunidades"
              primaryLabel="Explorar oportunidades"
              secondaryHref={dashboardHref}
              secondaryLabel={dashboardLabel}
            />

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/72">
              <Link
                className="inline-flex items-center rounded-full border border-white/14 bg-white/8 px-4 py-2 font-semibold transition hover:border-white/28 hover:bg-white/12"
                href="/como-participar"
              >
                Entender o processo
              </Link>
              <span className="inline-flex items-center rounded-full border border-white/14 bg-white/8 px-4 py-2 font-semibold">
                Atendimento oficial
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/14 bg-white/8 px-4 py-4 backdrop-blur-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-sand">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/76">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ambient-panel overflow-hidden rounded-[34px] border border-white/14 p-3 shadow-[0_36px_100px_-52px_rgba(0,0,0,0.75)] sm:p-4">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10">
              <Image
                alt="Banner institucional Kron Leilões"
                className="h-auto w-full"
                height={760}
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
                src="/media/brand/banner-kronberg.png"
                style={{ objectFit: "cover", objectPosition: "center" }}
                width={1600}
              />
            </div>

            <div className="grid gap-3 px-2 pb-2 pt-5 sm:grid-cols-2">
              <div className="rounded-[24px] border border-brand-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                  No site
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-brand-muted">
                  <li>Catálogo público com lotes e referências.</li>
                  <li>Área do comprador para interesse e histórico.</li>
                  <li>Pré-lance online com registro centralizado.</li>
                </ul>
              </div>

              <div className="rounded-[24px] border border-brand-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                  Atendimento oficial
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-brand-muted">
                  <li>Edital, documentos e anexos do evento.</li>
                  <li>Disponibilidade, pagamento e retirada.</li>
                  <li>Confirmações feitas pelo canal oficial.</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-3 px-2 pb-2 pt-1 sm:grid-cols-2 xl:grid-cols-[1fr_0.8fr_1.3fr]">
              {operationalSignals.map((item) => (
                <div className="min-w-0" key={item.label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                    {item.label}
                  </p>
                  <div className="mt-2 grid gap-1 text-sm leading-6 text-brand-muted">
                    {item.items.map((detail) => (
                      <p key={`${item.label}-${detail.value}`}>
                        {"label" in detail ? (
                          <span className="font-semibold text-brand-ink">
                            {detail.label}:{" "}
                          </span>
                        ) : null}
                        {"href" in detail && detail.href ? (
                          <a
                            className="break-words font-semibold text-brand-navy underline-offset-4 transition hover:text-brand-brass hover:underline"
                            href={detail.href}
                          >
                            {detail.value}
                          </a>
                        ) : (
                          detail.value
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-16 py-14 sm:py-20">
        <section className="grid gap-8">
          <SectionHeading
            description="Cada etapa tem uma função clara: consultar, acompanhar e confirmar as condições oficiais antes de participar."
            eyebrow="Jornada do comprador"
            title="Do catálogo ao atendimento oficial, sem misturar etapas."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {platformLayers.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_20px_52px_-44px_rgba(26,36,48,0.34)]"
              >
                <span className="inline-flex rounded-full bg-brand-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-navy">
                  {item.badge}
                </span>
                <h2 className="mt-5 text-2xl font-semibold leading-tight text-brand-ink">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8">
          <SectionHeading
            description="Veja lotes com fotos, referência de valor, status e caminho claro para acompanhar ou solicitar atendimento."
            eyebrow="Oportunidades em destaque"
            title="Lotes em destaque para começar sua análise."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredLots.map((lot) => (
              <LotCard key={lot.slug} lot={lot} />
            ))}
          </div>
        </section>

        <ActivityFeed
          description="Acompanhe atualizações públicas, novos interesses e pré-lances registrados de forma resumida."
          items={publicActivity}
          title="Movimentação recente"
        />

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start">
          <SectionHeading
            description="O fluxo orienta a consulta inicial, a solicitação de documentos e os próximos passos com a equipe."
            eyebrow="Processo"
            title="Como avançar da descoberta ao próximo passo oficial."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {howItWorksSteps.map((item) => (
              <article
                key={item.step}
                className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_20px_52px_-44px_rgba(26,36,48,0.34)]"
              >
                <p className="text-4xl font-semibold leading-none text-brand-brass">
                  {item.step}
                </p>
                <h3 className="mt-5 text-xl font-semibold text-brand-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
          <InstitutionalDataPanel
            description="Canais de atendimento, razão social, endereço e orientações regulatórias ficam reunidos para conferência antes da participação."
            eyebrow="Credibilidade institucional"
            title="Base institucional da Kron Leilões"
          />

          <TrustPanel items={trustPillars.slice(0, 4)} />
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[28px] border border-brand-line bg-brand-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Clareza para decidir
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
              Interesse, pré-lance e atendimento têm papéis diferentes.
            </h2>
            <div className="mt-6 grid gap-4">
              <article className="rounded-[24px] border border-brand-line bg-white p-4">
                <h3 className="text-lg font-semibold text-brand-ink">
                  Interesse no lote
                </h3>
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  Salva o lote na sua área e organiza acompanhamento, sem compromisso
                  comercial automático.
                </p>
              </article>
              <article className="rounded-[24px] border border-brand-line bg-white p-4">
                <h3 className="text-lg font-semibold text-brand-ink">
                  Pré-lance com histórico
                </h3>
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  Registra o valor que você deseja apresentar, com rastreabilidade e
                  contexto, mas sem substituir edital ou aceite oficial.
                </p>
              </article>
              <article className="rounded-[24px] border border-brand-line bg-white p-4">
                <h3 className="text-lg font-semibold text-brand-ink">
                  Canal oficial quando necessário
                </h3>
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  O atendimento confirma disponibilidade, documentação, pagamento,
                  retirada e demais condições do evento.
                </p>
              </article>
            </div>
          </div>

          <div className="grid gap-5">
            <SectionHeading
              description="As respostas ajudam a entender cadastro, interesse, pré-lance e confirmação oficial antes de participar."
              eyebrow="FAQ e segurança"
              title="Perguntas frequentes para comprar com mais clareza."
            />
            <FaqList items={faqPreview} />
          </div>
        </section>

        <CtaBox
          description="Explore os lotes, salve as oportunidades que fazem sentido e fale com a equipe quando precisar confirmar edital, disponibilidade e próximos passos."
          eyebrow="Fechamento"
          primaryHref={closingPrimaryHref}
          primaryLabel={closingPrimaryLabel}
          secondaryHref="/como-participar"
          secondaryLabel="Entender o processo"
          title="Comece pelo catálogo e avance com mais segurança."
          tone="dark"
        />
      </Container>
    </>
  );
}
