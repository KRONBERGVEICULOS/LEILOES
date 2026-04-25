# Kron Leiloes Platform

Plataforma web da operação Kron Leilões, com vitrine pública em Next.js, autenticação básica de usuários, pré-lances, interesse em lotes, painel administrativo enxuto e persistência em PostgreSQL.

## Visão Geral

- `frontend/`: aplicação Next.js 16 com App Router.
- `backend/`: domínio, acesso a dados, autenticação, catálogo, admin e integrações internas usados pelo frontend.
- `backend/migrations/`: migrações versionadas do PostgreSQL.
- `scripts/migrate.mjs`: runner de migrações do projeto.

O projeto suporta dois modos de dados:

- `local-seed`: somente desenvolvimento. Usa conteúdo local para navegação e não serve como persistência real.
- `postgres`: modo obrigatório para operação real, cadastro, login, admin, leads e healthcheck saudável.

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 14+ para persistência real

## Instalação

```bash
npm install
```

## Ambiente

Use os exemplos versionados como base:

- produção/preview: `.env.example`
- desenvolvimento local: `frontend/.env.local.example`

Variáveis obrigatórias em produção:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Regras importantes:

- `ADMIN_PASSWORD` precisa ter pelo menos 12 caracteres.
- Em produção, o fallback para `local-seed` é bloqueado.
- Se `KRON_DATA_MODE=postgres`, o app exige `DATABASE_URL`.
- Em Railway, `NEXT_PUBLIC_SITE_URL` pode apontar para a URL completa (`https://kronbergveiculos.up.railway.app`) ou usar a Reference Variable `${{ RAILWAY_PUBLIC_DOMAIN }}`.

## Desenvolvimento Local

### 1. Modo seed

Para trabalhar em interface e conteúdo sem banco:

Copie `frontend/.env.local.example` para `frontend/.env.local` e rode:

```bash
npm run dev
```

Use `KRON_DATA_MODE=local-seed`.

Observação: nesse modo não há persistência real para cadastro, login, admin e leads.

### 2. Modo Postgres

Para validar fluxos reais:

1. Configure `frontend/.env.local` com:
   `KRON_DATA_MODE=postgres`
2. Defina `DATABASE_URL`
3. Ajuste `DATABASE_SSL_MODE` conforme seu banco local
4. Rode:

```bash
npm run migrate
npm run dev
```

## Migrações

As migrações vivem em `backend/migrations` e são controladas pela tabela `platform_schema_migrations`.

Para aplicar:

```bash
npm run migrate
```

Comportamento:

- aplica apenas versões ainda não executadas
- valida checksum para evitar alteração de migrações antigas
- falha explicitamente se o banco não estiver configurado

## Imagens Locais de Lotes

Uploads feitos pelo admin e imagens importadas ficam dentro do repositório em:

```bash
frontend/public/media/lotes
```

O painel salva no banco apenas o caminho público, por exemplo
`/media/lotes/{lote}/{arquivo}.jpg`. Imagens antigas já versionadas em
`frontend/public/media/lots` continuam funcionando para preservar lotes existentes.

Na Railway, upload local deve ser tratado como preparação simples de catálogo. O
arquivo só entra de forma previsível no próximo build/deploy se for commitado no
repositório. Para armazenamento permanente em produção, migrar futuramente para
R2/S3 ou serviço equivalente.

Para reimportar os lotes do site antigo:

```bash
node scripts/import-old-site-lots.mjs
```

O script baixa imagens para `frontend/public/media/lotes/importados`, gera
`scripts/output/imported-old-lots.json` para revisão e atualiza o seed em
`backend/src/features/content/data/imported-old-site-lots.ts`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run migrate
npm run smoke:url
```

## Healthcheck

Endpoint:

```bash
GET /api/health
```

Resposta esperada:

- `ok`: Postgres conectado e migrações obrigatórias aplicadas
- `degraded`: aplicação em `local-seed`
- `error`: falha de banco, migração ou configuração obrigatória

## Arquitetura

### Frontend

- App Router
- páginas públicas, cadastro, login, área do usuário e admin
- rotas internas para healthcheck e contato com WhatsApp

### Backend interno

- catálogo de lotes e eventos
- autenticação de usuário
- sessão administrativa
- rate limit com Redis opcional e fallback em Postgres
- persistência de interesses, pré-lances, atividade e leads

## Deploy na Railway

Checklist mínimo:

1. Criar serviço da aplicação com este repositório
2. Anexar PostgreSQL
3. Configurar variáveis de ambiente com base em `.env.example`
4. Rodar migrações antes de liberar tráfego

O repositório já inclui `railway.toml` com:

- `preDeployCommand = "npm run migrate"`
- `healthcheckPath = "/api/health"`
- `startCommand = "npm run start"`

Fluxo recomendado:

```bash
npm install
npm run migrate
npm run build
npm run start
```

Configurações importantes:

- `KRON_DATA_MODE=postgres`
- `DATABASE_URL` apontando para o serviço Railway Postgres
- `DATABASE_SSL_MODE=require`
- `NEXT_PUBLIC_SITE_URL` com a URL pública final
  Exemplo atual: `https://kronbergveiculos.up.railway.app`
  Em Railway, pode ser uma Reference Variable para `${{ RAILWAY_PUBLIC_DOMAIN }}`
- `ADMIN_USERNAME` e `ADMIN_PASSWORD` fortes

Validação recomendada após o deploy:

```bash
npm run smoke:url -- https://kronbergveiculos.up.railway.app
```

## Segurança e Operação

- login admin com rate limit
- senha administrativa mínima de 12 caracteres
- rota de contato persiste lead antes do redirect para WhatsApp
- healthcheck distingue `local-seed` de banco real
- app falha explicitamente em produção se configuração crítica estiver ausente
