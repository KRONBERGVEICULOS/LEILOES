import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-list";
import { InterestActions } from "@/components/site/interest-actions";
import { LotGallery } from "@/components/site/lot-gallery";
import { PageHero } from "@/components/site/page-hero";
import { StructuredData } from "@/components/site/structured-data";
import { TrustPanel } from "@/components/site/trust-panel";
import { absoluteUrl } from "@/config/site";
import {
  getEventBySlug,
  getLotBySlug,
  lots,
} from "@/features/auctions/data/catalog";
import { trustPillars } from "@/features/content/data/site-content";

type LotPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return lots.map((lot) => ({
    slug: lot.slug,
  }));
}

export async function generateMetadata({
  params,
}: LotPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lot = getLotBySlug(slug);

  if (!lot) {
    return {
      title: "Lote não encontrado",
    };
  }

  return {
    title: lot.title,
    description: lot.overview,
    alternates: {
      canonical: absoluteUrl(`/lotes/${lot.slug}`),
    },
  };
}

export default async function LotDetailPage({ params }: LotPageProps) {
  const { slug } = await params;
  const lot = getLotBySlug(slug);

  if (!lot) {
    notFound();
  }

  const event = getEventBySlug(lot.eventSlug);
  const relatedLots = lots.filter(
    (candidate) => candidate.eventSlug === lot.eventSlug && candidate.slug !== lot.slug,
  );

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: lot.title,
      image: lot.media.map((image) => absoluteUrl(image)),
      description: lot.overview,
      category: lot.category,
      sku: lot.lotCode,
      additionalProperty: [
        { "@type": "PropertyValue", name: "Ano", value: lot.year },
        { "@type": "PropertyValue", name: "Localização", value: lot.location },
        { "@type": "PropertyValue", name: "Combustível", value: lot.fuel },
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
          name: "Leilões e eventos",
          item: absoluteUrl("/eventos"),
        },
        ...(event
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: event.title,
                item: absoluteUrl(`/eventos/${event.slug}`),
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: event ? 4 : 3,
          name: lot.title,
          item: absoluteUrl(`/lotes/${lot.slug}`),
        },
      ],
    },
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
              ...(event
                ? [{ label: event.title, href: `/eventos/${event.slug}` }]
                : []),
              { label: lot.title },
            ]}
          />
        </Container>
      </section>

      <PageHero
        aside={
          <div className="rounded-[2rem] border border-brand-line bg-white p-6 shadow-[0_22px_80px_-55px_rgba(16,24,39,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Condição do lote
            </p>
            <p className="mt-4 text-base leading-8 text-brand-muted">
              {lot.condition}
            </p>
            <InterestActions
              className="mt-6"
              primaryHref={lot.documents[0]?.ctaHref}
              primaryLabel="Manifestar interesse"
              secondaryHref={event ? `/eventos/${event.slug}` : "/eventos"}
              secondaryLabel={event ? "Ver evento" : "Ver eventos"}
            />
          </div>
        }
        description={lot.overview}
        eyebrow={lot.category}
        meta={[lot.lotCode, lot.location, lot.year]}
        title={lot.title}
      />

      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <LotGallery images={lot.media} title={lot.title} />

        <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-[2rem] border border-brand-line bg-brand-paper p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Metadados do lote
            </p>
            <dl className="mt-5 grid gap-5">
              <div>
                <dt className="text-sm font-semibold text-brand-ink">Lote</dt>
                <dd className="mt-1 text-sm leading-7 text-brand-muted">{lot.lotCode}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-brand-ink">Categoria</dt>
                <dd className="mt-1 text-sm leading-7 text-brand-muted">
                  {lot.category}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-brand-ink">Praça</dt>
                <dd className="mt-1 text-sm leading-7 text-brand-muted">
                  {lot.location}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-brand-ink">Quilometragem</dt>
                <dd className="mt-1 text-sm leading-7 text-brand-muted">
                  {lot.mileage}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-brand-ink">Combustível</dt>
                <dd className="mt-1 text-sm leading-7 text-brand-muted">{lot.fuel}</dd>
              </div>
              {lot.transmission ? (
                <div>
                  <dt className="text-sm font-semibold text-brand-ink">Transmissão</dt>
                  <dd className="mt-1 text-sm leading-7 text-brand-muted">
                    {lot.transmission}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="rounded-[2rem] border border-brand-line bg-white p-7 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Nota de origem
            </p>
            <p className="mt-4 text-sm leading-7 text-brand-muted">{lot.sourceNote}</p>
          </div>
        </aside>
      </Container>

      <Container className="grid gap-12 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <section className="space-y-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Destaques
            </p>
            <h2 className="mt-4 font-display text-5xl leading-none text-brand-ink">
              Informação organizada para triagem séria do lote.
            </h2>
          </div>
          <div className="grid gap-3">
            {lot.highlights.map((highlight) => (
              <div key={highlight} className="flex gap-3 text-base leading-8 text-brand-ink">
                <span className="mt-3 h-2 w-2 rounded-full bg-brand-brass" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
          <div className="rounded-[2rem] border border-brand-line bg-white p-7 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)]">
            <h3 className="text-2xl font-semibold text-brand-ink">
              Informações relevantes
            </h3>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-brand-muted">
              {lot.facts.map((fact) => (
                <li key={fact} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-brand-line bg-white p-7 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Documentos e edital
            </p>
            {lot.documents.map((document) => (
              <div key={document.title} className="mt-5 border-t border-brand-line pt-5 first:mt-0 first:border-t-0 first:pt-0">
                <h2 className="text-lg font-semibold text-brand-ink">
                  {document.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {document.description}
                </p>
                <a
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
                  href={document.ctaHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  {document.ctaLabel}
                </a>
              </div>
            ))}
          </div>

          {event ? (
            <div className="rounded-[2rem] border border-brand-line bg-brand-paper p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
                Evento relacionado
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-brand-ink">
                {event.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {event.summary}
              </p>
              <Link
                className="mt-5 inline-flex items-center justify-center rounded-full border border-brand-line bg-white px-5 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-brass hover:text-brand-brass"
                href={`/eventos/${event.slug}`}
              >
                Abrir evento
              </Link>
            </div>
          ) : null}
        </section>
      </Container>

      {relatedLots.length ? (
        <Container className="grid gap-8 border-t border-brand-line/80 py-16">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Outros lotes da mesma frente
            </p>
            <h2 className="font-display text-4xl leading-none text-brand-ink">
              Navegação lateral sem quebrar o contexto do comprador.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedLots.map((relatedLot) => (
              <Link
                key={relatedLot.slug}
                className="rounded-[1.8rem] border border-brand-line bg-white p-6 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)] transition hover:border-brand-brass"
                href={`/lotes/${relatedLot.slug}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-brass">
                  {relatedLot.lotCode}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-brand-ink">
                  {relatedLot.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {relatedLot.overview}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      ) : null}

      <Container className="grid gap-10 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
            Dúvidas frequentes
          </p>
          <FaqList items={lot.faq} />
        </div>
        <div className="space-y-6">
          <TrustPanel items={trustPillars} />
        </div>
      </Container>
    </>
  );
}
