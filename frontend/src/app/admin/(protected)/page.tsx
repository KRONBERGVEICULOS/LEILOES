import Link from "next/link";

import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import { getAdminDashboard } from "@/backend/features/admin/server/repository";
import { formatDateTimeBR } from "@/shared/lib/utils";

const quickLinks = [
  { href: "/admin/lotes/novo", label: "Adicionar lote" },
  { href: "/admin/lotes", label: "Editar lotes" },
  { href: "/admin/pre-lances", label: "Ver pré-lances" },
  { href: "/admin/interesses", label: "Ver interesses" },
  { href: "/admin/atividade", label: "Atualizar status e atividade" },
] as const;

async function loadDashboardPage() {
  return loadAdminPageData(
    () => getAdminDashboard(),
    "Não foi possível carregar o dashboard administrativo.",
  );
}

export default async function AdminDashboardPage() {
  const result = await loadDashboardPage();

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const dashboard = result.data;

  return (
    <>
      <section className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_28px_70px_-44px_rgba(26,36,48,0.28)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-brand-ink">
          Visão rápida da operação
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
          Este painel resume o volume de lotes, interesses, pré-lances e atividade recente
          para você operar o site sem fricção.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total de lotes", value: dashboard.totalLots },
          { label: "Lotes ativos", value: dashboard.activeLots },
          { label: "Lotes inativos", value: dashboard.inactiveLots },
          { label: "Interesses", value: dashboard.totalInterests },
          { label: "Pré-lances", value: dashboard.totalPreBids },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
              {item.label}
            </p>
            <p className="mt-4 text-4xl font-semibold text-brand-ink">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Atalhos rápidos
          </p>
          <div className="mt-5 grid gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                className="inline-flex items-center justify-between rounded-2xl border border-brand-line bg-brand-paper px-4 py-4 text-sm font-semibold text-brand-ink transition hover:border-brand-brass hover:text-brand-navy"
                href={item.href}
              >
                {item.label}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Atividade recente
            </p>
            <h2 className="text-2xl font-semibold text-brand-ink">
              Últimos movimentos do sistema
            </h2>
          </div>

          <div className="mt-6 grid gap-4">
            {dashboard.recentActivity.length ? (
              dashboard.recentActivity.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[24px] border border-brand-line bg-brand-paper px-5 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                    <span>{formatDateTimeBR(item.createdAt)}</span>
                    <span>{item.audience === "public" ? "Público" : "Admin"}</span>
                    {item.lotCode ? <span>{item.lotCode}</span> : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-brand-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-brand-muted">{item.description}</p>
                  {item.lotSlug ? (
                    <Link
                      className="mt-4 inline-flex text-sm font-semibold text-brand-navy"
                      href="/admin/lotes"
                    >
                      Ver operação do lote
                    </Link>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-brand-line bg-brand-paper px-5 py-5 text-sm leading-7 text-brand-muted">
                Ainda não há atividade recente registrada para mostrar no painel.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
