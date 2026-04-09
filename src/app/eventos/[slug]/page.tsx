import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-list";
import { InterestActions } from "@/components/site/interest-actions";
import { PageHero } from "@/components/site/page-hero";
import { StructuredData } from "@/components/site/structured-data";
import { TrustPanel } from "@/components/site/trust-panel";
import { absoluteUrl } from "@/config/site";
import {
  auctionEvents,
  getEventBySlug,
  getLotsByEventSlug,
} from "@/features/auctions/data/catalog";
import { trustPillars } from "@/features/content/data/site-content";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return auctionEvents.map((event) => ({
    slug: event.slug,
  }));
}

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

  return {
    title: event.title,
    description: event.summary,
    alternates: {
      canonical: absoluteUrl(`/eventos/${event.slug}`),
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const eventLots = getLotsByEventSlug(event.slug);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: event.title,
      description: event.summary,
      url: absoluteUrl(`/eventos/${event.slug}`),
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
          <div className="rounded-[2rem] border border-brand-line bg-white p-6 shadow-[0_22px_80px_-55px_rgba(16,24,39,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Visão operacional
            </p>
            <p className="mt-4 text-base leading-8 text-brand-muted">{event.note}</p>
            <InterestActions
              className="mt-6"
              primaryHref={event.documents[0]?.ctaHref}
              primaryLabel={event.documents[0]?.ctaLabel ?? "Solicitar atendimento"}
              secondaryHref="/como-participar"
              secondaryLabel="Como participar"
            />
          </div>
        }
        description={event.summary}
        eyebrow={event.eyebrow}
        meta={[event.status, event.coverage, event.format]}
        title={event.title}
      />

      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-brand-line bg-white">
            <div className="relative aspect-[16/10]">
              <Image
                alt={event.title}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                src={event.image}
              />
            </div>
          </div>
          <div className="grid gap-6 rounded-[2rem] border border-brand-line bg-white p-8 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
                Introdução
              </p>
              <p className="mt-4 text-base leading-8 text-brand-muted">
                {event.intro}
              </p>
            </div>
            <div className="grid gap-3">
              {event.highlights.map((highlight) => (
                <div key={highlight} className="flex gap-3 text-sm leading-7 text-brand-ink">
                  <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-[2rem] border border-brand-line bg-brand-paper p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Metadados do evento
            </p>
            <dl className="mt-5 grid gap-5">
              <div>
                <dt className="text-sm font-semibold text-brand-ink">Cobertura</dt>
                <dd className="mt-1 text-sm leading-7 text-brand-muted">
                  {event.coverage}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-brand-ink">Formato</dt>
                <dd className="mt-1 text-sm leading-7 text-brand-muted">
                  {event.format}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-brand-ink">Status</dt>
                <dd className="mt-1 text-sm leading-7 text-brand-muted">{event.status}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[2rem] border border-brand-line bg-white p-7 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Documentos e atendimento
            </p>
            {event.documents.map((document) => (
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
        </aside>
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
            Lotes do evento
          </p>
          <h2 className="font-display text-5xl leading-none text-brand-ink">
            Cada lote tem página própria, galeria, contexto e um CTA claro.
          </h2>
        </div>
        <div className="grid gap-5">
          {eventLots.map((lot) => (
            <article
              key={lot.slug}
              className="grid gap-5 overflow-hidden rounded-[2rem] border border-brand-line bg-white p-4 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)] md:grid-cols-[260px_minmax(0,1fr)]"
            >
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <div className="relative aspect-[4/3]">
                  <Image
                    alt={lot.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 260px"
                    src={lot.media[0]}
                  />
                </div>
              </div>
              <div className="grid gap-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-brass">
                    <span>{lot.category}</span>
                    <span className="text-brand-muted">{lot.lotCode}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold text-brand-ink">{lot.title}</h3>
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
          ))}
        </div>
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
            Dúvidas frequentes
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
