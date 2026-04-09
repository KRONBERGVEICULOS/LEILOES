import { createWhatsAppLink } from "@/config/site";
import type { AuctionEvent, Category, Lot } from "@/features/auctions/types";

export const categories: Category[] = [
  {
    slug: "veiculos-leves",
    name: "Veículos leves",
    summary:
      "Sedãs, hatches e utilitários esportivos com apresentação organizada por lote.",
    scope: "Perfil indicado para uso particular, frota executiva e renovação de ativos.",
  },
  {
    slug: "pick-ups-e-utilitarios",
    name: "Pick-ups e utilitários",
    summary:
      "Lotes com apelo operacional, agronegócio, obras, logística e transporte leve.",
    scope: "Ideal para compradores que precisam validar estado, praça e documentação.",
  },
  {
    slug: "motocicletas",
    name: "Motocicletas",
    summary:
      "Motos urbanas e de trabalho para quem busca agilidade em compras assistidas.",
    scope: "Fluxo focado em confirmação de disponibilidade e regras antes da proposta.",
  },
  {
    slug: "maquinas-equipamentos",
    name: "Máquinas e equipamentos",
    summary:
      "Ativos agrícolas e de apoio operacional com documentação e retirada sob consulta.",
    scope: "Categoria pensada para negociações com diligência técnica e logística definida.",
  },
];

export const lots: Lot[] = [
  {
    slug: "amarok-extreme-cd-3-0-2021",
    title: "Volkswagen Amarok Extreme CD 3.0 4x4",
    lotCode: "Lote #1428",
    eventSlug: "veiculos-premium-e-utilitarios",
    category: "Utilitário premium",
    location: "Curitiba/PR",
    overview:
      "Picape 4x4 com conjunto fotográfico amplo, indicada para compradores que desejam validar estado geral e condições documentais com apoio da equipe antes da manifestação.",
    condition:
      "Catálogo publicado com base em dados públicos do site de referência. Edital, disponibilidade e condições finais devem ser confirmados no atendimento.",
    year: "2021",
    mileage: "31.000 km",
    fuel: "Diesel",
    transmission: "Automática",
    sourceNote:
      "Informações consolidadas do catálogo público observado em 08/04/2026.",
    facts: [
      "Modelo Amarok Extreme CD 3.0 com tração 4x4.",
      "Apresentado com chave no catálogo público consultado.",
      "Localização operacional indicada em Curitiba/PR.",
      "Fluxo sugerido: solicitar edital, validar documentação e alinhar retirada.",
    ],
    highlights: [
      "Conjunto fotográfico robusto para análise preliminar.",
      "Perfil aderente a compradores corporativos e particulares.",
      "Atendimento assistido reduz ruído na etapa de proposta.",
    ],
    documents: [
      {
        title: "Solicitar edital e condições deste lote",
        description:
          "A equipe confirma regras operacionais, disponibilidade e documentação aplicável antes da manifestação.",
        ctaLabel: "Solicitar atendimento",
        ctaHref: createWhatsAppLink(
          "Olá, quero solicitar edital e condições do lote Volkswagen Amarok Extreme CD 3.0 4x4.",
        ),
      },
    ],
    faq: [
      {
        question: "Este lote já está em disputa em tempo real?",
        answer:
          "Não neste MVP. A página organiza informações públicas e direciona a manifestação de interesse para atendimento assistido.",
      },
      {
        question: "Como confirmo documentação e retirada?",
        answer:
          "O caminho recomendado é solicitar atendimento antes da proposta para receber orientação operacional e disponibilidade atualizada.",
      },
    ],
    media: [
      "/media/lots/amarok-extreme/amarok.jpg",
      "/media/lots/amarok-extreme/amarok2.jpg",
      "/media/lots/amarok-extreme/amarok3.jpg",
      "/media/lots/amarok-extreme/amarok4.jpg",
    ],
  },
  {
    slug: "civic-touring-1-5-turbo-2017",
    title: "Honda Civic Touring 1.5 Turbo",
    lotCode: "Lote #1752",
    eventSlug: "veiculos-premium-e-utilitarios",
    category: "Sedã executivo",
    location: "Curitiba/PR",
    overview:
      "Sedã com posicionamento executivo e material fotográfico detalhado, adequado para uma jornada de avaliação com maior foco em procedência, visitação e confirmação documental.",
    condition:
      "Dados públicos extraídos do catálogo atual. Toda informação comercial ou jurídica deve ser validada com a operação antes da decisão de compra.",
    year: "2017",
    mileage: "22.000 km",
    fuel: "Gasolina",
    transmission: "Automática",
    sourceNote:
      "Informações consolidadas do catálogo público observado em 08/04/2026.",
    facts: [
      "Versão Touring 1.5 Turbo descrita no catálogo de origem.",
      "Indicação de chave disponível no anúncio público.",
      "Praça informada em Curitiba/PR.",
      "Veículo voltado a análise técnica e documental antes da proposta.",
    ],
    highlights: [
      "Baixa quilometragem no material consultado.",
      "Galeria extensa para inspeção visual inicial.",
      "Boa aderência para compradores que priorizam transparência documental.",
    ],
    documents: [
      {
        title: "Solicitar ficha consolidada do lote",
        description:
          "Use este canal para pedir edital, observações operacionais e confirmação da situação do ativo.",
        ctaLabel: "Falar com a equipe",
        ctaHref: createWhatsAppLink(
          "Olá, quero receber a ficha consolidada do lote Honda Civic Touring 1.5 Turbo.",
        ),
      },
    ],
    faq: [
      {
        question: "O valor mostrado no site é vinculante?",
        answer:
          "Não. O MVP evita simular disputa real. A confirmação comercial acontece somente no atendimento assistido.",
      },
      {
        question: "Posso solicitar mais fotos ou orientações?",
        answer:
          "Sim. A equipe pode orientar o próximo passo e informar quais materiais estão disponíveis para este lote.",
      },
    ],
    media: [
      "/media/lots/civic-touring/civicg10.jpg",
      "/media/lots/civic-touring/civicg10_2.jpg",
      "/media/lots/civic-touring/civicg10_3.jpg",
      "/media/lots/civic-touring/civicg10_4.jpg",
    ],
  },
  {
    slug: "fiat-toro-endurance-1-8-2019",
    title: "Fiat Toro Endurance 1.8 Flex",
    lotCode: "Lote #1910",
    eventSlug: "operacao-frotas-e-logistica",
    category: "Pick-up de operação",
    location: "Curitiba/PR",
    overview:
      "Pick-up voltada a uso operacional, com apelo para renovação de frota, equipes de campo e compradores que precisam alinhar logística e documentação com antecedência.",
    condition:
      "As informações desta página refletem apenas o material público consultado. Valide disponibilidade, edital e retirada antes de prosseguir.",
    year: "2019",
    mileage: "2.300 km",
    fuel: "Flex",
    transmission: "Automática",
    sourceNote:
      "Informações consolidadas do catálogo público observado em 08/04/2026.",
    facts: [
      "Modelo Fiat Toro Endurance 1.8 16V Flex.",
      "Quilometragem pública descrita como 2.300 km.",
      "Praça operacional indicada em Curitiba/PR.",
      "Lote indicado para diligência de documentação e estado geral antes da proposta.",
    ],
    highlights: [
      "Vocação operacional clara para uso corporativo.",
      "Conjunto visual adequado para triagem preliminar.",
      "Pode ser combinado a outros lotes em negociação assistida.",
    ],
    documents: [
      {
        title: "Solicitar edital operacional do lote",
        description:
          "Canal indicado para alinhamento de documentação, agenda de visita e orientações de retirada.",
        ctaLabel: "Solicitar edital",
        ctaHref: createWhatsAppLink(
          "Olá, quero solicitar edital e informações operacionais do lote Fiat Toro Endurance 1.8 Flex.",
        ),
      },
    ],
    faq: [
      {
        question: "Este lote pode ser tratado como compra imediata?",
        answer:
          "Não sem confirmação. A página apresenta um ponto de partida para avaliação; o enquadramento final depende do atendimento.",
      },
      {
        question: "Como saber se o lote permanece disponível?",
        answer:
          "A disponibilidade precisa ser confirmada pela equipe antes de qualquer avanço, principalmente em catálogos com alta procura.",
      },
    ],
    media: [
      "/media/lots/toro-endurance/toro.jpg",
      "/media/lots/toro-endurance/toro2.jpg",
      "/media/lots/toro-endurance/toro3.jpg",
      "/media/lots/toro-endurance/toro4.jpg",
    ],
  },
  {
    slug: "toyota-hilux-cd-srv-2-8-2020",
    title: "Toyota Hilux CD SRV 2.8 4x4",
    lotCode: "Lote #1007",
    eventSlug: "operacao-frotas-e-logistica",
    category: "Pick-up diesel",
    location: "Campinas/SP",
    overview:
      "Ativo com forte apelo para agronegócio, manutenção, transporte leve e gestão de frota. A recomendação é seguir com confirmação operacional antes de qualquer proposta.",
    condition:
      "Conteúdo estruturado a partir de dados públicos do catálogo atual. Situação jurídica, edital e regras comerciais dependem de validação com a equipe.",
    year: "2020",
    mileage: "73.000 km",
    fuel: "Diesel",
    transmission: "Automática",
    sourceNote:
      "Informações consolidadas do catálogo público observado em 08/04/2026.",
    facts: [
      "Versão Hilux CD SRV 4x4 2.8 TDI Diesel Automática.",
      "Praça pública indicada em Campinas/SP.",
      "Material fotográfico suficiente para triagem inicial.",
      "Lote aderente a compradores com processo formal de diligência.",
    ],
    highlights: [
      "Categoria relevante para operação e campo.",
      "Adequado para análise de lote com foco em documentação e retirada.",
      "Compatível com negociação assistida por catálogo.",
    ],
    documents: [
      {
        title: "Solicitar documentos e orientação da praça",
        description:
          "Receba orientação sobre edital, disponibilidade e próximos passos para este lote.",
        ctaLabel: "Solicitar orientação",
        ctaHref: createWhatsAppLink(
          "Olá, quero solicitar documentos e orientação da praça do lote Toyota Hilux CD SRV 2.8 4x4.",
        ),
      },
    ],
    faq: [
      {
        question: "Existe agenda pública para este lote?",
        answer:
          "Não há agenda vinculante publicada neste MVP. A consulta deve ser feita diretamente com a operação.",
      },
      {
        question: "Posso agrupar mais de um lote no atendimento?",
        answer:
          "Sim. O canal assistido foi pensado para compradores que querem tratar múltiplos ativos em uma mesma jornada.",
      },
    ],
    media: [
      "/media/lots/hilux-srv/toyota.png",
      "/media/lots/hilux-srv/toyota2.png",
      "/media/lots/hilux-srv/toyota3.png",
      "/media/lots/hilux-srv/toyota4.png",
    ],
  },
  {
    slug: "yamaha-factor-125i-2017",
    title: "Yamaha Factor 125i ED",
    lotCode: "Lote #1012",
    eventSlug: "motos-e-maquinas-em-destaque",
    category: "Motocicleta urbana",
    location: "Guapimirim/RJ",
    overview:
      "Lote enxuto e objetivo para compradores que valorizam agilidade no contato, confirmação rápida de regras e análise de documentação antes da proposta.",
    condition:
      "Esta página reorganiza informações públicas de referência. O atendimento confirma situação atual, praça e eventuais condições adicionais.",
    year: "2017",
    mileage: "50.000 km",
    fuel: "Gasolina",
    sourceNote:
      "Informações consolidadas do catálogo público observado em 08/04/2026.",
    facts: [
      "Modelo Yamaha 125i ED informado no catálogo público.",
      "Localização pública indicada como Guapimirim/RJ.",
      "Categoria orientada a compradores que preferem fluxo rápido de decisão.",
      "A manifestação de interesse depende de confirmação assistida.",
    ],
    highlights: [
      "Página pensada para decisão objetiva.",
      "Compatível com compradores individuais e operações de mobilidade.",
      "Boa aderência a um funil de atendimento mais curto.",
    ],
    documents: [
      {
        title: "Solicitar orientação do lote",
        description:
          "Peça confirmação de disponibilidade, documentação aplicável e próximos passos antes de prosseguir.",
        ctaLabel: "Manifestar interesse",
        ctaHref: createWhatsAppLink(
          "Olá, quero manifestar interesse no lote Yamaha Factor 125i ED.",
        ),
      },
    ],
    faq: [
      {
        question: "Consigo receber o edital pelo WhatsApp?",
        answer:
          "O canal principal desta fase é o WhatsApp. A equipe informa se o documento aplicável já está disponível para envio.",
      },
      {
        question: "A manifestação já garante reserva?",
        answer:
          "Não. A manifestação apenas inicia o atendimento e a validação do lote.",
      },
    ],
    media: [
      "/media/lots/factor-125i/factor.png",
      "/media/lots/factor-125i/factor2.png",
      "/media/lots/factor-125i/factor3.png",
    ],
  },
  {
    slug: "trator-john-deere-6300-2004",
    title: "Trator John Deere 6300",
    lotCode: "Lote #1008",
    eventSlug: "motos-e-maquinas-em-destaque",
    category: "Máquina agrícola",
    location: "Brasília/DF",
    overview:
      "Ativo de perfil técnico, indicado para compradores que precisam confirmar logística, documentação e eventual vistoria antes da formalização.",
    condition:
      "Os dados exibidos foram organizados a partir do catálogo público de referência. Qualquer condição final deve ser confirmada diretamente com a equipe.",
    year: "2004",
    mileage: "Não informada no catálogo",
    fuel: "Diesel",
    sourceNote:
      "Informações consolidadas do catálogo público observado em 08/04/2026.",
    facts: [
      "Modelo John Deere 6300 descrito no catálogo público.",
      "Categoria de trator agrícola.",
      "Praça pública indicada em Brasília/DF.",
      "Fluxo recomendado com diligência de logística e documentação.",
    ],
    highlights: [
      "Categoria com maior necessidade de contextualização operacional.",
      "Atendimento assistido reduz risco de leitura incompleta do lote.",
      "Material adequado para negociações com diligência técnica.",
    ],
    documents: [
      {
        title: "Solicitar ficha operacional do equipamento",
        description:
          "O atendimento confirma disponibilidade, regras, logística e orientações do lote antes de qualquer avanço.",
        ctaLabel: "Solicitar ficha",
        ctaHref: createWhatsAppLink(
          "Olá, quero solicitar a ficha operacional do lote Trator John Deere 6300.",
        ),
      },
    ],
    faq: [
      {
        question: "Existe informação de logística ou retirada nesta página?",
        answer:
          "Não de forma conclusiva. Para máquinas e equipamentos, a orientação é tratar logística e documentação diretamente com a equipe.",
      },
      {
        question: "Este ativo exige diligência prévia?",
        answer:
          "Sim, esse é o fluxo recomendado para categorias técnicas como máquinas e equipamentos.",
      },
    ],
    media: [
      "/media/lots/john-deere-6300/trator.png",
      "/media/lots/john-deere-6300/trator2.png",
      "/media/lots/john-deere-6300/trator3.png",
    ],
  },
];

export const auctionEvents: AuctionEvent[] = [
  {
    slug: "veiculos-premium-e-utilitarios",
    eyebrow: "Coleção curada",
    title: "Veículos premium e utilitários",
    status: "Catálogo em consulta",
    summary:
      "Seleção orientada a compradores que priorizam leitura clara do lote, apoio documental e atendimento assistido antes da proposta.",
    intro:
      "Este catálogo reúne ativos com perfil executivo ou utilitário, apresentados de forma editorial para facilitar triagem, comparação e solicitação de documentação.",
    coverage: "Curitiba/PR e região de atendimento ampliado",
    format: "Manifestação de interesse assistida",
    note:
      "Datas, edital e condições finais são confirmados caso a caso pela operação.",
    image: "/media/lots/amarok-extreme/amarok.jpg",
    highlights: [
      "Catálogo pensado para leitura institucional, não para simular disputa em tempo real.",
      "Boa aderência a compradores que precisam consolidar decisão com segurança.",
      "Lotes com apelo para uso corporativo, executivo e renovação de ativos.",
    ],
    documents: [
      {
        title: "Solicitar edital consolidado desta coleção",
        description:
          "Receba o direcionamento operacional para documentação, disponibilidade e fluxo de manifestação.",
        ctaLabel: "Solicitar edital",
        ctaHref: createWhatsAppLink(
          "Olá, quero solicitar o edital consolidado da coleção Veículos premium e utilitários.",
        ),
      },
    ],
    faq: [
      {
        question: "Este catálogo possui data pública fechada?",
        answer:
          "Não nesta fase. A página organiza ativos e direciona o interessado para confirmação operacional antes de qualquer compromisso.",
      },
      {
        question: "Consigo tratar mais de um lote no mesmo atendimento?",
        answer:
          "Sim. A estrutura foi pensada para apoiar uma jornada consultiva, incluindo interesse em múltiplos lotes.",
      },
    ],
    lotSlugs: [
      "amarok-extreme-cd-3-0-2021",
      "civic-touring-1-5-turbo-2017",
    ],
  },
  {
    slug: "operacao-frotas-e-logistica",
    eyebrow: "Catálogo setorial",
    title: "Operação, frotas e logística",
    status: "Consulta qualificada",
    summary:
      "Seleção de pick-ups e utilitários para compradores que precisam alinhar documentação, praça e retirada dentro de um fluxo mais formal.",
    intro:
      "A curadoria destaca ativos com vocação operacional e de frota, priorizando clareza de contexto, contato rápido com a equipe e espaço para diligência.",
    coverage: "Curitiba/PR, Campinas/SP e praças correlatas",
    format: "Atendimento assistido por lote ou por pacote",
    note:
      "A equipe confirma disponibilidade, condições e eventuais regras adicionais antes da proposta.",
    image: "/media/lots/hilux-srv/toyota.png",
    highlights: [
      "Catálogo desenhado para compradores corporativos e operadores de frota.",
      "Fluxo ideal para quem precisa consolidar mais de um ativo em uma única conversa.",
      "Destaque para diligência documental e alinhamento de logística.",
    ],
    documents: [
      {
        title: "Solicitar orientação da coleção",
        description:
          "Converse com a equipe para receber edital, condições operacionais e visão consolidada dos lotes desta frente.",
        ctaLabel: "Falar com a equipe",
        ctaHref: createWhatsAppLink(
          "Olá, quero solicitar orientação da coleção Operação, frotas e logística.",
        ),
      },
    ],
    faq: [
      {
        question: "A página substitui o edital?",
        answer:
          "Não. Ela funciona como camada de organização e apresentação. O documento aplicável continua sendo a referência final para qualquer avanço.",
      },
      {
        question: "Essa frente serve para negociação em pacote?",
        answer:
          "Sim. A operação pode orientar compradores que precisam tratar múltiplos ativos com um mesmo atendimento.",
      },
    ],
    lotSlugs: [
      "fiat-toro-endurance-1-8-2019",
      "toyota-hilux-cd-srv-2-8-2020",
    ],
  },
  {
    slug: "motos-e-maquinas-em-destaque",
    eyebrow: "Frente especializada",
    title: "Motos e máquinas em destaque",
    status: "Catálogo técnico",
    summary:
      "Estrutura pensada para ativos que exigem orientação mais objetiva, confirmação rápida de documentação e leitura operacional do lote.",
    intro:
      "Essa frente une motocicletas e máquinas sob uma lógica consultiva: menos ruído visual, mais contexto para diligência e contato direto com a equipe.",
    coverage: "Guapimirim/RJ, Brasília/DF e atendimento nacional",
    format: "Manifestação de interesse com apoio operacional",
    note:
      "Ativos técnicos costumam demandar conferência adicional de logística, visitação e documentação.",
    image: "/media/lots/john-deere-6300/trator.png",
    highlights: [
      "Boa aderência para compradores que valorizam objetividade.",
      "Fluxo claro entre descoberta do lote, solicitação de apoio e validação documental.",
      "Indicado para categorias técnicas e com logística sensível.",
    ],
    documents: [
      {
        title: "Solicitar documentação e orientação desta frente",
        description:
          "Use o atendimento assistido para validar disponibilidade, documentação e próximos passos antes da proposta.",
        ctaLabel: "Manifestar interesse",
        ctaHref: createWhatsAppLink(
          "Olá, quero solicitar documentação da frente Motos e máquinas em destaque.",
        ),
      },
    ],
    faq: [
      {
        question: "É possível avançar sem falar com a equipe?",
        answer:
          "Não é o recomendado. Em ativos técnicos, o atendimento assistido é a etapa mais segura para validar condições reais.",
      },
      {
        question: "Como recebo as instruções finais?",
        answer:
          "Depois da manifestação de interesse, a equipe conduz as orientações aplicáveis ao lote consultado.",
      },
    ],
    lotSlugs: ["yamaha-factor-125i-2017", "trator-john-deere-6300-2004"],
  },
];

export const featuredLotSlugs = [
  "amarok-extreme-cd-3-0-2021",
  "toyota-hilux-cd-srv-2-8-2020",
  "trator-john-deere-6300-2004",
];

export function getEventBySlug(slug: string) {
  return auctionEvents.find((event) => event.slug === slug);
}

export function getLotBySlug(slug: string) {
  return lots.find((lot) => lot.slug === slug);
}

export function getLotsByEventSlug(eventSlug: string) {
  return lots.filter((lot) => lot.eventSlug === eventSlug);
}
