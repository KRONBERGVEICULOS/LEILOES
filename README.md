# Kron Leilões Platform

Rebuild completo de uma plataforma web de leilões com foco institucional, visual premium e arquitetura pronta para evolução. O projeto substitui a antiga página única estática por uma base em Next.js com rotas dedicadas, conteúdo tipado e CTAs honestos para uma operação que ainda depende de atendimento assistido.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Geração estática para páginas institucionais, eventos e lotes

## O que foi entregue

- Home institucional com hero forte, credibilidade, categorias, destaques, FAQ resumido e CTA final
- Página de listagem de eventos
- Página de evento com breadcrumb, imagem, metadados, destaques, lotes, FAQ e trust layer
- Página de lote com galeria, contexto, metadados, documentos, FAQ e CTA claro
- Páginas `como-participar`, `faq`, `sobre`, `contato`, `privacidade`, `cookies` e `termos-de-uso`
- SEO técnico básico com `metadata`, `sitemap.xml`, `robots.txt` e JSON-LD
- Conteúdo profissional alinhado ao estágio real do produto, sem simular lances em tempo real
- Documento de fundação do produto em `docs/foundation.md`

## Estrutura principal

```text
src/
  app/
    eventos/
    lotes/
    como-participar/
    faq/
    sobre/
    contato/
    privacidade/
    cookies/
    termos-de-uso/
  components/site/
  config/
  features/
    auctions/
    content/
  lib/
public/
  media/lots/
docs/
  foundation.md
```

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Decisões principais

- O MVP não finge backend de lance em tempo real. Todos os CTAs conduzem para manifestação de interesse, solicitação de edital ou atendimento via WhatsApp.
- O catálogo foi modelado com dados tipados por evento e lote para facilitar futura migração para CMS, banco de dados ou painel interno.
- As páginas jurídicas foram escritas para este produto, em vez de texto genérico desconectado da operação.
- O design system usa uma direção editorial premium com `Manrope` e `Cormorant Garamond`, paleta quente/institucional e hierarquia visual mais próxima de uma operação séria do que de um template barato.

## Validação executada

```bash
npm run lint
npm run build
```

Ambos concluíram com sucesso nesta entrega.

## Preview deploy

Um preview foi gerado na Vercel por fluxo claimable durante esta sessão. A URL de preview foi entregue no fechamento e a URL de claim não foi persistida no repositório.

## Próximos passos recomendados

1. Conectar um backend real para eventos, lotes, documentos e status operacionais.
2. Criar painel/admin para cadastro, versionamento de editais e publicação.
3. Integrar analytics, observabilidade e trilha operacional.
4. Ligar o repositório a um remoto GitHub e formalizar o fluxo de PRs.
