# Visão Geral

## Objetivo do produto

A Kron Leilões Platform é uma aplicação web institucional e operacional para apresentação de oportunidades de leilão, captação de interessados, registro de pré-lances e apoio ao atendimento humano.

O sistema foi desenhado para:

- expor lotes e eventos com clareza comercial;
- apoiar o cadastro e autenticação de usuários;
- registrar interesse e pré-lances online;
- fornecer um painel administrativo simples para operação do catálogo e da atividade;
- manter uma base de conteúdo organizada para evoluir no futuro para CMS ou backoffice mais completo.

## Stack principal

- Next.js 16.2 com App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Postgres com driver `postgres`
- Zod para schemas e contratos de conteúdo

## Organização atual do repositório

- `frontend`: aplicação Next.js executável.
- `backend`: domínio, persistência, catálogo, autenticação e lógica operacional.
- `project-context`: documentação viva para continuidade.
- `legacy`: histórico preservado fora do fluxo principal.

## Premissas do produto

- o site não simula leilão ao vivo completo;
- o fluxo comercial continua dependente de atendimento humano;
- transparência comercial é mais importante do que marketing agressivo;
- documentos, disponibilidade e regras de retirada/pagamento são tratados como informações operacionais validadas por evento e lote.
