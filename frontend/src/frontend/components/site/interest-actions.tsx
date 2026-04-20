import Link from "next/link";

import { cn } from "@/shared/lib/utils";

type InterestActionsProps = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

export function InterestActions({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: InterestActionsProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      {isExternalHref(primaryHref) ? (
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
        isExternalHref(secondaryHref) ? (
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
  );
}
