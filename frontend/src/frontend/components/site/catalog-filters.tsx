import Link from "next/link";

import { SearchBar } from "@/frontend/components/site/search-bar";
import { cn } from "@/shared/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

type FilterSelect = {
  label: string;
  name: string;
  options: FilterOption[];
  value: string;
};

type CatalogFiltersProps = {
  action: string;
  className?: string;
  query: string;
  resultCount: number;
  searchLabel: string;
  searchPlaceholder: string;
  selects?: FilterSelect[];
  totalCount: number;
};

export function CatalogFilters({
  action,
  className,
  query,
  resultCount,
  searchLabel,
  searchPlaceholder,
  selects = [],
  totalCount,
}: CatalogFiltersProps) {
  const searchId = `search-${action.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "catalogo"}`;
  const hasActiveFilters = Boolean(
    query || selects.some((select) => Boolean(select.value)),
  );
  const activeFilters = [
    ...(query ? [`Busca: ${query}`] : []),
    ...selects
      .filter((select) => Boolean(select.value))
      .map((select) => `${select.label}: ${select.value}`),
  ];
  const layoutClass =
    selects.length >= 3
      ? "lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))]"
      : selects.length === 2
        ? "lg:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(240px,0.7fr))]"
        : selects.length === 1
          ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.7fr)]"
          : "lg:grid-cols-1";

  return (
    <section
      className={cn(
        "min-w-0 rounded-xl border border-brand-line bg-white p-5",
        className,
      )}
    >
      <form
        action={action}
        aria-label="Filtrar catálogo"
        className="grid gap-5"
        role="search"
      >
        <div className={cn("grid gap-5", layoutClass)}>
          <SearchBar
            defaultValue={query}
            id={searchId}
            label={searchLabel}
            name="q"
            placeholder={searchPlaceholder}
          />

          {selects.map((select) => (
            <div key={select.name} className="grid gap-3">
              <label
                className="text-sm font-semibold text-brand-ink"
                htmlFor={select.name}
              >
                {select.label}
              </label>
              <select
                className="min-h-12 rounded-lg border border-brand-line bg-white px-4 text-sm text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={select.value}
                id={select.name}
                name={select.name}
              >
                <option value="">Todos</option>
                {select.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="grid gap-4 border-t border-brand-line pt-4">
          {activeFilters.length ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filterLabel) => (
                <span
                  key={filterLabel}
                  className="rounded-md border border-brand-line bg-brand-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted"
                >
                  {filterLabel}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite">
              {resultCount === totalCount
                ? `${totalCount} itens disponíveis nesta visão.`
                : `${resultCount} de ${totalCount} itens exibidos com os filtros atuais.`}
            </p>
            {hasActiveFilters ? (
              <Link
                className="inline-flex items-center justify-center rounded-lg border border-brand-line px-4 py-2 font-semibold text-brand-navy transition hover:border-brand-navy hover:text-brand-navy"
                href={action}
              >
                Limpar filtros
              </Link>
            ) : null}
          </div>
        </div>
      </form>
    </section>
  );
}
