# Kron Leilões Platform

Repositório reorganizado para entrega ao cliente com um núcleo enxuto e continuidade mais clara. O fluxo principal agora está concentrado em `backend`, `frontend` e `project-context`. Todo o material antigo, auxiliar ou de referência foi preservado em `legacy`.

## Documentação principal de entrega

O arquivo central de handoff para o cliente está em `00-GUIA-DE-ENTREGA-CLIENTE.md`.

Ele reúne:

- estrutura real do projeto;
- configuração de ambiente;
- execução local;
- publicação no GitHub;
- deploy na Vercel;
- cenário de uso do Railway;
- domínio e DNS com Cloudflare;
- limites de alteração sem apoio técnico.

## Estrutura final

```text
/backend
/frontend
/project-context
/legacy
README.md
.env.example
package.json
package-lock.json
```

### O que fica no fluxo principal

- `frontend`: app Next.js 16 com App Router, assets públicos, estilos e componentes visuais.
- `backend`: domínio de negócio, catálogo, conteúdo, autenticação, persistência e operações administrativas.
- `project-context`: documentação ativa para continuidade técnica e operacional.
- arquivos de root: apenas o mínimo para instalação, scripts e configuração de ambiente de entrega.

### O que é `legacy`

`legacy` não faz parte do fluxo principal do sistema. Ela guarda histórico útil, documentação antiga, saídas de QA, instruções de tooling e cópias reaproveitáveis de contexto.

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Use `.env.example` ou `frontend/.env.local.example` como referência e crie o arquivo local em `frontend/.env.local`.

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

## Observações de entrega

- O frontend continua sendo a aplicação executável principal.
- O backend permanece dentro do mesmo repositório, mas isolado fisicamente para facilitar manutenção.
- A documentação ativa foi normalizada em `project-context`.
- O material preservado em `legacy` deve ser tratado como histórico, referência ou base de reaproveitamento, não como parte do runtime atual.
