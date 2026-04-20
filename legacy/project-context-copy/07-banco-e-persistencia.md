# Banco e Persistência

## Banco principal

O sistema usa Postgres e requer `DATABASE_URL` para subir. O driver utilizado é `postgres`.

## Estratégia atual

- o esquema é criado automaticamente no bootstrap;
- a tabela de lotes é populada a partir da base local inicial;
- o conteúdo institucional e o catálogo nascem da modelagem interna do projeto;
- ações de usuário e operação são persistidas no banco.

## Tabelas principais

- `platform_lots`
- `platform_users`
- `platform_sessions`
- `platform_interests`
- `platform_pre_bids`
- `platform_activities`
- `platform_rate_limit_events`

## Responsabilidades

### Catálogo

- lotes operacionais
- status
- visibilidade
- valores de referência e pré-lance

### Plataforma

- usuários
- sessões
- interesses
- pré-lances
- feed de atividade

## Observações de continuidade

- `backend/src/features/platform/server/database.ts` é a referência do schema atual;
- `backend/src/features/auctions/server/catalog.ts` e `backend/src/features/platform/server/repository.ts` concentram leituras e mutações operacionais;
- qualquer evolução de schema deve considerar bootstrap, compatibilidade dos tipos e impacto no painel admin.
