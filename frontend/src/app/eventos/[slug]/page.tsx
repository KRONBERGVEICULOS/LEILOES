import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/frontend/components/site/breadcrumbs";
import { CatalogFilters } from "@/frontend/components/site/catalog-filters";
import { Container } from "@/frontend/components/site/container";
import { DocumentCenter } from "@/frontend/components/site/document-center";
import { EmptyState } from "@/frontend/components/site/empty-state";
import { FaqList } from "@/frontend/components/site/faq-list";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { LotCard } from "@/frontend/components/site/lot-card";
import { LotInfoPanel } from "@/frontend/components/site/lot-info-panel";
import { PageHero } from "@/frontend/components/site/page-hero";
import { StructuredData } from "@/frontend/components/site/structured-data";
import { TrustPanel } from "@/frontend/components/site/trust-panel";
import { absoluteUrl, siteConfig } from "@/shared/config/site";
import {
  getEventBySlug,
} from "@/backend/features/auctions/data/catalog";
import {
  filterLots,
  getLotCategoryOptions,
  normalizeLotCatalogFilters,
} from "@/backend/features/auctions/lib/catalog-queries";
import { getLotsByEventSlug } from "@/backend/features/auctions/server/catalog";
import { createPageMetadata } from "@/shared/lib/metadata";
import { trustPillars } from "@/backend/features/content/data/site-content";

export const dynamic = "force-dynamic";

type EventPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return {
      title: "Evento não encontrado",
    };
  }

  return createPageMetadata({
    title: event.title,
    path: `/eventos/${event.slug}`,
    imagePath: `/eventos/${event.slug}/opengraph-image`,
    description: event.summary,
  });
}

export default async function EventDetailPage({
  params,
  searchParams,
}: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const allEventLots = await getLotsByEventSlug(event.slug);
  const lotFilters = normalizeLotCatalogFilters(await searchParams);
  const filteredEventLots = filterLots(allEventLots, lotFilters);
  const lotCategoryOptions = getLotCategoryOptions(allEventLots).map((value) => ({
    label: value,
    value,
  }));

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: event.title,
      description: event.summary,
      url: absoluteUrl(`/eventos/${event.slug}`),
      numberOfItems: allEventLots.length,
      image: absoluteUrl(event.image.src),
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
          name: "Leilões e eventos",
          item: absoluteUrl("/eventos"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: event.title,
          item: absoluteUrl(`/eventos/${event.slug}`),
        },
      ],
    },
  ];
  const documentRules = [
    "O edital do evento continua sendo o documento base para participação, comissão, pagamento, cronograma e retirada.",
    "Cada praça pode exigir confirmação adicional de visitação, habilitação, documentos de liberação ou logística.",
    "A confirmação final de disponibilidade e anexos aplicáveis deve ser feita no atendimento oficial antes de qualquer decisão.",
    event.note,
  ];
  const documentObservations = [
    `Cobertura informada: ${event.coverage}.`,
    `Formato de atendimento: ${event.format}.`,
    "Documentos complementares podem variar por lote ou por praça dentro do mesmo evento.",
  ];

  return (
    <>
      <StructuredData data={structuredData} />

      <section className="border-b border-brand-line/80 bg-brand-paper">
        <Container className="py-6">
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: "Leilões e eventos", href: "/eventos" },
              { label: event.title },
            ]}
          />
        </Container>
      </section>

      <PageHero
        aside={
          <div className="rounded-xl border border-brand-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Atendimento do evento
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">{event.note}</p>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              {siteConfig.businessHours} • {siteConfig.phoneDisplay}
            </p>
            <InterestActions
              className="mt-5"
              primaryHref={event.documents[0]?.ctaHref}
              primaryLabel={event.documents[0]?.ctaLabel ?? "Solicitar atendimento"}
              secondaryHref="/cadastro"
              secondaryLabel="Criar cadastro"
            />
          </div>
        }
        description={event.summary}
        eyebrow={event.eyebrow}
        meta={[event.status, event.schedule, event.coverage, "Área restrita disponível"]}
        title={event.title}
      />

      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-xl border border-brand-line bg-white">
            <div className="relative aspect-[16/10]">
              <Image
                alt={event.image.alt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                src={event.image.src}
              />
            </div>
          </div>
          <div className="grid gap-6 rounded-xl border border-brand-line bg-white p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
                Resumo do evento
              </p>
              <p className="mt-3 text-base leading-7 text-brand-muted">
                {event.intro}
              </p>
            </div>
            <div className="grid gap-3">
              {event.highlights.map((highlight) => (
                <div key={highlight} className="flex gap-3 text-sm leading-6 text-brand-ink">
                  <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
          <LotInfoPanel
            eyebrow="Resumo operacional do evento"
            items={[
              { label: "Status", value: event.status },
              { label: "Praças", value: event.coverage },
              { label: "Cronograma", value: event.schedule },
              {
                label: "Documento base",
                value: event.documents[0]
                  ? `${event.documents[0].kind} • ${event.documents[0].statusLabel}`
                  : "Confirmar com a equipe",
              },
              {
                label: "Próximo passo",
                value: "Solicitar o edital e confirmar regras de participação, visitação, pagamento e retirada.",
              },
            ]}
          />
        </aside>
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16">
        <DocumentCenter
          description="Veja o documento base do evento, materiais complementares e o melhor canal para solicitar arquivos ou confirmar a versão aplicável."
          documents={event.documents}
          eyebrow="Central documental do evento"
          observations={documentObservations}
          rules={documentRules}
          title="Edital, anexos e status documental"
        />
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Lotes do evento
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            Lotes publicados neste evento.
          </h2>
        </div>
        <CatalogFilters
          action={`/eventos/${event.slug}`}
          query={lotFilters.query}
          resultCount={filteredEventLots.length}
          searchLabel="Buscar por lote ou código"
          searchPlaceholder="Ex.: Lote #1428, Amarok, Campinas"
          selects={[
            {
              label: "Categoria",
              name: "categoria",
              options: lotCategoryOptions,
              value: lotFilters.category,
            },
          ]}
          totalCount={allEventLots.length}
        />
        {filteredEventLots.length ? (
          <div className="grid gap-5">
            {filteredEventLots.map((lot) => (
              <LotCard key={lot.slug} lot={lot} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="Nenhum lote deste evento corresponde à busca atual. Limpe os filtros ou volte à listagem completa para retomar a navegação."
            primaryHref={`/eventos/${event.slug}`}
            primaryLabel="Limpar filtros"
            secondaryHref="/eventos"
            secondaryLabel="Ver outros eventos"
            title="Os lotes deste evento não retornaram resultados com os critérios atuais."
          />
        )}
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Dúvidas sobre este evento
          </p>
          <FaqList items={event.faq} />
        </div>
        <div className="space-y-6">
          <TrustPanel items={trustPillars} />
        </div>
      </Container>
    </>
  );
}
