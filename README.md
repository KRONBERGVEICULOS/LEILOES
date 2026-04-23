# Kron Leiloes Platform

Aplicacao web para catalogo de leiloes, cadastro de usuarios, registro de interesse, pre-lances e administracao basica de lotes.

## Execucao local

```bash
npm install
npm run dev
```

A aplicacao abre em `http://localhost:3000`.

## Scripts

```bash
npm run lint
npm run build
npm run start
```

## Ambiente

Arquivos `.env` reais nao devem ser versionados. Use `frontend/.env.local.example` para desenvolvimento local e `.env.example` como referencia minima para ambientes com persistencia.

## Deploy

O projeto usa Next.js com npm workspaces. Em Railway, configure as variaveis de ambiente do servico pelo painel do projeto e associe PostgreSQL e Redis gerenciados quando aplicavel.
