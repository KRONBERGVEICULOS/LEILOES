import { InterestActions } from "@/frontend/components/site/interest-actions";
import { cn } from "@/shared/lib/utils";

type CtaBoxProps = {
  className?: string;
  description: string;
  eyebrow: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
  tone?: "dark" | "light";
};

export function CtaBox({
  className,
  description,
  eyebrow,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
  tone = "light",
}: CtaBoxProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border px-6 py-8 sm:px-8",
        tone === "dark"
          ? "border-brand-navy bg-brand-navy text-white"
          : "border-brand-line bg-white text-brand-ink",
        className,
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.18em]",
          tone === "dark" ? "text-brand-sand" : "text-brand-brass",
        )}
      >
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      <p
        className={cn(
          "mt-4 max-w-3xl text-base leading-7",
          tone === "dark" ? "text-white/72" : "text-brand-muted",
        )}
      >
        {description}
      </p>
      <InterestActions
        className="mt-8"
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        secondaryHref={secondaryHref}
        secondaryLabel={secondaryLabel}
      />
    </section>
  );
}
