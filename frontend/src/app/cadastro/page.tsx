import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Container } from "@/frontend/components/site/container";
import { SignupForm } from "@/frontend/components/site/signup-form";
import { createPageMetadata } from "@/shared/lib/metadata";
import { normalizeInternalRedirect } from "@/backend/features/platform/lib/redirect";
import { getCurrentUser } from "@/backend/features/platform/server/auth";

type SignupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Cadastro",
  path: "/cadastro",
  description:
    "Crie seu cadastro na Kron Leilões para acompanhar oportunidades, interesses e pré-lances online.",
});

function readRedirect(searchParams: Record<string, string | string[] | undefined>) {
  return normalizeInternalRedirect(searchParams.redirect, "/area", {
    allowedPrefixes: ["/area", "/eventos", "/lotes"],
  });
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/area");
  }

  const redirectTo = readRedirect(await searchParams);

  return (
    <section className="border-b border-brand-line/80 bg-brand-paper">
      <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(460px,1.12fr)] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Cadastro comercial
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
            Crie seu acesso para acompanhar oportunidades sem sair do foco comercial.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-brand-muted">
            O cadastro foi desenhado para ser objetivo: nome, contato, senha e
            consentimento básico. Depois disso, você já entra na área com seus
            interesses e pré-lances organizados.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Acompanhar lotes",
              "Registrar interesse",
              "Pré-lance online com validação humana",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-brand-line bg-white px-4 py-4 text-sm font-semibold text-brand-ink shadow-[0_20px_52px_-44px_rgba(26,36,48,0.24)]"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-[30px] border border-brand-line bg-brand-navy shadow-[0_30px_90px_-54px_rgba(13,32,52,0.58)]">
            <Image
              alt="Marca Kron Leilões"
              className="h-auto w-full"
              height={760}
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              src="/media/brand/kron-banner.svg"
              width={1600}
            />
          </div>
        </div>

        <div className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_30px_90px_-58px_rgba(26,36,48,0.48)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Criar conta
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-ink">
            Cadastro rápido, claro e focado em oportunidade.
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Você pode continuar a negociação no WhatsApp quando quiser, mas agora
            com uma área restrita para centralizar seus movimentos no site.
          </p>
          <div className="mt-8">
            <SignupForm redirectTo={redirectTo} />
          </div>
        </div>
      </Container>
    </section>
  );
}
