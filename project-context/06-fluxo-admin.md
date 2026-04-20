# Fluxo Admin

## Acesso

1. O operador acessa `/admin/login`.
2. Informa `ADMIN_USERNAME` e `ADMIN_PASSWORD`.
3. A sessão administrativa é criada por cookie.
4. As rotas protegidas do painel ficam disponíveis.

## Operação principal

- `/admin`: dashboard resumido da operação.
- `/admin/lotes`: gestão de catálogo.
- `/admin/lotes/novo`: criação de lote.
- `/admin/lotes/[id]/editar`: edição de lote.
- `/admin/interesses`: leitura de interesse captado.
- `/admin/pre-lances`: leitura dos pré-lances registrados.
- `/admin/atividade`: registro e leitura de atividade operacional.

## O que o admin consegue fazer hoje

- criar e editar lotes;
- duplicar lotes;
- alternar visibilidade;
- alternar destaque;
- consultar sinais de interesse e pré-lance;
- publicar notas de atividade.

## Limites atuais

- não há gestão avançada de permissões por perfil;
- não há histórico robusto/versionado de documentos;
- o painel é funcional, mas ainda de escopo MVP.
