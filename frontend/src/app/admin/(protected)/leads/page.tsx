import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import { listAdminContactLeads } from "@/backend/features/admin/server/repository";

type AdminLeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function loadLeadsPage(filters: {
  query: string;
  origin: string;
  from: string;
  to: string;
}) {
  return loadAdminPageData(
    () => listAdminContactLeads(filters),
    "Não foi possível carregar os leads recebidos.",
  );
}

export default async function AdminLeadsPage({
  searchParams,
}: AdminLeadsPageProps) {
  const params = await searchParams;
  const filters = {
    query: readSearchParam(params, "q"),
    origin: readSearchParam(params, "origin"),
    from: readSearchParam(params, "from"),
    to: readSearchParam(params, "to"),
  };
  const result = await loadLeadsPage(filters);

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const leads = result.data;
  const offerLeads = leads.filter((lead) => lead.origin.startsWith("oferta:")).length;
  const serviceLeads = leads.length - offerLeads;

  return (
    <>
      <section className="rounded-[30px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)] backdrop-blur sm:p-6 xl:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
          Leads
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Contatos capturados pelo site
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          Consulte solicitações de atendimento e ofertas enviadas pelo fluxo público sem
          expor esses dados no dashboard resumido.
        </p>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)] sm:p-6">
        <form action="/admin/leads" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="grid gap-2 xl:col-span-2">
            <label className="text-sm font-semibold text-slate-200" htmlFor="lead-search">
              Buscar lead
            </label>
            <input
              className="min-h-12 rounded-2xl border border-white/10 bg-[#0c101b] px-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-orange-300/45"
              defaultValue={filters.query}
              id="lead-search"
              name="q"
              placeholder="Nome, telefone, e-mail ou referência"
              type="text"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-200" htmlFor="lead-origin">
              Origem
            </label>
            <input
              className="min-h-12 rounded-2xl border border-white/10 bg-[#0c101b] px-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-orange-300/45"
              defaultValue={filters.origin}
              id="lead-origin"
              name="origin"
              placeholder="oferta ou atendimento"
              type="text"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-200" htmlFor="lead-from">
              De
            </label>
            <input
              className="min-h-12 rounded-2xl border border-white/10 bg-[#0c101b] px-4 text-slate-100 outline-none transition focus:border-orange-300/45"
              defaultValue={filters.from}
              id="lead-from"
              name="from"
              type="date"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-200" htmlFor="lead-to">
              Até
            </label>
            <input
              className="min-h-12 rounded-2xl border border-white/10 bg-[#0c101b] px-4 text-slate-100 outline-none transition focus:border-orange-300/45"
              defaultValue={filters.to}
              id="lead-to"
              name="to"
              type="date"
            />
          </div>

          <div className="flex items-end xl:col-span-5">
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 md:w-auto"
              type="submit"
            >
              Filtrar leads
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.9)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Leads no resultado
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">{leads.length}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.9)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Ofertas
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">{offerLeads}</p>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.9)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Atendimento
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">{serviceLeads}</p>
        </article>
      </section>

      <section className="grid gap-4">
        {leads.length ? (
          leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-[26px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.9)]"
            >
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                <span>{lead.createdAtLabel}</span>
                <span>{lead.origin}</span>
                {lead.reference ? <span>{lead.reference}</span> : null}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-white">{lead.name}</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-400 md:grid-cols-2 xl:grid-cols-4">
                <p>
                  WhatsApp: <strong className="text-slate-100">{lead.phone}</strong>
                </p>
                <p>
                  E-mail: <strong className="text-slate-100">{lead.email ?? "Não informado"}</strong>
                </p>
                <p>
                  Origem: <strong className="text-slate-100">{lead.origin}</strong>
                </p>
                <p>
                  Referência: <strong className="text-slate-100">{lead.reference ?? "Sem referência"}</strong>
                </p>
              </div>
              {lead.message ? (
                <p className="mt-4 rounded-2xl border border-white/10 bg-[#0c101b] px-4 py-3 text-sm leading-7 text-slate-400">
                  {lead.message}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-[26px] border border-dashed border-white/10 bg-[#111522]/88 px-5 py-6 text-sm leading-7 text-slate-500">
            Nenhum lead encontrado para os filtros atuais.
          </div>
        )}
      </section>
    </>
  );
}
