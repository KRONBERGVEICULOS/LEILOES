import type { Metadata } from "next";

import { Container } from "@/frontend/components/site/container";
import { createPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacidade",
  path: "/privacidade",
  description:
    "Política de privacidade simples para o atendimento comercial e a captação de interessados via WhatsApp.",
});

const privacySections = [
  {
    title: "Quais dados podem ser informados",
    body:
      "Ao entrar em contato, você pode compartilhar nome, telefone, e-mail, lote de interesse e a mensagem que quiser enviar para iniciar a conversa.",
  },
  {
    title: "Como esses dados são usados",
    body:
      "Essas informações servem apenas para organizar o atendimento comercial, responder seu contato e dar sequência à conversa sobre oportunidades divulgadas no site.",
  },
  {
    title: "O que não acontece aqui",
    body:
      "Este site não processa pagamento, não conclui compra automática e não pede envio de dados bancários como parte do fluxo normal de contato.",
  },
] as const;

export default function PrivacyRoute() {
  return (
    <Container className="grid gap-8 py-16">
      <div className="max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Privacidade
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
          Política simples e objetiva.
        </h1>
        <p className="text-base leading-8 text-brand-muted sm:text-lg">
          Esta página resume o básico sobre o uso das informações compartilhadas
          durante o atendimento comercial.
        </p>
      </div>

      <div className="grid gap-4">
        {privacySections.map((section) => (
          <section
            key={section.title}
            className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]"
          >
            <h2 className="text-2xl font-semibold text-brand-ink">{section.title}</h2>
            <p className="mt-3 max-w-4xl text-base leading-8 text-brand-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </Container>
  );
}
