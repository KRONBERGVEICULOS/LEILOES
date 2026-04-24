import type { Metadata } from "next";
import Link from "next/link";

import { AdminLoginForm } from "@/frontend/components/admin/admin-login-form";
import { Container } from "@/frontend/components/site/container";
import {
  areAdminCredentialsConfigured,
  getAdminCredentialsIssue,
  redirectAuthenticatedAdmin,
} from "@/backend/features/admin/server/auth";
import { absoluteUrl, siteConfig } from "@/shared/config/site";

type AdminLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readRedirect(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const value = readSearchParam(searchParams, "redirect");
  return value.startsWith("/admin") ? value : "/admin";
}

export const metadata: Metadata = {
  title: "Admin",
  description: "Acesso administrativo da operação Kron Leilões.",
  alternates: {
    canonical: absoluteUrl("/admin/login"),
  },
  openGraph: {
    title: `Admin | ${siteConfig.name}`,
    description: "Acesso administrativo da operação Kron Leilões.",
    url: absoluteUrl("/admin/login"),
    siteName: siteConfig.name,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `Admin | ${siteConfig.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Admin | ${siteConfig.name}`,
    description: "Acesso administrativo da operação Kron Leilões.",
    images: [absoluteUrl("/opengraph-image")],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  await redirectAuthenticatedAdmin("/admin");

  const params = await searchParams;
  const redirectTo = readRedirect(params);
  const loggedOut = readSearchParam(params, "logout") === "1";
  const credentialsConfigured = areAdminCredentialsConfigured();
  const credentialsIssue = getAdminCredentialsIssue() ?? undefined;

  return (
    <section className="min-h-screen bg-brand-paper">
      <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,0.92fr)_460px] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Operação Kron
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
            Painel administrativo simples, direto e pronto para a operação.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-brand-muted">
            Este acesso existe só para tocar a operação básica do site: criar lotes,
            ajustar preços, trocar status, acompanhar interesses e revisar pré-lances
            sem transformar a rotina em um painel corporativo pesado.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Lotes com persistência real",
              "Controle rápido de status",
              "Atividade, interesses e pré-lances",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-brand-line bg-white px-4 py-4 text-sm font-semibold text-brand-ink shadow-[0_20px_52px_-44px_rgba(26,36,48,0.22)]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-brand-line bg-brand-navy p-6 text-white shadow-[0_28px_70px_-44px_rgba(13,32,52,0.72)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-sand">
              Segurança mínima
            </p>
            <p className="mt-3 text-sm leading-7 text-white/76">
              O admin continua simples, mas agora com credenciais fortes vindas do ambiente,
              sessão por cookie e bloqueio básico de tentativas de login. Nada de ACL ou
              múltiplos perfis nesta etapa.
            </p>
            <Link
              className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition hover:bg-brand-paper"
              href="/"
            >
              Voltar para o site
            </Link>
          </div>
        </div>

        <div className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_30px_90px_-58px_rgba(26,36,48,0.38)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Login administrativo
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-ink">
            Entre para administrar a operação.
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Use apenas as credenciais administrativas configuradas para este ambiente.
          </p>
          <div className="mt-8">
            <AdminLoginForm
              credentialsConfigured={credentialsConfigured}
              credentialsIssue={credentialsIssue}
              loggedOut={loggedOut}
              redirectTo={redirectTo}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
