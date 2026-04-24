import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import {
  getAdminReferenceData,
  listAdminLots,
  listAdminPreBids,
} from "@/backend/features/admin/server/repository";
type AdminPreBidsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function loadPreBidsPage(filters: {
  lotSlug: string;
  status: string;
  from: string;
  to: string;
}) {
  return loadAdminPageData(
    async () => {
      const [lots, preBids] = await Promise.all([
        listAdminLots({ sort: "updated" }),
        listAdminPreBids(filters),
      ]);

      return {
        referenceData: getAdminReferenceData(),
        lots,
        preBids,
      };
    },
    "Não foi possível carregar os pré-lances.",
  );
}

export default async function AdminPreBidsPage({
  searchParams,
}: AdminPreBidsPageProps) {
  const params = await searchParams;
  const filters = {
    lotSlug: readSearchParam(params, "lotSlug"),
    status: readSearchParam(params, "status"),
    from: readSearchParam(params, "from"),
    to: readSearchParam(params, "to"),
  };
  const result = await loadPreBidsPage(filters);

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const { lots, preBids, referenceData } = result.data;

  return (
    <>
      <section className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_28px_70px_-44px_rgba(26,36,48,0.28)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Pré-lances
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-brand-ink">
          Pré-lances com dados completos para operação
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
          Veja lote, valor, data e dados de contato do usuário para acompanhamento comercial.
        </p>
      </section>

      <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
        <form action="/admin/pre-lances" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="prebid-lot">
              Lote
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.lotSlug}
              id="prebid-lot"
              name="lotSlug"
            >
              <option value="">Todos</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.slug}>
                  {lot.lotCode} • {lot.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="prebid-status">
              Status
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.status}
              id="prebid-status"
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
            <label className="text-sm font-semibold text-brand-ink" htmlFor="prebid-from">
              De
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.from}
              id="prebid-from"
              name="from"
              type="date"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="prebid-to">
              Até
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.to}
              id="prebid-to"
              name="to"
              type="date"
            />
          </div>

          <div className="flex items-end">
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/92"
              type="submit"
            >
              Filtrar
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Resultado
          </p>
          <p className="mt-3 text-3xl font-semibold text-brand-ink">{preBids.length}</p>
        </article>
        <article className="rounded-[24px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)] md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Leitura operacional
          </p>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Cada registro traz dados completos apenas no admin. A vitrine pública segue usando nome mascarado.
          </p>
        </article>
      </section>

      <section className="grid gap-4">
        {preBids.length ? (
          preBids.map((item) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]"
            >
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                <span>{item.lotCode}</span>
                <span>{item.statusLabel}</span>
                <span>{item.createdAtLabel}</span>
                <span>{item.lotPreBidCount} lance(s) no lote</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-brand-ink">{item.lotTitle}</h2>
              <div className="mt-4 grid gap-3 text-sm text-brand-muted md:grid-cols-2 xl:grid-cols-4">
                <p>
                  Pré-lance: <strong className="text-brand-ink">{item.amountLabel}</strong>
                </p>
                <p>
                  Participante: <strong className="text-brand-ink">{item.userAlias}</strong>
                </p>
                <p>
                  Nome: <strong className="text-brand-ink">{item.userName}</strong>
                </p>
                <p>
                  CPF: <strong className="text-brand-ink">{item.userCpf}</strong>
                </p>
                <p>
                  WhatsApp: <strong className="text-brand-ink">{item.userPhone}</strong>
                </p>
                <p>
                  E-mail: <strong className="text-brand-ink">{item.userEmail}</strong>
                </p>
              </div>
              {item.note ? (
                <p className="mt-4 rounded-2xl border border-brand-line bg-brand-paper px-4 py-3 text-sm leading-7 text-brand-muted">
                  Observação: {item.note}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-brand-line bg-white px-5 py-6 text-sm leading-7 text-brand-muted">
            Nenhum pré-lance encontrado para os filtros atuais.
          </div>
        )}
      </section>
    </>
  );
}
