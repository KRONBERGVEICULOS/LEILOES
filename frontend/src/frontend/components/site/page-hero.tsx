import type { ReactNode } from "react";

import { Container } from "@/frontend/components/site/container";
import { cn } from "@/shared/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string[];
  aside?: ReactNode;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  meta,
  aside,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-b border-brand-line bg-white py-10 sm:py-14",
        className,
      )}
    >
      <Container className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-brand-muted sm:text-lg">
            {description}
          </p>
          {meta?.length ? (
            <ul className="flex flex-wrap gap-2 pt-1 text-sm text-brand-muted">
              {meta.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-brand-line bg-brand-paper px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {aside ? <div className="space-y-4 lg:pl-4">{aside}</div> : null}
      </Container>
    </section>
  );
}
