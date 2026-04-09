import type { Metadata } from "next";

import { Container } from "@/components/site/container";
import { InterestActions } from "@/components/site/interest-actions";
import { PageHero } from "@/components/site/page-hero";
import { createWhatsAppLink, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Canal institucional para solicitar edital, validar um lote, consolidar múltiplos ativos e iniciar atendimento assistido.",
};

const contactReasons = [
  {
    title: "Solicitar edital",
    description:
      "Peça o documento aplicável, regras do lote ou da coleção e observações operacionais antes de avançar.",
    href: createWhatsAppLink(
      "Olá, quero solicitar edital e regras aplicáveis a um lote ou evento da Kron Leilões.",
    ),
  },
  {
    title: "Validar um lote específico",
    description:
      "Ideal para confirmar disponibilidade, praça, logística, visitação e contexto documental de um ativo.",
    href: createWhatsAppLink(
      "Olá, quero validar a disponibilidade e as condições de um lote específico.",
    ),
  },
  {
    title: "Consolidar uma negociação assistida",
    description:
      "Fluxo indicado para quem pretende tratar vários lotes em uma única conversa com a operação.",
    href: createWhatsAppLink(
      "Olá, quero consolidar uma negociação assistida com múltiplos lotes.",
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        aside={
          <div className="rounded-[2rem] border border-brand-line bg-white p-6 shadow-[0_22px_80px_-55px_rgba(16,24,39,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Canal principal
            </p>
            <p className="mt-4 text-2xl font-semibold text-brand-ink">
              {siteConfig.whatsappDisplay}
            </p>
            <p className="mt-3 text-base leading-8 text-brand-muted">
              Atendimento assistido para edital, documentação, triagem comercial e
              orientação operacional.
            </p>
          </div>
        }
        description="Esta página concentra os pontos de contato corretos para um MVP que ainda não opera com backend transacional. O objetivo é reduzir atrito e tornar o atendimento mais profissional."
        eyebrow="Contato"
        title="Fale com a operação pelo canal certo, com contexto suficiente e sem ruído."
      />

      <Container className="grid gap-8 py-16">
        <section className="grid gap-5 md:grid-cols-3">
          {contactReasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-[2rem] border border-brand-line bg-white p-7 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-brass">
                Fluxo de contato
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-brand-ink">
                {reason.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-brand-muted">
                {reason.description}
              </p>
              <a
                className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-ink/90"
                href={reason.href}
                rel="noreferrer"
                target="_blank"
              >
                Iniciar conversa
              </a>
            </article>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
          <div className="rounded-[2rem] border border-brand-line bg-brand-paper p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              O que enviar no primeiro contato
            </p>
            <ul className="mt-5 grid gap-3 text-base leading-8 text-brand-muted">
              {[
                "Nome ou identificação do interessado.",
                "Lote ou evento que motivou o contato.",
                "Se deseja edital, confirmação de disponibilidade ou orientação documental.",
                "Se a consulta envolve um único ativo ou múltiplos lotes.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-2 w-2 rounded-full bg-brand-brass" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-brand-line bg-white p-8 shadow-[0_18px_60px_-55px_rgba(16,24,39,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
              Endereço institucional
            </p>
            <div className="mt-5 space-y-2 text-base leading-8 text-brand-muted">
              {siteConfig.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <InterestActions
              className="mt-8"
              primaryHref={createWhatsAppLink(
                "Olá, quero falar com a equipe da Kron Leilões.",
              )}
              primaryLabel="Falar no WhatsApp"
              secondaryHref="/faq"
              secondaryLabel="Ler FAQ"
            />
          </div>
        </section>
      </Container>
    </>
  );
}
