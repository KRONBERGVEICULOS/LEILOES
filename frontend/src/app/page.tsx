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
    "Plataforma de oportunidades de leilão com catálogo público, área restrita para acompanhamento e pré-lance, e canais oficiais para validação operacional.",
  keywords: [
    "plataforma de leilão",
    "catálogo de oportunidades",
    "pré-lance online",
    "lotes de veículos e equipamentos",
  ],
});

const heroHighlights = [
  {
    label: "Catálogo público",
    value:
      "Lotes com fotos, localização, código, referência online e status comercial visíveis para análise inicial.",
  },
  {
    label: "Área restrita",
    value:
      "Interesses, acompanhamento e pré-lances ficam registrados com histórico centralizado dentro da plataforma.",
  },
  {
    label: "Canal oficial",
    value:
      "Edital, disponibilidade, pagamento e retirada continuam validados pelos canais institucionais no momento certo.",
  },
] as const;

const platformLayers = [
  {
    badge: "Público",
    title: "Consulte oportunidades com mais contexto",
    description:
      "A home prioriza leitura rápida do lote, sinais de movimentação e dados úteis para decidir se vale aprofundar a análise.",
  },
  {
    badge: "Área restrita",
    title: "Transforme curiosidade em acompanhamento real",
    description:
      "O cadastro libera interesse, histórico e pré-lance sem depender apenas da memória de uma conversa fora do site.",
  },
  {
    badge: "Canal oficial",
    title: "Acione a equipe quando a jornada sair do digital",
    description:
      "O contato continua disponível para edital, documentos, comissão, pagamento e próximos passos operacionais.",
  },
] as const;

const operationalSignals = [
  {
    label: "Praças atendidas",
    value: siteConfig.serviceRegions.join(" • "),
  },
  {
    label: "Horário institucional",
    value: siteConfig.businessHours,
  },
  {
    label: "Contato oficial",
    value: `${siteConfig.phoneDisplay} • ${siteConfig.email}`,
  },
] as const;

const faqPreview: FaqItem[] = [
  {
    question: "O que muda quando eu crio cadastro na plataforma?",
    answer:
      "O cadastro libera a área restrita para acompanhar lotes, registrar interesse, ver o valor visível da área logada e enviar pré-lances com histórico centralizado.",
  },
  {
    question: "Registrar interesse é a mesma coisa que dar pré-lance?",
    answer:
      "Não. Registrar interesse apenas adiciona o lote à sua área para acompanhamento. O pré-lance registra uma intenção comercial com valor, mas não fecha compra automaticamente.",
  },
  {
    question: "O pré-lance garante reserva, arrematação ou disponibilidade?",
    answer:
      "Não. O pré-lance organiza seu valor e o contexto comercial dentro da plataforma. Aceite, documentação, pagamento, comissão e retirada seguem sujeitos ao edital e à validação oficial.",
  },
  {
    question: "Quando eu preciso falar com a equipe?",
    answer:
      "Quando chegar a hora de validar edital, disponibilidade, anexos, visitação, pagamento, retirada ou qualquer condição operacional que não seja concluída dentro da plataforma.",
  },
] as const;

const homeStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl(),
    description:
      "Plataforma institucional da Kron Leilões com catálogo público, área restrita, acompanhamento e pré-lance online.",
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
  const [currentUser, publicActivity, featuredLots] = await Promise.all([
    getCurrentUser(),
    listPublicActivity(4),
    listFeaturedLots(3),
  ]);

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
                Plataforma de oportunidades
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-balance sm:text-5xl lg:text-6xl">
                Leilões com mais contexto, clareza operacional e credibilidade institucional.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                A Kron Leilões organiza catálogo público, área restrita para
                acompanhamento e pré-lance, e canais oficiais para tudo o que
                precisa de validação fora da plataforma.
              </p>
            </div>

            <InterestActions
              primaryHref="/eventos"
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
                Base institucional visível
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
                  Dentro da plataforma
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-brand-muted">
                  <li>Catálogo público com lotes e referências.</li>
                  <li>Área restrita para interesse e histórico.</li>
                  <li>Pré-lance com registro centralizado.</li>
                </ul>
              </div>

              <div className="rounded-[24px] border border-brand-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                  Fora da plataforma
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-brand-muted">
                  <li>Edital, documentos e anexos do evento.</li>
                  <li>Disponibilidade, pagamento e retirada.</li>
                  <li>Confirmações feitas pelo canal oficial.</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-3 px-2 pb-2 pt-1 sm:grid-cols-3">
              {operationalSignals.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-16 py-14 sm:py-20">
        <section className="grid gap-8">
          <SectionHeading
            description="A experiência pública agora deixa explícito o que acontece no catálogo, o que acontece na área restrita e o que continua dependendo da validação oficial da operação."
            eyebrow="Camadas da experiência"
            title="Uma jornada mais próxima de plataforma do que de página de captação."
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
            description="Os destaques reforçam a proposta da plataforma: leitura clara do lote, valor de referência e caminho objetivo para aprofundar a análise."
            eyebrow="Oportunidades em destaque"
            title="Lotes publicados com leitura mais objetiva e profissional."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredLots.map((lot) => (
              <LotCard key={lot.slug} lot={lot} />
            ))}
          </div>
        </section>

        <ActivityFeed
          description="Novos lotes, interesses registrados e pré-lances visíveis reforçam que existe movimentação pública e acompanhamento rastreável dentro do produto."
          items={publicActivity}
          title="Sinais públicos de atividade na plataforma"
        />

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start">
          <SectionHeading
            description="A operação deixa explícito o que o usuário consegue resolver dentro do site e em que momento o canal oficial entra para validação formal."
            eyebrow="Processo"
            title="Como a experiência evolui da descoberta ao próximo passo oficial."
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
            description="Razão social, contato, base pública e sinalização de dados regulatórios pendentes aparecem organizados para reforçar legitimidade sem improviso visual."
            eyebrow="Credibilidade institucional"
            title="Base pública e regulatória da operação"
          />

          <TrustPanel items={trustPillars.slice(0, 4)} />
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[28px] border border-brand-line bg-brand-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Clareza de produto
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
              Interesse, pré-lance e contato deixados em papéis diferentes.
            </h2>
            <div className="mt-6 grid gap-4">
              <article className="rounded-[24px] border border-brand-line bg-white p-4">
                <h3 className="text-lg font-semibold text-brand-ink">
                  Interesse na plataforma
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
                  O atendimento entra para validar disponibilidade, documentação,
                  pagamento, retirada e qualquer confirmação fora do ambiente digital.
                </p>
              </article>
            </div>
          </div>

          <div className="grid gap-5">
            <SectionHeading
              description="A FAQ reforça os limites do produto sem enfraquecer conversão: a plataforma resolve organização e contexto; a operação resolve validação formal."
              eyebrow="FAQ e segurança"
              title="Perguntas frequentes sobre o fluxo público e a etapa oficial."
            />
            <FaqList items={faqPreview} />
          </div>
        </section>

        <CtaBox
          description="Explore os lotes, acompanhe o que faz sentido na sua área e use o canal oficial apenas quando chegar o momento de validar edital, disponibilidade e próximos passos."
          eyebrow="Fechamento"
          primaryHref={closingPrimaryHref}
          primaryLabel={closingPrimaryLabel}
          secondaryHref="/como-participar"
          secondaryLabel="Entender o processo"
          title="Comece pela plataforma e avance com mais segurança."
          tone="dark"
        />
      </Container>
    </>
  );
}
