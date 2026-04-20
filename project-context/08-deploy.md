# Deploy

## Execução local

Na raiz do repositório:

```bash
npm install
npm run dev
```

O script delega para o workspace `frontend`.

## Ambiente local

Use `.env.example` como referência e crie `frontend/.env.local`.

Variáveis esperadas:

- `DATABASE_URL`
- `DATABASE_SSL_MODE`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `GOOGLE_SITE_VERIFICATION`
- `BING_SITE_VERIFICATION`

## Build e validação

```bash
npm run lint
npm run build
npm run start
```

Smoke test público:

```bash
npm run smoke:url -- https://seu-deploy.vercel.app
```

## Produção

Fluxo sugerido:

1. instalar dependências na raiz;
2. configurar variáveis do `frontend`;
3. executar `npm run build`;
4. publicar a aplicação Next.js do workspace `frontend`;
5. validar `/api/health` e o smoke público.

## Observações

- o runtime principal é o frontend Next.js;
- o backend está no mesmo repositório e é consumido pelo app;
- `legacy` não entra no fluxo de deploy atual.
