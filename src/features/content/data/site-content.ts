import { createWhatsAppLink } from "@/config/site";
import type { ContentPage, FaqItem } from "@/features/auctions/types";

export const trustPillars = [
  {
    title: "Atendimento assistido",
    description:
      "O fluxo parte de manifestação de interesse e validação com a equipe, sem simular sistema de lance em tempo real quando ele não existe.",
  },
  {
    title: "Informação organizada",
    description:
      "Cada página reúne contexto, metadados, galeria e próximos passos para reduzir ruído e melhorar leitura institucional.",
  },
  {
    title: "Transparência operacional",
    description:
      "Edital, disponibilidade, agenda e condições finais são sempre confirmados antes de qualquer avanço comercial.",
  },
] as const;

export const howItWorksSteps = [
  {
    step: "01",
    title: "Analise o catálogo",
    description:
      "Selecione um evento ou lote, verifique praça, categoria, material visual e o contexto público disponível.",
  },
  {
    step: "02",
    title: "Solicite documentação",
    description:
      "Use o CTA de atendimento para receber edital, regras aplicáveis e esclarecimentos antes da manifestação.",
  },
  {
    step: "03",
    title: "Valide a estratégia",
    description:
      "A equipe confirma disponibilidade, visitação, logística e orienta o formato mais adequado para cada ativo.",
  },
  {
    step: "04",
    title: "Formalize o interesse",
    description:
      "Depois da validação, o comprador segue com o canal indicado pela operação para concluir o próximo passo.",
  },
] as const;

export const faqItems: FaqItem[] = [
  {
    question: "Como funciona a manifestação de interesse neste MVP?",
    answer:
      "O site organiza o catálogo e direciona o usuário para atendimento assistido. A equipe confirma disponibilidade, edital e o formato correto de avanço antes de qualquer proposta.",
  },
  {
    question: "Por que não existe um botão de lance em tempo real?",
    answer:
      "Porque o objetivo deste MVP é ser honesto com a operação atual. Enquanto não existir backend de lance real, o CTA correto é contato assistido, sem criar falsa sensação de disputa ao vivo.",
  },
  {
    question: "Posso tratar vários lotes de uma vez?",
    answer:
      "Sim. A arquitetura da plataforma foi pensada para permitir uma jornada consultiva, inclusive com múltiplos ativos em uma mesma conversa.",
  },
  {
    question: "O que devo solicitar antes de avançar?",
    answer:
      "Edital, confirmação de disponibilidade, praça, condições de visitação, logística de retirada e qualquer observação jurídica ou operacional aplicável ao lote.",
  },
  {
    question: "A página do lote substitui o edital oficial?",
    answer:
      "Não. Ela existe para organizar a descoberta do ativo. O edital e as orientações confirmadas pela equipe continuam sendo a referência final.",
  },
  {
    question: "Como recebo retorno depois do contato?",
    answer:
      "O canal primário deste MVP é o WhatsApp institucional, usado para triagem e direcionamento do atendimento conforme o lote ou coleção consultada.",
  },
];

export const aboutPage: ContentPage = {
  eyebrow: "Posicionamento",
  title: "Uma base institucional para dar forma profissional ao atendimento de leilões.",
  description:
    "Esta plataforma reorganiza a experiência de catálogo, contato e orientação para que a operação pareça séria, transparente e pronta para escalar.",
  sections: [
    {
      title: "O que esta plataforma resolve",
      body: [
        "O site anterior dependia de uma única página estática, catálogo hard-coded e um fluxo pouco institucional. O novo produto parte de uma lógica oposta: páginas dedicadas, informação tipada, arquitetura de rotas e linguagem visual coerente com uma operação de confiança.",
        "O foco do MVP é organizar descoberta, contexto e atendimento sem prometer o que ainda não existe em backend. Isso preserva credibilidade e prepara o terreno para evolução futura.",
      ],
    },
    {
      title: "Pilares editoriais e operacionais",
      body: [
        "A experiência foi desenhada para equilibrar clareza comercial e responsabilidade operacional. Em vez de inflar a interface com sinais artificiais de urgência, o site enfatiza catálogo, documentação, diligência e suporte humano.",
      ],
      bullets: [
        "Catálogo institucional com leitura rápida e consistente.",
        "Páginas de lote com contexto suficiente para triagem séria.",
        "CTA honesto: solicitar atendimento, edital ou manifestação de interesse.",
        "Estrutura pronta para evoluir para dados dinâmicos e painel operacional.",
      ],
    },
    {
      title: "Escalabilidade do produto",
      body: [
        "A base foi pensada para crescer por features: catálogo, conteúdo institucional, SEO, compliance e contato. Isso permite acoplar futuramente CMS, painel administrativo, autenticação e motor de lotes sem refazer a fundação.",
      ],
    },
  ],
};

export const howToParticipatePage: ContentPage = {
  eyebrow: "Jornada do comprador",
  title: "Como participar com segurança, previsibilidade e contexto suficiente.",
  description:
    "O fluxo foi organizado para evitar ruído, reduzir ambiguidades e concentrar a negociação em passos verificáveis.",
  sections: [
    {
      title: "Antes de manifestar interesse",
      body: [
        "Leia o lote com atenção, confira a praça indicada, categoria do ativo, observações públicas e a natureza do atendimento. Se precisar de edital, visitação ou contexto documental, solicite esses itens antes de qualquer decisão.",
      ],
      bullets: [
        "Confirmar disponibilidade do ativo.",
        "Solicitar edital e condições aplicáveis.",
        "Verificar praça, logística e retirada.",
        "Alinhar estratégia caso existam múltiplos lotes de interesse.",
      ],
    },
    {
      title: "Durante o contato com a equipe",
      body: [
        "Use o atendimento assistido como camada de validação. O objetivo não é apenas registrar uma intenção, mas consolidar informações que deem segurança para o próximo passo da negociação.",
      ],
    },
    {
      title: "Depois da validação",
      body: [
        "Com disponibilidade, documentação e formato confirmados, a equipe indica a trilha correta para continuidade. Esse desenho evita a falsa expectativa de um fluxo automático quando o processo ainda depende de validação humana.",
      ],
    },
  ],
};

export const privacyPage: ContentPage = {
  eyebrow: "Privacidade",
  title: "Tratamento responsável de dados em uma operação orientada a atendimento.",
  description:
    "Esta página descreve como o MVP trata dados de navegação e dados compartilhados pelo usuário quando ele inicia contato com a operação.",
  sections: [
    {
      title: "Dados coletados",
      body: [
        "No estado atual do MVP, o site funciona principalmente como vitrine institucional e ponto de entrada para o atendimento. Informações enviadas pelo usuário podem incluir nome, telefone, texto da solicitação e o contexto do lote ou evento consultado, conforme o canal acionado.",
        "Em ambiente de hospedagem, podem existir registros técnicos de acesso, como IP, user-agent, data e hora da requisição, usados para segurança, diagnóstico e operação da infraestrutura.",
      ],
    },
    {
      title: "Uso dos dados",
      body: [
        "Os dados são tratados para responder solicitações, organizar triagem comercial e operacional e prestar esclarecimentos sobre lotes, eventos e documentação. Este MVP não executa cobrança nem conclui pagamento pela interface.",
      ],
      bullets: [
        "Responder pedidos de atendimento e edital.",
        "Contextualizar o interesse do usuário em determinado lote ou coleção.",
        "Preservar segurança operacional e trilha mínima de contato.",
      ],
    },
    {
      title: "Canais de terceiros",
      body: [
        "Ao optar por iniciar contato via WhatsApp, o usuário também se sujeita às políticas da plataforma terceira responsável pelo canal. Recomenda-se compartilhar apenas os dados necessários para o atendimento.",
      ],
    },
  ],
};

export const cookiesPage: ContentPage = {
  eyebrow: "Cookies",
  title: "Uso enxuto de tecnologias de navegação no MVP.",
  description:
    "A versão atual prioriza uma camada técnica mínima, com comportamento simples e sem dependência de trackers invasivos.",
  sections: [
    {
      title: "Cookies essenciais",
      body: [
        "O site pode utilizar recursos técnicos indispensáveis ao funcionamento da aplicação e à entrega segura das páginas em ambiente de hospedagem. Esses recursos não são usados para simular comportamento comercial inexistente nem para criar perfis de compra.",
      ],
    },
    {
      title: "Medição e evolução futura",
      body: [
        "Se ferramentas de analytics forem adotadas em versões futuras, o objetivo será medir navegação, performance e jornadas de contato para aprimorar a experiência institucional. A política deverá ser atualizada sempre que essa camada mudar materialmente.",
      ],
    },
  ],
};

export const termsPage: ContentPage = {
  eyebrow: "Termos de uso",
  title: "Regras de uso desta plataforma institucional de catálogo e atendimento.",
  description:
    "O site apresenta conteúdo informativo sobre lotes, coleções e fluxo de contato. Ele não substitui edital, contrato nem confirmação operacional da equipe.",
  sections: [
    {
      title: "Natureza da plataforma",
      body: [
        "Este MVP organiza informações institucionais e públicas de catálogo. A presença de um lote ou evento na plataforma não constitui, por si só, garantia de disponibilidade, adjudicação, venda direta, resultado de leilão ou direito adquirido.",
      ],
    },
    {
      title: "Responsabilidades do usuário",
      body: [
        "Cabe ao interessado solicitar confirmação de disponibilidade, edital, documentação e regras aplicáveis antes de qualquer decisão. O uso da plataforma deve respeitar a boa-fé e a finalidade de contato legítimo com a operação.",
      ],
      bullets: [
        "Não presumir que a página substitui documento oficial.",
        "Não interpretar manifestação de interesse como aceitação automática.",
        "Validar todas as condições com a equipe antes de avançar.",
      ],
    },
    {
      title: "Limites desta fase do produto",
      body: [
        "Enquanto não existir backend transacional específico, a plataforma não deve ser lida como sistema de lance em tempo real. Toda evolução futura será comunicada de forma expressa e refletida nestes termos.",
      ],
    },
  ],
};

export const finalCta = {
  title: "Precisa validar um lote, pedir edital ou alinhar uma negociação assistida?",
  description:
    "Use o canal institucional para concentrar dúvidas, documentação e manifestação de interesse sem depender de um fluxo improvisado.",
  primaryLabel: "Falar no WhatsApp",
  primaryHref: createWhatsAppLink(
    "Olá, quero falar com a equipe da Kron Leilões para validar um lote ou solicitar edital.",
  ),
  secondaryLabel: "Ir para contato",
  secondaryHref: "/contato",
} as const;
