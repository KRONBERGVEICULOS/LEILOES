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
- npm workspaces

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para desenvolvimento local, use `frontend/.env.local.example` como referência e crie `frontend/.env.local`. O `.env.example` da raiz é referência para preview/produção com persistência real.

Sem `DATABASE_URL`, o app roda localmente em modo `local-seed`: a vitrine, catálogo, páginas públicas, SEO e health check funcionam com dados versionados, mas cadastro, login, interesses e pré-lances ficam indisponíveis até configurar Postgres.

Variáveis mínimas para produção com persistência real:

```bash
KRON_DATA_MODE=postgres
DATABASE_URL=postgresql://...
DATABASE_SSL_MODE=require
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=troque-esta-senha
```

## Scripts principais

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run smoke:url -- https://seu-deploy.vercel.app
```

## Deploy

O deploy esperado é a aplicação Next.js em `frontend`. Em provedores com configuração de monorepo, a publicação deve apontar para `frontend` como aplicação principal, ou executar os scripts da raiz, que delegam para esse workspace. Não há app estático legado versionado como alvo de publicação.

## Observações

- O app executável está em `frontend`.
- A camada de domínio e persistência está em `backend` e é importada pelo app Next.js.
- Arquivos `.env` reais não devem ser versionados.
