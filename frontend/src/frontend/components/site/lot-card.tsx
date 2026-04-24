import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/frontend/components/site/status-badge";
import type { Lot } from "@/backend/features/auctions/types";

type LotCardProps = {
  lot: Lot;
};

function getLotCardSummaryLabel(statusKey: Lot["statusKey"]) {
  switch (statusKey) {
    case "prebid_open":
      return "Pré-lance disponível na área";
    case "available":
    case "featured":
    case "in_review":
      return "Acompanhamento na área";
    case "closed":
      return "Validação operacional necessária";
    case "sold":
      return "Lote concluído";
    default:
      return "Disponibilidade sujeita a atualização";
  }
}

function getLotSecondaryAction(lot: Lot) {
  const signupHref = `/cadastro?redirect=${encodeURIComponent(`/lotes/${lot.slug}`)}`;

  switch (lot.statusKey) {
    case "prebid_open":
      return {
        href: signupHref,
        label: "Cadastrar para pré-lance",
      };
    case "available":
    case "featured":
    case "in_review":
      return {
        href: signupHref,
        label: "Cadastrar para acompanhar",
      };
    default:
      return {
        href: "/como-participar",
        label: "Entender o processo",
      };
  }
}

export function LotCard({ lot }: LotCardProps) {
  const coverImage = lot.media[0];
  const lotMeta = [lot.lotCode, lot.category, lot.location].join(" • ");
  const lotCardSummaryLabel = getLotCardSummaryLabel(lot.statusKey);
  const secondaryAction = getLotSecondaryAction(lot);
  const hasPublicPreBidValue =
    lot.pricing.currentValueCents > lot.pricing.referenceValueCents;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-brand-line bg-white shadow-[0_24px_60px_-42px_rgba(26,36,48,0.3)] transition hover:-translate-y-1 hover:shadow-[0_34px_80px_-42px_rgba(26,36,48,0.42)] focus-within:-translate-y-1 focus-within:shadow-[0_34px_80px_-42px_rgba(26,36,48,0.42)]">
      <div className="relative overflow-hidden border-b border-brand-line/80">
        <div className="relative min-h-[300px] aspect-[5/4] overflow-hidden bg-brand-navy-deep sm:aspect-[4/3]">
          <Image
            alt={coverImage.alt}
            className="object-cover transition duration-700 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            src={coverImage.src}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/92 via-brand-navy/30 to-brand-navy/8" />
          <div className="absolute inset-x-0 top-0 z-20 p-4 sm:p-5">
            <div className="flex max-w-full flex-wrap items-start gap-2">
              <StatusBadge className="text-left" tone="ink">
                {lot.status}
              </StatusBadge>
              <StatusBadge
                className="max-w-[15rem] border-white/30 bg-white/12 text-left text-white backdrop-blur-sm"
                tone="muted"
              >
                {lot.onlineStatusLabel}
              </StatusBadge>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
            <div className="space-y-2 text-white">
              <p className="max-w-[36ch] text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                {lotMeta}
              </p>
              <h3 className="max-w-[24ch] text-2xl font-semibold leading-tight sm:text-[1.9rem]">
                {lot.title}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-rows-[auto_1fr_auto] gap-5 p-5">
        <div className="grid gap-4">
          <div className="grid gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-brass">
                Referência do lote
              </p>
              <p className="mt-2 text-3xl font-semibold text-brand-ink">
                {hasPublicPreBidValue
                  ? lot.pricing.currentValueLabel
                  : lot.pricing.referenceValueLabel}
              </p>
              <p className="mt-1 text-xs leading-5 text-brand-muted">
                {hasPublicPreBidValue
                  ? `Referência: ${lot.pricing.referenceValueLabel}`
                  : lot.pricing.supportLabel}
              </p>
            </div>
            <span className="inline-flex w-fit max-w-full rounded-full bg-brand-paper px-3 py-2 text-left text-xs font-semibold uppercase leading-4 tracking-[0.12em] text-brand-navy">
              {lotCardSummaryLabel}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm leading-7 text-brand-muted">{lot.overview}</p>

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
          <Link
            className="inline-flex flex-1 items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy hover:text-brand-navy"
            href={secondaryAction.href}
          >
            {secondaryAction.label}
          </Link>
        </div>
      </div>
    </article>
  );
}
