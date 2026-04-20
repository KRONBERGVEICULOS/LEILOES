# Plano Operacional de Entrega

## Baseline validada em 11/04/2026

### O que já foi feito

- Projeto em `Next.js 16.2.3`, `React 19`, App Router e Tailwind v4.
- Rotas públicas já implementadas para `home`, `eventos`, `evento`, `lote`, `documentos`, `como-participar`, `faq`, `contato`, `sobre` e páginas legais.
- Conteúdo institucional e catálogo saem de seed local tipada com repositório dedicado.
- Estados de `loading`, `error` e `not-found` já existem no app.
- SEO técnico base já existe com `metadata`, `robots.txt`, `sitemap.xml` e Open Graph por rota.
- Documentação de apoio já existe para fundação, UX/UI, conteúdo, variáveis e release.
- `npm run lint` executado com sucesso em `11/04/2026`.
- `npm run build` executado com sucesso em `11/04/2026`.

### O que ainda falta e não pode ficar escondido

- O repositório local ainda não tem `origin` configurado.
- O projeto ainda não está vinculado localmente à Vercel.
- O domínio canônico de produção ainda não foi confirmado neste workspace.
- A zona final na Cloudflare ainda não foi validada neste workspace.
- As páginas legais ainda dependem de revisão final do responsável jurídico.
- O conteúdo final ainda depende de aprovação do dono da operação para não publicar texto que pareça provisório.

## Backlog por épicos

### 1. Auditoria das referências

- `[P0]` Fechar a matriz do que foi aproveitado das referências e o que foi explicitamente evitado.
- `[P0]` Validar se home, listagem, evento e lote mantêm leitura comercial brasileira sem copiar estrutura ou copy das referências.
- `[P0]` Verificar se a densidade operacional está correta: edital, praça, status, contato e documentos aparecem cedo.
- `[P1]` Registrar diferenças finais entre referência e produto entregue para defender decisões de UX em review.

### 2. UX/UI

- `[P0]` Fechar a versão visual final de `home`, `eventos`, `evento`, `lote`, `faq`, `contato` e `footer`.
- `[P0]` Revisar hierarquia, contraste, grid, espaçamento e CTAs em desktop e mobile.
- `[P0]` Garantir consistência visual entre cards, headings, badges, FAQ, trust blocks e páginas de conteúdo.
- `[P1]` Refinar microcopy de empty states, erros e CTAs contextuais após validação de negócio.

### 3. Frontend core

- `[P0]` Confirmar que todas as rotas públicas estão completas e sem páginas vazias.
- `[P0]` Confirmar que não existem placeholders visuais, lorem ipsum, dados genéricos ou blocos que soem artificiais.
- `[P0]` Validar busca, filtros, breadcrumbs, links internos, estados de loading e fallbacks.
- `[P1]` Revisar semântica, foco visível, teclado e detalhes de acessibilidade com foco nas rotas-chave.
- `[P1]` Revisar performance percebida de hero, imagens e grids acima da dobra.

### 4. Conteúdo e credibilidade

- `[P0]` Fazer revisão editorial final de `home`, `faq`, `contato`, `sobre`, `eventos` e `lotes`.
- `[P0]` Validar todos os dados institucionais públicos: CNPJ, praça, horários, canais oficiais e alerta bancário.
- `[P0]` Revisar CTAs para manter linguagem operacional real: edital, lote, visitação, pagamento e retirada.
- `[P1]` Definir owner e rotina de atualização de conteúdo para não gerar drift pós-publicação.

### 5. Páginas legais e trust layer

- `[P0]` Revisar `privacidade`, `cookies` e `termos-de-uso` com jurídico ou responsável formal.
- `[P0]` Garantir que todos os caminhos de contato levam para canal oficial ativo.
- `[P0]` Garantir que trust blocks não prometem automação, pagamento, lance em tempo real ou workflow inexistente.
- `[P1]` Preparar versionamento editorial das páginas legais para futuras revisões.

### 6. SEO e acessibilidade

- `[P0]` Fechar `NEXT_PUBLIC_SITE_URL` com o domínio canônico final.
- `[P0]` Revisar `title`, `description`, canonical, Open Graph, `robots` e `sitemap`.
- `[P0]` Garantir `noindex` em preview e indexação correta apenas em produção.
- `[P0]` Revisar headings, landmarks, ordem de foco, navegação por teclado e contraste.
- `[P1]` Planejar auditoria complementar com Lighthouse e revisão manual pós-preview.

### 7. Deploy e QA

- `[P0]` Criar remoto no GitHub e proteger `main`.
- `[P0]` Configurar Vercel com preview por PR e produção em `main`.
- `[P0]` Configurar domínio e Cloudflare com DNS, SSL e WAF.
- `[P0]` Rodar QA funcional, visual e de SEO antes do go-live.
- `[P1]` Formalizar rollback e janela de publicação.

## Tarefas por prioridade

### P0. Bloqueadores de release

- Confirmar domínio canônico, canais oficiais e owner jurídico/editorial.
- Publicar o repositório no GitHub e proteger `main`.
- Configurar Vercel com preview deploy por PR.
- Configurar `NEXT_PUBLIC_SITE_URL` em produção.
- Fechar revisão de conteúdo e trust layer.
- Validar páginas legais.
- Rodar QA obrigatório completo.
- Executar smoke test final no domínio real.

### P1. Necessárias para estabilidade e escala do MVP

- Refino final de microcopy e estados vazios.
- Rodada adicional de acessibilidade.
- Rodada adicional de performance visual.
- Definição de processo editorial e governança de conteúdo.
- Playbook de rollback e janela de deploy.

### P2. Pós-MVP

- CMS/admin.
- Backend real de eventos, lotes e documentos.
- Analytics, observabilidade e funil de conversão.
- Automação editorial e integrações.

## Plano de execução

### Fase 1. Congelamento do escopo MVP

1. Confirmar domínio final, host canônico e canais oficiais.
2. Confirmar owner de conteúdo, jurídico e publicação.
3. Fechar a lista de páginas obrigatórias do MVP sem exceções.

### Fase 2. Fechamento do produto

1. Revisar home, listagem de leilões, página de evento, página de lote, FAQ, contato e footer.
2. Remover qualquer placeholder, cópia genérica ou bloco que soe como demo.
3. Revisar consistência visual e responsividade.

### Fase 3. Governança de entrega

1. Subir remoto no GitHub.
2. Proteger `main`, exigir review e `squash merge`.
3. Ativar preview deployment por PR.
4. Trabalhar só com PRs pequenos e rastreáveis.

### Fase 4. Validação e publicação

1. Rodar `lint` e `build`.
2. Rodar QA manual em preview.
3. Validar domínio, SSL, redirect canônico e indexação.
4. Publicar.
5. Executar smoke test pós-go-live.

## Estratégia de branches

- `main`: única branch de produção, protegida.
- `release/<data>`: opcional para congelar janela de publicação.
- `feat/<escopo>`: entregas funcionais ou visuais.
- `fix/<escopo>`: correções objetivas.
- `docs/<escopo>`: documentação, governança e playbooks.
- `hotfix/<escopo>`: correção urgente pós-go-live.
- `codex/<escopo>`: aceitável como branch transitória de agente, mas deve desembocar em uma branch padrão antes do merge.

## Plano de PRs limpos

### Regras

- Um objetivo central por PR.
- Sem misturar refactor amplo com ajuste visual e conteúdo não relacionado.
- Todo PR com impacto visual deve ter screenshots desktop e mobile.
- Todo PR deve registrar `lint`, `build`, risco e rollback.
- Todo PR deve dizer explicitamente se altera ambiente, conteúdo legal ou SEO.
- Nenhum PR entra com placeholder, página vazia, texto genérico ou promessa de feature inexistente.

### Fatiamento recomendado da branch atual

| Ordem | Branch sugerida | PR sugerido | Escopo |
| --- | --- | --- | --- |
| 1 | `feat/content-foundation` | `feat: fecha modelo de conteúdo e base editorial` | `src/features/content/**`, `src/features/auctions/types.ts`, `docs/foundation.md`, `docs/data-model.md`, `docs/content-credibility-review.md` |
| 2 | `feat/site-shell-and-trust` | `feat: entrega shell institucional e páginas de confiança` | `src/app/layout.tsx`, `src/app/globals.css`, `src/components/site/site-header.tsx`, `src/components/site/site-footer.tsx`, `src/app/sobre/page.tsx`, `src/app/faq/page.tsx`, `src/app/contato/page.tsx`, `src/app/documentos/page.tsx`, `src/app/privacidade/page.tsx`, `src/app/cookies/page.tsx`, `src/app/termos-de-uso/page.tsx` |
| 3 | `feat/home-events-and-lots` | `feat: publica home, catálogo, evento e lote` | `src/app/page.tsx`, `src/app/eventos/**`, `src/app/lotes/**`, `src/components/site/event-card.tsx`, `src/components/site/lot-card.tsx`, `src/components/site/catalog-filters.tsx`, `src/components/site/search-bar.tsx`, `src/components/site/status-badge.tsx`, `src/components/site/lot-gallery.tsx`, `src/components/site/lot-info-panel.tsx` |
| 4 | `feat/seo-a11y-and-fallbacks` | `feat: fecha metadata, OG, a11y base e fallbacks` | `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`, `src/app/eventos/[slug]/opengraph-image.tsx`, `src/app/lotes/[slug]/opengraph-image.tsx`, `src/app/error.tsx`, `src/app/loading.tsx`, `src/app/not-found.tsx`, `src/lib/metadata.ts`, `src/lib/og.tsx` |
| 5 | `docs/delivery-governance` | `docs: adiciona operação de release, QA e publicação` | `docs/delivery-ops-plan.md`, `docs/release-playbook.md`, `docs/environment-variables.md`, `.github/pull_request_template.md`, `.env.example` |

## Plano de deploy

### GitHub

1. Criar remoto e publicar `main`.
2. Proteger `main` com review obrigatório e bloqueio de push direto.
3. Habilitar `squash merge`.

### Vercel

1. Importar o repositório.
2. Definir `main` como production branch.
3. Habilitar preview deployment por PR.
4. Configurar `NEXT_PUBLIC_SITE_URL` em `production`.
5. Validar que preview usa fallback de hostname e fica `noindex`.

### Cloudflare

1. Apontar DNS do domínio para a Vercel.
2. Definir um único host canônico.
3. Ativar `SSL/TLS` em `Full (strict)`.
4. Ativar proxy e WAF gerenciado.
5. Não usar `Cache Everything` para HTML do App Router.

### Promoção para produção

1. Merge do último PR aprovado em `main`.
2. Esperar deployment verde na Vercel.
3. Validar domínio real, redirects, `robots`, `sitemap` e Open Graph.
4. Executar smoke test em desktop e mobile.

## Checklist de QA obrigatório

### Fluxo e páginas

- [ ] Home abre sem erro e com hierarquia clara.
- [ ] Listagem de leilões abre, busca funciona e filtros respondem.
- [ ] Página de evento abre com cronograma, CTA, documentos e lotes relacionados corretos.
- [ ] Página de lote abre com galeria, dados, observações, documentos e CTA corretos.
- [ ] FAQ abre e mantém leitura objetiva.
- [ ] Contato abre com canais corretos e CTA funcional.
- [ ] Footer está completo, consistente e com dados institucionais corretos.

### Qualidade técnica

- [ ] `npm run lint` passou.
- [ ] `npm run build` passou.
- [ ] Links internos foram percorridos e não quebram.
- [ ] Metadata básica existe nas páginas-chave.
- [ ] `robots.txt` e `sitemap.xml` respondem corretamente.

### UX, mobile e consistência

- [ ] Mobile validado em navegação, header, grids, FAQ, forms e footer.
- [ ] Responsividade sem overflow horizontal.
- [ ] Consistência visual entre home, listagem, evento, lote e páginas institucionais.
- [ ] Não existem páginas vazias.
- [ ] Não existem placeholders.
- [ ] Não existem textos genéricos.
- [ ] A experiência não tem cara de IA ou template genérico.

### Conteúdo e confiança

- [ ] Canais oficiais, praça, horários e avisos comerciais estão corretos.
- [ ] Nenhum CTA promete pagamento, checkout ou lance ao vivo inexistente.
- [ ] Páginas legais revisadas.
- [ ] Conteúdo institucional aprovado pelo negócio.

## Checklist de go-live

- [ ] `main` limpa, revisada e aprovada.
- [ ] Deployment de produção verde na Vercel.
- [ ] `NEXT_PUBLIC_SITE_URL` configurada com o domínio final.
- [ ] Domínio canônico configurado na Vercel.
- [ ] DNS configurado na Cloudflare.
- [ ] `SSL/TLS` em `Full (strict)`.
- [ ] Redirect entre host alternativo e host canônico validado.
- [ ] `robots.txt`, `sitemap.xml` e canonical em produção apontam para o host final.
- [ ] Smoke test completo no domínio final em desktop e mobile.
- [ ] Plano de rollback validado: voltar ao último deployment saudável da Vercel em caso de falha.

## Pós-MVP claro

- Painel administrativo para CRUD de eventos, lotes, documentos e páginas.
- Backend real para catálogo e documentos.
- Workflow editorial com revisão, versionamento e histórico.
- Analytics, eventos de conversão e observabilidade.
- Área autenticada para interessados.
- Integração com CRM/ERP/atendimento.
- Busca avançada, favoritos, alertas e notificações.
- Qualquer fluxo transacional com Stripe.
- Lances em tempo real e operação leiloeira full-stack.
