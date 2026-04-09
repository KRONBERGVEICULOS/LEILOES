import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-list";
import { InterestActions } from "@/components/site/interest-actions";
import { SectionHeading } from "@/components/site/section-heading";
import { StructuredData } from "@/components/site/structured-data";
import { TrustPanel } from "@/components/site/trust-panel";
import { absoluteUrl, siteConfig } from "@/config/site";
import {
  auctionEvents,
  categories,
  featuredLotSlugs,
  getLotBySlug,
} from "@/features/auctions/data/catalog";
import {
  faqItems,
  finalCta,
  howItWorksSteps,
  trustPillars,
} from "@/features/content/data/site-content";

export const metadata: Metadata = {
  title: "Início",
  description:
    "Catálogo institucional com eventos, lotes, conteúdo orientativo e atendimento assistido para uma operação de leilões mais confiável.",
};

const featuredLots = featuredLotSlugs
  .map((slug) => getLotBySlug(slug))
  .filter((lot) => Boolean(lot));

const homeStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl(),
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address[0],
      addressLocality: "Curitiba",
      addressRegion: "PR",
      addressCountry: "BR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.whatsappDisplay,
      contactType: "customer support",
      areaServed: "BR",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl(),
    inLanguage: "pt-BR",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.slice(0, 4).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
];

export default function Home() {
  return (
    <>
      <StructuredData data={homeStructuredData} />

      <section className="relative overflow-hidden bg-brand-ink text-white">
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/8 to-transparent" />
        <Container className="relative grid min-h-[calc(100svh-80px)] gap-12 py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:py-20">
          <div className="space-y-8">
            <div className="space-y-5 animate-rise-in">
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-brand-sand">
                Plataforma institucional de leilões
              </p>
              <h1 className="max-w-3xl font-display text-6xl leading-none text-balance sm:text-7xl">
                Catálogo sério, linguagem premium e um fluxo honesto de atendimento.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/72">
                Um novo produto digital para apresentar lotes, organizar informação e
                sustentar confiança. Sem aparência improvisada. Sem simular lances ao
                vivo quando a operação ainda depende de atendimento assistido.
              </p>
            </div>

            <InterestActions
              className="animate-rise-in-delay"
              primaryHref={finalCta.primaryHref}
              primaryLabel="Manifestar interesse"
              secondaryHref="/eventos"
              secondaryLabel="Explorar eventos"
            />

            <div className="grid gap-4 border-t border-white/12 pt-7 sm:grid-cols-3">
              {[
                "Arquitetura pronta para crescer",
                "Catálogo tipado por evento e lote",
                "Edital e atendimento sob solicitação",
              ].map((item) => (
                <p key={item} className="text-sm leading-7 text-white/64">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="relative animate-rise-in-delay">
            <div className="grain-surface absolute inset-0 rounded-[2.5rem] bg-white/6" />
            <div className="relative rounded-[2.5rem] border border-white/12 bg-white/6 p-4 shadow-[0_30px_120px_-50px_rgba(0,0,0,0.75)] backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-[2rem]">
                <div className="relative aspect-[4/4.5]">
                  <Image
                    alt="Picape em destaque no catálogo institucional"
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    src="/media/lots/amarok-extreme/amarok.jpg"
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)]">
                <div className="rounded-[1.7rem] border border-white/10 bg-black/18 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-sand">
                    Direção do produto
                  </p>
                  <p className="mt-3 text-base leading-7 text-white/72">
                    A plataforma assume um papel institucional: ela organiza leitura,
                    contexto e contato. O protagonismo é da confiança, não de um card
                    aleatório com urgência falsa.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-brand-brass/30 bg-brand-brass/12 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-sand">
                    MVP honesto
                  </p>
                  <p className="mt-3 text-base leading-7 text-white/72">
                    CTA baseado em manifestação de interesse, solicitação de edital e
                    atendimento assistido. Sem prometer motor de lance que ainda não foi
                    implementado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-brand-line bg-brand-paper">
        <Container className="grid gap-6 py-12 md:grid-cols-3">
          {trustPillars.map((pillar) => (
            <div key={pillar.title} className="section-divider space-y-4 pt-5">
              <h2 className="text-2xl font-semibold text-brand-ink">
                {pillar.title}
              </h2>
              <p className="text-base leading-8 text-brand-muted">
                {pillar.description}
              </p>
            </div>
          ))}
        </Container>
      </section>

      <Container className="grid gap-16 py-18 sm:py-24">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading
            description="As categorias aparecem como frentes de navegação, ajudando a agrupar leitura, documentação e atendimento."
            eyebrow="Categorias de bens"
            title="Uma taxonomia simples o bastante para orientar, sólida o bastante para escalar."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="rounded-[1.8rem] border border-brand-line bg-white p-6 shadow-[0_18px_60px_-50px_rgba(16,24,39,0.35)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-brass">
                  {category.name}
                </p>
                <p className="mt-4 text-xl font-semibold leading-8 text-brand-ink">
                  {category.summary}
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {category.scope}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8">
          <SectionHeading
            description="Cada frente editorial foi desenhada para servir como página de contexto, não apenas como agrupamento aleatório de cards."
            eyebrow="Leilões e eventos"
            title="Coleções com contexto, escopo e um CTA que respeita a operação real."
          />
          <div className="grid gap-8">
            {auctionEvents.map((event, index) => (
              <article
                key={event.slug}
                className="grid gap-6 overflow-hidden rounded-[2.25rem] border border-brand-line bg-white shadow-[0_22px_90px_-60px_rgba(16,24,39,0.45)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
              >
                <div className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}>
                  <div className="relative h-full min-h-[320px]">
                    <Image
                      alt={event.title}
                      className="object-cover"
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      src={event.image}
                    />
                  </div>
                </div>
                <div className="order-2 flex flex-col justify-between p-8 lg:p-10">
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-brass">
                      <span>{event.eyebrow}</span>
                      <span className="text-brand-muted">{event.status}</span>
                    </div>
                    <h3 className="font-display text-4xl leading-none text-brand-ink">
                      {event.title}
                    </h3>
                    <p className="text-base leading-8 text-brand-muted">
                      {event.summary}
                    </p>
                    <ul className="grid gap-3 text-sm leading-7 text-brand-ink">
                      {event.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      className="inline-flex items-center justify-center rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
                      href={`/eventos/${event.slug}`}
                    >
                      Ver evento
                    </Link>
                    <a
                      className="inline-flex items-center justify-center rounded-full border border-brand-line px-5 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-brass hover:text-brand-brass"
                      href={event.documents[0]?.ctaHref}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Solicitar edital
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <SectionHeading
              description="O site não empurra o usuário para uma ação nebulosa. Ele conduz uma sequência verificável, adequada ao estágio atual da operação."
              eyebrow="Como funciona"
              title="Uma jornada curta, profissional e preparada para ser automatizada depois."
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
                    <h3 className="text-2xl font-semibold text-brand-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-brand-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8">
          <SectionHeading
            description="Os destaques abaixo mostram como a página de lote pode ser tratada como uma peça editorial robusta, com galeria, metadados, contexto e CTA claro."
            eyebrow="Lotes em destaque"
            title="Páginas de lote com leitura executiva e apoio à diligência."
          />
          <div className="grid gap-5">
            {featuredLots.map((lot) =>
              lot ? (
                <article
                  key={lot.slug}
                  className="grid gap-6 overflow-hidden rounded-[2rem] border border-brand-line bg-white p-4 shadow-[0_22px_80px_-55px_rgba(16,24,39,0.4)] md:grid-cols-[280px_minmax(0,1fr)]"
                >
                  <div className="relative overflow-hidden rounded-[1.5rem]">
                    <div className="relative aspect-[4/3]">
                      <Image
                        alt={lot.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 280px"
                        src={lot.media[0]}
                      />
                    </div>
                  </div>
                  <div className="grid gap-5 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-brass">
                        <span>{lot.category}</span>
                        <span className="text-brand-muted">{lot.lotCode}</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-semibold leading-tight text-brand-ink">
                          {lot.title}
                        </h3>
                        <p className="mt-2 text-base leading-8 text-brand-muted">
                          {lot.overview}
                        </p>
                      </div>
                      <ul className="flex flex-wrap gap-3 text-sm text-brand-muted">
                        <li className="rounded-full border border-brand-line px-4 py-2">
                          {lot.year}
                        </li>
                        <li className="rounded-full border border-brand-line px-4 py-2">
                          {lot.location}
                        </li>
                        <li className="rounded-full border border-brand-line px-4 py-2">
                          {lot.mileage}
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Link
                        className="inline-flex items-center justify-center rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
                        href={`/lotes/${lot.slug}`}
                      >
                        Ver lote
                      </Link>
                      <a
                        className="inline-flex items-center justify-center rounded-full border border-brand-line px-5 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-brass hover:text-brand-brass"
                        href={lot.documents[0]?.ctaHref}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Solicitar ficha
                      </a>
                    </div>
                  </div>
                </article>
              ) : null,
            )}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <SectionHeading
            description="As respostas a seguir deixam explícito o que este MVP faz hoje e o que será tratado no atendimento assistido."
            eyebrow="FAQ resumido"
            title="Perguntas frequentes sem ruído jurídico ou promessa vazia."
          />
          <FaqList items={faqItems.slice(0, 4)} />
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-[2.5rem] bg-brand-ink px-8 py-10 text-white sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-sand">
              Encerramento
            </p>
            <h2 className="mt-4 font-display text-5xl leading-none">
              {finalCta.title}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
              {finalCta.description}
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
        </section>
      </Container>
    </>
  );
}
