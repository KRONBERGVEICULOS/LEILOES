import Link from "next/link";

import type { ActivityFeedItem } from "@/backend/features/platform/types";
import { formatDateTimeBR } from "@/shared/lib/utils";

type ActivityFeedProps = {
  items: ActivityFeedItem[];
  title: string;
  description?: string;
};

export function ActivityFeed({
  items,
  title,
  description,
}: ActivityFeedProps) {
  return (
    <section className="grid gap-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Atividade recente
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-base leading-8 text-brand-muted">
            {description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_20px_52px_-44px_rgba(26,36,48,0.3)]"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
              <span>{formatDateTimeBR(item.createdAt)}</span>
              {item.lotCode ? <span>{item.lotCode}</span> : null}
            </div>
            <h3 className="mt-3 text-xl font-semibold text-brand-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-brand-muted">{item.description}</p>
            {item.lotSlug ? (
              <Link
                className="mt-4 inline-flex text-sm font-semibold text-brand-navy"
                href={`/lotes/${item.lotSlug}`}
              >
                Ver oportunidade
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
