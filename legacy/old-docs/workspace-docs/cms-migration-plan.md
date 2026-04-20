# Plano de Migração para CMS/Admin

## Objetivo

Migrar do seed local tipado para uma origem administrável sem quebrar:

- URLs atuais
- componentes atuais
- SEO atual
- contratos internos já usados pela UI

## Estratégia

### 1. Preservar o domínio canônico

O contrato a preservar é o de [`schemas.ts`](/Users/Pedro%20Spoto/Desktop/leilão/src/features/content/model/schemas.ts) e [`types.ts`](/Users/Pedro%20Spoto/Desktop/leilão/src/features/content/model/types.ts), não o shape legado de `features/auctions/types.ts`.

### 2. Manter o repositório como fronteira

Ao migrar, o ponto de troca deve ser:

- de `localContentSeed`
- para um novo provider no mesmo `ContentRepository`

Ou seja: a UI continua chamando repository/adapters, e só a implementação da origem muda.

### 3. Migrar por coleções

Coleções recomendadas no CMS/admin:

- `company_info`
- `contact_channels`
- `ctas`
- `asset_categories`
- `documents`
- `faq_entries`
- `institutional_pages`
- `auction_events`
- `auction_lots`
- `site_experience`

## Ordem sugerida

### Fase 1: conteúdo institucional

Migrar primeiro:

- `company_info`
- `contact_channels`
- `ctas`
- `faq_entries`
- `institutional_pages`

Risco baixo e sem impacto em catálogo.

### Fase 2: taxonomia e documentos

Migrar:

- `asset_categories`
- `documents`

Isso estabiliza relacionamentos antes de mexer em lotes/eventos.

### Fase 3: eventos e lotes

Migrar:

- `auction_events`
- `auction_lots`

Regras importantes:

- preservar `id`
- preservar `slug`
- preservar `canonicalPath` de SEO
- manter `statusKey` como valor estável

### Fase 4: painel operacional

Depois da origem em CMS/admin já estar estável:

- adicionar versionamento de documentos
- adicionar workflows de publicação
- adicionar revisão editorial
- adicionar auditoria de alterações

## Mapeamento técnico

### Seed local -> CMS

- Cada array do seed vira uma coleção.
- Cada referência por `id` vira relation/reference nativa do CMS.
- `siteExperience` pode virar singleton/global document.

### CMS -> Repository

Criar novo adapter, por exemplo:

```ts
export const contentRepository = new CmsContentRepository(cmsClient);
```

Sem alterar:

- `src/features/auctions/data/catalog.ts`
- `src/features/content/data/site-content.ts`
- `src/config/site.ts`

## Regras para evitar retrabalho

- Não trocar `slug` por identificadores do CMS.
- Não embutir documentos ou FAQs como texto inline em evento/lote.
- Não usar labels de UI como chave de negócio.
- Não misturar estado editorial com estado comercial.
- Não introduzir campos de leilão em tempo real antes de backend real.

## Campos futuros previstos

Quando houver backend real, os seguintes blocos podem ser adicionados sem refatorar o existente:

- `availability`
- `pricingSignals`
- `inspectionSchedule`
- `complianceFlags`
- `publicationAudit`
- `operatorNotes`

Esses blocos devem entrar no domínio canônico e depois ser traduzidos pelos adapters, não inseridos diretamente nos componentes.
