import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import { listAdminUsers } from "@/backend/features/admin/server/repository";

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function loadUsersPage(filters: {
  query: string;
  from: string;
  to: string;
}) {
  return loadAdminPageData(
    () => listAdminUsers(filters),
    "Não foi possível carregar os usuários cadastrados.",
  );
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const filters = {
    query: readSearchParam(params, "q"),
    from: readSearchParam(params, "from"),
    to: readSearchParam(params, "to"),
  };
  const result = await loadUsersPage(filters);

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const users = result.data;

  return (
    <>
      <section className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_28px_70px_-44px_rgba(26,36,48,0.28)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Usuários
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-brand-ink">
          Contas criadas na plataforma
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
          Lista operacional com cadastro, contato e volume de interesses e pré-lances por usuário.
        </p>
      </section>

      <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
        <form action="/admin/usuarios" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-2 xl:col-span-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="user-search">
              Buscar usuário
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.query}
              id="user-search"
              name="q"
              placeholder="Nome, CPF, WhatsApp, e-mail ou alias"
              type="text"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="user-from">
              Criado de
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.from}
              id="user-from"
              name="from"
              type="date"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-brand-ink" htmlFor="user-to">
              Criado até
            </label>
            <input
              className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
              defaultValue={filters.to}
              id="user-to"
              name="to"
              type="date"
            />
          </div>

          <div className="flex items-end xl:col-span-4">
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/92 md:w-auto"
              type="submit"
            >
              Filtrar usuários
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Contas no resultado
          </p>
          <p className="mt-3 text-3xl font-semibold text-brand-ink">{users.length}</p>
        </article>
        <article className="rounded-[24px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Interesses
          </p>
          <p className="mt-3 text-3xl font-semibold text-brand-ink">
            {users.reduce((total, user) => total + user.interestsCount, 0)}
          </p>
        </article>
        <article className="rounded-[24px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Pré-lances
          </p>
          <p className="mt-3 text-3xl font-semibold text-brand-ink">
            {users.reduce((total, user) => total + user.preBidsCount, 0)}
          </p>
        </article>
      </section>

      <section className="grid gap-4">
        {users.length ? (
          users.map((user) => (
            <article
              key={user.id}
              className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]"
            >
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                <span>{user.publicAlias}</span>
                <span>{user.statusLabel}</span>
                <span>{user.createdAtLabel}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-brand-ink">{user.name}</h2>
              <div className="mt-4 grid gap-3 text-sm text-brand-muted md:grid-cols-2 xl:grid-cols-4">
                <p>
                  CPF: <strong className="text-brand-ink">{user.cpf}</strong>
                </p>
                <p>
                  WhatsApp: <strong className="text-brand-ink">{user.phone}</strong>
                </p>
                <p>
                  E-mail: <strong className="text-brand-ink">{user.email}</strong>
                </p>
                <p>
                  Cidade: <strong className="text-brand-ink">{user.city ?? "Não informada"}</strong>
                </p>
                <p>
                  Interesses: <strong className="text-brand-ink">{user.interestsCount}</strong>
                </p>
                <p>
                  Pré-lances: <strong className="text-brand-ink">{user.preBidsCount}</strong>
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-brand-line bg-white px-5 py-6 text-sm leading-7 text-brand-muted">
            Nenhum usuário encontrado para os filtros atuais.
          </div>
        )}
      </section>
    </>
  );
}
