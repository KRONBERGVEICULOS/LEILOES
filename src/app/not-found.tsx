import Link from "next/link";

import { Container } from "@/components/site/container";

export default function NotFound() {
  return (
    <Container className="grid min-h-[70svh] place-items-center py-16">
      <div className="max-w-2xl space-y-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-brass">
          404
        </p>
        <h1 className="font-display text-6xl leading-none text-brand-ink">
          A página procurada não faz parte desta estrutura institucional.
        </h1>
        <p className="text-lg leading-8 text-brand-muted">
          O caminho pode ter sido alterado durante o rebuild do produto. Use os atalhos
          abaixo para voltar ao catálogo principal ou retomar a navegação.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-brand-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
            href="/"
          >
            Voltar ao início
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-brand-line bg-white px-6 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-brass hover:text-brand-brass"
            href="/eventos"
          >
            Ver eventos
          </Link>
        </div>
      </div>
    </Container>
  );
}
