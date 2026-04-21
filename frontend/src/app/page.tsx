import type { Metadata } from "next";
import Image from "next/image";

import { ActivityFeed } from "@/frontend/components/site/activity-feed";
import { Container } from "@/frontend/components/site/container";
import { FaqList } from "@/frontend/components/site/faq-list";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { LotCard } from "@/frontend/components/site/lot-card";
import { StructuredData } from "@/frontend/components/site/structured-data";
import { absoluteUrl, createWhatsAppLink, siteConfig } from "@/shared/config/site";
import { listFeaturedLots } from "@/backend/features/auctions/server/catalog";
import type { FaqItem } from "@/backend/features/auctions/types";
import { getCurrentUser } from "@/backend/features/platform/server/auth";
import { listPublicActivity } from "@/backend/features/platform/server/repository";
import { createPageMetadata } from "@/shared/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Início",
  path: "/",
  description:
    "Encontre veículos, máquinas e equipamentos de leilão com valores abaixo do mercado. Cadastre-se, acompanhe lotes e envie seu pré-lance online.",
  keywords: [
    "pré-lance online",
    "leilão de veículos",
    "oportunidades de leilão",
    "lotes abaixo do mercado",
  ],
});

const heroSignals = [
  {
    label: "Economia real",
    value: "Veículos, máquinas e equipamentos com valores abaixo do mercado, vindos de leilões oficiais.",
  },
  {
    label: "Atendimento direto",
    value: "Tire dúvidas e negocie pelo WhatsApp com uma equipe que entende do processo de ponta a ponta.",
  },
  {
    label: "Pré-lance online",
    value: "Registre seu interesse e envie sua proposta antes do leilão, sem sair de casa.",
  },
] as const;

const processSteps = [
  {
    step: "01",
    title: "Escolha sua oportunidade",
    description:
      "Navegue pelo catálogo, veja fotos, localização, valores de referência e o status de cada lote disponível.",
  },
  {
    step: "02",
    title: "Cadastre-se e acompanhe",
    description:
      "Crie sua conta gratuita em segundos, salve os lotes que te interessam e acompanhe a movimentação em tempo real.",
  },
  {
    step: "03",
    title: "Faça seu pré-lance ou fale conosco",
    description:
      "Envie sua proposta online ou chame no WhatsApp para tirar qualquer dúvida antes de dar o próximo passo.",
  },
] as const;

const commercialPillars = [
  {
    title: "Oportunidades selecionadas",
    description:
      "Cada lote passa por uma triagem comercial antes de entrar no catálogo. Você vê só o que realmente vale a pena.",
  },
  {
    title: "Processo simples e transparente",
    description:
      "Sem burocracia desnecessária. Valores claros, status atualizado e atendimento humano do início ao fim.",
  },
  {
    title: "Segurança e confiança",
    description:
      "Seus dados ficam protegidos, suas propostas são registradas com segurança e todo o histórico é rastreável.",
  },
] as const;

const faqPreview: FaqItem[] = [
  {
    question: "Preciso me cadastrar para ver os lotes?",
    answer:
      "Não. Qualquer pessoa pode ver as oportunidades, fotos e valores de referência. O cadastro é necessário para acompanhar lotes e enviar pré-lances.",
  },
  {
    question: "O pré-lance garante a compra?",
    answer:
      "O pré-lance registra sua proposta de forma oficial. A confirmação final é feita pela equipe de atendimento via WhatsApp, com toda a orientação necessária.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "Após a aprovação do lance, nossa equipe orienta todo o processo de pagamento e documentação pelo WhatsApp, de forma segura e personalizada.",
  },
  {
    question: "Posso tirar dúvidas antes de dar um lance?",
    answer:
      "Claro! Use o botão de WhatsApp em qualquer página para falar diretamente com a equipe. Estamos aqui para ajudar.",
  },
];

const homeStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl(),
    description:
      "Página comercial de divulgação da Kron Leilões com cadastro, área restrita e atendimento via WhatsApp.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phoneNumber,
      email: siteConfig.email,
      contactType: "sales",
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

  return (
    <>
      <StructuredData data={homeStructuredData} />

      <section className="relative overflow-hidden border-b border-brand-line bg-brand-navy-deep text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,139,27,0.24),transparent_34%),linear-gradient(160deg,#0d2034_8%,#173452_64%,#0d2034_100%)]" />
        <Container className="relative grid gap-10 py-14 sm:py-20 lg:min-h-[calc(100svh-84px)] lg:grid-cols-[minmax(0,0.94fr)_minmax(480px,1.06fr)] lg:items-center">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-sand">
                Kron Leilões
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-balance sm:text-5xl lg:text-6xl">
                Oportunidades de leilão com economia real e atendimento humano.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
                Encontre veículos, máquinas e equipamentos com valores abaixo do
                mercado. Cadastre-se, acompanhe os lotes e envie seu pré-lance
                online — tudo com o suporte da nossa equipe pelo WhatsApp.
              </p>
            </div>

            <InterestActions
              primaryHref={createWhatsAppLink(
                `Olá, quero atendimento comercial da ${siteConfig.name} para analisar uma oportunidade.`,
              )}
              primaryLabel="Falar no WhatsApp"
              secondaryHref={dashboardHref}
              secondaryLabel={dashboardLabel}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              {heroSignals.map((item) => (
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
                src="/media/brand/kron-banner.svg"
                width={1600}
              />
            </div>
            <div className="grid gap-3 px-2 pb-2 pt-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                  Catálogo atualizado
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  Novos lotes entram regularmente com fotos, localização e valores de referência.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                  Sua área exclusiva
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  Cadastre-se gratuitamente para acompanhar lotes e registrar pré-lances online.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                  WhatsApp direto
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  Fale com a equipe em qualquer momento para dúvidas, propostas ou orientação.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-16 py-14 sm:py-20">
        <section className="grid gap-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Oportunidades em destaque
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
              Confira os lotes com melhor potencial de economia.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-brand-muted">
              Veículos e equipamentos selecionados com valores de referência,
              localização e status atualizados. Veja os detalhes e entre em contato.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredLots.map((lot) => (
              <LotCard key={lot.slug} lot={lot} />
            ))}
          </div>
        </section>

        <ActivityFeed
          description="Veja as últimas movimentações da plataforma: novos lotes, interesses registrados e pré-lances recentes."
          items={publicActivity}
          title="Atividade recente"
        />

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Como funciona
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
              Três passos para aproveitar a melhor oportunidade.
            </h2>
            <p className="text-base leading-8 text-brand-muted">
              Um processo simples, transparente e com atendimento humano do
              início ao fim. Você no controle, nós na orientação.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((item) => (
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

        <section className="grid gap-4 lg:grid-cols-3">
          {commercialPillars.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_20px_52px_-44px_rgba(26,36,48,0.3)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-brass">
                Pilar comercial
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-brand-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Perguntas frequentes
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
              Dúvidas? A gente responde.
            </h2>
            <p className="text-base leading-8 text-brand-muted">
              Confira as respostas para as perguntas mais comuns. Se precisar de
              mais detalhes, é só chamar no WhatsApp.
            </p>
          </div>
          <FaqList items={faqPreview} />
        </section>

        <section className="overflow-hidden rounded-[34px] border border-brand-line bg-brand-navy text-white">
          <div className="grid gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-sand">
                Pronto para aproveitar?
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
                Cadastre-se agora ou fale direto com a equipe.
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-8 text-white/72">
                Não perca tempo. As melhores oportunidades de leilão estão aqui,
                com atendimento personalizado pelo WhatsApp e pré-lance online.
              </p>
            </div>

            <InterestActions
              primaryHref={createWhatsAppLink(
                `Olá, quero falar com o atendimento comercial da ${siteConfig.name}.`,
              )}
              primaryLabel="Falar no WhatsApp"
              secondaryHref={dashboardHref}
              secondaryLabel={dashboardLabel}
            />
          </div>
        </section>
      </Container>
    </>
  );
}
