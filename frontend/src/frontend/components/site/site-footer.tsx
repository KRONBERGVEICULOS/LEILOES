import Image from "next/image";
import Link from "next/link";

import { Container } from "@/frontend/components/site/container";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { getOperationalValue, hasOperationalValue } from "@/shared/lib/institutional";
import { legalNavigation, mainNavigation, siteConfig } from "@/shared/config/site";

export function SiteFooter() {
  const hasAuctioneerData =
    hasOperationalValue(siteConfig.auctioneerName) &&
    hasOperationalValue(siteConfig.auctioneerRegistration) &&
    hasOperationalValue(siteConfig.auctioneerBoard);

  return (
    <footer className="border-t border-brand-line bg-brand-navy-deep text-white">
      <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.78fr)_minmax(0,1.07fr)]">
        <div className="space-y-5">
          <Image
            alt="Logo Kron Leilões"
            className="h-auto w-[182px]"
            height={52}
            src="/media/brand/kron-logo-light.svg"
            width={182}
          />
          <p className="max-w-xl text-3xl font-semibold leading-tight">
            Plataforma pública para analisar oportunidades com mais contexto e menos improviso.
          </p>
          <p className="max-w-2xl text-sm leading-7 text-white/74">
            Catálogo público, área restrita, pré-lance rastreável e canais oficiais
            organizados em uma experiência que deixa explícito o que acontece na
            plataforma e o que depende de validação operacional.
          </p>

          <InterestActions
            primaryHref="/cadastro"
            primaryLabel="Criar cadastro"
            secondaryHref="/como-participar"
            secondaryLabel="Entender o processo"
          />

          <p className="rounded-[24px] border border-white/12 bg-white/6 p-4 text-sm leading-7 text-white/72">
            {siteConfig.footerDisclaimer}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Plataforma
          </p>
          <ul className="mt-4 grid gap-3 text-sm text-white/74">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="transition hover:text-white" href="/cadastro">
                Criar cadastro
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-white" href="/entrar">
                Entrar
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-white" href="/area">
                Minha área
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Base institucional
          </p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/74">
            <li>Razão social: {siteConfig.legalName}</li>
            <li>
              CNPJ:{" "}
              {getOperationalValue(
                siteConfig.taxId,
                "Publicação institucional pendente com o dado cadastral definitivo.",
              )}
            </li>
            <li>Telefone: {siteConfig.phoneDisplay}</li>
            <li>E-mail: {siteConfig.email}</li>
            <li>Horário: {siteConfig.businessHours}</li>
            <li>Praças: {siteConfig.serviceRegions.join(" • ")}</li>
            <li>
              Leiloeiro responsável:{" "}
              {hasAuctioneerData
                ? `${siteConfig.auctioneerName} • ${siteConfig.auctioneerRegistration} • ${siteConfig.auctioneerBoard}`
                : "Publicação regulatória pendente com nome, matrícula e Junta Comercial."}
            </li>
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
