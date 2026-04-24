import { buildWhatsAppLink } from "@/shared/lib/contact-links";
import type { ContentSource } from "@/backend/features/content/data/source";
import { platformContentSeedSchema } from "@/backend/features/content/model/schemas";
import type { PlatformContentSeed } from "@/backend/features/content/model/types";

function makeSeo(options: {
  canonicalPath: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  title: string;
}) {
  return {
    title: options.title,
    description: options.description,
    canonicalPath: options.canonicalPath,
    keywords: options.keywords ?? [],
    ...(options.ogImage ? { ogImage: options.ogImage } : {}),
  };
}

function assertUnique(items: { id: string; slug?: string }[], collection: string) {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicated id "${item.id}" in ${collection}`);
    }

    ids.add(item.id);

    if (!item.slug) {
      continue;
    }

    if (slugs.has(item.slug)) {
      throw new Error(`Duplicated slug "${item.slug}" in ${collection}`);
    }

    slugs.add(item.slug);
  }
}

function assertReferences(seed: PlatformContentSeed) {
  const categories = new Set(seed.categories.map((item) => item.id));
  const channels = new Set(seed.contactChannels.map((item) => item.id));
  const ctas = new Set(seed.ctas.map((item) => item.id));
  const documents = new Set(seed.documents.map((item) => item.id));
  const events = new Set(seed.auctionEvents.map((item) => item.id));
  const faq = new Set(seed.faq.map((item) => item.id));
  const lots = new Set(seed.lots.map((item) => item.id));

  const assertCollectionRef = (
    collection: Set<string>,
    value: string,
    field: string,
  ) => {
    if (!collection.has(value)) {
      throw new Error(`Missing reference "${value}" for ${field}`);
    }
  };

  assertCollectionRef(
    channels,
    seed.company.primaryContactChannelId,
    "company.primaryContactChannelId",
  );
  assertCollectionRef(ctas, seed.siteExperience.finalCtaId, "siteExperience.finalCtaId");

  for (const ctaId of seed.siteExperience.contactReasonCtaIds) {
    assertCollectionRef(ctas, ctaId, "siteExperience.contactReasonCtaIds");
  }

  for (const lotId of seed.siteExperience.featuredLotIds) {
    assertCollectionRef(lots, lotId, "siteExperience.featuredLotIds");
  }

  for (const document of seed.documents) {
    if (document.ctaId) {
      assertCollectionRef(ctas, document.ctaId, `documents.${document.id}.ctaId`);
    }
  }

  for (const page of seed.pages) {
    for (const faqId of page.relatedFaqIds) {
      assertCollectionRef(faq, faqId, `pages.${page.id}.relatedFaqIds`);
    }

    if (page.primaryCtaId) {
      assertCollectionRef(ctas, page.primaryCtaId, `pages.${page.id}.primaryCtaId`);
    }

    if (page.secondaryCtaId) {
      assertCollectionRef(
        ctas,
        page.secondaryCtaId,
        `pages.${page.id}.secondaryCtaId`,
      );
    }
  }

  for (const event of seed.auctionEvents) {
    for (const categoryId of event.categoryIds) {
      assertCollectionRef(categories, categoryId, `auctionEvents.${event.id}.categoryIds`);
    }

    for (const documentId of event.documentIds) {
      assertCollectionRef(documents, documentId, `auctionEvents.${event.id}.documentIds`);
    }

    for (const faqId of event.faqIds) {
      assertCollectionRef(faq, faqId, `auctionEvents.${event.id}.faqIds`);
    }

    for (const lotId of event.lotIds) {
      assertCollectionRef(lots, lotId, `auctionEvents.${event.id}.lotIds`);
    }

    if (event.primaryCtaId) {
      assertCollectionRef(ctas, event.primaryCtaId, `auctionEvents.${event.id}.primaryCtaId`);
    }
  }

  for (const lot of seed.lots) {
    assertCollectionRef(events, lot.eventId, `lots.${lot.id}.eventId`);
    assertCollectionRef(categories, lot.categoryId, `lots.${lot.id}.categoryId`);

    for (const documentId of lot.documentIds) {
      assertCollectionRef(documents, documentId, `lots.${lot.id}.documentIds`);
    }

    for (const faqId of lot.faqIds) {
      assertCollectionRef(faq, faqId, `lots.${lot.id}.faqIds`);
    }

    for (const ctaId of lot.ctaIds) {
      assertCollectionRef(ctas, ctaId, `lots.${lot.id}.ctaIds`);
    }
  }
}

const primaryWhatsAppNumber = "5516996540954";

const rawSeed = {
  company: {
    id: "company-kron-leiloes",
    slug: "kron-leiloes",
    brandName: "Kron Leilões",
    legalName: "Kron Leilões Ltda.",
    taxId: null,
    shortDescription:
      "Oportunidades de leilão com catálogo claro, acompanhamento online e atendimento oficial para compradores.",
    longDescription:
      "A Kron Leilões reúne lotes, informações comerciais e canais de atendimento para compradores que querem analisar oportunidades com segurança antes de participar.",
    addressLines: ["Rua André de Barros, 226", "15º andar - Centro", "Curitiba/PR"],
    city: "Curitiba",
    state: "PR",
    country: "BR",
    businessHours: "Segunda a sexta, das 9h às 18h.",
    responseTime:
      "Mensagens recebidas fora do horário útil são respondidas no próximo dia útil.",
    auctioneerName: null,
    auctioneerRegistration: null,
    auctioneerBoard: null,
    registrationNote:
      "Dados cadastrais e regulatórios aplicáveis a cada evento devem ser conferidos no edital e nos canais oficiais antes da participação.",
    serviceRegions: ["Curitiba/PR", "Campinas/SP", "Guapimirim/RJ", "Brasília/DF"],
    footerDisclaimer:
      "O site não recebe pagamento. Antes de qualquer lance, proposta ou arrematação, confirme edital, comissão, visitação, documentação e retirada somente pelos canais oficiais.",
    primaryContactChannelId: "contact-whatsapp-institucional",
    seo: makeSeo({
        title: "Kron Leilões | Oportunidades de leilão",
        description:
          "Catálogo público, área do comprador, acompanhamento e pré-lance online com atendimento oficial.",
      canonicalPath: "/",
        ogImage: "/media/brand/banner-kronberg.png",
      keywords: [
        "leilões",
        "oportunidades de leilão",
        "pré-lance online",
        "cadastro de interessados",
        "atendimento comercial",
        "lotes",
      ],
    }),
  },
  contactChannels: [
    {
      id: "contact-whatsapp-institucional",
      slug: "whatsapp-atendimento",
      kind: "whatsapp",
      label: "WhatsApp de atendimento",
      value: primaryWhatsAppNumber,
      displayValue: "+55 16 99654-0954",
      href: `https://wa.me/${primaryWhatsAppNumber}`,
      description:
        "Canal principal para solicitar edital, confirmar lote, praça, visitação e falar com a equipe.",
      isPrimary: true,
    },
    {
      id: "contact-phone-comercial",
      slug: "telefone-comercial",
      kind: "phone",
      label: "Telefone comercial",
      value: "551635000954",
      displayValue: "(16) 3500-0954",
      href: "tel:+551635000954",
      description:
        "Central comercial para triagem, retorno e direcionamento do atendimento.",
    },
    {
      id: "contact-email-atendimento",
      slug: "email-atendimento",
      kind: "email",
      label: "E-mail de atendimento",
      value: "atendimento@kronleiloes.com.br",
      displayValue: "atendimento@kronleiloes.com.br",
      href: "mailto:atendimento@kronleiloes.com.br",
      description:
        "Canal para envio de contexto, documentos complementares e confirmações formais.",
    },
  ],
  ctas: [
    {
      id: "cta-falar-whatsapp",
      slug: "falar-whatsapp",
      actionType: "contact",
      title: "Atendimento comercial e documental",
      label: "Falar com atendimento",
      description:
        "Fale com a equipe para pedir edital, confirmar lote, comissão, visitação, pagamento ou retirada.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero falar com a equipe da Kron Leilões para confirmar edital e condições de um lote ou evento.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-ir-contato",
      slug: "ir-contato",
      actionType: "navigate",
      title: "Abrir canais de atendimento",
      label: "Ir para contato",
      description: "Veja canais, horários, contexto inicial e motivos de contato.",
      href: "/contato",
    },
    {
      id: "cta-ir-como-participar",
      slug: "ir-como-participar",
      actionType: "navigate",
      title: "Ver passo a passo do comprador",
      label: "Como participar",
      description:
        "Veja o fluxo para edital, cadastro, comissão, pagamento, arrematação e retirada.",
      href: "/como-participar",
    },
    {
      id: "cta-ir-faq",
      slug: "ir-faq",
      actionType: "navigate",
      title: "Abrir perguntas frequentes",
      label: "Ler FAQ",
      description:
        "Consulte respostas objetivas sobre edital, cadastro, visitação, pagamento, retirada e atendimento.",
      href: "/faq",
    },
    {
      id: "cta-solicitar-edital-geral",
      slug: "solicitar-edital-geral",
      actionType: "contact",
      title: "Solicitar edital do evento ou do lote",
      label: "Solicitar edital",
      description:
        "Peça o edital com regras de participação, comissão, pagamento, visitação e retirada antes de avançar.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero solicitar o edital e as regras aplicáveis a um lote ou evento da Kron Leilões.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-validar-lote",
      slug: "validar-lote",
      actionType: "contact",
      title: "Confirmar situação do lote",
      label: "Consultar lote",
      description:
        "Confirme disponibilidade, praça, visitação, documentação e retirada de um lote específico.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero confirmar a situação e as condições de um lote específico.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-negociacao-assistida",
      slug: "negociacao-assistida",
      actionType: "contact",
      title: "Atendimento para mais de um lote",
      label: "Consultar vários lotes",
      description:
        "Indicado para quem vai comparar ativos ou alinhar documentação, pagamento e retirada de mais de um lote.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero consultar mais de um lote e alinhar a análise em um único atendimento.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-evento-premium",
      slug: "doc-evento-premium",
      actionType: "request-document",
      title: "Solicitar edital do evento",
      label: "Pedir edital",
      description:
        "Receba o edital deste evento com regras de participação, comissão, pagamento, visitação e retirada.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero solicitar o edital do evento Veículos leves e utilitários.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-evento-frotas",
      slug: "doc-evento-frotas",
      actionType: "request-document",
      title: "Consultar este evento",
      label: "Consultar evento",
      description:
        "Use o atendimento para confirmar edital, regras da praça, pagamento e retirada deste evento.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero consultar o evento Pick-ups, frotas e logística.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-evento-tecnico",
      slug: "doc-evento-tecnico",
      actionType: "request-document",
      title: "Pedir orientação do evento",
      label: "Pedir orientação",
      description:
        "Indicado para validar documentação, visitação, logística e retirada antes de participar.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero pedir orientação do evento Motos e máquinas.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-amarok",
      slug: "doc-amarok",
      actionType: "request-document",
      title: "Consultar este lote",
      label: "Consultar lote",
      description:
        "Confirme edital, disponibilidade, documentação, visitação e regras de retirada deste lote.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero consultar o lote Volkswagen Amarok Extreme CD 3.0 4x4 e receber o edital aplicável.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-civic",
      slug: "doc-civic",
      actionType: "request-document",
      title: "Pedir ficha deste lote",
      label: "Pedir ficha",
      description:
        "Use este canal para pedir ficha, edital, situação documental e confirmação da disponibilidade.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero pedir a ficha e o edital do lote Honda Civic Touring 1.5 Turbo.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-toro",
      slug: "doc-toro",
      actionType: "request-document",
      title: "Pedir edital deste lote",
      label: "Pedir edital",
      description:
        "Canal indicado para alinhar documentação, visitação, prazo de retirada e regras do evento.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero pedir o edital do lote Fiat Toro Endurance 1.8 Flex.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-hilux",
      slug: "doc-hilux",
      actionType: "request-document",
      title: "Confirmar condições deste lote",
      label: "Confirmar condições",
      description:
        "Receba orientação sobre edital, disponibilidade, visitação, pagamento e próximos passos deste lote.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero confirmar as condições do lote Toyota Hilux CD SRV 2.8 4x4.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-factor",
      slug: "doc-factor",
      actionType: "request-document",
      title: "Consultar este lote",
      label: "Consultar lote",
      description:
        "Peça confirmação de disponibilidade, documentação aplicável, forma de participação e retirada antes de prosseguir.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero consultar o lote Yamaha Factor 125i ED.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
    {
      id: "cta-doc-trator",
      slug: "doc-trator",
      actionType: "request-document",
      title: "Pedir ficha deste equipamento",
      label: "Pedir ficha",
      description:
        "O atendimento confirma disponibilidade, regras do evento, logística, documentação e retirada antes de qualquer avanço.",
      href: buildWhatsAppLink(
        primaryWhatsAppNumber,
        "Olá, quero pedir a ficha do lote Trator John Deere 6300.",
      ),
      contactChannelId: "contact-whatsapp-institucional",
    },
  ],
  categories: [
    {
      id: "category-veiculos-leves",
      slug: "veiculos-leves",
      label: "Veículos leves",
      summary:
        "Sedãs, hatches e utilitários esportivos com apresentação organizada por lote.",
      scope:
        "Perfil indicado para uso particular, frota executiva e renovação de ativos.",
      tags: ["automotivo", "veiculos", "uso-particular"],
      seo: makeSeo({
        title: "Veículos leves",
        description:
          "Categoria com sedãs, hatches e utilitários esportivos disponíveis para consulta.",
        canonicalPath: "/",
      }),
    },
    {
      id: "category-pickups-utilitarios",
      slug: "pick-ups-e-utilitarios",
      label: "Pick-ups e utilitários",
      summary:
        "Lotes com apelo operacional, agronegócio, obras, logística e transporte leve.",
      scope:
        "Ideal para compradores que precisam validar estado, praça e documentação.",
      tags: ["pickup", "frota", "operacional"],
      seo: makeSeo({
        title: "Pick-ups e utilitários",
        description:
          "Categoria com pick-ups e utilitários voltados a uso operacional, frota e logística.",
        canonicalPath: "/",
      }),
    },
    {
      id: "category-motocicletas",
      slug: "motocicletas",
      label: "Motocicletas",
      summary:
        "Motos urbanas e de trabalho para quem busca agilidade em compras assistidas.",
      scope:
        "Fluxo focado em confirmação de disponibilidade e regras antes da proposta.",
      tags: ["motos", "mobilidade"],
      seo: makeSeo({
        title: "Motocicletas",
        description:
          "Categoria com motocicletas para consulta de lote, edital e documentação.",
        canonicalPath: "/",
      }),
    },
    {
      id: "category-maquinas-equipamentos",
      slug: "maquinas-equipamentos",
      label: "Máquinas e equipamentos",
      summary:
        "Ativos agrícolas e de apoio operacional com documentação e retirada sob consulta.",
      scope:
        "Categoria pensada para negociações com diligência técnica e logística definida.",
      tags: ["maquinas", "equipamentos", "agricola"],
      seo: makeSeo({
        title: "Máquinas e equipamentos",
        description:
          "Categoria com ativos técnicos que exigem análise de documentação, logística e retirada.",
        canonicalPath: "/",
      }),
    },
  ],
  documents: [
    {
      id: "document-evento-premium-edital",
      slug: "evento-premium-edital",
      title: "Solicitar edital e regras deste evento",
      summary:
        "Receba edital com regras de participação, comissão, pagamento, visitação e próximos passos deste evento.",
      documentType: "edital",
      accessMode: "request",
      ctaId: "cta-doc-evento-premium",
      relatedEntityIds: ["event-veiculos-premium"],
    },
    {
      id: "document-evento-frotas-orientacao",
      slug: "evento-frotas-orientacao",
      title: "Solicitar edital e orientações do evento",
      summary:
        "Converse com a equipe para receber edital, condições operacionais, forma de pagamento e informações dos lotes deste evento.",
      documentType: "orientacao",
      accessMode: "request",
      ctaId: "cta-doc-evento-frotas",
      relatedEntityIds: ["event-operacao-frotas"],
    },
    {
      id: "document-evento-tecnico-orientacao",
      slug: "evento-tecnico-orientacao",
      title: "Solicitar documentação e orientação deste evento",
      summary:
        "Use o atendimento da equipe para validar disponibilidade, documentação, logística e próximos passos antes da proposta.",
      documentType: "orientacao",
      accessMode: "request",
      ctaId: "cta-doc-evento-tecnico",
      relatedEntityIds: ["event-motos-maquinas"],
    },
    {
      id: "document-lote-amarok-edital",
      slug: "lote-amarok-edital",
      title: "Solicitar edital e condições deste lote",
      summary:
        "A equipe confirma edital, disponibilidade, visitação, retirada e documentação aplicável antes de qualquer avanço.",
      documentType: "edital",
      accessMode: "request",
      ctaId: "cta-doc-amarok",
      relatedEntityIds: ["lot-amarok-2021"],
    },
    {
      id: "document-lote-civic-ficha",
      slug: "lote-civic-ficha",
      title: "Solicitar ficha consolidada do lote",
      summary:
        "Use este canal para pedir edital, observações do lote, situação documental e confirmação da disponibilidade.",
      documentType: "ficha",
      accessMode: "request",
      ctaId: "cta-doc-civic",
      relatedEntityIds: ["lot-civic-2017"],
    },
    {
      id: "document-lote-toro-edital",
      slug: "lote-toro-edital",
      title: "Solicitar edital operacional do lote",
      summary:
        "Canal indicado para alinhamento de documentação, visitação, prazo de retirada e orientações do evento.",
      documentType: "edital",
      accessMode: "request",
      ctaId: "cta-doc-toro",
      relatedEntityIds: ["lot-toro-2019"],
    },
    {
      id: "document-lote-hilux-orientacao",
      slug: "lote-hilux-orientacao",
      title: "Solicitar documentos e orientação da praça",
      summary:
        "Receba orientação sobre edital, disponibilidade, pagamento e próximos passos para este lote.",
      documentType: "orientacao",
      accessMode: "request",
      ctaId: "cta-doc-hilux",
      relatedEntityIds: ["lot-hilux-2020"],
    },
    {
      id: "document-lote-factor-orientacao",
      slug: "lote-factor-orientacao",
      title: "Solicitar orientação do lote",
      summary:
        "Peça confirmação de disponibilidade, documentação aplicável, forma de participação e próximos passos antes de prosseguir.",
      documentType: "orientacao",
      accessMode: "request",
      ctaId: "cta-doc-factor",
      relatedEntityIds: ["lot-factor-2017"],
    },
    {
      id: "document-lote-trator-ficha",
      slug: "lote-trator-ficha",
      title: "Solicitar ficha operacional do equipamento",
      summary:
        "O atendimento confirma disponibilidade, regras do evento, logística, retirada e orientações do lote antes de qualquer avanço.",
      documentType: "ficha",
      accessMode: "request",
      ctaId: "cta-doc-trator",
      relatedEntityIds: ["lot-trator-2004"],
    },
  ],
  faq: [
    {
      id: "faq-global-manifestacao",
      slug: "como-iniciar-um-atendimento",
      question: "Qual é o canal oficial para pedir edital ou tirar dúvida sobre um lote?",
      answer:
        "O canal principal é o WhatsApp de atendimento. Informe o código do lote ou o nome do evento, a praça e o que você precisa confirmar. Com esse contexto, a equipe orienta o edital e o próximo passo.",
      scope: "global",
      tags: ["atendimento", "contato"],
    },
    {
      id: "faq-global-sem-lance",
      slug: "por-que-nao-existe-lance-online",
      question: "O site permite lance ou compra online?",
      answer:
        "Não. O site funciona como catálogo e ponto de contato. Lance, proposta, habilitação, arrematação e formalização seguem as regras do edital e a orientação da equipe.",
      scope: "global",
      tags: ["transparencia", "edital"],
    },
    {
      id: "faq-global-cadastro",
      slug: "preciso-de-cadastro-ou-habilitacao",
      question: "Preciso de cadastro ou habilitação antes de participar?",
      answer:
        "Depende do evento. O edital informa se há cadastro prévio, habilitação, documentos exigidos e prazo para participar. Em caso de dúvida, confirme com a equipe antes de avançar.",
      scope: "global",
      tags: ["cadastro", "habilitacao"],
    },
    {
      id: "faq-global-comissao",
      slug: "onde-vejo-comissao-e-pagamento",
      question: "Onde vejo comissão do leiloeiro, prazo e forma de pagamento?",
      answer:
        "Essas condições constam no edital do evento. Antes de participar, confira percentual de comissão, forma de pagamento, prazo de liquidação, encargos e penalidades aplicáveis.",
      scope: "global",
      tags: ["comissao", "pagamento", "edital"],
    },
    {
      id: "faq-global-retirada",
      slug: "como-funcionam-visitacao-e-retirada",
      question: "Como funcionam visitação e retirada?",
      answer:
        "Cada evento define local, dias, necessidade de agendamento, prazo de retirada e documentos de liberação. A informação final deve ser conferida no edital e confirmada com a equipe.",
      scope: "global",
      tags: ["visitacao", "retirada"],
    },
    {
      id: "faq-global-documentacao",
      slug: "a-documentacao-do-lote-acompanha-o-ativo",
      question: "A documentação do veículo ou ativo acompanha o lote?",
      answer:
        "A documentação varia conforme o lote. Verifique no edital e com a equipe se há CRLV, nota fiscal, termo de entrega, baixa, débitos, restrições ou outra exigência documental.",
      scope: "global",
      tags: ["documentacao", "lote"],
    },
    {
      id: "faq-global-dados-institucionais",
      slug: "como-confirmar-dados-institucionais",
      question: "Como confirmo CNPJ, leiloeiro responsável e matrícula na Junta Comercial?",
      answer:
        "Esses dados devem ser conferidos no edital aplicável ao evento e nos canais oficiais de atendimento antes da participação.",
      scope: "global",
      tags: ["institucional", "cnpj", "leiloeiro", "junta-comercial"],
    },
    {
      id: "faq-global-vistoria",
      slug: "a-vistoria-e-responsabilidade-do-comprador",
      question: "A vistoria do lote é responsabilidade de quem?",
      answer:
        "É responsabilidade do comprador. Fotos e resumo ajudam na triagem, mas a decisão deve considerar edital, visitação quando houver, documentação e avaliação própria do lote.",
      scope: "global",
      tags: ["vistoria", "responsabilidade"],
    },
    {
      id: "faq-global-multiplos-lotes",
      slug: "posso-tratar-varios-lotes",
      question: "Posso tratar vários lotes em um mesmo atendimento?",
      answer:
        "Sim. Se pretende comparar mais de um lote, informe todos os códigos já na primeira mensagem. Isso ajuda a equipe a orientar edital, disponibilidade, pagamento e retirada de forma mais organizada.",
      scope: "global",
      tags: ["atendimento", "multiplos-lotes"],
    },
    {
      id: "faq-global-solicitacoes",
      slug: "o-que-devo-solicitar-antes-de-avancar",
      question: "Quais informações devo solicitar antes de avançar?",
      answer:
        "Peça o edital, confirme a disponibilidade do lote, a praça, a visitação, a comissão, a forma de pagamento, o prazo de retirada e as observações documentais ou operacionais aplicáveis.",
      scope: "global",
      tags: ["documentacao", "diligencia"],
    },
    {
      id: "faq-global-edital",
      slug: "pagina-substitui-edital-oficial",
      question: "A página substitui edital, termo ou documento oficial?",
      answer:
        "Não. A página serve para consulta inicial. O edital e as orientações confirmadas pela equipe continuam sendo a referência final para participação, arrematação, pagamento, retirada e documentação.",
      scope: "global",
      tags: ["edital", "juridico"],
    },
    {
      id: "faq-global-retorno",
      slug: "como-recebo-retorno-depois-do-contato",
      question: "Como recebo retorno depois do contato?",
      answer:
        "O retorno é feito pelo canal usado no primeiro contato, com prioridade para o WhatsApp em horário útil. A equipe informa edital, ficha, disponibilidade e próximos passos conforme o lote ou evento consultado.",
      scope: "global",
      tags: ["contato", "whatsapp"],
    },
    {
      id: "faq-evento-premium-data",
      slug: "evento-premium-data-publica",
      question: "As datas, visitação e encerramento deste evento já estão confirmados?",
      answer:
        "O cronograma aplicável deve ser consultado no edital e confirmado com a equipe. Datas de visitação, encerramento e retirada podem variar conforme o evento e a praça.",
      scope: "event",
      relatedEntityIds: ["event-veiculos-premium"],
    },
    {
      id: "faq-evento-premium-multiplos",
      slug: "evento-premium-multiplos-lotes",
      question: "Posso solicitar um único atendimento para mais de um lote deste evento?",
      answer:
        "Sim. O atendimento pode reunir o interesse em mais de um lote do mesmo evento para facilitar comparação, envio de edital e alinhamento do processo.",
      scope: "event",
      relatedEntityIds: ["event-veiculos-premium"],
    },
    {
      id: "faq-evento-frotas-edital",
      slug: "evento-frotas-pagina-substitui-edital",
      question: "O edital deste evento informa comissão, pagamento e retirada?",
      answer:
        "Sim. Essas condições devem constar no edital ou documento base do evento. A página ajuda na consulta inicial, mas o documento aplicável continua sendo a referência final.",
      scope: "event",
      relatedEntityIds: ["event-operacao-frotas"],
    },
    {
      id: "faq-evento-frotas-pacote",
      slug: "evento-frotas-negociacao-em-pacote",
      question: "Esse evento permite tratar vários lotes no mesmo atendimento?",
      answer:
        "Sim. A operação pode orientar compradores que precisam tratar múltiplos ativos com um mesmo atendimento, principalmente quando pagamento, retirada e logística são avaliados em conjunto.",
      scope: "event",
      relatedEntityIds: ["event-operacao-frotas"],
    },
    {
      id: "faq-evento-tecnico-falar-com-equipe",
      slug: "evento-tecnico-avancar-sem-equipe",
      question: "Para motos e máquinas, é possível avançar sem confirmar logística e documentação?",
      answer:
        "Não é o recomendado. Em ativos técnicos, falar com a equipe é a etapa mais segura para validar documentação, visitação, retirada e condições reais do lote.",
      scope: "event",
      relatedEntityIds: ["event-motos-maquinas"],
    },
    {
      id: "faq-evento-tecnico-instrucoes",
      slug: "evento-tecnico-como-recebo-instrucoes-finais",
      question: "Quando recebo orientações de retirada e documentação?",
      answer:
        "Depois do contato inicial, a equipe informa o documento aplicável, as regras do evento e as orientações operacionais do lote consultado.",
      scope: "event",
      relatedEntityIds: ["event-motos-maquinas"],
    },
    {
      id: "faq-lote-amarok-disputa",
      slug: "lote-amarok-disputa-nesta-pagina",
      question: "Este lote está disponível para lance ou proposta nesta página?",
      answer:
        "Não. Esta página serve para consulta inicial. A forma de participação e a situação atual do lote são confirmadas pela equipe e pelo edital aplicável.",
      scope: "lot",
      relatedEntityIds: ["lot-amarok-2021"],
    },
    {
      id: "faq-lote-amarok-documentacao",
      slug: "lote-amarok-documentacao-e-retirada",
      question: "O que preciso conferir antes de tratar retirada deste lote?",
      answer:
        "Confirme edital, disponibilidade, visitação, documentos aplicáveis, prazo de retirada e regras da praça antes de qualquer pagamento ou proposta.",
      scope: "lot",
      relatedEntityIds: ["lot-amarok-2021"],
    },
    {
      id: "faq-lote-civic-valor",
      slug: "lote-civic-valor-vinculante",
      question: "O valor mostrado no site basta para fechar negócio?",
      answer:
        "Não. A confirmação comercial depende das condições vigentes do lote e do edital do evento, incluindo comissão, forma de pagamento e demais encargos.",
      scope: "lot",
      relatedEntityIds: ["lot-civic-2017"],
    },
    {
      id: "faq-lote-civic-fotos",
      slug: "lote-civic-mais-fotos",
      question: "As fotos substituem visitação ou vistoria?",
      answer:
        "Não. As imagens ajudam na consulta inicial, mas não substituem análise documental, vistoria e demais verificações recomendadas antes de participar.",
      scope: "lot",
      relatedEntityIds: ["lot-civic-2017"],
    },
    {
      id: "faq-lote-toro-compra",
      slug: "lote-toro-compra-imediata",
      question: "Este lote pode ser tratado como compra imediata?",
      answer:
        "Não sem confirmação. O enquadramento final do lote, a forma de participação e as condições de pagamento dependem do edital e do atendimento.",
      scope: "lot",
      relatedEntityIds: ["lot-toro-2019"],
    },
    {
      id: "faq-lote-toro-disponibilidade",
      slug: "lote-toro-disponibilidade",
      question: "Como saber se o lote permanece disponível?",
      answer:
        "A disponibilidade precisa ser confirmada pela equipe antes de qualquer avanço, principalmente em eventos com procura mais alta ou atualização de catálogo.",
      scope: "lot",
      relatedEntityIds: ["lot-toro-2019"],
    },
    {
      id: "faq-lote-hilux-agenda",
      slug: "lote-hilux-agenda-publica",
      question: "Há visitação ou agenda pública para este lote?",
      answer:
        "A visitação e a agenda aplicável devem ser consultadas diretamente com a operação e no edital do evento.",
      scope: "lot",
      relatedEntityIds: ["lot-hilux-2020"],
    },
    {
      id: "faq-lote-hilux-agrupamento",
      slug: "lote-hilux-agrupar-lotes",
      question: "Posso agrupar mais de um lote no atendimento?",
      answer:
        "Sim. Esse fluxo é indicado para compradores que querem avaliar vários ativos na mesma consulta e alinhar pagamento, retirada e documentação em conjunto.",
      scope: "lot",
      relatedEntityIds: ["lot-hilux-2020"],
    },
    {
      id: "faq-lote-factor-edital-whatsapp",
      slug: "lote-factor-edital-whatsapp",
      question: "Consigo receber o edital pelo WhatsApp?",
      answer:
        "Sim. O canal principal é o WhatsApp. A equipe informa se o edital ou documento aplicável já está disponível para envio.",
      scope: "lot",
      relatedEntityIds: ["lot-factor-2017"],
    },
    {
      id: "faq-lote-factor-reserva",
      slug: "lote-factor-manifestacao-reserva",
      question: "Manifestar interesse já garante reserva do lote?",
      answer:
        "Não. O contato apenas inicia o atendimento e a validação do lote. Reserva, arrematação ou fechamento dependem das regras do evento.",
      scope: "lot",
      relatedEntityIds: ["lot-factor-2017"],
    },
    {
      id: "faq-lote-trator-logistica",
      slug: "lote-trator-logistica-na-pagina",
      question: "Logística e retirada já estão definidas nesta página?",
      answer:
        "Não de forma conclusiva. Para máquinas e equipamentos, a orientação é tratar logística, documentos de liberação e retirada diretamente com a equipe.",
      scope: "lot",
      relatedEntityIds: ["lot-trator-2004"],
    },
    {
      id: "faq-lote-trator-diligencia",
      slug: "lote-trator-exige-diligencia",
      question: "Este ativo exige vistoria e análise prévia?",
      answer:
        "Sim. Esse é o fluxo recomendado para categorias técnicas como máquinas e equipamentos, principalmente quando há logística especial, conferência documental e retirada programada.",
      scope: "lot",
      relatedEntityIds: ["lot-trator-2004"],
    },
  ],
  pages: [
    {
      id: "page-sobre",
      slug: "sobre",
      eyebrow: "Quem somos",
      title: "Leilão de veículos com catálogo organizado e atendimento humano.",
      description:
        "A Kron Leilões trabalha com eventos e lotes de veículos, publica informações para consulta inicial e orienta o comprador no que precisa ser confirmado antes de participar.",
      sections: [
        {
          id: "section-sobre-resolve",
          title: "O que a Kron Leilões faz",
          body: [
            "A operação reúne eventos, lotes e documentos de apoio para compradores que precisam analisar veículos, confirmar regras e decidir com informação prática.",
            "Cada página mostra o código do lote, a praça, o status, o documento base e o canal correto para solicitar edital, ficha ou orientação.",
          ],
        },
        {
          id: "section-sobre-pilares",
          title: "Como a base institucional é apresentada",
          body: [
            "A Kron Leilões mantém canais oficiais, endereço, razão social e orientação documental em áreas públicas para facilitar a conferência do comprador.",
          ],
          bullets: [
            "Atendimento por WhatsApp, telefone e e-mail em dias úteis.",
            "Dados cadastrais e regulatórios conferidos no edital e no atendimento oficial.",
            "Solicitação de edital, ficha do lote e orientação da praça pelo canal oficial.",
            "Consulta de um lote ou de vários ativos no mesmo atendimento.",
            "Informações comerciais e operacionais tratadas com base no edital aplicável.",
          ],
        },
        {
          id: "section-sobre-escalabilidade",
          title: "O que o comprador precisa confirmar",
          body: [
            "Disponibilidade do lote, documentação, habilitação, comissão, forma de pagamento, visitação e retirada dependem do edital do evento e da confirmação da equipe.",
            "A decisão de participar deve considerar a leitura do edital, a vistoria quando houver visitação e a análise própria do comprador.",
          ],
        },
      ],
      seo: makeSeo({
        title: "Sobre",
        description:
          "Conheça a Kron Leilões e a forma como o atendimento e os eventos são organizados.",
        canonicalPath: "/sobre",
      }),
    },
    {
      id: "page-como-participar",
      slug: "como-participar",
      eyebrow: "Passo a passo do comprador",
      title: "Como participar com regra clara, sem pular etapa importante.",
      description:
        "O fluxo começa na leitura do lote e do edital, passa pela confirmação da forma de participação e termina em pagamento, comissão e retirada conforme o evento.",
      sections: [
        {
          id: "section-como-participar-antes",
          title: "1. Consulte o lote e o evento",
          body: [
            "Antes de qualquer lance ou proposta, confira o código do lote, a praça, o status, as fotos e as observações públicas disponíveis na página.",
            "Se o lote fizer sentido para você, avance para o edital do evento e para a confirmação das condições comerciais.",
          ],
          bullets: [
            "Conferir código do lote, praça, status e categoria do ativo.",
            "Anotar o evento relacionado antes de falar com a equipe.",
            "Separar dúvidas sobre documentação, visitação e retirada.",
            "Evitar qualquer decisão antes da leitura do edital.",
          ],
        },
        {
          id: "section-como-participar-durante",
          title: "2. Peça o edital e confirme a habilitação",
          body: [
            "Com o edital em mãos, confirme se o evento exige cadastro, habilitação prévia, caução, agendamento de visitação ou envio de documentos.",
            "É nessa etapa que o comprador também deve validar comissão, forma de pagamento, cronograma e regras específicas da praça.",
          ],
        },
        {
          id: "section-como-participar-depois",
          title: "3. Siga o pós-arrematação conforme o edital",
          body: [
            "Depois da arrematação ou da confirmação do lote, o comprador deve seguir o edital para pagamento, comissão, prazo de retirada, documentos de liberação e demais obrigações do evento.",
            "A retirada só deve ser tratada depois da confirmação das exigências documentais e operacionais da praça.",
          ],
        },
      ],
      primaryCtaId: "cta-falar-whatsapp",
      secondaryCtaId: "cta-ir-contato",
      seo: makeSeo({
        title: "Como participar",
        description:
          "Veja o fluxo recomendado para avaliação de lotes, solicitação de documentos e contato com a equipe.",
        canonicalPath: "/como-participar",
      }),
    },
    {
      id: "page-privacidade",
      slug: "privacidade",
      eyebrow: "Privacidade",
      title: "Como tratamos dados de contato e navegação.",
      description:
        "Esta página resume como a Kron Leilões trata dados de navegação e dados compartilhados pelo usuário ao iniciar contato com a equipe.",
      sections: [
        {
          id: "section-privacidade-dados",
          title: "Dados coletados",
          body: [
            "Ao preencher formulários ou iniciar contato, o usuário pode informar nome, telefone, e-mail, cidade, lote, evento e o conteúdo da solicitação.",
            "Também podem existir registros técnicos de acesso, como IP, data, hora e navegador, usados para segurança, diagnóstico e estabilidade da infraestrutura.",
          ],
        },
        {
          id: "section-privacidade-uso",
          title: "Uso dos dados",
          body: [
            "Os dados são tratados para responder solicitações, organizar o atendimento comercial e prestar esclarecimentos sobre lotes, eventos, documentação, pagamento e retirada.",
            "O site não processa pagamento e não solicita dados bancários do usuário pela interface pública.",
          ],
          bullets: [
            "Responder pedidos de atendimento, edital e documentação.",
            "Registrar o contexto do lote ou do evento consultado.",
            "Preservar segurança operacional e histórico mínimo do atendimento.",
          ],
        },
        {
          id: "section-privacidade-terceiros",
          title: "Compartilhamento e canais de terceiros",
          body: [
            "Ao optar por iniciar contato por WhatsApp, o usuário também se sujeita às políticas da plataforma responsável pelo canal.",
            "A recomendação é compartilhar apenas os dados necessários para o atendimento e evitar o envio de documentos além do que for solicitado pela equipe.",
          ],
        },
      ],
      seo: makeSeo({
        title: "Privacidade",
        description:
          "Política de privacidade da Kron Leilões para dados de navegação e contato.",
        canonicalPath: "/privacidade",
      }),
    },
    {
      id: "page-cookies",
      slug: "cookies",
      eyebrow: "Cookies",
      title: "Como usamos cookies e recursos técnicos.",
      description:
        "A operação prioriza recursos técnicos essenciais para navegação, segurança e estabilidade da aplicação.",
      sections: [
        {
          id: "section-cookies-essenciais",
          title: "Cookies essenciais",
          body: [
            "O site pode utilizar cookies e recursos equivalentes indispensáveis ao funcionamento da aplicação, à segurança da navegação e à entrega correta das páginas.",
            "Esses recursos não são usados para fechar negócio, gerar lance automático ou substituir o atendimento da equipe.",
          ],
        },
        {
          id: "section-cookies-evolucao",
          title: "Medição e atualizações futuras",
          body: [
            "Se ferramentas de medição forem adotadas em versões futuras, elas deverão ter finalidade de performance, navegação e análise de contatos iniciados.",
            "Sempre que houver mudança material nessa camada, esta página será atualizada para refletir o uso real desses recursos.",
          ],
        },
      ],
      seo: makeSeo({
        title: "Cookies",
        description: "Política de cookies da Kron Leilões para o uso de recursos técnicos essenciais.",
        canonicalPath: "/cookies",
      }),
    },
    {
      id: "page-documentos",
      slug: "documentos",
      eyebrow: "Editais e documentos",
      title: "Edital, ficha do lote e orientação do evento.",
      description:
        "Os documentos variam por evento e por lote. Esta área explica o papel do edital, o que costuma constar em cada material e como solicitar o documento certo.",
      sections: [
        {
          id: "section-documentos-funcionamento",
          title: "O papel do edital",
          body: [
            "O edital é o documento base do evento. É nele que o comprador deve conferir regras de participação, comissão, pagamento, visitação, retirada, documentação e demais condições aplicáveis.",
            "Cada evento e cada lote pode ter material complementar. Por isso, o site distribui pontos de solicitação ao longo das páginas, sempre vinculados ao canal oficial.",
          ],
        },
        {
          id: "section-documentos-tipos",
          title: "O que o documento costuma informar",
          body: [
            "A operação pode disponibilizar documentos diferentes conforme o evento ou o lote consultado. Os pontos abaixo são os mais comuns neste tipo de operação.",
          ],
          bullets: [
            "Regras de participação, cadastro, habilitação e prazos.",
            "Comissão do leiloeiro, forma de pagamento e vencimentos.",
            "Visitação, local da praça, retirada e documentos de liberação.",
            "Ficha do lote, observações complementares e situação documental.",
          ],
        },
        {
          id: "section-documentos-boas-praticas",
          title: "Como pedir o documento certo",
          body: [
            "Ao solicitar um documento, informe o lote ou evento de interesse, a praça indicada na página e se a consulta envolve um único ativo ou vários lotes.",
            "Se a dúvida for sobre comissão, pagamento, retirada, visitação ou documentação, deixe isso claro já no primeiro contato para receber o material correto.",
            "Quando um documento não estiver disponível para acesso direto, solicite a versão aplicável pelo canal oficial antes de avançar.",
          ],
        },
      ],
      relatedFaqIds: ["faq-global-solicitacoes", "faq-global-edital"],
      primaryCtaId: "cta-solicitar-edital-geral",
      secondaryCtaId: "cta-ir-contato",
      seo: makeSeo({
        title: "Documentos",
        description:
          "Área de documentos da Kron Leilões com orientações sobre edital, fichas e solicitação de documentos.",
        canonicalPath: "/documentos",
      }),
    },
    {
      id: "page-termos",
      slug: "termos-de-uso",
      eyebrow: "Termos de uso",
      title: "Termos de uso do site e regras da consulta inicial.",
      description:
        "O site apresenta conteúdo informativo sobre lotes, eventos e contato inicial. Ele não substitui edital, contrato nem confirmação operacional da equipe.",
      sections: [
        {
          id: "section-termos-natureza",
          title: "Natureza do site",
          body: [
            "O site organiza informações de eventos e lotes para consulta inicial do comprador. A presença de um lote ou evento na página não constitui, por si só, garantia de disponibilidade, adjudicação ou direito adquirido.",
          ],
        },
        {
          id: "section-termos-edital",
          title: "Papel do edital",
          body: [
            "O edital ou documento base do evento prevalece sobre qualquer resumo publicado no site. Comissão, pagamento, visitação, retirada, documentação do lote e demais condições aplicáveis devem ser conferidos nesse material.",
          ],
        },
        {
          id: "section-termos-responsabilidades",
          title: "Responsabilidades do interessado",
          body: [
            "Cabe ao interessado solicitar confirmação de disponibilidade, edital, documentação e regras aplicáveis antes de qualquer decisão. O uso do site deve respeitar a boa-fé e a finalidade de contato legítimo com a operação.",
          ],
          bullets: [
            "Não presumir que a página substitui documento oficial.",
            "Não interpretar contato ou pedido de atendimento como reserva automática.",
            "Conferir comissão, pagamento, visitação e retirada antes de participar.",
            "Assumir a responsabilidade por análise, vistoria e leitura do edital.",
          ],
        },
        {
          id: "section-termos-financeiro",
          title: "Pagamento, comissão e retirada",
          body: [
            "Condições financeiras, percentuais de comissão, prazos, penalidades, documentos de liberação e retirada são definidos por evento. O site não deve ser lido como confirmação automática dessas condições.",
            "Nenhum pagamento deve ser feito com base apenas no conteúdo da página, sem conferência do edital e validação pelos canais oficiais.",
          ],
        },
      ],
      seo: makeSeo({
        title: "Termos de uso",
        description:
          "Termos de uso da Kron Leilões para o catálogo online e o atendimento da equipe.",
        canonicalPath: "/termos-de-uso",
      }),
    },
  ],
  auctionEvents: [
    {
      id: "event-veiculos-premium",
      slug: "veiculos-leves-e-utilitarios",
      eyebrow: "Leilão de veículos",
      title: "Veículos leves e utilitários",
      summary:
        "Evento com veículos leves, utilitários e picapes publicado para consulta de lotes e solicitação de edital antes da participação.",
      intro:
        "Este evento reúne lotes com fotos, código, praça e documento base para o comprador que precisa confirmar regras, documentação e forma de participação.",
      coverage: "Curitiba/PR e lotes vinculados à mesma praça",
      statusKey: "catalogo-em-consulta",
      statusLabel: "Catálogo aberto",
      journeyModeKey: "manifestacao-assistida",
      journeyModeLabel: "Consulta por lote com atendimento da equipe",
      note:
        "Cronograma, habilitação, comissão, pagamento, visitação e retirada constam no edital do evento.",
      heroImage: {
        id: "media-evento-premium-hero",
        url: "/media/lots/amarok-extreme/amarok.jpg",
        alt: "Volkswagen Amarok representando o evento de veículos leves e utilitários",
      },
      highlightBullets: [
        "Lotes com código, praça e fotos para triagem inicial.",
        "Edital e ficha sob solicitação no canal oficial.",
        "Indicado para compra individual ou comparação entre lotes do mesmo evento.",
      ],
      categoryIds: ["category-veiculos-leves", "category-pickups-utilitarios"],
      documentIds: ["document-evento-premium-edital"],
      faqIds: ["faq-evento-premium-data", "faq-evento-premium-multiplos"],
      lotIds: ["lot-amarok-2021", "lot-civic-2017"],
      primaryCtaId: "cta-doc-evento-premium",
      schedule: {
        timezone: "America/Sao_Paulo",
        startsAt: null,
        endsAt: null,
        isToBeConfirmed: true,
      },
      seo: makeSeo({
        title: "Veículos leves e utilitários",
        description:
          "Evento com veículos leves, utilitários e picapes para consulta de lotes, documentos e atendimento comercial.",
        canonicalPath: "/eventos/veiculos-leves-e-utilitarios",
        ogImage: "/media/lots/amarok-extreme/amarok.jpg",
      }),
    },
    {
      id: "event-operacao-frotas",
      slug: "pickups-frotas-e-logistica",
      eyebrow: "Frotas e utilitários",
      title: "Pick-ups, frotas e logística",
      summary:
        "Evento com pick-ups e utilitários para quem precisa analisar lotes de operação, frota e uso comercial.",
      intro:
        "O evento reúne lotes com perfil de frota e operação, com foco em leitura objetiva do lote, alinhamento documental e consulta de um ou mais ativos.",
      coverage: "Curitiba/PR, Campinas/SP e lotes vinculados às praças do evento",
      statusKey: "consulta-qualificada",
      statusLabel: "Consulta por lote ou pacote",
      journeyModeKey: "pacote-ou-lote",
      journeyModeLabel: "Atendimento por lote ou por grupo de lotes",
      note:
        "Disponibilidade, regras da praça, pagamento, comissão e cronograma de retirada devem ser confirmados no edital e no atendimento.",
      heroImage: {
        id: "media-evento-frotas-hero",
        url: "/media/lots/hilux-srv/toyota.png",
        alt: "Toyota Hilux representando o evento de pick-ups, frotas e logística",
      },
      highlightBullets: [
        "Indicado para compras por lote ou por grupo de lotes.",
        "Priorização de praça, documentação, pagamento e logística de retirada.",
        "Fluxo adequado para empresas e compradores com processo formal.",
      ],
      categoryIds: ["category-pickups-utilitarios"],
      documentIds: ["document-evento-frotas-orientacao"],
      faqIds: ["faq-evento-frotas-edital", "faq-evento-frotas-pacote"],
      lotIds: ["lot-toro-2019", "lot-hilux-2020"],
      primaryCtaId: "cta-doc-evento-frotas",
      schedule: {
        timezone: "America/Sao_Paulo",
        startsAt: null,
        endsAt: null,
        isToBeConfirmed: true,
      },
      seo: makeSeo({
        title: "Pick-ups, frotas e logística",
        description:
          "Evento com pick-ups e utilitários voltados a frota, logística, documentação e retirada.",
        canonicalPath: "/eventos/pickups-frotas-e-logistica",
        ogImage: "/media/lots/hilux-srv/toyota.png",
      }),
    },
    {
      id: "event-motos-maquinas",
      slug: "motos-e-maquinas",
      eyebrow: "Ativos técnicos",
      title: "Motos e máquinas",
      summary:
        "Evento com motos e máquinas para consulta de lote, documentação, visitação e retirada.",
      intro:
        "Este evento reúne ativos que normalmente exigem conferência de praça, logística, documentação e orientação direta antes de participar.",
      coverage: "Guapimirim/RJ, Brasília/DF e atendimento nacional",
      statusKey: "catalogo-tecnico",
      statusLabel: "Consulta técnica",
      journeyModeKey: "atendimento-consultivo",
      journeyModeLabel: "Atendimento com apoio operacional",
      note:
        "Para motos e máquinas, edital, visitação, retirada e exigências documentais devem ser checados antes de qualquer proposta.",
      heroImage: {
        id: "media-evento-tecnico-hero",
        url: "/media/lots/john-deere-6300/trator.png",
        alt: "Trator John Deere representando o evento de motos e máquinas",
      },
      highlightBullets: [
        "Consulta voltada a quem precisa confirmar documento, praça e logística.",
        "Atendimento útil para ativos técnicos ou com retirada mais sensível.",
        "O edital indica as regras do evento e a equipe apoia a leitura inicial.",
      ],
      categoryIds: ["category-motocicletas", "category-maquinas-equipamentos"],
      documentIds: ["document-evento-tecnico-orientacao"],
      faqIds: [
        "faq-evento-tecnico-falar-com-equipe",
        "faq-evento-tecnico-instrucoes",
      ],
      lotIds: ["lot-factor-2017", "lot-trator-2004"],
      primaryCtaId: "cta-doc-evento-tecnico",
      schedule: {
        timezone: "America/Sao_Paulo",
        startsAt: null,
        endsAt: null,
        isToBeConfirmed: true,
      },
      seo: makeSeo({
        title: "Motos e máquinas",
        description:
          "Evento com motos e máquinas para consulta de lotes, documentação e diligência operacional.",
        canonicalPath: "/eventos/motos-e-maquinas",
        ogImage: "/media/lots/john-deere-6300/trator.png",
      }),
    },
  ],
  lots: [
    {
      id: "lot-amarok-2021",
      slug: "amarok-extreme-cd-3-0-2021",
      title: "Volkswagen Amarok Extreme CD 3.0 4x4",
      subtitle:
        "Picape diesel 4x4 com praça informada, fotos do lote e consulta de edital pelo atendimento.",
      referenceCode: "Lote #1428",
      eventId: "event-veiculos-premium",
      categoryId: "category-pickups-utilitarios",
      segmentLabel: "Pick-up diesel",
      location: {
        city: "Curitiba",
        state: "PR",
        display: "Curitiba/PR",
      },
      statusKey: "sob-consulta",
      statusLabel: "Sob consulta",
      shortDescription:
        "Picape 4x4 apresentada com fotos e dados principais para análise inicial. Antes de participar, confirme edital, documentação, comissão, pagamento e retirada com a equipe.",
      longDescription: [
        "A página concentra galeria, dados técnicos e informações básicas para leitura inicial do lote.",
        "O próximo passo é solicitar o edital e validar a situação documental, a forma de participação e a retirada na praça informada.",
      ],
      gallery: [
        {
          id: "media-amarok-1",
          url: "/media/lots/amarok-extreme/amarok.jpg",
          alt: "Volkswagen Amarok Extreme em vista frontal lateral",
        },
        {
          id: "media-amarok-2",
          url: "/media/lots/amarok-extreme/amarok2.jpg",
          alt: "Volkswagen Amarok Extreme em vista lateral",
        },
        {
          id: "media-amarok-3",
          url: "/media/lots/amarok-extreme/amarok3.jpg",
          alt: "Volkswagen Amarok Extreme em vista traseira lateral",
        },
        {
          id: "media-amarok-4",
          url: "/media/lots/amarok-extreme/amarok4.jpg",
          alt: "Volkswagen Amarok Extreme com detalhe adicional do catálogo",
        },
      ],
      documentIds: ["document-lote-amarok-edital"],
      faqIds: ["faq-lote-amarok-disputa", "faq-lote-amarok-documentacao"],
      technicalMetadata: {
        yearModel: "2021",
        usageMetric: "31.000 km",
        fuel: "Diesel",
        transmission: "Automática",
      },
      observations: {
        sourceNote:
          "Dados consolidados a partir da publicação do lote e sujeitos a atualização operacional.",
        commercialDisclaimer:
          "Edital, disponibilidade, documentação, comissão, pagamento, visitação e retirada devem ser confirmados com a equipe antes de qualquer decisão.",
        operationalNotes: [
          "Modelo Amarok Extreme CD 3.0 com tração 4x4.",
          "Indicação de chave na publicação do lote.",
          "Localização operacional indicada em Curitiba/PR.",
          "Fluxo recomendado: solicitar edital, validar documentação e alinhar retirada.",
        ],
      },
      highlightBullets: [
        "Fotos suficientes para leitura inicial do estado geral.",
        "Praça informada e caminho direto para pedir edital.",
        "Indicado para comprador que precisa confirmar documentação antes de participar.",
      ],
      ctaIds: ["cta-doc-amarok"],
      tags: ["pickup", "diesel", "4x4", "corporativo"],
      seo: makeSeo({
        title: "Volkswagen Amarok Extreme CD 3.0 4x4",
        description:
          "Lote com galeria, dados principais e solicitação de edital para a Amarok Extreme CD 3.0 4x4.",
        canonicalPath: "/lotes/amarok-extreme-cd-3-0-2021",
        ogImage: "/media/lots/amarok-extreme/amarok.jpg",
      }),
    },
    {
      id: "lot-civic-2017",
      slug: "civic-touring-1-5-turbo-2017",
      title: "Honda Civic Touring 1.5 Turbo",
      subtitle:
        "Sedã com fotos, praça informada e orientação para visitação, documentação e retirada.",
      referenceCode: "Lote #1752",
      eventId: "event-veiculos-premium",
      categoryId: "category-veiculos-leves",
      segmentLabel: "Sedã executivo",
      location: {
        city: "Curitiba",
        state: "PR",
        display: "Curitiba/PR",
      },
      statusKey: "sob-consulta",
      statusLabel: "Sob consulta",
      shortDescription:
        "Sedã com material fotográfico detalhado e leitura inicial organizada para quem quer confirmar edital, visitação, documentação e retirada antes de participar.",
      longDescription: [
        "A página reúne fotos, dados principais e referência do lote para consulta inicial.",
        "Antes de avançar, confirme documento aplicável, situação atual do lote e regras de pagamento e retirada.",
      ],
      gallery: [
        {
          id: "media-civic-1",
          url: "/media/lots/civic-touring/civicg10.jpg",
          alt: "Honda Civic Touring em vista frontal",
        },
        {
          id: "media-civic-2",
          url: "/media/lots/civic-touring/civicg10_2.jpg",
          alt: "Honda Civic Touring em vista lateral",
        },
        {
          id: "media-civic-3",
          url: "/media/lots/civic-touring/civicg10_3.jpg",
          alt: "Honda Civic Touring em vista traseira",
        },
        {
          id: "media-civic-4",
          url: "/media/lots/civic-touring/civicg10_4.jpg",
          alt: "Honda Civic Touring com enquadramento adicional do catálogo",
        },
      ],
      documentIds: ["document-lote-civic-ficha"],
      faqIds: ["faq-lote-civic-valor", "faq-lote-civic-fotos"],
      technicalMetadata: {
        yearModel: "2017",
        usageMetric: "22.000 km",
        fuel: "Gasolina",
        transmission: "Automática",
      },
      observations: {
        sourceNote:
          "Dados consolidados a partir da publicação do lote e sujeitos a atualização operacional.",
        commercialDisclaimer:
          "Edital, situação documental, disponibilidade, comissão, pagamento e retirada precisam de confirmação com a equipe.",
        operationalNotes: [
          "Versão Touring 1.5 Turbo descrita na publicação do lote.",
          "Indicação de chave disponível na publicação.",
          "Praça informada em Curitiba/PR.",
          "Recomendado solicitar edital ou ficha do lote antes da participação.",
        ],
      },
      highlightBullets: [
        "Galeria ampla para leitura inicial do veículo.",
        "Bom lote para quem quer verificar documentação e condições da praça.",
        "Atendimento indicado para confirmar visitação, pagamento e retirada.",
      ],
      ctaIds: ["cta-doc-civic"],
      tags: ["seda", "executivo", "gasolina"],
      seo: makeSeo({
        title: "Honda Civic Touring 1.5 Turbo",
        description:
          "Lote do Honda Civic Touring com galeria, contexto e atendimento da equipe.",
        canonicalPath: "/lotes/civic-touring-1-5-turbo-2017",
        ogImage: "/media/lots/civic-touring/civicg10.jpg",
      }),
    },
    {
      id: "lot-toro-2019",
      slug: "fiat-toro-endurance-1-8-2019",
      title: "Fiat Toro Endurance 1.8 Flex",
      subtitle:
        "Pick-up para uso operacional com foco em praça, documentação e retirada.",
      referenceCode: "Lote #1910",
      eventId: "event-operacao-frotas",
      categoryId: "category-pickups-utilitarios",
      segmentLabel: "Pick-up de operação",
      location: {
        city: "Curitiba",
        state: "PR",
        display: "Curitiba/PR",
      },
      statusKey: "sob-consulta",
      statusLabel: "Sob consulta",
      shortDescription:
        "Pick-up com perfil de frota e uso operacional, indicada para quem precisa alinhar documentação, comissão, pagamento e logística de retirada.",
      longDescription: [
        "A página reúne fotos, dados principais e documento base para análise inicial do lote.",
        "Cadastro, forma de participação, pagamento e retirada devem ser confirmados antes de qualquer proposta.",
      ],
      gallery: [
        {
          id: "media-toro-1",
          url: "/media/lots/toro-endurance/toro.jpg",
          alt: "Fiat Toro Endurance em vista frontal lateral",
        },
        {
          id: "media-toro-2",
          url: "/media/lots/toro-endurance/toro2.jpg",
          alt: "Fiat Toro Endurance em vista lateral",
        },
        {
          id: "media-toro-3",
          url: "/media/lots/toro-endurance/toro3.jpg",
          alt: "Fiat Toro Endurance em vista traseira",
        },
        {
          id: "media-toro-4",
          url: "/media/lots/toro-endurance/toro4.jpg",
          alt: "Fiat Toro Endurance com detalhe adicional do catálogo",
        },
      ],
      documentIds: ["document-lote-toro-edital"],
      faqIds: ["faq-lote-toro-compra", "faq-lote-toro-disponibilidade"],
      technicalMetadata: {
        yearModel: "2019",
        usageMetric: "2.300 km",
        fuel: "Flex",
        transmission: "Automática",
      },
      observations: {
        sourceNote:
          "Dados consolidados a partir da publicação do lote e sujeitos a atualização operacional.",
        commercialDisclaimer:
          "Edital, disponibilidade, documentação, comissão, pagamento e retirada precisam ser confirmados no atendimento antes de qualquer avanço.",
        operationalNotes: [
          "Modelo Fiat Toro Endurance 1.8 16V Flex.",
          "Quilometragem informada na publicação como 2.300 km.",
          "Praça operacional indicada em Curitiba/PR.",
          "Próximo passo recomendado: pedir edital e alinhar retirada na praça.",
        ],
      },
      highlightBullets: [
        "Lote útil para renovação de frota ou operação de campo.",
        "Praça e documento base ajudam na avaliação inicial.",
        "Pode ser tratado junto com outros lotes no mesmo atendimento.",
      ],
      ctaIds: ["cta-doc-toro"],
      tags: ["pickup", "frota", "flex"],
      seo: makeSeo({
        title: "Fiat Toro Endurance 1.8 Flex",
        description:
          "Lote da Fiat Toro Endurance com foco em frota, logística e documentação.",
        canonicalPath: "/lotes/fiat-toro-endurance-1-8-2019",
        ogImage: "/media/lots/toro-endurance/toro.jpg",
      }),
    },
    {
      id: "lot-hilux-2020",
      slug: "toyota-hilux-cd-srv-2-8-2020",
      title: "Toyota Hilux CD SRV 2.8 4x4",
      subtitle:
        "Pick-up diesel com foco em frota, agronegócio e conferência formal do lote.",
      referenceCode: "Lote #1007",
      eventId: "event-operacao-frotas",
      categoryId: "category-pickups-utilitarios",
      segmentLabel: "Pick-up diesel",
      location: {
        city: "Campinas",
        state: "SP",
        display: "Campinas/SP",
      },
      statusKey: "sob-consulta",
      statusLabel: "Sob consulta",
      shortDescription:
        "Lote indicado para compradores que precisam validar documentação, comissão, cronograma e retirada antes de participar.",
      longDescription: [
        "A apresentação reúne fotos, dados principais e referências úteis para análise inicial da Hilux.",
        "O atendimento confirma disponibilidade, edital, agenda de visitação e regras de pagamento e retirada.",
      ],
      gallery: [
        {
          id: "media-hilux-1",
          url: "/media/lots/hilux-srv/toyota.png",
          alt: "Toyota Hilux em vista frontal lateral",
        },
        {
          id: "media-hilux-2",
          url: "/media/lots/hilux-srv/toyota2.png",
          alt: "Toyota Hilux em vista lateral",
        },
        {
          id: "media-hilux-3",
          url: "/media/lots/hilux-srv/toyota3.png",
          alt: "Toyota Hilux em vista traseira",
        },
        {
          id: "media-hilux-4",
          url: "/media/lots/hilux-srv/toyota4.png",
          alt: "Toyota Hilux com detalhe adicional do catálogo",
        },
      ],
      documentIds: ["document-lote-hilux-orientacao"],
      faqIds: ["faq-lote-hilux-agenda", "faq-lote-hilux-agrupamento"],
      technicalMetadata: {
        yearModel: "2020",
        usageMetric: "73.000 km",
        fuel: "Diesel",
        transmission: "Automática",
      },
      observations: {
        sourceNote:
          "Dados consolidados a partir da publicação do lote e sujeitos a atualização operacional.",
        commercialDisclaimer:
          "Edital, situação documental, disponibilidade, comissão, pagamento, visitação e retirada dependem de confirmação com a equipe.",
        operationalNotes: [
          "Versão Hilux CD SRV 4x4 2.8 TDI Diesel Automática.",
          "Praça indicada em Campinas/SP.",
          "Material fotográfico suficiente para leitura inicial.",
          "Próximo passo recomendado: solicitar edital e confirmar agenda da praça.",
        ],
      },
      highlightBullets: [
        "Categoria recorrente para operação, campo e frota.",
        "Consulta inicial com foco em documentação e logística.",
        "Atendimento indicado para quem compra um ou mais lotes.",
      ],
      ctaIds: ["cta-doc-hilux"],
      tags: ["pickup", "diesel", "agronegocio"],
      seo: makeSeo({
        title: "Toyota Hilux CD SRV 2.8 4x4",
        description:
          "Lote da Toyota Hilux com foco em frota, agronegócio e atendimento da equipe.",
        canonicalPath: "/lotes/toyota-hilux-cd-srv-2-8-2020",
        ogImage: "/media/lots/hilux-srv/toyota.png",
      }),
    },
    {
      id: "lot-factor-2017",
      slug: "yamaha-factor-125i-2017",
      title: "Yamaha Factor 125i ED",
      subtitle:
        "Motocicleta urbana com consulta direta de lote, edital e disponibilidade.",
      referenceCode: "Lote #1012",
      eventId: "event-motos-maquinas",
      categoryId: "category-motocicletas",
      segmentLabel: "Motocicleta urbana",
      location: {
        city: "Guapimirim",
        state: "RJ",
        display: "Guapimirim/RJ",
      },
      statusKey: "sob-consulta",
      statusLabel: "Sob consulta",
      shortDescription:
        "Lote objetivo para quem quer confirmar documentação, regras do evento e disponibilidade antes de participar.",
      longDescription: [
        "A página reúne fotos, dados básicos e documento de apoio para leitura inicial do lote.",
        "Antes de avançar, confirme edital, situação atual, comissão e retirada com a equipe.",
      ],
      gallery: [
        {
          id: "media-factor-1",
          url: "/media/lots/factor-125i/factor.png",
          alt: "Yamaha Factor 125i em vista principal",
        },
        {
          id: "media-factor-2",
          url: "/media/lots/factor-125i/factor2.png",
          alt: "Yamaha Factor 125i em vista lateral",
        },
        {
          id: "media-factor-3",
          url: "/media/lots/factor-125i/factor3.png",
          alt: "Yamaha Factor 125i com enquadramento adicional do catálogo",
        },
      ],
      documentIds: ["document-lote-factor-orientacao"],
      faqIds: ["faq-lote-factor-edital-whatsapp", "faq-lote-factor-reserva"],
      technicalMetadata: {
        yearModel: "2017",
        usageMetric: "50.000 km",
        fuel: "Gasolina",
      },
      observations: {
        sourceNote:
          "Dados consolidados a partir da publicação do lote e sujeitos a atualização operacional.",
        commercialDisclaimer:
          "A equipe confirma disponibilidade, documentação, comissão, pagamento e retirada antes de qualquer participação.",
        operationalNotes: [
          "Modelo Yamaha 125i ED informado na publicação do lote.",
          "Localização indicada como Guapimirim/RJ.",
          "Categoria com consulta simples e objetiva.",
          "Próximo passo recomendado: solicitar orientação do lote e confirmar regras do evento.",
        ],
      },
      highlightBullets: [
        "Leitura rápida para comprador individual ou operação de mobilidade.",
        "Praça informada e contato direto para confirmar regras.",
        "Bom lote para quem busca processo simples e objetivo.",
      ],
      ctaIds: ["cta-doc-factor"],
      tags: ["moto", "urbana", "mobilidade"],
      seo: makeSeo({
        title: "Yamaha Factor 125i ED",
        description:
          "Lote da Yamaha Factor 125i ED com fluxo objetivo de contato e validação de documentação.",
        canonicalPath: "/lotes/yamaha-factor-125i-2017",
        ogImage: "/media/lots/factor-125i/factor.png",
      }),
    },
    {
      id: "lot-trator-2004",
      slug: "trator-john-deere-6300-2004",
      title: "Trator John Deere 6300",
      subtitle:
        "Máquina agrícola com necessidade de conferência de logística, documentação, visitação e retirada.",
      referenceCode: "Lote #1008",
      eventId: "event-motos-maquinas",
      categoryId: "category-maquinas-equipamentos",
      segmentLabel: "Máquina agrícola",
      location: {
        city: "Brasília",
        state: "DF",
        display: "Brasília/DF",
      },
      statusKey: "sob-consulta",
      statusLabel: "Sob consulta",
      shortDescription:
        "Ativo técnico indicado para compradores que precisam validar documento, logística, visitação e retirada antes da formalização.",
      longDescription: [
        "A página concentra fotos, dados básicos e apoio documental para análise inicial do equipamento.",
        "Por se tratar de máquina agrícola, a recomendação é confirmar edital, logística, retirada e condições documentais antes de participar.",
      ],
      gallery: [
        {
          id: "media-trator-1",
          url: "/media/lots/john-deere-6300/trator.png",
          alt: "Trator John Deere 6300 em vista principal",
        },
        {
          id: "media-trator-2",
          url: "/media/lots/john-deere-6300/trator2.png",
          alt: "Trator John Deere 6300 em vista lateral",
        },
        {
          id: "media-trator-3",
          url: "/media/lots/john-deere-6300/trator3.png",
          alt: "Trator John Deere 6300 com enquadramento adicional do catálogo",
        },
      ],
      documentIds: ["document-lote-trator-ficha"],
      faqIds: ["faq-lote-trator-logistica", "faq-lote-trator-diligencia"],
      technicalMetadata: {
        yearModel: "2004",
        usageMetric: "Não informada no catálogo",
        fuel: "Diesel",
      },
      observations: {
        sourceNote:
          "Dados consolidados a partir da publicação do lote e sujeitos a atualização operacional.",
        commercialDisclaimer:
          "Edital, disponibilidade, logística, retirada e exigências documentais devem ser confirmados com a equipe antes de qualquer avanço.",
        operationalNotes: [
          "Modelo John Deere 6300 descrito na publicação do lote.",
          "Categoria de trator agrícola.",
          "Praça indicada em Brasília/DF.",
          "Próximo passo recomendado: pedir ficha do lote e alinhar logística de retirada.",
        ],
      },
      highlightBullets: [
        "Ativo técnico com atenção maior para documentação e logística.",
        "Praça informada e material suficiente para leitura inicial.",
        "Atendimento indicado para compra com diligência técnica.",
      ],
      ctaIds: ["cta-doc-trator"],
      tags: ["trator", "agricola", "equipamento"],
      seo: makeSeo({
        title: "Trator John Deere 6300",
        description:
          "Lote do trator John Deere 6300 com documentação e diligência operacional.",
        canonicalPath: "/lotes/trator-john-deere-6300-2004",
        ogImage: "/media/lots/john-deere-6300/trator.png",
      }),
    },
  ],
  siteExperience: {
    featuredLotIds: ["lot-amarok-2021", "lot-hilux-2020", "lot-trator-2004"],
    finalCtaId: "cta-falar-whatsapp",
    contactReasonCtaIds: [
      "cta-solicitar-edital-geral",
      "cta-validar-lote",
      "cta-negociacao-assistida",
    ],
    contactChecklist: [
      "Nome, telefone e empresa, quando a compra for corporativa.",
      "Código do lote, nome do evento e praça que motivaram o contato.",
      "Se precisa de edital, documentação, visitação, pagamento, comissão ou retirada.",
      "Se a consulta envolve um único ativo ou vários lotes.",
    ],
    trustPillars: [
      {
        id: "pillar-base-institucional",
        title: "Base institucional pública",
        description:
          "Razão social, endereço, canais oficiais e orientações regulatórias ficam reunidos em áreas próprias para facilitar a conferência do comprador.",
      },
      {
        id: "pillar-atendimento-assistido",
        title: "Edital como documento base",
        description:
          "As regras de participação, comissão, pagamento, visitação, arrematação e retirada devem ser lidas no edital aplicável ao evento.",
      },
      {
        id: "pillar-informacao-organizada",
        title: "Responsabilidade do comprador",
        description:
          "Fotos, resumo e dados do lote ajudam na consulta inicial, mas não substituem vistoria, leitura do edital e validação documental.",
      },
      {
        id: "pillar-transparencia-operacional",
        title: "Pagamento e retirada por evento",
        description:
          "Prazo, forma de pagamento, comissão, documentos de liberação e regras de retirada dependem do evento e devem ser confirmados antes de participar.",
      },
      {
        id: "pillar-atendimento-comercial",
        title: "Atendimento em horário comercial",
        description:
          "A equipe atende em dias úteis para orientar edital, documentos do lote, dúvidas da praça e próximos passos da participação.",
      },
    ],
    participationSteps: [
      {
        id: "step-analise-catalogo",
        step: "01",
        title: "Consulte evento e lote",
        description:
          "Selecione um evento ou lote e confira código, praça, status, fotos e observações disponíveis para análise inicial.",
      },
      {
        id: "step-solicite-documentacao",
        step: "02",
        title: "Peça o edital",
        description:
          "Solicite o edital e confirme comissão, forma de pagamento, visitação, documentação e demais regras antes de qualquer participação.",
      },
      {
        id: "step-valide-estrategia",
        step: "03",
        title: "Confirme cadastro e participação",
        description:
          "A equipe confirma disponibilidade, cadastro ou habilitação, visitação e a forma de participação prevista para cada ativo.",
      },
      {
        id: "step-formalize-interesse",
        step: "04",
        title: "Siga pagamento e retirada",
        description:
          "Depois da confirmação ou arrematação, o comprador segue o edital para pagamento, comissão, liberação documental e retirada do lote.",
      },
    ],
  },
};

const parsedSeed = platformContentSeedSchema.parse(rawSeed);

assertUnique([parsedSeed.company], "company");
assertUnique(parsedSeed.contactChannels, "contactChannels");
assertUnique(parsedSeed.ctas, "ctas");
assertUnique(parsedSeed.categories, "categories");
assertUnique(parsedSeed.documents, "documents");
assertUnique(parsedSeed.faq, "faq");
assertUnique(parsedSeed.pages, "pages");
assertUnique(parsedSeed.auctionEvents, "auctionEvents");
assertUnique(parsedSeed.lots, "lots");
assertReferences(parsedSeed);

export const localSeedContentSource: ContentSource = {
  kind: "local-seed",
  label: "Seed local validada",
  description:
    "Fonte temporária usada no front para conteúdo institucional, catálogo, FAQ e camada documental até a entrada de CMS, backoffice ou API operacional.",
  content: parsedSeed,
  pendingOperationalDependencies: [
    {
      id: "pending-company-tax-id",
      label: "CNPJ oficial",
      description:
        "Registrar o CNPJ oficial nas áreas institucionais quando o dado estiver liberado.",
      owner: "juridico",
    },
    {
      id: "pending-auctioneer-record",
      label: "Leiloeiro responsável e matrícula",
      description:
        "Informar nome do leiloeiro, número de matrícula e Junta Comercial competente.",
      owner: "juridico",
    },
    {
      id: "pending-document-urls",
      label: "URLs finais de editais e anexos",
      description:
        "Atualizar CTAs de solicitação para arquivos públicos ou links oficiais sempre que a operação autorizar publicação.",
      owner: "operacao",
    },
    {
      id: "pending-event-schedules",
      label: "Cronogramas definitivos por evento",
      description:
        "Preencher datas, visitação, retirada e janelas operacionais quando a agenda real estiver aprovada.",
      owner: "operacao",
    },
  ],
  futureIntegrationPoints: [
    {
      id: "integration-company-profile",
      area: "company",
      label: "Perfil institucional",
      description:
        "Razão social, CNPJ, endereço, leiloeiro e notas regulatórias podem migrar para CMS ou backoffice sem alterar a UI consumidora.",
    },
    {
      id: "integration-document-registry",
      area: "documents",
      label: "Registro documental",
      description:
        "Editais, fichas, anexos e status de publicação podem vir de CMS, GED ou API própria mantendo o mesmo contrato de documento.",
    },
    {
      id: "integration-editorial-pages",
      area: "pages",
      label: "Páginas institucionais",
      description:
        "Sobre, contato, privacidade, cookies e termos podem ser abastecidos por backoffice mantendo a estrutura em seções.",
    },
    {
      id: "integration-event-catalog",
      area: "events",
      label: "Eventos e lotes",
      description:
        "Eventos, lotes, cronogramas, FAQ contextual e galeria podem sair da seed local para uma API operacional sem quebrar os adapters atuais.",
    },
    {
      id: "integration-faq",
      area: "faq",
      label: "FAQ institucional e operacional",
      description:
        "Perguntas frequentes podem ser editadas por conteúdo real com o mesmo esquema de tags e escopo.",
    },
  ],
};

export const localContentSeed = localSeedContentSource.content;
