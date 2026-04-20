import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import {
  getAdminReferenceData,
  listAdminInterests,
  listAdminLots,
} from "@/backend/features/admin/server/repository";
import { formatDateTimeBR } from "@/shared/lib/utils";

type AdminInterestsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function loadInterestsPage(filters: {
  lotSlug: string;
  status: string;
  from: string;
  to: string;
}) {
  return loadAdminPageData(
    async () => {
      const [lots, interests] = await Promise.all([
        listAdminLots({ sort: "updated" }),
        listAdminInterests(filters),
      ]);

      return {
        referenceData: getAdminReferenceData(),
        lots,
        interests,
      };
    },
    "Não foi possível carregar os interesses.",
  );
}

export default async function AdminInterestsPage({
  searchParams,
}: AdminInterestsPageProps) {
  const params = await searchParams;
  const filters = {
    lotSlug: readSearchParam(params, "lotSlug"),
    status: readSearchParam(params, "status"),
    from: readSearchParam(params, "from"),
    to: readSearchParam(params, "to"),
  };
  const result = await loadInterestsPage(filters);

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const { interests, lots, referenceData } = result.data;

  return (
    <>
      <section className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_28px_70px_-44px_rgba(26,36,48,0.28)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Interesses
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-brand-ink">
          Quem marcou interesse em cada lote
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
          Esta listagem mostra lote, status atual, data e um alias controlado do usuário.
        </p>
      </section>

      <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
        <form action="/admin/interesses" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="interest-lot">
              Lote
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.lotSlug}
              id="interest-lot"
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
            <label className="text-sm font-semibold text-brand-ink" htmlFor="interest-status">
              Status
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.status}
              id="interest-status"
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
            <label className="text-sm font-semibold text-brand-ink" htmlFor="interest-from">
              De
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.from}
              id="interest-from"
              name="from"
              type="date"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="interest-to">
              Até
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.to}
              id="interest-to"
              name="to"
              type="date"
            />
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        {interests.length ? (
          interests.map((item) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]"
            >
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                <span>{item.lotCode}</span>
                <span>{item.statusLabel}</span>
                <span>{formatDateTimeBR(item.createdAt)}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-brand-ink">{item.lotTitle}</h2>
              <p className="mt-4 text-sm text-brand-muted">
                Participante: <strong className="text-brand-ink">{item.userAlias}</strong>
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-brand-line bg-white px-5 py-6 text-sm leading-7 text-brand-muted">
            Nenhum interesse encontrado para os filtros atuais.
          </div>
        )}
      </section>
    </>
  );
}
