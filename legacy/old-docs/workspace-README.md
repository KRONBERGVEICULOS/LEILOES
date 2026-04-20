# Kron Leilões Platform

Site institucional original para leilão de veículos, construído em Next.js App Router com dados locais tipados, páginas próprias para eventos e lotes e foco em clareza operacional. As referências analisadas serviram apenas para arquitetura, UX e lógica comercial. Layout, identidade visual, copy e componentes foram produzidos do zero.

## Stack

- Next.js 16.2 com App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Postgres com driver `postgres` e conexão pronta para Supabase pooler
- `next/font` com `Public Sans` e `Archivo`
- Seed local validada com Zod
- Contrato explícito de fonte de conteúdo (`ContentSource`)

## Escopo entregue

- App shell com layout global, header sticky, footer institucional e skip link
- Home com hero, busca, acesso rápido, eventos em destaque, lotes em destaque, processo, confiança, FAQ resumido e CTA final
- Página de listagem de eventos com busca, filtros reais, contagem de resultados e empty state
- Página de evento com breadcrumb, metadata dinâmica, Open Graph próprio, documento base, resumo operacional, filtro de lotes e FAQ específica
- Página de lote com breadcrumb, metadata dinâmica, galeria, dados técnicos, observações operacionais, documentos, lotes relacionados e FAQ
- Cadastro, login, logout, área restrita e sessão persistente por cookie seguro
- Registro de interesse e pré-lance online com persistência real em banco
- Feed de atividade real para home, lotes, dashboard e ticker flutuante
- Páginas `documentos`, `como-participar`, `faq`, `sobre`, `contato`, `privacidade`, `cookies` e `termos-de-uso`
- Estados `loading.tsx`, `error.tsx`, `not-found.tsx`, skeletons e componentes reutilizáveis

## Arquitetura

```text
src/
  app/                      # rotas App Router, metadata, sitemap, robots e OG images
  components/site/          # header, hero, filtros, cards, FAQ, trust, CTA, galeria
  config/                   # identidade do site, navegação, URLs e helpers
  features/auctions/        # tipos, catálogo e queries de eventos/lotes
  features/content/         # source contract, seed local, repositório, páginas institucionais e FAQs
  features/platform/        # auth, dashboard, persistência, feed, rate limit e pré-lance
  lib/                      # metadata, OG image e utilitários
public/media/lots/          # imagens locais dos lotes
docs/                       # fundação do produto e blueprint UX/UI
```

## Dados locais

O conteúdo parte da seed tipada em `src/features/content/data/local-seed.ts`, que concentra:

- empresa e canais de contato
- CTAs
- categorias
- documentos
- FAQ global
- páginas institucionais e legais
- eventos
- lotes
- configuração de experiência do site
- dependências externas de go-live
- pontos futuros de integração para CMS/backoffice/API

O repositório em `src/features/content/data/repository.ts` é criado a partir do contrato `ContentSource`, deixando a troca da seed local por CMS/backoffice/API mais direta sem reescrever a UI.

## Componentes principais

- `SiteHeader`
- `SiteFooter`
- `PageHero`
- `SearchBar`
- `CatalogFilters`
- `EventCard`
- `LotCard`
- `StatusBadge`
- `LotGallery`
- `LotInfoPanel`
- `FaqList`
- `TrustPanel`
- `CtaBox`
- `Breadcrumbs`
- `ContactForm`

## SEO e acessibilidade

- `metadata` por rota com canonical, Open Graph e Twitter Cards
- `sitemap.xml` e `robots.txt` via file conventions do App Router
- `manifest.webmanifest` via `src/app/manifest.ts`
- Open Graph dinâmico em `src/app/opengraph-image.tsx`, `src/app/eventos/[slug]/opengraph-image.tsx` e `src/app/lotes/[slug]/opengraph-image.tsx`
- JSON-LD para `Organization`, `WebSite`, `CollectionPage`, `Product`, `FAQPage` e `BreadcrumbList`
- estrutura real de headings, breadcrumb com `aria-label`, foco visível e navegação por teclado
- header mobile controlado para não manter o menu aberto após mudança de rota
- headers públicos mínimos de segurança via `next.config.ts`

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Crie o arquivo local de ambiente a partir do exemplo:

```bash
cp .env.example .env.local
```

Para produção, configure obrigatoriamente:

```bash
DATABASE_URL=postgresql://...
DATABASE_SSL_MODE=require
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

Se o domínio já estiver em validação:

```bash
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
```

Sem `DATABASE_URL`, o projeto só usa o fallback legado em desenvolvimento local. Em produção, o deploy deve falhar de propósito se o banco não estiver configurado.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run smoke:url -- https://seu-deploy.vercel.app
```

## Decisões de produto

- O site não simula lance ao vivo nem compra transacional sem backend real.
- O CTA principal conduz para atendimento oficial e solicitação de documento aplicável.
- Edital, disponibilidade, pagamento, comissão, visitação e retirada são sempre tratados como informações dependentes de validação.
- A direção visual é clara, institucional e brasileira, sem dark premium, sem linguagem de startup e sem marketing vazio.

## Validação executada

Validação técnica:

```bash
npm run lint
npm run build
```

Validação manual:

- revisão mobile da home e da FAQ
- checagem de navegação nas páginas principais
- verificação de ausência de overflow horizontal
- correção do comportamento do menu mobile persistente entre rotas
- smoke de ambiente via `/api/health`

## Deploy na Vercel

O projeto está pronto para Vercel, mas agora depende de banco real em produção:

1. Importar o repositório
2. Definir `DATABASE_URL` com a connection string do pooler do Supabase
3. Definir `DATABASE_SSL_MODE=require`
4. Definir `NEXT_PUBLIC_SITE_URL`
5. Definir `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` se necessário
6. Publicar com os defaults detectados pela plataforma
7. Validar `https://seu-deploy.vercel.app/api/health`
8. Rodar `npm run smoke:url -- https://seu-deploy.vercel.app`

```bash
Install Command: npm install
Build Command: npm run build
Output: .next
```

## Próximos passos

1. Remover o fallback legado local quando o ambiente de banco estiver consolidado em todos os fluxos de dev
2. Criar painel operacional para CRUD de eventos, lotes e editais
3. Versionar documentos e regras por evento
4. Adicionar recuperação de senha, confirmação de e-mail/telefone e observabilidade de produção
