import type { Metadata } from "next";

import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-list";
import { InterestActions } from "@/components/site/interest-actions";
import { PageHero } from "@/components/site/page-hero";
import { StructuredData } from "@/components/site/structured-data";
import { finalCta, faqItems } from "@/features/content/data/site-content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Perguntas frequentes sobre manifestação de interesse, documentação, catálogo e operação assistida.",
};

export default function FaqPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />
      <PageHero
        description="A FAQ assume um papel estratégico neste MVP: alinhar expectativa, deixar claro o limite da plataforma e reduzir ambiguidades antes do contato."
        eyebrow="FAQ"
        title="Respostas objetivas para uma operação que prefere clareza à improvisação."
      />

      <Container className="grid gap-10 py-16 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
            O que esta página resolve
          </p>
          <h2 className="font-display text-5xl leading-none text-brand-ink">
            Explicar o produto com sinceridade também é parte da credibilidade.
          </h2>
          <p className="text-base leading-8 text-brand-muted">
            Ao deixar explícito que o fluxo ainda depende de atendimento assistido, a
            plataforma evita promessas vazias e prepara melhor o comprador para o
            próximo passo.
          </p>
          <InterestActions
            className="pt-2"
            primaryHref={finalCta.primaryHref}
            primaryLabel="Falar com a equipe"
            secondaryHref="/como-participar"
            secondaryLabel="Ver processo"
          />
        </div>
        <FaqList items={faqItems} />
      </Container>
    </>
  );
}
