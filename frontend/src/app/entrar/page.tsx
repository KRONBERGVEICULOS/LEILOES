import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Container } from "@/frontend/components/site/container";
import { LoginForm } from "@/frontend/components/site/login-form";
import { createPageMetadata } from "@/shared/lib/metadata";
import { normalizeInternalRedirect } from "@/backend/features/platform/lib/redirect";
import { getCurrentUser } from "@/backend/features/platform/server/auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Entrar",
  path: "/entrar",
  description:
    "Acesse a área restrita da Kron Leilões para acompanhar oportunidades e registrar pré-lances online.",
});

function readRedirect(searchParams: Record<string, string | string[] | undefined>) {
  return normalizeInternalRedirect(searchParams.redirect, "/area", {
    allowedPrefixes: ["/area", "/eventos", "/lotes"],
  });
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/area");
  }

  const redirectTo = readRedirect(await searchParams);

  return (
    <section className="border-b border-brand-line/80 bg-brand-paper">
      <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,0.94fr)_minmax(420px,1.06fr)] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Área restrita Kron Leilões
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
            Entre para acompanhar seus lotes e registrar seu pré-lance com contexto.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-brand-muted">
            O acesso libera histórico recente da plataforma, registro de interesse,
            maior pré-lance válido do lote e um caminho mais organizado até o atendimento humano.
          </p>
          <div className="overflow-hidden rounded-[30px] border border-brand-line bg-brand-navy shadow-[0_30px_90px_-54px_rgba(13,32,52,0.58)]">
            <Image
              alt="Banner institucional Kron Leilões"
              className="h-auto w-full"
              height={760}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              src="/media/brand/kron-banner.svg"
              width={1600}
            />
          </div>
        </div>

        <div className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_30px_90px_-58px_rgba(26,36,48,0.48)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Entrar
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-ink">
            Use seu cadastro para seguir com segurança.
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            O site continua comercial e simples. O login existe para restringir o
            acompanhamento e o pré-lance a usuários autenticados.
          </p>
          <div className="mt-8">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </Container>
    </section>
  );
}
