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

type OpportunitiesPageContentProps = {
  routePath: "/eventos" | "/oportunidades";
  searchParams: Record<string, string | string[] | undefined>;
};

export async function OpportunitiesPageContent({
  routePath,
  searchParams,
}: OpportunitiesPageContentProps) {
  const filters = normalizeLotCatalogFilters(searchParams);
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
          url: absoluteUrl(routePath),
          description:
            "Catálogo de oportunidades para consulta, comparação e solicitação de atendimento.",
          numberOfItems: filteredLots.length,
        }}
      />

      <PageHero
        aside={
          <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Catálogo de oportunidades
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Procure por nome, código ou cidade. Quando encontrar o lote certo,
              abra o detalhe para ver referência online, atividade recente e os
              próximos passos de acompanhamento ou atendimento.
            </p>
            <InterestActions
              className="mt-5"
              primaryHref="/cadastro"
              primaryLabel="Criar cadastro"
              secondaryHref="/como-participar"
              secondaryLabel="Entender o processo"
            />
          </div>
        }
        description="Compare lotes publicados, confira referências de valor e avance para cadastro ou atendimento quando uma oportunidade fizer sentido."
        eyebrow="Oportunidades"
        meta={["Lotes", "Referência online", "Área do comprador", "Atendimento oficial"]}
        title="Escolha uma oportunidade e avance com clareza."
      />

      <Container className="grid gap-8 py-16">
        <CatalogFilters
          action={routePath}
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
            description="A busca atual não encontrou nenhuma oportunidade. Limpe os filtros ou ajuste a consulta para continuar sua análise."
            primaryHref={routePath}
            primaryLabel="Limpar busca"
            secondaryHref="/como-participar"
            secondaryLabel="Entender o processo"
            title="Nenhuma oportunidade corresponde aos filtros atuais."
          />
        )}

        <section className="rounded-[32px] border border-brand-line bg-white px-6 py-8 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Próximo passo
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            Quando uma oportunidade fizer sentido, avance com cadastro ou atendimento.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-brand-muted">
            O cadastro libera acompanhamento e pré-lance online. O atendimento
            oficial confirma edital, documentação, pagamento, comissão e retirada
            antes de qualquer decisão.
          </p>
          <InterestActions
            className="mt-8"
            primaryHref="/cadastro"
            primaryLabel="Criar cadastro"
            secondaryHref="/como-participar"
            secondaryLabel="Entender o processo"
          />
        </section>
      </Container>
    </>
  );
}
