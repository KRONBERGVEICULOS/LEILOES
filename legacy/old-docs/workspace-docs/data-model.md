# Data Model

## Objetivo

Esta base foi reorganizada para que o projeto continue funcionando com seed local tipado hoje, mas com a mesma estrutura conceitual que será usada quando existir CMS, painel administrativo ou backend real.

## Princípios

- A fonte de verdade do conteúdo fica centralizada em seed local validado.
- O domínio canônico não depende do formato atual da UI.
- A UI continua consumindo adapters estáveis para evitar retrabalho durante a migração.
- Naming comercial permanece honesto: não existem campos como `currentBid`, `liveAuction` ou equivalentes enquanto não houver backend real para isso.
- Relações entre entidades são feitas por `id`, não por texto solto.

## Estrutura de arquivos

```text
src/
  config/
    site.ts                         -> adapter de config pública do site
  features/
    auctions/
      data/
        catalog.ts                  -> adapter do domínio canônico para a UI atual
      types.ts                      -> view models legados consumidos pelos componentes
    content/
      data/
        local-seed.ts               -> seed local validado
        source.ts                   -> contrato da fonte de conteúdo e pontos futuros de integração
        repository.ts               -> abstração/repositório da fonte de dados
        site-content.ts             -> adapter de páginas institucionais e conteúdo de suporte
      model/
        schemas.ts                  -> schemas Zod canônicos
        types.ts                    -> tipos derivados dos schemas
  lib/
    contact-links.ts                -> helpers neutros para geração de links de contato
```

## Entidades canônicas

### `CompanyInfo`

Representa a empresa e os dados institucionais de base.

- `id`
- `slug`
- `brandName`
- `legalName`
- `taxId?`
- `shortDescription`
- `longDescription`
- `addressLines`
- `city`
- `state`
- `country`
- `serviceRegions`
- `auctioneerName?`
- `auctioneerRegistration?`
- `auctioneerBoard?`
- `footerDisclaimer`
- `primaryContactChannelId`
- `seo`

### `ContactChannel`

Representa um canal real de contato.

- `id`
- `slug`
- `kind`
- `label`
- `value`
- `displayValue`
- `href`
- `description`
- `isPrimary`

### `CallToAction`

Representa uma ação de UX reutilizável, desacoplada do componente.

- `id`
- `slug`
- `actionType`
- `title`
- `label`
- `description`
- `href`
- `contactChannelId?`

### `AssetCategory`

Taxonomia principal do bem. É deliberadamente mais ampla que o rótulo exibido no card do lote.

- `id`
- `slug`
- `label`
- `summary`
- `scope`
- `tags`
- `seo`

### `DocumentAsset`

Documento ou solicitação documental relacionada a evento/lote.

- `id`
- `slug`
- `title`
- `summary`
- `documentType`
- `accessMode`
- `ctaId?`
- `relatedEntityIds`

O contrato canônico continua neutro em relação à origem do documento:

- `request` -> documento existe no fluxo operacional, mas ainda não está em URL pública
- `download` -> arquivo público hospedado pela própria operação
- `external` -> arquivo hospedado fora do site, exigindo conferência de origem e vigência

### `FAQEntry`

FAQ reutilizável, com escopo explícito.

- `id`
- `slug`
- `question`
- `answer`
- `scope`
- `relatedEntityIds`
- `tags`

### `InstitutionalPage`

Página institucional estruturada em seções.

- `id`
- `slug`
- `eyebrow`
- `title`
- `description`
- `sections[]`
- `relatedFaqIds`
- `primaryCtaId?`
- `secondaryCtaId?`
- `seo`

### `AuctionEvent`

Modelo canônico do evento/leilão editorial.

- `id`
- `slug`
- `eyebrow`
- `title`
- `summary`
- `intro`
- `coverage`
- `statusKey`
- `statusLabel`
- `journeyModeKey`
- `journeyModeLabel`
- `note`
- `heroImage`
- `highlightBullets`
- `categoryIds`
- `documentIds`
- `faqIds`
- `lotIds`
- `primaryCtaId?`
- `schedule`
- `seo`

### `AuctionLot`

Modelo canônico do lote.

- `id`
- `slug`
- `title`
- `subtitle`
- `referenceCode`
- `eventId`
- `categoryId`
- `segmentLabel`
- `location`
- `statusKey`
- `statusLabel`
- `shortDescription`
- `longDescription`
- `gallery`
- `documentIds`
- `faqIds`
- `technicalMetadata`
- `observations`
- `highlightBullets`
- `ctaIds`
- `tags`
- `seo`

## Campos normalizados

### Identidade

- Toda entidade principal possui `id` e `slug`.
- Relações sempre apontam para `id`.
- `slug` fica reservado para roteamento e leitura humana.

### Status

- `statusKey`: valor estável para filtros, CMS e integrações futuras.
- `statusLabel`: valor editorial exibível na UI.

### Conteúdo comercial

- `journeyModeKey` e `journeyModeLabel` substituem nomes que insinuariam automação de leilão inexistente.
- `commercialDisclaimer` vive em `lot.observations`, não misturado com metadado técnico.

### SEO

Todos os modelos publicáveis possuem `seo` com:

- `title`
- `description`
- `canonicalPath`
- `keywords`
- `ogImage?`

### Lote

Os campos pedidos para lote estão cobertos desta forma:

- `id` -> `id`
- `slug` -> `slug`
- `título` -> `title`
- `subtítulo` -> `subtitle`
- `evento relacionado` -> `eventId`
- `categoria` -> `categoryId` + `segmentLabel`
- `localização` -> `location`
- `status` -> `statusKey` + `statusLabel`
- `descrição resumida` -> `shortDescription`
- `descrição longa` -> `longDescription`
- `galeria` -> `gallery`
- `documentos` -> `documentIds`
- `metadados técnicos` -> `technicalMetadata`
- `observações` -> `observations`
- `CTA` -> `ctaIds`
- `tags` -> `tags`
- `SEO metadata` -> `seo`

## Seed local

O seed local vive em [`src/features/content/data/local-seed.ts`](/Users/Pedro%20Spoto/Desktop/leilão/src/features/content/data/local-seed.ts) e é validado por:

- schema Zod
- unicidade de `id`
- unicidade de `slug`
- integridade de referências cruzadas

Isso reduz o risco de seed incoerente antes de existir banco ou CMS.

Além do conteúdo, a seed local agora declara:

- dependências operacionais pendentes para go-live
- pontos futuros de integração por área (`company`, `documents`, `pages`, `events`, `lots`, `faq`)

## Repositório e adapters

### Repositório

[`src/features/content/data/repository.ts`](/Users/Pedro%20Spoto/Desktop/leilão/src/features/content/data/repository.ts) expõe a abstração `ContentRepository`.

Hoje ele é criado via `createContentRepository(localSeedContentSource)`.
No futuro a mesma fábrica pode receber uma fonte de CMS, backoffice ou API sem quebrar quem consome o domínio.

### Adapters atuais

- [`src/features/auctions/data/catalog.ts`](/Users/Pedro%20Spoto/Desktop/leilão/src/features/auctions/data/catalog.ts)
  Traduz o modelo canônico para os view models legados usados pelos componentes e páginas de catálogo.

- [`src/features/content/data/site-content.ts`](/Users/Pedro%20Spoto/Desktop/leilão/src/features/content/data/site-content.ts)
  Traduz páginas institucionais, CTA final, razões de contato e FAQ para a UI atual.

- [`src/config/site.ts`](/Users/Pedro%20Spoto/Desktop/leilão/src/config/site.ts)
  Expõe a configuração pública do site a partir de `CompanyInfo` e `ContactChannel`.

## Decisão importante sobre UX honesta

Mesmo com a modelagem pronta para evoluir, a base propositalmente não introduz:

- campo de lance atual
- contador de tempo de leilão
- preço de compra imediata
- disponibilidade automática

Quando essas informações existirem de forma real e rastreável, elas devem entrar como novos campos canônicos, não como mocks reaproveitados.
