# Checklist de Continuidade

## Para qualquer pessoa assumir o projeto

- ler `README.md`;
- ler `project-context/README.md`;
- validar `frontend/.env.local`;
- subir o projeto com `npm run dev`;
- testar `/api/health`;
- revisar `backend/src/features/platform/server/database.ts`;
- revisar `backend/src/features/admin/server/repository.ts`;
- revisar `frontend/src/app` para rotas principais.

## Antes de alterar catálogo ou operação

- confirmar impacto no schema e nas queries;
- confirmar impacto em rotas públicas e admin;
- validar revalidação de páginas afetadas;
- rodar lint e build.

## Antes de entregar nova release

- validar login/cadastro;
- validar interesse e pré-lance;
- validar painel admin;
- validar páginas institucionais principais;
- rodar smoke público;
- revisar se algo novo foi parar em `legacy` por engano.
