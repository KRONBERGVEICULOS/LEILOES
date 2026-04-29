import Link from "next/link";

import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import {
  getAdminDashboardSummary,
  type AdminDashboardData,
  type AdminDashboardPeriod,
  type AdminDashboardRecentItem,
} from "@/backend/features/admin/server/repository";
import { cn } from "@/shared/lib/utils";

type AdminDashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const periodOptions: Array<{ value: AdminDashboardPeriod; label: string }> = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
];

const activityTabs = [
  { value: "all", label: "Todas" },
  { value: "lead", label: "Leads" },
  { value: "pre-bid", label: "Pré-lances" },
  { value: "user", label: "Usuários" },
  { value: "lot", label: "Lotes" },
  { value: "system", label: "Sistema" },
] as const;

const quickActions = [
  { href: "/admin/lotes/novo", label: "Novo lote", helper: "Cadastrar oportunidade" },
  { href: "/eventos", label: "Ver eventos públicos", helper: "Abrir vitrine" },
  { href: "/admin/pre-lances", label: "Pré-lances", helper: "Revisar ofertas" },
  { href: "/admin/usuarios", label: "Usuários", helper: "Consultar cadastros" },
  { href: "/admin/leads", label: "Leads", helper: "Atendimento comercial" },
  { href: "/admin/lotes", label: "Lotes", helper: "Editar vitrine" },
] as const;

const metricToneClasses = {
  orange: "from-orange-500/18 to-orange-500/4 text-orange-200 ring-orange-300/20",
  blue: "from-sky-500/18 to-sky-500/4 text-sky-200 ring-sky-300/20",
  purple: "from-violet-500/18 to-violet-500/4 text-violet-200 ring-violet-300/20",
  green: "from-emerald-500/18 to-emerald-500/4 text-emerald-200 ring-emerald-300/20",
} as const;

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalizePeriod(value: string): AdminDashboardPeriod {
  if (value === "today" || value === "week" || value === "month" || value === "year") {
    return value;
  }

  return "month";
}

function normalizeActivityTab(value: string) {
  return activityTabs.some((tab) => tab.value === value) ? value : "all";
}

function buildDashboardHref(input: {
  period: AdminDashboardPeriod;
  activity: string;
}) {
  const params = new URLSearchParams();

  if (input.period !== "month") {
    params.set("period", input.period);
  }

  if (input.activity !== "all") {
    params.set("activity", input.activity);
  }

  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

async function loadDashboardPage(period: AdminDashboardPeriod) {
  return loadAdminPageData(
    () => getAdminDashboardSummary(period),
    "Não foi possível carregar o dashboard administrativo.",
  );
}

function getMetrics(dashboard: AdminDashboardData) {
  return [
    {
      label: "Lotes ativos",
      value: String(dashboard.activeLots),
      helper:
        dashboard.activeLots > 0
          ? `${dashboard.featuredLots} em destaque na vitrine`
          : "Nenhum lote ativo agora",
      tone: "orange" as const,
      icon: "LA",
    },
    {
      label: "Pré-lances",
      value: String(dashboard.totalPreBids),
      helper:
        dashboard.totalPreBids > 0
          ? "Registros enviados por usuários"
          : "Sem pré-lances registrados",
      tone: "purple" as const,
      icon: "PL",
    },
    {
      label: "Usuários",
      value: String(dashboard.totalUsers),
      helper:
        dashboard.totalUsers > 0
          ? `${dashboard.totalInterests} interesse(s) vinculados`
          : "Sem contas cadastradas",
      tone: "blue" as const,
      icon: "US",
    },
    {
      label: "Leads",
      value: String(dashboard.totalLeads),
      helper:
        dashboard.totalLeads > 0
          ? "Contatos capturados pelo site"
          : "Nenhum lead recebido",
      tone: "green" as const,
      icon: "LD",
    },
    {
      label: "Valor em referência",
      value: dashboard.referenceValueLabel,
      helper:
        dashboard.referenceValueCents > 0
          ? "Soma dos lotes ativos"
          : "Sem valor ativo no período",
      tone: "orange" as const,
      icon: "R$",
    },
  ];
}

function ActivityChart({ dashboard }: { dashboard: AdminDashboardData }) {
  const maxTotal = Math.max(
    1,
    ...dashboard.activitySeries.map((point) => point.total),
  );
  const hasActivity = dashboard.activitySeries.some((point) => point.total > 0);

  return (
    <div className="relative mt-7 h-[300px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0c101b] px-4 pb-10 pt-5 sm:px-6">
      <div className="pointer-events-none absolute inset-x-5 top-8 bottom-14 grid grid-rows-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="border-t border-dashed border-white/[0.08]" />
        ))}
      </div>

      {hasActivity ? (
        <div className="relative z-10 flex h-full items-end gap-1.5 sm:gap-2">
          {dashboard.activitySeries.map((point) => {
            const height = point.total ? Math.max(10, (point.total / maxTotal) * 100) : 0;

            return (
              <div key={point.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-[220px] w-full items-end justify-center">
                  <div
                    className="w-full max-w-7 rounded-t-xl bg-gradient-to-t from-violet-600 via-sky-500 to-orange-300 shadow-[0_18px_40px_-28px_rgba(139,92,246,0.9)] transition"
                    style={{ height: `${height}%` }}
                    title={`${point.total} movimento(s)`}
                  />
                </div>
                <span className="truncate text-[10px] font-semibold text-slate-500">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative z-10 grid h-full place-items-center">
          <div className="max-w-sm text-center">
            <p className="text-base font-semibold text-slate-200">
              Sem atividade registrada neste período.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Leads, pré-lances, usuários e lotes aparecerão aqui assim que houver movimentação.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getActivityTypeLabel(type: AdminDashboardRecentItem["type"]) {
  switch (type) {
    case "lead":
      return "Lead";
    case "pre-bid":
      return "Pré-lance";
    case "user":
      return "Usuário";
    case "lot":
      return "Lote";
    case "interest":
      return "Interesse";
    default:
      return "Sistema";
  }
}

function filterActivity(items: AdminDashboardRecentItem[], activeTab: string) {
  if (activeTab === "all") {
    return items;
  }

  if (activeTab === "system") {
    return items.filter((item) => item.type === "system" || item.type === "interest");
  }

  return items.filter((item) => item.type === activeTab);
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const params = await searchParams;
  const period = normalizePeriod(readSearchParam(params, "period"));
  const activeActivityTab = normalizeActivityTab(readSearchParam(params, "activity"));
  const result = await loadDashboardPage(period);

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const dashboard = result.data;
  const metrics = getMetrics(dashboard);
  const visibleActivity = filterActivity(dashboard.recentMovements, activeActivityTab);
  const totalActivity = dashboard.activitySeries.reduce(
    (total, point) => total + point.total,
    0,
  );

  return (
    <>
      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)] backdrop-blur sm:p-6 xl:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              Resumo operacional
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Painel central da operação Kron
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
              Acompanhe lotes ativos, pré-lances, leads, usuários e movimentos recentes
              da plataforma em uma visão executiva e acionável.
            </p>
          </div>
          <div className="grid min-w-[220px] gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Movimento no período
            </p>
            <p className="text-3xl font-semibold text-white">{totalActivity}</p>
            <p className="text-sm text-slate-500">{dashboard.periodLabel}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[26px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {metric.label}
              </p>
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-[11px] font-bold ring-1",
                  metricToneClasses[metric.tone],
                )}
              >
                {metric.icon}
              </span>
            </div>
            <p className="mt-5 break-words text-3xl font-semibold leading-tight text-white">
              {metric.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{metric.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-[30px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)] sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
                Movimento da plataforma
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Atividade dos últimos dias
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Leads, pré-lances, novos usuários e lotes criados no recorte selecionado.
              </p>
            </div>
            <div className="flex w-full rounded-2xl border border-white/10 bg-[#0b0f19] p-1 md:w-auto">
              {periodOptions.map((option) => (
                <Link
                  key={option.value}
                  aria-current={period === option.value ? "page" : undefined}
                  className={cn(
                    "flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition md:flex-none",
                    period === option.value
                      ? "bg-violet-600 text-white"
                      : "text-slate-500 hover:bg-white/[0.06] hover:text-white",
                  )}
                  href={buildDashboardHref({
                    period: option.value,
                    activity: activeActivityTab,
                  })}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <ActivityChart dashboard={dashboard} />
        </article>

        <aside className="grid gap-5">
          <section className="rounded-[30px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
              Ações rápidas
            </p>
            <div className="mt-5 grid gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-orange-300/30 hover:bg-white/[0.07]"
                  href={action.href}
                >
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold text-white">
                    {action.label}
                    <span className="text-slate-500 transition group-hover:text-orange-200">
                      →
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">{action.helper}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
              Lotes em movimento
            </p>
            <div className="mt-5 grid gap-3">
              {dashboard.topMovingLots.length ? (
                dashboard.topMovingLots.map((lot) => (
                  <Link
                    key={lot.slug}
                    className="rounded-2xl border border-white/10 bg-[#0c101b] px-4 py-3 transition hover:border-violet-300/30"
                    href={`/admin/pre-lances?lotSlug=${encodeURIComponent(lot.slug)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {lot.lotCode}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {lot.title}
                        </p>
                      </div>
                      <span className="rounded-full bg-violet-500/12 px-2 py-1 text-xs font-semibold text-violet-200">
                        {lot.score}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {lot.preBidsCount} pré-lance(s), {lot.interestsCount} interesse(s)
                    </p>
                    {lot.topAmountLabel ? (
                      <p className="mt-1 text-xs font-semibold text-slate-300">
                        Maior valor: {lot.topAmountLabel}
                      </p>
                    ) : null}
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c101b] px-4 py-4 text-sm leading-6 text-slate-500">
                  Nenhum lote com pré-lances registrado até agora.
                </div>
              )}
            </div>
          </section>
        </aside>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)] sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
              Central de atividade
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Últimos movimentos</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Eventos reais de leads, pré-lances, usuários, lotes e sistema.
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#0b0f19] p-1">
            {activityTabs.map((tab) => (
              <Link
                key={tab.value}
                aria-current={activeActivityTab === tab.value ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition",
                  activeActivityTab === tab.value
                    ? "bg-violet-600 text-white"
                    : "text-slate-500 hover:bg-white/[0.06] hover:text-white",
                )}
                href={buildDashboardHref({
                  period,
                  activity: tab.value,
                })}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {visibleActivity.length ? (
            visibleActivity.map((item) => {
              const content = (
                <article className="rounded-2xl border border-white/10 bg-[#0c101b] px-4 py-4 transition hover:border-white/20">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <span className="rounded-full bg-white/[0.06] px-2 py-1 text-slate-300">
                      {getActivityTypeLabel(item.type)}
                    </span>
                    <span>{item.createdAtLabel}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                </article>
              );

              return item.href ? (
                <Link key={item.id} href={item.href}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c101b] px-5 py-6 text-sm leading-7 text-slate-500">
              Nenhum movimento encontrado para esta aba.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
