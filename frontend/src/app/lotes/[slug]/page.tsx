import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivityFeed } from "@/frontend/components/site/activity-feed";
import { Breadcrumbs } from "@/frontend/components/site/breadcrumbs";
import { Container } from "@/frontend/components/site/container";
import { FaqList } from "@/frontend/components/site/faq-list";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { LotGallery } from "@/frontend/components/site/lot-gallery";
import { LotInfoPanel } from "@/frontend/components/site/lot-info-panel";
import { LotCard } from "@/frontend/components/site/lot-card";
import { OpportunityActionsPanel } from "@/frontend/components/site/opportunity-actions-panel";
import { StructuredData } from "@/frontend/components/site/structured-data";
import { absoluteUrl, createLotWhatsAppLink, siteConfig } from "@/shared/config/site";
import {
  getLotBySlug,
  getLotsByEventSlug,
} from "@/backend/features/auctions/server/catalog";
import { getCurrentUser } from "@/backend/features/platform/server/auth";
import { getLotPlatformSnapshot } from "@/backend/features/platform/server/repository";
import { createPageMetadata } from "@/shared/lib/metadata";

export const dynamic = "force-dynamic";

type LotPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LotPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lot = await getLotBySlug(slug);

  if (!lot) {
    return {
      title: "Lote não encontrado",
    };
  }

  return createPageMetadata({
    title: lot.title,
    path: `/lotes/${lot.slug}`,
    imagePath: `/lotes/${lot.slug}/opengraph-image`,
    description: lot.overview,
  });
}

export default async function LotDetailPage({ params }: LotPageProps) {
  const { slug } = await params;
  const lot = await getLotBySlug(slug);

  if (!lot) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const snapshot = await getLotPlatformSnapshot(lot.slug, currentUser?.id);

  const relatedLots = (await getLotsByEventSlug(lot.eventSlug))
    .filter(
      (candidate) =>
        candidate.eventSlug === lot.eventSlug && candidate.slug !== lot.slug,
    )
    .slice(0, 3);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: lot.title,
      image: lot.media.map((image) => absoluteUrl(image.src)),
      description: lot.overview,
      category: lot.category,
      sku: lot.lotCode,
      additionalProperty: [
        { "@type": "PropertyValue", name: "Ano", value: lot.year },
        { "@type": "PropertyValue", name: "Localização", value: lot.location },
        { "@type": "PropertyValue", name: "Combustível", value: lot.fuel },
        {
          "@type": "PropertyValue",
          name: "Referência online",
          value: lot.pricing.referenceValueLabel,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Início",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Eventos",
          item: absoluteUrl("/eventos"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: lot.title,
          item: absoluteUrl(`/lotes/${lot.slug}`),
        },
      ],
    },
  ];

  const primaryAction = currentUser
    ? snapshot.preBidEnabled
      ? {
          href: "#pre-lance-online",
          label: "Ir para pré-lance",
        }
      : {
          href: "#acoes-da-plataforma",
          label: "Ver ações do lote",
        }
    : {
        href: `/cadastro?redirect=${encodeURIComponent(`/lotes/${lot.slug}`)}`,
        label: "Criar cadastro",
      };

  const secondaryAction = currentUser
    ? {
        href: "/como-participar",
        label: "Entender o processo",
      }
    : {
        href: `/entrar?redirect=${encodeURIComponent(`/lotes/${lot.slug}`)}`,
        label: "Já tenho conta",
      };
  const lotWhatsAppHref = createLotWhatsAppLink({
    title: lot.title,
    lotCode: lot.lotCode,
    location: lot.location,
  });

  const experienceLayers = [
    "Nesta página: galeria, código, localização, referência e atividade pública.",
    "Na sua área: interesse e pré-lance com histórico do lote.",
    "No canal oficial: edital, disponibilidade, pagamento, comissão e retirada.",
  ] as const;

  const platformGuides = [
    {
      title: "O que você analisa no site",
      bullets: [
        "Analisar fotos, resumo, fatos do lote e referência online.",
        "Comparar status comercial, localização e informações principais.",
        "Registrar interesse e pré-lance com rastreabilidade, quando autenticado.",
      ],
    },
    {
      title: "O que continua na validação oficial",
      bullets: [
        lot.sourceNote,
        "Edital, anexos, disponibilidade, pagamento, comissão e retirada seguem confirmação formal da operação.",
        "O pré-lance não substitui habilitação, leitura documental nem aceite definitivo da oportunidade.",
      ],
    },
  ] as const;

  return (
    <>
      <StructuredData data={structuredData} />

      <section className="border-b border-brand-line/80 bg-brand-paper">
        <Container className="py-6">
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: "Eventos", href: "/eventos" },
              { label: lot.title },
            ]}
          />
        </Container>
      </section>

      <section className="border-b border-brand-line/80 bg-brand-paper">
        <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
                Lote em destaque
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
                {lot.title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-brand-muted sm:text-lg">
                {lot.overview}
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                {[
                  lot.status,
                  lot.lotCode,
                  lot.location,
                  lot.year,
                  lot.onlineStatusLabel,
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-brand-line bg-white px-4 py-2 font-semibold text-brand-muted"
                  >
                    {item}
                  </span>
                ))}
                <span className="rounded-full bg-brand-navy px-4 py-2 font-semibold text-white">
                  Referência: {lot.pricing.referenceValueLabel}
                </span>
              </div>
            </div>

            <LotGallery images={lot.media} title={lot.title} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[28px] bg-brand-navy p-6 text-white shadow-[0_28px_70px_-44px_rgba(13,32,52,0.85)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-sand">
                Fluxo deste lote
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight">
                Analise o lote e registre seu interesse antes da confirmação oficial.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/74">
                A consulta do lote, o acompanhamento na área do comprador e o
                atendimento oficial têm funções diferentes dentro da jornada.
              </p>

              <div className="mt-6 grid gap-3">
                {experienceLayers.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4 text-sm leading-7 text-white/78"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <InterestActions
                className="mt-6"
                primaryHref={primaryAction.href}
                primaryLabel={primaryAction.label}
                secondaryHref={secondaryAction.href}
                secondaryLabel={secondaryAction.label}
              />
              <p className="mt-4 text-sm leading-6 text-white/72">
                WhatsApp oficial:{" "}
                <a
                  className="font-semibold text-white underline-offset-4 transition hover:underline"
                  href={lotWhatsAppHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {siteConfig.whatsappDisplay}
                </a>{" "}
                • {siteConfig.businessHours}
              </p>
            </div>

            <OpportunityActionsPanel lot={lot} snapshot={snapshot} />

            <LotInfoPanel
              eyebrow="Ficha pública do lote"
              items={[
                { label: "Código do lote", value: lot.lotCode },
                { label: "Localização", value: lot.location },
                { label: "Ano", value: lot.year },
                { label: "Quilometragem", value: lot.mileage },
                { label: "Combustível", value: lot.fuel },
                ...(lot.transmission
                  ? [{ label: "Transmissão", value: lot.transmission }]
                  : []),
                { label: "Status comercial", value: lot.status },
                { label: "Referência online", value: lot.pricing.referenceValueLabel },
              ]}
            />
          </aside>
        </Container>
      </section>

      <Container className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <section className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              O que observar
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
              Resumo objetivo desta oportunidade.
            </h2>
          </div>

          <div className="grid gap-3">
            {lot.highlights.map((highlight) => (
              <div key={highlight} className="flex gap-3 text-base leading-7 text-brand-ink">
                <span className="mt-3 h-2 w-2 rounded-full bg-brand-brass" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]">
            <h3 className="text-2xl font-semibold text-brand-ink">
              Descrição e observações
            </h3>
            <div className="mt-4 grid gap-4 text-base leading-8 text-brand-muted">
              {lot.details.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-5 text-base leading-8 text-brand-muted">
              {lot.operationalDisclaimer}
            </p>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-brand-muted">
              {lot.facts.map((fact) => (
                <li key={fact} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {snapshot.recentActivity.length ? (
            <ActivityFeed
              description={
                snapshot.viewerIsAuthenticated
                  ? "Como você está autenticado, o bloco abaixo mostra a movimentação desta oportunidade com mais contexto."
                  : "Visitantes veem apenas o resumo público e anonimizado da atividade desta oportunidade."
              }
              items={snapshot.recentActivity}
              title="Movimentação recente deste lote"
            />
          ) : null}
        </section>

        <section className="space-y-5">
          {platformGuides.map((guide) => (
            <div
              key={guide.title}
              className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
                Clareza de processo
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-brand-ink">
                {guide.title}
              </h2>
              <ul className="mt-5 grid gap-3 text-sm leading-7 text-brand-muted">
                {guide.bullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </Container>

      {relatedLots.length ? (
        <Container className="grid gap-8 border-t border-brand-line/80 py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Mais lotes
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
              Outros lotes para continuar a análise.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedLots.map((relatedLot) => (
              <LotCard key={relatedLot.slug} lot={relatedLot} />
            ))}
          </div>
        </Container>
      ) : null}

      <Container className="grid gap-10 border-t border-brand-line/80 py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            FAQ curta
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            Perguntas rápidas sobre este lote.
          </h2>
        </div>
        <FaqList items={lot.faq.slice(0, 4)} />
      </Container>
    </>
  );
}
