"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { Container } from "@/frontend/components/site/container";
import { LogoutButton } from "@/frontend/components/site/logout-button";
import { createWhatsAppLink, mainNavigation, siteConfig } from "@/shared/config/site";
import type { AuthenticatedUser } from "@/backend/features/platform/types";
import { cn } from "@/shared/lib/utils";

type SiteHeaderProps = {
  currentUser: AuthenticatedUser | null;
};

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ currentUser }: SiteHeaderProps) {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const whatsappHref = createWhatsAppLink(
    `Olá, quero atendimento comercial da ${siteConfig.name} para analisar uma oportunidade.`,
  );

  useEffect(() => {
    mobileMenuRef.current?.removeAttribute("open");
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line/80 bg-brand-paper/92 backdrop-blur-xl">
      <Container className="flex min-h-[84px] items-center justify-between gap-5">
        <Link
          aria-label="Ir para a página inicial da Kron Leilões"
          className="flex min-w-0 items-center gap-3"
          href="/"
        >
          <Image
            alt="Logo Kron Leilões"
            className="h-auto w-[148px] sm:w-[168px]"
            height={48}
            priority
            src="/media/brand/kron-logo.svg"
            width={168}
          />
          <span className="hidden text-xs leading-5 text-brand-muted xl:block">
            Comercial, confiável e com área restrita para acompanhar oportunidades.
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-6 lg:flex">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              aria-current={isActiveLink(pathname, item.href) ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition hover:text-brand-navy",
                isActiveLink(pathname, item.href)
                  ? "text-brand-navy"
                  : "text-brand-ink",
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className={cn(
              "text-sm font-medium transition hover:text-brand-navy",
              isActiveLink(pathname, "/area")
                ? "text-brand-navy"
                : "text-brand-ink",
            )}
            href={currentUser ? "/area" : "/entrar"}
          >
            {currentUser ? "Minha área" : "Entrar"}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {currentUser ? (
            <>
              <div className="rounded-full border border-brand-line bg-white px-4 py-2 text-right">
                <p className="text-sm font-semibold text-brand-ink">{currentUser.name}</p>
                <p className="text-xs text-brand-muted">{currentUser.publicAlias}</p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy"
                href="/area"
              >
                Minha área
              </Link>
              <LogoutButton
                className="inline-flex items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-navy hover:text-brand-navy"
                label="Sair"
              />
            </>
          ) : (
            <>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-navy hover:text-brand-navy"
                href="/entrar"
              >
                Entrar
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-[0_18px_38px_-26px_rgba(24,50,79,0.36)] transition hover:bg-brand-paper"
                href="/cadastro"
              >
                Criar cadastro
              </Link>
            </>
          )}
          <a
            className="inline-flex items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/92"
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            WhatsApp
          </a>
        </div>

        <details ref={mobileMenuRef} className="relative lg:hidden">
          <summary
            aria-controls="mobile-navigation"
            aria-label="Abrir menu principal"
            className="flex cursor-pointer list-none items-center rounded-full border border-brand-line bg-white px-4 py-3 text-sm font-semibold text-brand-ink [&::-webkit-details-marker]:hidden"
          >
            Menu
          </summary>
          <div
            className="absolute right-0 top-[calc(100%+12px)] z-10 w-[min(92vw,340px)] rounded-[26px] border border-brand-line bg-white p-4 shadow-[0_14px_32px_-26px_rgba(16,59,102,0.28)]"
            id="mobile-navigation"
          >
            <div className="rounded-[22px] bg-brand-paper p-4">
              {currentUser ? (
                <>
                  <p className="text-sm font-semibold text-brand-ink">{currentUser.name}</p>
                  <p className="text-xs text-brand-muted">{currentUser.publicAlias}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-brand-ink">
                    Área restrita para pré-lance online
                  </p>
                  <p className="text-xs text-brand-muted">
                    Cadastro simples para acompanhar lotes e interações.
                  </p>
                </>
              )}
            </div>

            <nav className="mt-4 grid gap-1">
              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  aria-current={isActiveLink(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActiveLink(pathname, item.href)
                      ? "bg-brand-paper text-brand-navy"
                      : "text-brand-ink hover:bg-brand-paper hover:text-brand-navy",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActiveLink(pathname, "/area") || isActiveLink(pathname, "/entrar")
                    ? "bg-brand-paper text-brand-navy"
                    : "text-brand-ink hover:bg-brand-paper hover:text-brand-navy",
                )}
                href={currentUser ? "/area" : "/entrar"}
              >
                {currentUser ? "Minha área" : "Entrar"}
              </Link>
            </nav>

            {!currentUser ? (
              <Link
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-[0_18px_38px_-26px_rgba(24,50,79,0.36)]"
                href="/cadastro"
              >
                Criar cadastro
              </Link>
            ) : (
              <div className="mt-4">
                <LogoutButton
                  className="inline-flex w-full items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-ink"
                  label="Sair"
                />
              </div>
            )}

            <a
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-brass px-4 py-3 text-sm font-semibold text-white"
              href={whatsappHref}
              rel="noopener noreferrer"
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
