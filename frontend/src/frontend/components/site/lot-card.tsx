import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/frontend/components/site/status-badge";
import { createLotWhatsAppLink } from "@/shared/config/site";
import type { Lot } from "@/backend/features/auctions/types";

type LotCardProps = {
  lot: Lot;
};

export function LotCard({ lot }: LotCardProps) {
  const coverImage = lot.media[0];
  const whatsappHref = createLotWhatsAppLink({
    title: lot.title,
    lotCode: lot.lotCode,
    location: lot.location,
  });

  return (
    <article className="group min-w-0 overflow-hidden rounded-[28px] border border-brand-line bg-white shadow-[0_24px_60px_-42px_rgba(26,36,48,0.3)] transition hover:-translate-y-1 hover:shadow-[0_34px_80px_-42px_rgba(26,36,48,0.42)]">
      <div className="relative">
        <div className="relative min-h-[280px] aspect-[5/4] sm:aspect-[4/3]">
          <Image
            alt={coverImage.alt}
            className="object-cover transition duration-700 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            src={coverImage.src}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/88 via-brand-navy/24 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between gap-6 p-4 sm:p-5">
            <div className="flex max-w-full flex-wrap gap-2 pr-2">
              <StatusBadge tone="ink">{lot.status}</StatusBadge>
              <StatusBadge
                className="border-white/30 bg-white/12 text-white"
                tone="muted"
              >
                {lot.onlineStatusLabel}
              </StatusBadge>
            </div>
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                {lot.lotCode} • {lot.category} • {lot.location}
              </p>
              <h3 className="mt-2 text-2xl font-semibold leading-tight sm:text-[1.9rem]">
                {lot.title}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5">
        <div className="space-y-4">
          <div className="grid gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-brass">
                Referência online
              </p>
              <p className="mt-2 text-3xl font-semibold text-brand-ink">
                {lot.pricing.referenceValueLabel}
              </p>
              <p className="mt-1 text-xs leading-5 text-brand-muted">
                {lot.pricing.supportLabel}
              </p>
            </div>
            <span className="inline-flex w-fit max-w-full rounded-full bg-brand-paper px-3 py-2 text-left text-xs font-semibold uppercase leading-4 tracking-[0.12em] text-brand-navy">
              {lot.onlineTeaserLabel}
            </span>
          </div>

          <p className="text-sm leading-7 text-brand-muted">
            {lot.overview}
          </p>

          <ul className="grid gap-2 text-sm text-brand-muted sm:grid-cols-2">
            <li className="rounded-2xl border border-brand-line bg-brand-paper px-3 py-3">
              {lot.year}
            </li>
            <li className="rounded-2xl border border-brand-line bg-brand-paper px-3 py-3">
              {lot.mileage}
            </li>
            <li className="rounded-2xl border border-brand-line bg-brand-paper px-3 py-3">
              {lot.fuel}
            </li>
            <li className="rounded-2xl border border-brand-line bg-brand-paper px-3 py-3">
              {lot.location}
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/92"
            href={`/lotes/${lot.slug}`}
          >
            Ver lote
          </Link>
          <a
            className="inline-flex flex-1 items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy hover:text-brand-navy"
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            Falar com atendimento
          </a>
        </div>
      </div>
    </article>
  );
}
