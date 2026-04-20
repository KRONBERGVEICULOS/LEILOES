# Fundação do produto

## 1. Diagnóstico resumido do site de referência

O site observado em `https://kronbergveiculos.github.io/LEIL-O/` funciona como uma página única estática com duas camadas:

- Home simples com banner, grid de lotes hard-coded e FAQ colapsável.
- Tela de produto montada em JavaScript, exibida sem rotas reais.

Principais limitações identificadas:

- catálogo acoplado a um array no `script.js`
- ausência de arquitetura de páginas e navegação escalável
- ausência de SEO técnico estrutural
- ausência de conteúdo institucional consistente
- fluxo de lance simulado via WhatsApp, com “lance atual” e “maior lance” hard-coded
- sem estrutura jurídica mínima bem resolvida
- sem organização por eventos reais, catálogo editorial ou features futuras

Diretriz adotada no rebuild:

- usar o site anterior apenas para entender entidades e fluxo básico
- não replicar a estética antiga
- não fingir sistema de lance ao vivo sem backend real

## 2. Sitemap final

- `/`
- `/eventos`
- `/eventos/[slug]`
- `/lotes/[slug]`
- `/documentos`
- `/como-participar`
- `/faq`
- `/sobre`
- `/contato`
- `/privacidade`
- `/cookies`
- `/termos-de-uso`

## 3. Arquitetura proposta

### Camadas

- `src/app`: rotas App Router e SEO nativo
- `src/components/site`: componentes visuais e estruturais
- `src/features/auctions`: tipos, dados e consultas de catálogo
- `src/features/content`: conteúdo institucional, FAQ, trust e páginas legais
- `src/config`: identidade do site, navegação, contato e helpers de URL
- `src/lib`: utilidades leves

### Estratégia de renderização

- páginas institucionais: estáticas
- páginas de evento e lote: SSG com `generateStaticParams`
- metadata por rota: gerada no servidor

## 4. Design system inicial

### Tese visual

Institucional comercial e operacional, com superfícies claras, azul forte, laranja pontual e leitura objetiva de leilão real.

### Tipografia

- texto: `Public Sans`
- títulos: `Archivo`

### Paleta

- `brand-paper`: fundo principal
- `brand-surface`: superfície branca
- `brand-ink`: texto principal
- `brand-muted`: conteúdo secundário
- `brand-line`: divisórias
- `brand-blue`: azul institucional
- `brand-orange`: CTA e destaque pontual

### Direção de interface

- hero direto com busca e prova operacional
- listas horizontais claras para eventos e lotes prioritários
- documentos, editais, status e praça visíveis cedo
- linguagem visual orientada a confiança, clareza e ação humana

## 5. Estrutura de rotas

### Rotas públicas

- Home
- listagem de eventos
- detalhe de evento
- detalhe de lote
- documentos e editais
- conteúdo institucional
- conteúdo jurídico

### Utilidades SEO

- `sitemap.ts`
- `robots.ts`
- JSON-LD por página relevante

## 6. Componentização

### Base

- `Container`
- `SectionHeading`
- `PageHero`
- `Breadcrumbs`

### Navegação e layout

- `SiteHeader`
- `SiteFooter`

### Conteúdo

- `FaqList`
- `TrustPanel`
- `InterestActions`
- `ContentPage`
- `StructuredData`

### Catálogo

- `LotGallery`

## 7. Implementação do frontend

### Home

- hero com proposta de valor clara
- bloco de credibilidade
- categorias de bens
- destaques de eventos
- como funciona
- destaques de lotes
- FAQ resumido
- CTA final

### Eventos

- listagem com frentes editoriais
- páginas próprias com contexto, metadados, lotes e FAQ

### Lotes

- breadcrumb
- galeria profissional
- metadados claros
- seção de informações relevantes
- documentos/editais por solicitação
- CTA honesto
- trust layer

### Institucional e jurídico

- conteúdo escrito para o produto
- sem links quebrados
- sem páginas vazias

## 8. Conteúdo-base profissional

Princípios adotados:

- não publicar dados falsos como se fossem reais
- não usar contadores ou lances ao vivo inventados
- deixar explícito que edital, disponibilidade e condições finais dependem de validação
- tratar o site como camada institucional e organizadora do atendimento

Os lotes usados nesta base são derivados do catálogo público observado no site de referência em 08/04/2026, reestruturados para leitura institucional e sem reaproveitar sinais falsos de disputa.

## 9. SEO técnico

- metadata global com `title`, `description`, Open Graph e Twitter Cards
- metadata específica para eventos e lotes
- `sitemap.xml`
- `robots.txt`
- JSON-LD para `Organization`, `WebSite`, `FAQPage`, `CollectionPage`, `Product` e `BreadcrumbList`
- URLs canônicas por rota

## 10. Acessibilidade

- semântica básica por seção e cabeçalhos
- `skip link` global
- foco visível para links, botões e summaries
- breadcrumb com `aria-label`
- FAQ em `details/summary`
- galeria de lote com botões acessíveis e labels por imagem
- contraste alto nas áreas críticas

## 11. Plano futuro para painel/admin e dados dinâmicos

### Épico 1: catálogo dinâmico

- migrar lotes e eventos de dados locais para banco/CMS
- suportar status reais, praças, agenda e documentos versionados

### Épico 2: painel operacional

- CRUD de eventos e lotes
- upload e versionamento de edital
- gestão de categorias, destaques e FAQ

### Épico 3: governança e compliance

- trilha de auditoria
- revisão de conteúdo jurídico
- fluxo de aprovação antes da publicação

### Épico 4: experiência transacional

- autenticação
- manifestação de interesse persistida
- histórico operacional
- eventual motor de lances, somente se houver backend real

## 12. Deploy de preview

Foi gerado um preview claimable na Vercel durante esta entrega. A URL operacional foi comunicada fora do repositório e a URL de claim não foi persistida em arquivo.

## 13. Backlog sugerido por frente

### Produto

- consolidar taxonomia oficial de eventos e categorias
- revisar copy institucional com o negócio

### Dados

- definir fonte de verdade para lotes, documentos e agenda
- desenhar versionamento de edital

### Operação

- mapear fluxo real de triagem por WhatsApp e por painel interno
- definir SLAs e responsáveis por praça

### Tecnologia

- ligar a um repositório GitHub remoto
- configurar CI, preview por PR e observabilidade
- integrar storage e banco para documentos e catálogo
