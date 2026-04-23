import type { Metadata } from "next";

import { CatalogFilters } from "@/frontend/components/site/catalog-filters";
import { Container } from "@/frontend/components/site/container";
import { EmptyState } from "@/frontend/components/site/empty-state";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { LotCard } from "@/frontend/components/site/lot-card";
import { PageHero } from "@/frontend/components/site/page-hero";
import { StructuredData } from "@/frontend/components/site/structured-data";
import { absoluteUrl } from "@/shared/config/site";
import { listLots } from "@/backend/features/auctions/server/catalog";
import {
  filterLots,
  getLotCategoryOptions,
  normalizeLotCatalogFilters,
} from "@/backend/features/auctions/lib/catalog-queries";
import { createPageMetadata } from "@/shared/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Oportunidades",
  path: "/eventos",
  description:
    "Catálogo de oportunidades e lotes com referência online, cadastro e suporte especializado.",
  keywords: ["oportunidades", "lotes", "veículos", "cadastro", "pré-lance"],
});

type OpportunitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OpportunitiesPage({
  searchParams,
}: OpportunitiesPageProps) {
  const filters = normalizeLotCatalogFilters(await searchParams);
  const lots = await listLots();
  const filteredLots = filterLots(lots, filters);
  const categoryOptions = getLotCategoryOptions(lots).map((value) => ({
    label: value,
    value,
  }));

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Oportunidades",
          url: absoluteUrl("/eventos"),
          description:
            "Página de oportunidades publicada para consulta, comparação e avanço pela plataforma.",
          numberOfItems: filteredLots.length,
        }}
      />

      <PageHero
        aside={
          <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Navegação simples
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Procure por nome, código ou cidade. Quando encontrar o lote certo,
              abra o detalhe para ver referência online, atividade recente e o
              caminho de cadastro ou contato especializado.
            </p>
            <InterestActions
              className="mt-5"
              primaryHref="/contato"
              primaryLabel="Abrir contato"
            />
          </div>
        }
        description="A vitrine organiza referência online, área restrita e canais de suporte em uma jornada mais clara para comparar oportunidades."
        eyebrow="Oportunidades"
        meta={["Lotes", "Referência online", "Cadastro simples", "Apoio especializado"]}
        title="Escolha uma oportunidade e avance com mais contexto."
      />

      <Container className="grid gap-8 py-16">
        <CatalogFilters
          action="/eventos"
          query={filters.query}
          resultCount={filteredLots.length}
          searchLabel="Buscar por lote, código ou cidade"
          searchPlaceholder="Ex.: Amarok, Lote #1007, Campinas"
          selects={[
            {
              label: "Categoria",
              name: "categoria",
              options: categoryOptions,
              value: filters.category,
            },
          ]}
          totalCount={lots.length}
        />

        {filteredLots.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredLots.map((lot) => (
              <LotCard key={lot.slug} lot={lot} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="A busca atual não encontrou nenhuma oportunidade. Limpe os filtros ou abra contato para receber ajuda."
            primaryHref="/eventos"
            primaryLabel="Limpar busca"
            secondaryHref="/contato"
            secondaryLabel="Abrir contato"
            title="Nenhuma oportunidade corresponde aos filtros atuais."
          />
        )}

        <section className="rounded-[32px] border border-brand-line bg-white px-6 py-8 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Apoio especializado
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            Quer ajuda para comparar lotes ou organizar sua proposta?
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-brand-muted">
            Use o contato para tratar um lote específico ou vários ativos na mesma
            conversa, e aproveite o cadastro quando quiser acompanhar atividade e
            pré-lances na área restrita.
          </p>
          <InterestActions
            className="mt-8"
            primaryHref="/contato"
            primaryLabel="Abrir contato"
            secondaryHref="/contato"
            secondaryLabel="Ver canais"
          />
        </section>
      </Container>
    </>
  );
}
