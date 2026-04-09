import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/site/container";
import { InterestActions } from "@/components/site/interest-actions";
import { PageHero } from "@/components/site/page-hero";
import { StructuredData } from "@/components/site/structured-data";
import { auctionEvents } from "@/features/auctions/data/catalog";
import { finalCta, trustPillars } from "@/features/content/data/site-content";

export const metadata: Metadata = {
  title: "Leilões e eventos",
  description:
    "Veja as frentes editoriais e eventos organizados para apresentação institucional de lotes, documentação e atendimento assistido.",
};

export default function EventsPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Leilões e eventos",
          description:
            "Página institucional com as frentes de catálogo e seus respectivos lotes.",
        }}
      />
      <PageHero
        aside={
          <div className="rounded-[2rem] border border-brand-line bg-white p-6 shadow-[0_22px_80px_-55px_rgba(16,24,39,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Critério editorial
            </p>
            <p className="mt-4 text-base leading-8 text-brand-muted">
              Cada evento desta página representa uma frente de navegação e atendimento,
              não um contador artificial de disputa. O objetivo é qualificar leitura,
              comparação e contato.
            </p>
          </div>
        }
        description="Esta camada reorganiza o catálogo em coleções com contexto, escopo, documentação sob solicitação e CTA compatível com a operação atual."
        eyebrow="Leilões e eventos"
        meta={trustPillars.map((pillar) => pillar.title)}
        title="Uma página de eventos pensada para orientar decisão, não para empilhar cards."
      />

      <Container className="grid gap-8 py-16 sm:py-20">
        {auctionEvents.map((event, index) => (
          <article
            key={event.slug}
            className="grid gap-6 overflow-hidden rounded-[2.3rem] border border-brand-line bg-white shadow-[0_22px_90px_-60px_rgba(16,24,39,0.45)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
          >
            <div className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}>
              <div className="relative h-full min-h-[340px]">
                <Image
                  alt={event.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  src={event.image}
                />
              </div>
            </div>
            <div className="order-2 grid gap-6 p-8 lg:p-10">
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-brass">
                <span>{event.eyebrow}</span>
                <span className="text-brand-muted">{event.status}</span>
              </div>
              <div>
                <h2 className="font-display text-5xl leading-none text-brand-ink">
                  {event.title}
                </h2>
                <p className="mt-5 text-base leading-8 text-brand-muted">
                  {event.summary}
                </p>
              </div>
              <div className="grid gap-4 rounded-[1.8rem] border border-brand-line bg-brand-paper p-6 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-brass">
                    Cobertura
                  </p>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">
                    {event.coverage}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-brass">
                    Formato
                  </p>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">
                    {event.format}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-brass">
                    Observação
                  </p>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">
                    {event.note}
                  </p>
                </div>
              </div>
              <ul className="grid gap-3 text-sm leading-7 text-brand-ink">
                {event.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
                  href={`/eventos/${event.slug}`}
                >
                  Abrir evento
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

        <section className="rounded-[2.4rem] bg-brand-ink px-8 py-10 text-white sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-sand">
            Próximo passo
          </p>
          <h2 className="mt-4 font-display text-5xl leading-none">
            Escolha a frente que faz mais sentido para sua diligência.
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">
            A estrutura de eventos foi desenhada para suportar crescimento futuro com
            dados dinâmicos, filtros, agenda operacional e documentação versionada sem
            precisar refazer a base do frontend.
          </p>
          <InterestActions
            className="mt-8"
            primaryHref={finalCta.primaryHref}
            primaryLabel="Falar com a equipe"
            secondaryHref="/como-participar"
            secondaryLabel="Entender o processo"
          />
        </section>
      </Container>
    </>
  );
}
