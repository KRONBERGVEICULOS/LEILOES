# Arquitetura

## Estrutura do repositório

```text
backend/
  src/
    features/
      admin/
      auctions/
      content/
      platform/
    shared/

frontend/
  public/
  scripts/
  src/
    app/
    frontend/

project-context/
legacy/
```

## Papel de cada camada

### `frontend`

Contém a aplicação Next.js:

- rotas App Router em `frontend/src/app`;
- componentes visuais em `frontend/src/frontend/components`;
- estilos globais em `frontend/src/frontend/styles`;
- assets públicos em `frontend/public`.

### `backend`

Contém o núcleo lógico:

- `features/content`: fonte de conteúdo e modelos;
- `features/auctions`: catálogo, tipos e consultas de eventos/lotes;
- `features/platform`: autenticação, usuários, interesses, pré-lances e atividade;
- `features/admin`: autenticação admin e operação do painel;
- `shared`: config do site, utilitários, metadata e helpers compartilhados.

## Relação entre frontend e backend

O frontend importa o backend por aliases TypeScript:

- `@/frontend/*` aponta para `frontend/src/frontend/*`;
- `@/backend/*` aponta para `backend/src/*`;
- `@/shared/*` aponta para `backend/src/shared/*`.

Isso mantém o app executável separado do domínio, sem quebrar o build do Next.

## Fluxo técnico resumido

1. A rota do App Router recebe a requisição.
2. A página ou `route.ts` consulta funções server-side do `backend`.
3. O `backend` acessa Postgres e monta os dados necessários.
4. O frontend renderiza a interface ou devolve a resposta JSON.

## Observações importantes

- o projeto usa `outputFileTracingRoot` e `turbopack.root` apontando para a raiz do repositório;
- a aplicação executável continua sendo o `frontend`;
- a separação atual é estrutural e organizacional, não dois deploys independentes.
