import type { Metadata } from "next";

import { Container } from "@/frontend/components/site/container";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { PageHero } from "@/frontend/components/site/page-hero";
import { createWhatsAppLink } from "@/shared/config/site";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Atendimento",
  path: "/sobre",
  description:
    "Entenda como funciona o atendimento comercial da Kron Leilões e o papel desta página na captação via WhatsApp.",
});

const serviceHighlights = [
  {
    title: "Página comercial de divulgação",
    description:
      "O site existe para mostrar oportunidades, gerar confiança e levar o interessado para a conversa no WhatsApp.",
  },
  {
    title: "Fluxo simples e humano",
    description:
      "Nada de parecer um portal oficial completo. Aqui a navegação é leve, clara e focada em conversão.",
  },
  {
    title: "Proposta organizada na conversa",
    description:
      "Quando o lote fizer sentido, a oferta é encaminhada pelo WhatsApp, com contexto suficiente para o vendedor dar sequência.",
  },
] as const;

const expectations = [
  "Você encontra os lotes com leitura rápida e CTA forte.",
  "Você fala com atendimento comercial para esclarecer dúvidas.",
  "Você pode enviar proposta pelo WhatsApp sem simular compra automática no site.",
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
              Esta é uma página comercial da Kron Leilões para captação de interessados
              e atendimento via WhatsApp.
            </p>
          </div>
        }
        description="A proposta aqui não é simular uma leiloeira com dezenas de camadas institucionais. É vender melhor, com clareza e confiança."
        eyebrow="Atendimento"
        meta={["Divulgação", "WhatsApp", "Conversão", "Atendimento humano"]}
        title="Como funciona o atendimento comercial desta página."
      />

      <Container className="grid gap-8 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="space-y-6">
          <p className="text-base leading-8 text-brand-muted">
            O foco do projeto agora é simples: apresentar oportunidades com boa
            aparência, passar confiança comercial e transformar interesse em
            conversa direta no WhatsApp.
          </p>

          <InterestActions
            primaryHref={createWhatsAppLink(
              "Olá, quero falar com o atendimento comercial.",
            )}
            primaryLabel="Falar no WhatsApp"
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
            O site foi simplificado para ajudar a vender.
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
