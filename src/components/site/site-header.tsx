import Link from "next/link";

import { Container } from "@/components/site/container";
import { createWhatsAppLink, mainNavigation, siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-ink/90 text-white backdrop-blur-xl">
      <Container className="flex min-h-20 items-center justify-between gap-6">
        <Link className="group flex items-center gap-3" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 text-xs font-semibold uppercase tracking-[0.28em] text-brand-sand">
            KL
          </span>
          <span className="block">
            <strong className="block font-display text-2xl font-semibold leading-none">
              Kron
            </strong>
            <span className="block text-[0.68rem] uppercase tracking-[0.34em] text-white/60">
              Leilões
            </span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-7 lg:flex">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              className="text-sm font-medium text-white/72 transition hover:text-white"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <span className="text-sm text-white/60">{siteConfig.whatsappDisplay}</span>
          <a
            className="inline-flex items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-brand-ink transition hover:bg-brand-sand"
            href={createWhatsAppLink(
              "Olá, quero falar com a equipe da Kron Leilões.",
            )}
            rel="noreferrer"
            target="_blank"
          >
            Solicitar atendimento
          </a>
        </div>

        <details className="relative lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+12px)] w-[min(86vw,320px)] rounded-[1.75rem] border border-white/10 bg-brand-ink p-4 shadow-2xl">
            <nav className="grid gap-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/6 hover:text-white"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <a
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-brand-ink"
              href={createWhatsAppLink(
                "Olá, quero falar com a equipe da Kron Leilões.",
              )}
              rel="noreferrer"
              target="_blank"
            >
              Falar no WhatsApp
            </a>
          </div>
        </details>
      </Container>
    </header>
  );
}
