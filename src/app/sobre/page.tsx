import type { Metadata } from "next";

import { ContentPage } from "@/components/site/content-page";
import { Container } from "@/components/site/container";
import { InterestActions } from "@/components/site/interest-actions";
import { TrustPanel } from "@/components/site/trust-panel";
import {
  aboutPage,
  finalCta,
  trustPillars,
} from "@/features/content/data/site-content";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Entenda o posicionamento, os pilares editoriais e a lógica de produto da nova plataforma de leilões.",
};

export default function AboutPageRoute() {
  return (
    <>
      <ContentPage page={aboutPage} />
      <Container className="grid gap-10 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[2.4rem] bg-brand-ink px-8 py-10 text-white sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-sand">
            Visão de evolução
          </p>
          <h2 className="mt-4 font-display text-5xl leading-none">
            A base já nasce preparada para catálogo dinâmico, governança e escala.
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">
            O MVP resolve a presença institucional e a arquitetura de informação. A
            próxima camada pode incluir painel, autenticação, versionamento de editais e
            dados estruturados sem recomeçar do zero.
          </p>
          <InterestActions
            className="mt-8"
            primaryHref={finalCta.primaryHref}
            primaryLabel="Solicitar atendimento"
            secondaryHref="/eventos"
            secondaryLabel="Explorar eventos"
          />
        </div>
        <TrustPanel items={trustPillars} />
      </Container>
    </>
  );
}
