import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { AdminManualActivityForm } from "@/frontend/components/admin/admin-manual-activity-form";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import {
  getAdminReferenceData,
  listAdminActivity,
  listAdminLots,
} from "@/backend/features/admin/server/repository";
import { formatDateTimeBR } from "@/shared/lib/utils";

type AdminActivityPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function loadActivityPage(filters: {
  lotSlug: string;
  status: string;
  type: string;
  audience: string;
  from: string;
  to: string;
}) {
  return loadAdminPageData(
    async () => {
      const [lots, activity] = await Promise.all([
        listAdminLots({ sort: "updated" }),
        listAdminActivity(filters),
      ]);

      return {
        referenceData: getAdminReferenceData(),
        lots,
        activity,
      };
    },
    "Não foi possível carregar o feed administrativo.",
  );
}

export default async function AdminActivityPage({
  searchParams,
}: AdminActivityPageProps) {
  const params = await searchParams;
  const filters = {
    lotSlug: readSearchParam(params, "lotSlug"),
    status: readSearchParam(params, "status"),
    type: readSearchParam(params, "type"),
    audience: readSearchParam(params, "audience"),
    from: readSearchParam(params, "from"),
    to: readSearchParam(params, "to"),
  };
  const result = await loadActivityPage(filters);

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const { activity, lots, referenceData } = result.data;

  return (
    <>
      <section className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_28px_70px_-44px_rgba(26,36,48,0.28)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Atividade
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-brand-ink">
          Feed real da operação e do sistema
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
          Veja eventos de cadastro, interesse, pré-lance, atualização de lote e registre
          observações manuais quando fizer sentido operacional.
        </p>
      </section>

      <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Registrar atividade manual
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-brand-ink">
          Complementar o histórico quando necessário
        </h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          Nada de atividade fake automática. Este bloco serve só para registrar eventos
          operacionais reais que fazem sentido para a equipe.
        </p>
        <div className="mt-6">
          <AdminManualActivityForm
            lots={lots.map((lot) => ({
              id: lot.id,
              label: `${lot.lotCode} • ${lot.title}`,
            }))}
            successMessage={readSearchParam(params, "saved") === "activity"
              ? "Atividade manual registrada com sucesso."
              : undefined}
          />
        </div>
      </section>

      <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
        <form action="/admin/atividade" className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="grid gap-2 xl:col-span-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="activity-lot">
              Lote
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.lotSlug}
              id="activity-lot"
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
            <label className="text-sm font-semibold text-brand-ink" htmlFor="activity-status">
              Status do lote
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.status}
              id="activity-status"
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
            <label className="text-sm font-semibold text-brand-ink" htmlFor="activity-type">
              Tipo
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.type}
              id="activity-type"
              name="type"
              placeholder="Ex.: prebid_registered"
              type="text"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="activity-audience">
              Visibilidade
            </label>
            <select
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.audience}
              id="activity-audience"
              name="audience"
            >
              <option value="">Todas</option>
              <option value="admin">Admin</option>
              <option value="public">Público</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="activity-from">
              De
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.from}
              id="activity-from"
              name="from"
              type="date"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="activity-to">
              Até
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.to}
              id="activity-to"
              name="to"
              type="date"
            />
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        {activity.length ? (
          activity.map((item) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]"
            >
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                <span>{formatDateTimeBR(item.createdAt)}</span>
                <span>{item.audience === "public" ? "Público" : "Admin"}</span>
                <span>{item.kind}</span>
                {item.lotCode ? <span>{item.lotCode}</span> : null}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-brand-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-brand-muted">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-brand-muted">
                {item.actorAlias ? (
                  <p>
                    Participante: <strong className="text-brand-ink">{item.actorAlias}</strong>
                  </p>
                ) : null}
                {item.amountLabel ? (
                  <p>
                    Valor: <strong className="text-brand-ink">{item.amountLabel}</strong>
                  </p>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-brand-line bg-white px-5 py-6 text-sm leading-7 text-brand-muted">
            Nenhuma atividade encontrada para os filtros atuais.
          </div>
        )}
      </section>
    </>
  );
}
