import Link from "next/link";

import { cn } from "@/lib/utils";

type InterestActionsProps = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function InterestActions({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: InterestActionsProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <a
        className="inline-flex items-center justify-center rounded-full bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
        href={primaryHref}
        rel="noreferrer"
        target="_blank"
      >
        {primaryLabel}
      </a>
      {secondaryHref && secondaryLabel ? (
        <Link
          className="inline-flex items-center justify-center rounded-full border border-brand-line bg-white px-6 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-brass hover:text-brand-brass"
          href={secondaryHref}
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
