import Image from "next/image";
import Link from "next/link";

import { Container } from "@/frontend/components/site/container";
import {
  createWhatsAppLink,
  legalNavigation,
  mainNavigation,
  siteConfig,
} from "@/shared/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-line bg-brand-navy-deep text-white">
      <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.95fr)]">
        <div className="space-y-5">
          <Image
            alt="Logo Kron Leilões"
            className="h-auto w-[182px]"
            height={52}
            src="/media/brand/kron-logo-light.svg"
            width={182}
          />
          <p className="max-w-xl text-3xl font-semibold leading-tight">
            Plataforma digital para acompanhar oportunidades com mais contexto e segurança.
          </p>
          <p className="max-w-2xl text-sm leading-7 text-white/74">
            Catálogo público, cadastro, área restrita e pré-lance online organizados
            em uma experiência mais clara para analisar cada lote com segurança.
            Quando necessário, a equipe segue disponível para orientar o próximo passo.
          </p>
          <a
            className="inline-flex items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/92"
            href={createWhatsAppLink(
              `Olá, quero falar com um especialista da ${siteConfig.name} sobre uma oportunidade.`,
            )}
            rel="noopener noreferrer"
            target="_blank"
          >
            Falar com especialista
          </a>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Navegação
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
            Contato institucional
          </p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/74">
            <li>
              <a
                className="transition hover:text-white"
                href={createWhatsAppLink(
                  `Olá, quero falar com um especialista da ${siteConfig.name}.`,
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                WhatsApp institucional: {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li>
              <a className="transition hover:text-white" href={siteConfig.phoneHref}>
                Telefone: {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="transition hover:text-white" href={siteConfig.emailHref}>
                E-mail: {siteConfig.email}
              </a>
            </li>
            <li>Horário: {siteConfig.businessHours}</li>
            <li>
              Pré-lance online visível somente para usuários cadastrados e logados.
            </li>
            <li>
              Pagamentos: confirmar dados bancários apenas pelos canais oficiais.
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
