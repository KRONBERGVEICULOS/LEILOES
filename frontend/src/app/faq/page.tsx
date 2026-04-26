import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/frontend/components/site/breadcrumbs";
import { Container } from "@/frontend/components/site/container";
import { EmptyState } from "@/frontend/components/site/empty-state";
import { FaqList } from "@/frontend/components/site/faq-list";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { PageHero } from "@/frontend/components/site/page-hero";
import { SearchBar } from "@/frontend/components/site/search-bar";
import { StructuredData } from "@/frontend/components/site/structured-data";
import { siteConfig } from "@/shared/config/site";
import { finalCta } from "@/backend/features/content/data/site-content";
import { contentRepository } from "@/backend/features/content/data/repository";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "FAQ",
  path: "/faq",
  description:
    "Perguntas frequentes sobre edital, atendimento, documentação, pagamento e retirada.",
});

type FaqPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const faqCategories: ReadonlyArray<{
  slug: string;
  label: string;
  tags: readonly string[];
}> = [
  {
    slug: "cadastro",
    label: "Cadastro",
    tags: ["cadastro", "habilitacao"],
  },
  {
    slug: "edital-documentos",
    label: "Edital e documentos",
    tags: ["edital", "documentacao", "juridico", "diligencia", "lote"],
  },
  {
    slug: "pagamento-retirada",
    label: "Pagamento e retirada",
    tags: ["comissao", "pagamento", "visitacao", "retirada", "vistoria"],
  },
  {
    slug: "atendimento",
    label: "Atendimento",
    tags: ["atendimento", "contato", "whatsapp", "multiplos-lotes"],
  },
  {
    slug: "institucional",
    label: "Dados institucionais",
    tags: ["institucional", "cnpj", "leiloeiro", "junta-comercial"],
  },
];

const allFaqEntries = contentRepository.listGlobalFaq();

function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function buildFaqHref(query: string, category: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category) {
    params.set("categoria", category);
  }

  return params.size ? `/faq?${params.toString()}` : "/faq";
}

export default async function FaqPage({ searchParams }: FaqPageProps) {
  const params = await searchParams;
  const query = readParam(params.q);
  const category = readParam(params.categoria);
  const activeCategory = faqCategories.find((item) => item.slug === category) ?? null;
  const normalizedQuery = normalize(query);

  const filteredFaqEntries = allFaqEntries.filter((item) => {
    const matchesCategory = activeCategory
      ? item.tags.some((tag) => activeCategory.tags.includes(tag))
      : true;
    const matchesQuery = normalizedQuery
      ? normalize(`${item.question} ${item.answer}`).includes(normalizedQuery)
      : true;

    return matchesCategory && matchesQuery;
  });

  const filteredFaqItems = filteredFaqEntries.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allFaqEntries.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />

      <section className="border-b border-brand-line/80 bg-brand-paper">
        <Container className="py-6">
          <Breadcrumbs
            items={[
              { label: "Início", href: "/" },
              { label: "FAQ" },
            ]}
          />
        </Container>
      </section>

      <PageHero
        aside={
          <div className="rounded-xl border border-brand-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Atendimento oficial
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Quando a resposta depender de edital, disponibilidade, visitação,
              retirada ou documentação da praça, o canal oficial continua sendo o próximo passo.
            </p>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              {siteConfig.whatsappDisplay} • {siteConfig.businessHours}
            </p>
            <InterestActions
              className="mt-5"
              primaryHref={finalCta.primaryHref}
              primaryLabel="Falar com a equipe"
              secondaryHref="/como-participar"
              secondaryLabel="Como participar"
            />
          </div>
        }
        description="A FAQ reúne respostas práticas sobre edital, cadastro, visitação, pagamento, retirada e atendimento."
        eyebrow="FAQ"
        meta={["Cadastro", "Edital", "Pagamento", "Dados institucionais"]}
        title="Perguntas frequentes sobre edital, visitação, pagamento e retirada."
      />

      <Container className="grid gap-8 py-16 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
          <form action="/faq" className="rounded-xl border border-brand-line bg-white p-5">
            {category ? <input name="categoria" type="hidden" value={category} /> : null}
            <SearchBar
              defaultValue={query}
              id="faq-search"
              label="Buscar por pergunta"
              name="q"
              placeholder="Ex.: edital, comissão, retirada ou cadastro"
            />
          </form>

          <div className="rounded-xl border border-brand-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Categorias
            </p>
            <div className="mt-4 grid gap-2">
              <Link
                className={[
                  "rounded-lg border px-4 py-3 text-sm font-semibold transition",
                  !activeCategory
                    ? "border-brand-navy bg-brand-paper text-brand-navy"
                    : "border-brand-line bg-white text-brand-ink hover:border-brand-navy/40",
                ].join(" ")}
                href={buildFaqHref(query, "")}
              >
                Todas as perguntas
              </Link>
              {faqCategories.map((item) => {
                const itemCount = allFaqEntries.filter((faqEntry) =>
                  faqEntry.tags.some((tag) => item.tags.includes(tag)),
                ).length;
                const isActive = item.slug === activeCategory?.slug;

                return (
                  <Link
                    key={item.slug}
                    className={[
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold transition",
                      isActive
                        ? "border-brand-navy bg-brand-paper text-brand-navy"
                        : "border-brand-line bg-white text-brand-ink hover:border-brand-navy/40",
                    ].join(" ")}
                    href={buildFaqHref(query, item.slug)}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted">
                      {itemCount}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-xl border border-brand-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Resultado
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-brand-ink">
                {filteredFaqItems.length} pergunta{filteredFaqItems.length === 1 ? "" : "s"} nesta visão
              </h2>
              <p className="text-sm leading-6 text-brand-muted">
                {activeCategory ? `Categoria: ${activeCategory.label}` : "Todas as categorias"}
              </p>
            </div>
          </div>

          {filteredFaqItems.length ? (
            <FaqList items={filteredFaqItems} />
          ) : (
            <EmptyState
              description="Nenhuma pergunta corresponde à busca atual. Limpe a categoria ou fale com a equipe para confirmar edital, disponibilidade e regras do evento."
              primaryHref="/faq"
              primaryLabel="Limpar filtros"
              secondaryHref={finalCta.primaryHref}
              secondaryLabel="Falar com a equipe"
              title="A busca não encontrou uma resposta correspondente."
            />
          )}
        </div>
      </Container>
    </>
  );
}
