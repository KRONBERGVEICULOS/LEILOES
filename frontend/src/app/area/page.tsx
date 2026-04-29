import type { Metadata } from "next";
import Link from "next/link";

import { ActivityFeed } from "@/frontend/components/site/activity-feed";
import { Container } from "@/frontend/components/site/container";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { createWhatsAppLink } from "@/shared/config/site";
import { requireAuthenticatedUser } from "@/backend/features/platform/server/auth";
import { getUserDashboard } from "@/backend/features/platform/server/repository";
import { createPageMetadata } from "@/shared/lib/metadata";
import { formatDateTimeBR } from "@/shared/lib/utils";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Minha área",
    path: "/area",
    description:
      "Área restrita da Kron Leilões para acompanhar interesses, pré-lances e atividade recente.",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/area");
  const dashboard = await getUserDashboard(user.id);

  return (
    <section className="border-b border-brand-line/80 bg-brand-paper">
      <Container className="grid gap-12 py-14">
        <div className="grid gap-6 rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_30px_90px_-58px_rgba(26,36,48,0.36)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Minha área
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
              {dashboard.user.name}, seus lotes acompanhados estão aqui.
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
              Você está logado como {dashboard.user.publicAlias}. Use esta área
              para revisar interesses, pré-lances e seguir com a equipe com mais contexto.
            </p>
          </div>

          <InterestActions
            primaryHref={createWhatsAppLink(
              `Olá, sou ${dashboard.user.name} (${dashboard.user.publicAlias}) e quero seguir com a equipe a partir da minha área.`,
            )}
            primaryLabel="Falar com especialista"
            secondaryHref="/oportunidades"
            secondaryLabel="Ver oportunidades"
          />
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Meus interesses
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-brand-ink">
              Lotes salvos para acompanhamento.
            </h2>
            <div className="mt-6 grid gap-4">
              {dashboard.interests.length ? (
                dashboard.interests.map((interest) => (
                  <article
                    key={interest.id}
                    className="rounded-[24px] border border-brand-line bg-brand-paper px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                      <span>{interest.lotCode}</span>
                      <span>•</span>
                      <span>{interest.location}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-brand-ink">
                      {interest.lotTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">
                      Referência publicada: {interest.referenceValueLabel}
                    </p>
                    <p className="text-sm leading-6 text-brand-muted">
                      Maior pré-lance válido: {interest.visibleValueLabel}
                    </p>
                    <p className="mt-2 text-xs text-brand-muted">
                      Acompanhando desde {formatDateTimeBR(interest.createdAt)}
                    </p>
                    <Link
                      className="mt-4 inline-flex text-sm font-semibold text-brand-navy"
                      href={`/lotes/${interest.lotSlug}`}
                    >
                      Abrir lote
                    </Link>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-brand-line bg-brand-paper px-4 py-5 text-sm leading-7 text-brand-muted">
                  Você ainda não salvou nenhum lote. Abra uma oportunidade e clique em
                  “Acompanhar lote” para começar.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Meus pré-lances
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-brand-ink">
              Manifestações online já registradas.
            </h2>
            <div className="mt-6 grid gap-4">
              {dashboard.preBids.length ? (
                dashboard.preBids.map((preBid) => (
                  <article
                    key={preBid.id}
                    className="rounded-[24px] border border-brand-line bg-brand-paper px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                      <span>{preBid.lotCode}</span>
                      <span>•</span>
                      <span>{preBid.location}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-brand-ink">
                      {preBid.lotTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">
                      Seu pré-lance: {preBid.amountLabel}
                    </p>
                    <p className="text-sm leading-6 text-brand-muted">
                      Maior pré-lance válido do lote: {preBid.currentValueLabel}
                    </p>
                    <p className="mt-2 text-xs text-brand-muted">
                      Registrado em {formatDateTimeBR(preBid.createdAt)}
                    </p>
                    <Link
                      className="mt-4 inline-flex text-sm font-semibold text-brand-navy"
                      href={`/lotes/${preBid.lotSlug}`}
                    >
                      Voltar ao lote
                    </Link>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-brand-line bg-brand-paper px-4 py-5 text-sm leading-7 text-brand-muted">
                  Nenhum pré-lance foi registrado ainda. Quando fizer sentido, use a
                  área autenticada do lote para enviar sua manifestação.
                </div>
              )}
            </div>
          </div>
        </section>

        {dashboard.activity.length ? (
          <ActivityFeed
            description="Este feed reúne a atividade relacionada à sua conta e às oportunidades que você acompanha."
            items={dashboard.activity}
            title="Resumo recente da sua movimentação."
          />
        ) : null}
      </Container>
    </section>
  );
}
