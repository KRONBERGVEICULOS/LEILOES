"use client";

import Link from "next/link";

type ErrorStateProps = {
  description: string;
  onRetry?: () => void;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
};

export function ErrorState({
  description,
  onRetry,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: ErrorStateProps) {
  return (
    <section className="grid min-h-[70svh] place-items-center px-5 py-16">
      <div className="max-w-2xl space-y-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-brass">
          Estado de erro
        </p>
        <h1 className="font-display text-5xl leading-none text-brand-ink sm:text-6xl">
          {title}
        </h1>
        <p className="text-lg leading-8 text-brand-muted">{description}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {onRetry ? (
            <button
              className="inline-flex items-center justify-center rounded-full bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
              onClick={onRetry}
              type="button"
            >
              Tentar novamente
            </button>
          ) : null}
          {primaryHref && primaryLabel ? (
            <Link
              className="inline-flex items-center justify-center rounded-full bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
              href={primaryHref}
            >
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link
              className="inline-flex items-center justify-center rounded-full border border-brand-line bg-white px-6 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-brass hover:text-brand-brass"
              href={secondaryHref}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
