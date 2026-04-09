import type { ReactNode } from "react";

import { Container } from "@/components/site/container";
import { cn } from "@/lib/utils";

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
        "border-b border-brand-line/80 bg-brand-paper py-16 sm:py-20",
        className,
      )}
    >
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-end">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-brass">
            {eyebrow}
          </p>
          <h1 className="font-display text-5xl leading-none text-brand-ink sm:text-6xl">
            {title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-brand-muted">
            {description}
          </p>
          {meta?.length ? (
            <ul className="flex flex-wrap gap-3 pt-2 text-sm text-brand-muted">
              {meta.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-brand-line bg-white/70 px-4 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {aside ? <div className="space-y-4">{aside}</div> : null}
      </Container>
    </section>
  );
}
