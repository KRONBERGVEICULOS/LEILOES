import Link from "next/link";

import { Container } from "@/components/site/container";
import { legalNavigation, mainNavigation, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-line bg-brand-paper">
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-brass">
              Kron Leilões
            </p>
            <h2 className="mt-3 font-display text-4xl leading-none text-brand-ink">
              Estrutura digital para catálogo, contexto e confiança.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-brand-muted">
            {siteConfig.description} {siteConfig.footerDisclaimer}
          </p>
          <div className="space-y-1 text-sm leading-7 text-brand-muted">
            {siteConfig.address.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>{siteConfig.whatsappDisplay}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-ink">
            Navegação
          </p>
          <ul className="mt-5 grid gap-3 text-sm text-brand-muted">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-brand-ink" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-ink">
            Jurídico
          </p>
          <ul className="mt-5 grid gap-3 text-sm text-brand-muted">
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-brand-ink" href={item.href}>
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
