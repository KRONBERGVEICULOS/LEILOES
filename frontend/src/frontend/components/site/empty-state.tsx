import Link from "next/link";

type EmptyStateProps = {
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
};

export function EmptyState({
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: EmptyStateProps) {
  const isPrimaryExternal = primaryHref.startsWith("http");
  const isSecondaryExternal = secondaryHref?.startsWith("http");

  return (
    <section className="grid min-h-72 place-items-center rounded-xl border border-brand-line bg-white px-6 py-10 text-center">
      <div className="max-w-2xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Nenhum resultado
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
          {title}
        </h2>
        <p className="text-base leading-7 text-brand-muted">{description}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {isPrimaryExternal ? (
            <a
              className="inline-flex items-center justify-center rounded-lg bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/90"
              href={primaryHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              {primaryLabel}
            </a>
          ) : (
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/90"
              href={primaryHref}
            >
              {primaryLabel}
            </Link>
          )}
          {secondaryHref && secondaryLabel ? (
            isSecondaryExternal ? (
              <a
                className="inline-flex items-center justify-center rounded-lg border border-brand-line bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy hover:text-brand-navy"
                href={secondaryHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                {secondaryLabel}
              </a>
            ) : (
              <Link
                className="inline-flex items-center justify-center rounded-lg border border-brand-line bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy hover:text-brand-navy"
                href={secondaryHref}
              >
                {secondaryLabel}
              </Link>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
