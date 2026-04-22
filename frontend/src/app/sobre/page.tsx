import type { Metadata } from "next";

import { Container } from "@/frontend/components/site/container";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { PageHero } from "@/frontend/components/site/page-hero";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Atendimento",
  path: "/sobre",
  description:
    "Entenda como funciona o atendimento comercial da Kron Leilões e como o site organiza a jornada até o contato humano.",
});

const serviceHighlights = [
  {
    title: "Portal comercial com foco em oportunidade",
    description:
      "O site existe para mostrar oportunidades, gerar confiança e organizar o caminho até a tomada de decisão.",
  },
  {
    title: "Fluxo simples e humano",
    description:
      "A navegação é leve, clara e focada em contexto. O portal mostra o essencial e o atendimento completa o processo.",
  },
  {
    title: "Próximos passos com apoio da equipe",
    description:
      "Quando o lote fizer sentido, a conversa segue com contexto suficiente para a equipe dar sequência com segurança.",
  },
] as const;

const expectations = [
  "Você encontra os lotes com leitura rápida e informações objetivas.",
  "Você fala com atendimento comercial para esclarecer dúvidas e validar próximos passos.",
  "Você pode registrar interesse ou proposta sem simular compra automática no site.",
] as const;

export default function AboutPageRoute() {
  return (
    <>
      <PageHero
        aside={
          <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Resumo
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Esta é uma página institucional da Kron Leilões para apresentar o modelo
              de atendimento e como o site apoia a operação.
            </p>
          </div>
        }
        description="A proposta aqui não é simular uma leiloeira com dezenas de camadas institucionais. É apresentar melhor as oportunidades, com clareza e confiança."
        eyebrow="Atendimento"
        meta={["Divulgação", "Catálogo", "Atendimento humano", "Confiança"]}
        title="Como funciona o atendimento comercial desta página."
      />

      <Container className="grid gap-8 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="space-y-6">
          <p className="text-base leading-8 text-brand-muted">
            O foco do projeto agora é simples: apresentar oportunidades com boa
            aparência, passar confiança comercial e transformar interesse em
            atendimento organizado com apoio humano.
          </p>

          <InterestActions
            primaryHref="/contato"
            primaryLabel="Falar com atendimento"
            secondaryHref="/eventos"
            secondaryLabel="Ver oportunidades"
          />
        </section>

        <div className="grid gap-4">
          {serviceHighlights.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]"
            >
              <h2 className="text-xl font-semibold text-brand-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </Container>

      <Container className="grid gap-8 border-t border-brand-line/80 py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            O que esperar
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            O site foi simplificado para ajudar a decidir com mais segurança.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {expectations.map((item) => (
            <article
              key={item}
              className="rounded-[28px] border border-brand-line bg-brand-paper p-6 text-sm leading-7 text-brand-muted"
            >
              {item}
            </article>
          ))}
        </div>
      </Container>
    </>
  );
}
