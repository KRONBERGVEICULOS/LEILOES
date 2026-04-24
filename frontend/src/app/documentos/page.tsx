import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/frontend/components/site/container";
import { ContentPage } from "@/frontend/components/site/content-page";
import { CtaBox } from "@/frontend/components/site/cta-box";
import { StructuredData } from "@/frontend/components/site/structured-data";
import { absoluteUrl } from "@/shared/config/site";
import { auctionEvents } from "@/backend/features/auctions/data/catalog";
import {
  documentsPage,
  finalCta,
} from "@/backend/features/content/data/site-content";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Documentos",
  path: "/documentos",
  description:
    "Área de documentos da Kron Leilões com orientações sobre edital, fichas e solicitação de documentos por evento ou lote.",
  keywords: ["documentos", "edital", "ficha do lote", "solicitar edital"],
});

export default function DocumentsPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Documentos",
          url: absoluteUrl("/documentos"),
          description:
            "Área do site para orientação sobre editais, fichas e documentos de apoio.",
          numberOfItems: auctionEvents.length,
        }}
      />

      <ContentPage page={documentsPage} />

      <Container className="grid gap-8 border-t border-brand-line/80 py-16 sm:py-20">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Documentos por evento
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            Documentos e orientações por evento.
          </h2>
          <p className="max-w-3xl text-base leading-7 text-brand-muted">
            Cada evento indica o documento base, o status do material e o canal
            correto para solicitar edital, anexos ou orientação complementar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {auctionEvents.map((event) => {
            const primaryDocument = event.documents[0];
            const documentStatus =
              primaryDocument?.statusLabel ?? "Documento a confirmar";

            return (
              <article
                key={event.slug}
                className="rounded-xl border border-brand-line bg-white p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
                    {event.eyebrow}
                  </p>
                  <span className="rounded-md border border-brand-line bg-brand-paper px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">
                    {primaryDocument?.kind ?? "Documento"}
                  </span>
                  <span className="rounded-md border border-brand-line bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">
                    {documentStatus}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-brand-ink">
                  {event.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {primaryDocument?.description ?? event.summary}
                </p>
                <dl className="mt-5 grid gap-4 rounded-xl border border-brand-line bg-brand-paper p-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                      Status
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-brand-ink">{event.status}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                      Cronograma
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-brand-ink">{event.schedule}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                      Lotes vinculados
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-brand-ink">
                      {event.lotSlugs.length} lote{event.lotSlugs.length === 1 ? "" : "s"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 rounded-xl border border-brand-line bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                    Status documental
                  </p>
                  <p className="mt-2 text-sm leading-7 text-brand-muted">
                    {primaryDocument?.statusDescription ??
                      "Solicite a orientação documental pelo canal oficial."}
                  </p>
                </div>
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                    Materiais vinculados
                  </p>
                  <div className="space-y-3">
                    {event.documents.map((document) => (
                      <div
                        key={`${event.slug}-${document.title}`}
                        className="rounded-xl border border-brand-line bg-brand-paper p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-brand-line bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">
                            {document.kind}
                          </span>
                          <span className="rounded-md border border-brand-line bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">
                            {document.statusLabel}
                          </span>
                        </div>
                        <h4 className="mt-3 text-base font-semibold text-brand-ink">
                          {document.title}
                        </h4>
                        <p className="mt-2 text-sm leading-7 text-brand-muted">
                          {document.statusDescription}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {primaryDocument ? (
                    <a
                      className="inline-flex items-center justify-center rounded-lg bg-brand-brass px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/90"
                      href={primaryDocument.ctaHref}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {primaryDocument.ctaLabel}
                    </a>
                  ) : null}
                  <Link
                    className="inline-flex items-center justify-center rounded-lg border border-brand-line px-4 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy hover:text-brand-navy"
                    href={`/eventos/${event.slug}`}
                  >
                    Ver detalhes do evento
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-brand-line bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Acesso aos documentos
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-brand-ink">
              O edital é a referência principal de participação.
            </h3>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Quando o material não estiver disponível para acesso direto, solicite
              a versão aplicável pelo atendimento oficial antes de qualquer decisão.
            </p>
          </article>
          <article className="rounded-xl border border-brand-line bg-brand-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Antes de avançar
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-brand-muted">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                <span>Confira a versão vigente do edital, anexos e fichas aplicáveis ao lote.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                <span>Confirme cronograma, visitação, pagamento, comissão e retirada com a equipe.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                <span>Use o código do lote e a praça informada para receber orientação mais precisa.</span>
              </li>
            </ul>
          </article>
        </div>

        <CtaBox
          description="Se a sua consulta envolver mais de um lote ou se você ainda não souber qual documento pedir, use o canal oficial para receber a orientação correta."
          eyebrow="Atendimento"
          primaryHref={finalCta.primaryHref}
          primaryLabel="Falar com a equipe"
          secondaryHref="/contato"
          secondaryLabel="Ver contato"
          title="Ainda não encontrou o edital ou a ficha correta?"
        />
      </Container>
    </>
  );
}
