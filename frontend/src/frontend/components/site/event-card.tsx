import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/frontend/components/site/status-badge";
import type { AuctionEvent } from "@/backend/features/auctions/types";

type EventCardProps = {
  event: AuctionEvent;
  imagePriority?: boolean;
  lotCount?: number;
  mirrored?: boolean;
};

export function EventCard({
  event,
  imagePriority = false,
  lotCount,
  mirrored = false,
}: EventCardProps) {
  const primaryDocument = event.documents[0];

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-brand-line bg-white">
      <div className="grid gap-0 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className={mirrored ? "order-1 lg:order-2" : "order-1"}>
          <div className="relative h-full min-h-[260px] border-b border-brand-line lg:border-b-0 lg:border-r">
            <Image
              alt={event.image.alt}
              className="object-cover"
              fill
              loading={imagePriority ? "eager" : undefined}
              sizes="(max-width: 1024px) 100vw, 340px"
              src={event.image.src}
            />
          </div>
        </div>
        <div className="order-2 grid gap-5 p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="ink">{event.status}</StatusBadge>
            <StatusBadge tone="muted">{event.format}</StatusBadge>
            {lotCount ? <StatusBadge tone="muted">{`${lotCount} lotes`}</StatusBadge> : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              {event.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-brand-ink">
              {event.title}
            </h2>
            <p className="text-base leading-7 text-brand-muted">{event.summary}</p>
          </div>

          <dl className="grid gap-4 rounded-xl border border-brand-line bg-brand-paper p-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                Praças
              </dt>
              <dd className="mt-1 text-sm leading-6 text-brand-ink">{event.coverage}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                Cronograma
              </dt>
              <dd className="mt-1 text-sm leading-6 text-brand-ink">{event.schedule}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">
                Documento base
              </dt>
              <dd className="mt-1 text-sm leading-6 text-brand-ink">
                {primaryDocument
                  ? `${primaryDocument.kind} • ${primaryDocument.statusLabel}`
                  : "Confirmar com a equipe"}
              </dd>
            </div>
          </dl>

          <ul className="grid gap-2 text-sm leading-6 text-brand-ink">
            {event.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/92"
              href={`/eventos/${event.slug}`}
            >
              Ver evento
            </Link>
            {primaryDocument?.ctaHref ? (
              <a
                className="inline-flex items-center justify-center rounded-lg border border-brand-line bg-white px-4 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy hover:text-brand-navy"
                href={primaryDocument.ctaHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                {primaryDocument.ctaLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
