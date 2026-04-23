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
- `ADMIN_USERNAME` e `ADMIN_PASSWORD` fortes

## Segurança e Operação

- login admin com rate limit
- senha administrativa mínima de 12 caracteres
- rota de contato persiste lead antes do redirect para WhatsApp
- healthcheck distingue `local-seed` de banco real
- app falha explicitamente em produção se configuração crítica estiver ausente
