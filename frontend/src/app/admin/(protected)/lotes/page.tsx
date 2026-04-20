import Link from "next/link";

import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import {
  duplicateAdminLotAction,
  toggleAdminLotFeaturedAction,
  toggleAdminLotVisibilityAction,
} from "@/backend/features/admin/actions/lots";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import {
  getAdminReferenceData,
  listAdminLots,
} from "@/backend/features/admin/server/repository";
import { formatDateTimeBR } from "@/shared/lib/utils";

type AdminLotsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getFlashMessage(saved: string) {
  switch (saved) {
    case "created":
      return "Lote criado com sucesso.";
    case "updated":
      return "Lote atualizado com sucesso.";
    case "duplicated":
      return "Lote duplicado com sucesso.";
    case "hidden":
      return "Lote ocultado da vitrine pública.";
    case "shown":
      return "Lote reexibido na vitrine pública.";
    case "featured":
      return "Lote marcado como destaque.";
    case "unfeatured":
      return "Lote removido dos destaques.";
    default:
      return "";
  }
}

async function loadLotsPage(filters: {
  query: string;
  status: string;
  visibility: string;
  sort: string;
}) {
  return loadAdminPageData(
    async () => ({
      referenceData: getAdminReferenceData(),
      lots: await listAdminLots(filters),
    }),
    "Não foi possível carregar a listagem de lotes.",
  );
}

export default async function AdminLotsPage({
  searchParams,
}: AdminLotsPageProps) {
  const params = await searchParams;
  const filters = {
    query: readSearchParam(params, "q"),
    status: readSearchParam(params, "status"),
    visibility: readSearchParam(params, "visibility"),
    sort: readSearchParam(params, "sort") || "updated",
  };
  const flashMessage = getFlashMessage(readSearchParam(params, "saved"));
  const result = await loadLotsPage(filters);

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const { lots, referenceData } = result.data;

  return (
    <>
      <section className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_28px_70px_-44px_rgba(26,36,48,0.28)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Gestão de lotes
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-brand-ink">
              Cadastre, edite e controle a vitrine
            </h1>
            <p className="max-w-3xl text-base leading-8 text-brand-muted">
              O admin agora opera lotes no banco real do projeto, com status, preço,
              destaque, visibilidade e preview público.
            </p>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/92"
            href="/admin/lotes/novo"
          >
            Novo lote
          </Link>
        </div>
      </section>

      {flashMessage ? (
        <p className="rounded-2xl border border-brand-success/20 bg-brand-success/8 px-4 py-3 text-sm text-brand-success">
          {flashMessage}
        </p>
      ) : null}

      <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
        <form action="/admin/lotes" className="grid gap-4 md:grid-cols-4 xl:grid-cols-5">
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-search">
              Buscar lote
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.query}
              id="lot-search"
              name="q"
              placeholder="Título, código, slug ou cidade"
              type="text"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-status-filter">
              Status
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.status}
              id="lot-status-filter"
              name="status"
            >
              <option value="">Todos</option>
              {referenceData.statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-visibility-filter">
              Visibilidade
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.visibility}
              id="lot-visibility-filter"
              name="visibility"
            >
              <option value="">Todos</option>
              <option value="visible">Visíveis</option>
              <option value="hidden">Ocultos</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-sort">
              Ordenar por
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.sort}
              id="lot-sort"
              name="sort"
            >
              <option value="updated">Atualização</option>
              <option value="created">Criação</option>
              <option value="title">Título</option>
              <option value="status">Status</option>
              <option value="reference">Preço de referência</option>
            </select>
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        {lots.length ? (
          lots.map((lot) => (
            <article
              key={lot.id}
              className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                    <span>{lot.lotCode}</span>
                    <span>{lot.statusLabel}</span>
                    <span>{lot.isVisible ? "Visível" : "Oculto"}</span>
                    {lot.isFeatured ? <span>Destaque</span> : null}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-brand-ink">{lot.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-brand-muted">
                      {lot.location} • slug: <code>{lot.slug}</code>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm text-brand-muted">
                    <p>
                      Referência: <strong className="text-brand-ink">{lot.referenceValueLabel}</strong>
                    </p>
                    <p>
                      Atual: <strong className="text-brand-ink">{lot.currentValueLabel}</strong>
                    </p>
                    <p>
                      Atualizado em: <strong className="text-brand-ink">
                        {lot.updatedAt ? formatDateTimeBR(lot.updatedAt) : "Sem registro"}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                  <Link
                    className="inline-flex items-center justify-center rounded-full bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/92"
                    href={`/admin/lotes/${lot.id}/editar`}
                  >
                    Editar
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy"
                    href={`/lotes/${lot.slug}`}
                  >
                    Preview
                  </Link>

                  <form action={duplicateAdminLotAction}>
                    <input name="id" type="hidden" value={lot.id} />
                    <input name="returnTo" type="hidden" value="/admin/lotes" />
                    <button
                      className="inline-flex w-full items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-navy hover:text-brand-navy"
                      type="submit"
                    >
                      Duplicar lote
                    </button>
                  </form>

                  <form action={toggleAdminLotFeaturedAction}>
                    <input name="id" type="hidden" value={lot.id} />
                    <input name="mode" type="hidden" value={lot.isFeatured ? "unfeature" : "feature"} />
                    <input name="returnTo" type="hidden" value="/admin/lotes" />
                    <button
                      className="inline-flex w-full items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-navy hover:text-brand-navy"
                      type="submit"
                    >
                      {lot.isFeatured ? "Remover destaque" : "Destacar lote"}
                    </button>
                  </form>

                  <form action={toggleAdminLotVisibilityAction} className="sm:col-span-2">
                    <input name="id" type="hidden" value={lot.id} />
                    <input name="mode" type="hidden" value={lot.isVisible ? "hide" : "show"} />
                    <input name="returnTo" type="hidden" value="/admin/lotes" />
                    <button
                      className="inline-flex w-full items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-navy hover:text-brand-navy"
                      type="submit"
                    >
                      {lot.isVisible ? "Ocultar lote" : "Reexibir lote"}
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-brand-line bg-white px-5 py-6 text-sm leading-7 text-brand-muted">
            Nenhum lote corresponde aos filtros atuais.
          </div>
        )}
      </section>
    </>
  );
}
