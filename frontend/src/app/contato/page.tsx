import type { Metadata } from "next";

import { ContactForm } from "@/frontend/components/site/contact-form";
import { Container } from "@/frontend/components/site/container";
import { FaqList } from "@/frontend/components/site/faq-list";
import { InterestActions } from "@/frontend/components/site/interest-actions";
import { PageHero } from "@/frontend/components/site/page-hero";
import { StructuredData } from "@/frontend/components/site/structured-data";
import { absoluteUrl, createWhatsAppLink, siteConfig } from "@/shared/config/site";
import type { FaqItem } from "@/backend/features/auctions/types";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contato",
  path: "/contato",
  description:
    "Fale com o atendimento comercial da Kron Leilões e escolha o melhor canal para seguir com contexto.",
  keywords: ["contato", "whatsapp", "atendimento comercial"],
});

const contactPoints = [
  {
    title: "WhatsApp",
    value: siteConfig.whatsappDisplay,
    description:
      "Canal principal para tirar dúvidas, falar sobre um lote específico e enviar proposta.",
  },
  {
    title: "Telefone",
    value: siteConfig.phoneDisplay,
    description:
      "Bom para retorno, alinhamento rápido e suporte complementar ao atendimento comercial.",
  },
  {
    title: "E-mail",
    value: siteConfig.email,
    description:
      "Canal complementar para contexto adicional e confirmações que precisem ficar registradas.",
  },
] as const;

const contactChecklist = [
  "Seu nome e um telefone que facilite o retorno.",
  "O código, nome do lote ou tipo de oportunidade que chamou sua atenção.",
  "Se você quer só orientação, comparação entre lotes ou já pretende enviar proposta.",
] as const;

const faqPreview: FaqItem[] = [
  {
    question: "Vocês respondem fora do horário comercial?",
    answer:
      "Mensagens enviadas fora do horário útil entram na fila e são respondidas no próximo período de atendimento.",
  },
  {
    question: "Posso chamar sem saber o código do lote?",
    answer:
      "Pode. Se tiver nome, cidade, categoria ou referência visual, isso já ajuda a equipe a localizar a oportunidade.",
  },
  {
    question: "Posso abrir contato só para entender o processo?",
    answer:
      "Sim. O atendimento serve tanto para quem já quer propor quanto para quem ainda está entendendo o melhor caminho.",
  },
];

export default function ContactPage() {
  return (
    <>
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contato",
            url: absoluteUrl("/contato"),
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: absoluteUrl(),
            email: siteConfig.email,
            contactPoint: {
              "@type": "ContactPoint",
              telephone: siteConfig.phoneNumber,
              email: siteConfig.email,
              contactType: "sales",
              availableLanguage: ["pt-BR"],
            },
          },
        ]}
      />

      <PageHero
        aside={
          <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Fale agora
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-brand-ink">
              {siteConfig.whatsappDisplay}
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              {siteConfig.businessHours}
            </p>
            <InterestActions
              className="mt-5"
              primaryHref={createWhatsAppLink(
                `Olá, quero falar com o atendimento comercial da ${siteConfig.name}.`,
              )}
              primaryLabel="Abrir atendimento"
            />
          </div>
        }
        description="Escolha o canal que preferir. O caminho mais rápido continua sendo o atendimento com sua mensagem já preparada."
        eyebrow="Contato"
        meta={["WhatsApp", "Telefone", "E-mail", "Atendimento humano"]}
        title="Contato direto para dúvidas, orientação e propostas."
      />

      <Container className="grid gap-8 py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="grid gap-4">
          {contactPoints.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
                {item.title}
              </p>
              <h2 className="mt-3 break-words text-2xl font-semibold leading-tight text-brand-ink">
                {item.value}
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {item.description}
              </p>
            </article>
          ))}

          <article className="rounded-[28px] border border-brand-line bg-brand-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              O que vale mandar
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-brand-muted">
              {contactChecklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <ContactForm />
      </Container>

      <Container className="grid gap-10 border-t border-brand-line/80 py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            FAQ curta
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
            O que acontece depois do seu contato.
          </h2>
        </div>
        <FaqList items={faqPreview} />
      </Container>
    </>
  );
}
