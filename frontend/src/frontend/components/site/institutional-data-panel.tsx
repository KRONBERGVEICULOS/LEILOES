import type { ReactNode } from "react";

import { siteConfig } from "@/shared/config/site";
import { getOperationalValue, hasOperationalValue } from "@/shared/lib/institutional";

type InstitutionalDataPanelProps = {
  className?: string;
  description?: string;
  eyebrow?: string;
  title?: string;
};

type InstitutionalItem = {
  label: string;
  value: ReactNode;
  pending?: boolean;
  note?: string;
};

function PendingBadge() {
  return (
    <span className="inline-flex rounded-full border border-brand-line bg-brand-paper px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">
      Pendente
    </span>
  );
}

export function InstitutionalDataPanel({
  className,
  description = "Dados públicos de identificação, contato e responsabilidade institucional da operação.",
  eyebrow = "Base institucional",
  title = "Dados institucionais e regulatórios",
}: InstitutionalDataPanelProps) {
  const hasTaxId = hasOperationalValue(siteConfig.taxId);
  const hasAuctioneerName = hasOperationalValue(siteConfig.auctioneerName);
  const hasAuctioneerRegistry =
    hasOperationalValue(siteConfig.auctioneerRegistration) &&
    hasOperationalValue(siteConfig.auctioneerBoard);

  const items: InstitutionalItem[] = [
    { label: "Nome fantasia", value: siteConfig.name },
    { label: "Razão social", value: siteConfig.legalName },
    {
      label: "CNPJ",
      value: getOperationalValue(
        siteConfig.taxId,
        "Publicação pendente com o CNPJ real da operação.",
      ),
      pending: !hasTaxId,
      note: !hasTaxId
        ? "Inserir o dado cadastral definitivo antes da validação pública final."
        : undefined,
    },
    { label: "Endereço", value: siteConfig.address.join(", ") },
    { label: "Telefone", value: siteConfig.phoneDisplay },
    { label: "E-mail", value: siteConfig.email },
    { label: "Horário de atendimento", value: siteConfig.businessHours },
    {
      label: "Leiloeiro responsável",
      value: getOperationalValue(
        siteConfig.auctioneerName,
        "Publicação pendente com o nome do leiloeiro responsável.",
      ),
      pending: !hasAuctioneerName,
    },
    {
      label: "Matrícula / Junta Comercial",
      value: hasAuctioneerRegistry
        ? `${siteConfig.auctioneerRegistration} • ${siteConfig.auctioneerBoard}`
        : "Publicação pendente com matrícula e Junta Comercial competentes.",
      pending: !hasAuctioneerRegistry,
    },
  ];

  return (
    <section
      className={[
        "rounded-xl border border-brand-line bg-white p-6",
        className ?? "",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-brand-ink">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
        {description}
      </p>

      <dl className="mt-6 grid gap-0 md:grid-cols-2 md:gap-x-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-t border-brand-line py-4 first:border-t-0 first:pt-0 md:even:pl-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-sm font-semibold text-brand-ink">{item.label}</dt>
              {item.pending ? <PendingBadge /> : null}
            </div>
            <dd className="mt-1 text-sm leading-6 text-brand-muted">{item.value}</dd>
            {item.note ? (
              <p className="mt-2 text-xs leading-5 text-brand-muted">{item.note}</p>
            ) : null}
          </div>
        ))}
      </dl>

      <p className="mt-6 rounded-xl border border-brand-line bg-brand-paper p-4 text-sm leading-7 text-brand-muted">
        {siteConfig.registrationNote}
      </p>
    </section>
  );
}
