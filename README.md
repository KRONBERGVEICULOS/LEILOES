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

Use `.env.example` ou `frontend/.env.local.example` como referência e crie `frontend/.env.local`.

Variáveis mínimas para produção:

```bash
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

## Observações

- O app executável está em `frontend`.
- A camada de domínio e persistência está em `backend` e é importada pelo app Next.js.
- Arquivos `.env` reais não devem ser versionados.
