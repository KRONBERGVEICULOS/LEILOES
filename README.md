# Kron Leilões Platform

Aplicação web fullstack para vitrine de oportunidades de leilão, cadastro de usuários, registro de interesse, pré-lances e operação administrativa básica.

## Estrutura

```text
/backend
/frontend
README.md
.env.example
package.json
package-lock.json
```

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Postgres
- Redis opcional para cache público e rate limiting
- npm workspaces

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para desenvolvimento local, use `frontend/.env.local.example` como referência e crie `frontend/.env.local`. O `.env.example` da raiz é referência para preview/produção com persistência real e não substitui o arquivo local do workspace.

Sem `DATABASE_URL`, o app roda localmente em modo `local-seed`: a vitrine, catálogo, páginas públicas, SEO e health check funcionam com dados versionados, mas cadastro, login, interesses e pré-lances ficam indisponíveis até configurar Postgres.

## Variáveis mínimas

Local read-only, sem persistência:

```bash
KRON_DATA_MODE=local-seed
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Local ou produção com persistência real:

```bash
KRON_DATA_MODE=postgres
DATABASE_URL=postgresql://...
DATABASE_SSL_MODE=require
REDIS_URL=redis://...
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=troque-esta-senha
```

Opcionais:

```bash
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
SMOKE_BASE_URL=https://seu-deploy.vercel.app
```

## Redis opcional

Redis é usado como acelerador, não como dependência crítica. Sem Redis ou com Redis indisponível, a aplicação continua atendendo: listagens públicas passam direto pelo Postgres e o rate limiting usa a tabela `platform_rate_limit_events`.

Pontos implementados:

- `backend/src/features/platform/server/redis.ts`: cliente Redis centralizado, leitura de configuração e circuito de fallback temporário após falha de conexão.
- `backend/src/features/platform/server/public-cache.ts`: cache versionado para catálogo público e atividade pública.
- `backend/src/features/auctions/server/catalog.ts`: cache da listagem pública de lotes, incluindo destaques usados na home.
- `backend/src/features/platform/server/repository.ts`: cache da atividade pública exibida na home.
- `backend/src/features/admin/server/repository.ts`: invalidação do cache público ao criar, editar, duplicar, publicar, ocultar ou destacar lote.
- `backend/src/features/platform/server/rate-limit.ts`: rate limiting em cadastro, login, interesse e pré-lance via Redis, com fallback em Postgres.

Configuração aceita:

```bash
# Preferencial em produção quando disponível.
REDIS_URL=redis://default:senha@host:6379

# Fallback quando o provedor só expõe uma URL pública para o runtime.
REDIS_PUBLIC_URL=

# Fallback quando o provedor entrega partes separadas.
REDISHOST=
REDISPORT=6379
REDISUSER=default
REDISPASSWORD=
REDIS_PASSWORD=
REDIS_TLS=false
```

Quando Redis falha, o cliente entra em cooldown curto antes de tentar reconectar, evitando atrasos repetidos em páginas públicas. O health check retorna `cache: "disabled"` ou `cache: "unavailable"` sem derrubar o status principal quando o Postgres está saudável.

## Scripts principais

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run smoke:url -- https://seu-deploy.vercel.app
```

## Deploy

O deploy esperado é a aplicação Next.js em `frontend`. A pasta `backend` não é um serviço separado; ela é importada pelo app Next.js por aliases TypeScript e precisa estar disponível no build.

Configuração objetiva para Vercel:

```text
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: padrão do Next.js
Environment Variables: cadastrar as variáveis mínimas de produção
```

Como `frontend` importa arquivos de `../backend/src`, habilite nas configurações de monorepo da Vercel a inclusão de arquivos fora do Root Directory no build. Se o provedor não permitir acesso a fontes fora de `frontend`, publique a partir da raiz usando os scripts do `package.json`, que delegam para `@kron/frontend`.

Não há app estático legado versionado como alvo de publicação. Se uma publicação atual estiver servindo `out/`, GitHub Pages, arquivos HTML antigos ou uma branch diferente desta aplicação Next.js, ela está desalinhada com o runtime principal.

## Observações

- O app executável está em `frontend`.
- A camada de domínio e persistência está em `backend` e é importada pelo app Next.js.
- Arquivos `.env` reais não devem ser versionados.
- Antes de promover produção, valide `/api/health` e rode `npm run smoke:url -- https://seu-deploy`.
