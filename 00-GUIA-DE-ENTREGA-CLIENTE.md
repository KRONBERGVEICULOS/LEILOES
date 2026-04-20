# Guia de Entrega e Continuidade do Projeto

## 1. Visão geral do projeto

Este repositório entrega a base atual da **Kron Leilões Platform**.

Na prática, o sistema é uma aplicação web para:

- divulgar oportunidades de leilão;
- exibir eventos e lotes com contexto comercial;
- permitir cadastro e login de usuários;
- registrar interesse em lotes;
- registrar pré-lances online;
- oferecer um painel administrativo simples para operação do catálogo;
- centralizar o atendimento comercial via WhatsApp.

### Estado atual da entrega

Hoje o projeto já roda, faz build e publica como um **app Next.js fullstack**.

Ele está em um estágio de **MVP funcional / publicação controlada**, porque a base já possui:

- site público;
- área logada;
- painel administrativo;
- persistência em Postgres;
- rotas de API internas;
- conteúdo institucional organizado.

Ao mesmo tempo, ainda existem pendências operacionais antes de um go-live público mais definitivo:

- CNPJ real da operação;
- leiloeiro responsável e matrícula;
- URLs finais de editais/anexos;
- cronogramas definitivos por evento;
- revisão final de domínio e credenciais de produção.

> **Importante:** este projeto **não é um motor completo de leilão ao vivo**. Ele funciona como vitrine comercial + cadastro + interesse + pré-lance + operação administrativa básica, sempre com validação humana no atendimento.

---

## 2. Estrutura real de pastas

Estrutura simplificada do repositório entregue:

```text
/
├─ backend/
│  └─ src/
│     ├─ features/
│     │  ├─ admin/
│     │  ├─ auctions/
│     │  ├─ content/
│     │  └─ platform/
│     └─ shared/
├─ frontend/
│  ├─ public/
│  │  └─ media/
│  ├─ scripts/
│  ├─ src/
│  │  ├─ app/
│  │  └─ frontend/
│  ├─ .env.local.example
│  ├─ next.config.ts
│  └─ package.json
├─ project-context/
├─ legacy/
├─ .env.example
├─ package.json
├─ package-lock.json
├─ README.md
└─ 00-GUIA-DE-ENTREGA-CLIENTE.md
```

### Pastas principais

#### `frontend/`

É a aplicação executável.

Principais pontos:

- `frontend/src/app`: rotas do Next.js App Router;
- `frontend/src/frontend/components`: componentes visuais;
- `frontend/src/frontend/styles`: estilos globais;
- `frontend/public/media`: imagens de marca e dos lotes;
- `frontend/scripts/smoke-public.mjs`: smoke test público.

Rotas principais encontradas no build:

- `/`
- `/eventos`
- `/eventos/[slug]`
- `/lotes/[slug]`
- `/cadastro`
- `/entrar`
- `/area`
- `/admin`
- `/admin/login`
- `/admin/lotes`
- `/admin/interesses`
- `/admin/pre-lances`
- `/admin/atividade`
- `/api/health`
- `/api/activity`
- `/api/contact-whatsapp`

#### `backend/`

Não é um servidor separado.

Aqui fica a camada de domínio e persistência consumida pelo próprio app Next.js.

Principais módulos:

- `features/content`: conteúdo institucional, eventos, FAQs, páginas e seed local;
- `features/auctions`: catálogo, status de lotes, consultas e tipagens;
- `features/platform`: autenticação de usuários, sessões, interesses, pré-lances, atividade e banco;
- `features/admin`: autenticação do admin e operações do painel;
- `shared`: configuração do site, metadata e utilitários compartilhados.

#### `project-context/`

É a pasta de documentação ativa do projeto.

Ela contém markdowns de continuidade técnica e operacional, como:

- visão geral;
- arquitetura;
- regras de negócio;
- persistência;
- deploy;
- checklist de continuidade.

É material de apoio para manutenção e evolução. Não faz parte do runtime do sistema.

#### `legacy/`

É histórico preservado fora do fluxo principal.

Subpastas encontradas:

- `experiments`
- `old-docs`
- `project-context-copy`
- `qa-artifacts`
- `tooling`

Nada em `legacy` deve ser tratado como dependência do sistema atual sem revisão técnica.

### Arquivos importantes na raiz

- `package.json`: scripts principais da entrega;
- `.env.example`: referência central das variáveis;
- `README.md`: visão curta do projeto;
- `00-GUIA-DE-ENTREGA-CLIENTE.md`: este guia principal.

---

## 3. O que cada parte faz

### Frontend

O frontend é o app Next.js em `frontend/`.

Ele entrega:

- páginas públicas;
- páginas institucionais;
- área logada;
- painel administrativo;
- rotas internas de API;
- renderização da interface.

### Backend

O backend está embutido no mesmo repositório e é carregado pelo Next.js.

Ele cuida de:

- leitura e validação de conteúdo;
- catálogo e regras de lotes;
- autenticação de usuários;
- autenticação do admin;
- sessões por cookie;
- persistência em Postgres;
- registro de interesses e pré-lances;
- feed de atividade;
- bootstrap do schema.

### Estrutura real de execução

Este projeto **não tem frontend e backend em deploys separados por padrão**.

O modelo real hoje é:

- **um único deploy do app Next.js**;
- com a lógica de backend rodando dentro do runtime do próprio Next;
- conectado a um Postgres externo.

### O que vai para Vercel

O que deve ser publicado é o **app de `frontend/`**.

O motivo:

- `frontend/package.json` é o pacote executável do Next;
- `frontend/next.config.ts` já está preparado para enxergar o repositório;
- o `backend/` é importado por aliases TypeScript dentro desse app.

### O que pode ir para Railway

No estado atual, Railway **não é obrigatório**.

Os cenários em que Railway faz sentido aqui são:

- hospedar o **Postgres**;
- ou, de forma opcional, hospedar a aplicação inteira em vez da Vercel.

Como o backend não é separado, **não existe um serviço de API independente pronto para subir no Railway**.

### O que é só documentação

Estas áreas não entram no runtime:

- `project-context/`
- `legacy/`
- este guia de entrega

### O que não entra no fluxo principal

- `legacy/`
- `.next/`
- `node_modules/`
- arquivos locais de ambiente como `frontend/.env.local`

---

## 4. Como configurar o ambiente (`.env`)

### Arquivos de referência existentes

O projeto entregue possui:

- `.env.example`
- `frontend/.env.local.example`

### Onde o arquivo real deve ficar

Para rodar o projeto, o arquivo real deve ficar em:

- `frontend/.env.local`

### Como criar

Opção recomendada:

```bash
copy frontend\\.env.local.example frontend\\.env.local
```

Se preferir, também pode usar a raiz como referência e criar manualmente `frontend/.env.local`.

### Variáveis realmente usadas pelo projeto

| Variável | Obrigatória | Finalidade no projeto | Exemplo seguro | Onde conseguir |
|---|---|---|---|---|
| `DATABASE_URL` | Sim | String de conexão do Postgres usado por catálogo, usuários, sessões, interesses, pré-lances e admin | `postgresql://usuario:senha@host:5432/banco?sslmode=require` | Provider de Postgres, como Supabase, Railway Postgres, Neon ou servidor próprio |
| `DATABASE_SSL_MODE` | Sim | Define o modo SSL do driver `postgres` | `require` ou `disable` | `require` para banco gerenciado; `disable` só em Postgres local sem SSL |
| `NEXT_PUBLIC_SITE_URL` | Recomendado em produção | URL pública canônica usada em metadata, canonical, sitemap e OG | `https://seudominio.com` | Seu domínio final |
| `ADMIN_USERNAME` | Sim para usar `/admin` | Usuário fixo do painel admin | `admin` | Definido por quem opera o sistema |
| `ADMIN_PASSWORD` | Sim para usar `/admin` | Senha fixa do painel admin | `Troque-por-uma-senha-forte` | Definido por quem opera o sistema |
| `GOOGLE_SITE_VERIFICATION` | Opcional | Token de verificação do Google Search Console | `abc123_exemplo` | Google Search Console |
| `BING_SITE_VERIFICATION` | Opcional | Token de verificação do Bing Webmaster Tools | `abc123_exemplo` | Bing Webmaster Tools |
| `SMOKE_BASE_URL` | Opcional | Só é usada no script de smoke se você não passar a URL por argumento | `https://seudominio.com` | URL do deploy a ser validado |

### Variáveis automáticas da Vercel

O código também lê variáveis que a própria Vercel costuma injetar:

- `VERCEL_URL`
- `NEXT_PUBLIC_VERCEL_URL`
- `VERCEL_ENV`
- `NEXT_PUBLIC_VERCEL_ENV`

Elas são usadas como fallback para previews.

Na prática:

- em preview, `NEXT_PUBLIC_SITE_URL` pode ficar em branco;
- em produção, o ideal é preencher `NEXT_PUBLIC_SITE_URL` com o domínio oficial.

### Sensíveis: não compartilhar

Nunca suba ou compartilhe publicamente:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `frontend/.env.local`

> **Importante:** o arquivo de exemplo pode ir para o GitHub. O arquivo real de ambiente não.

---

## 5. Como rodar localmente

### Pré-requisitos reais do projeto

Você precisa ter:

- Node.js instalado;
- npm instalado;
- um Postgres acessível;
- `frontend/.env.local` preenchido.

### Sobre a versão do Node

O repositório **não fixa** versão exata em `.nvmrc`, `.node-version` ou `package.json`.

Como o projeto usa **Next.js 16**, a recomendação é usar uma versão atual de Node compatível com essa versão do Next.

### Instalação

Na raiz do projeto:

```bash
npm install
```

### Subida local em modo desenvolvimento

Na raiz:

```bash
npm run dev
```

Esse comando delega para o workspace `frontend`.

### Porta esperada

O Next tenta usar:

- `http://localhost:3000`

Se a porta já estiver ocupada, ele pode subir em outra, como:

- `3001`
- `3002`

O terminal mostra a porta final em uso.

### Como validar se subiu

Teste pelo menos:

- `/`
- `/cadastro`
- `/entrar`
- `/admin/login`
- `/api/health`

### Comandos reais de validação encontrados

Na raiz:

```bash
npm run lint
npm run build
npm run start
```

Smoke test:

```bash
npm run smoke:url -- https://seu-deploy.vercel.app
```

Ou:

```bash
set SMOKE_BASE_URL=https://seu-deploy.vercel.app
npm run smoke:url
```

### O que o smoke verifica hoje

O script existente valida:

- `/api/health`
- `/api/activity`
- `/`
- `/cadastro`
- `/entrar`
- `/admin/login`

### Banco e bootstrap

O projeto **não usa migrations formais separadas** neste estado.

O que ele faz hoje:

- cria schema e índices automaticamente;
- cria as tabelas se não existirem;
- faz seed inicial dos lotes base.

Arquivo de referência:

- `backend/src/features/platform/server/database.ts`

### Observação importante sobre o build/start

Durante `build` e `start`, o Postgres pode mostrar mensagens do tipo:

- tabela já existe;
- índice já existe;
- coluna já existe.

Isso é esperado no estado atual, porque o bootstrap usa `create if not exists` e `alter ... if not exists`.

---

## 6. Como subir no GitHub

### Situação atual do projeto

Este projeto **já está git-initialized**.

Ou seja:

- já existe pasta `.git`;
- já existe histórico local;
- o fluxo mais seguro é continuar a partir desse repositório.

### Antes de subir

Confira:

- `.gitignore`
- se `frontend/.env.local` não está versionado
- se nenhum segredo foi colado em markdowns ou commits

Itens já ignorados na base:

- `.env*`
- `.next`
- `node_modules`
- `.vercel`

### Fluxo se você quiser manter o histórico atual

Na raiz:

```bash
git remote -v
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main
```

Se já existir `origin`, troque a URL:

```bash
git remote set-url origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

### Fluxo se o cliente receber a pasta sem histórico Git

Nesse cenário:

```bash
git init
git branch -M main
git add .
git commit -m "feat: entrega inicial do projeto"
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

### O que nunca deve ir para o GitHub

- `frontend/.env.local`
- senhas
- `DATABASE_URL` real
- `ADMIN_PASSWORD` real
- logs locais
- `.next/`
- `node_modules/`

### Arquivos que devem ir

- código-fonte;
- `package.json`;
- `package-lock.json`;
- `.env.example`;
- `frontend/.env.local.example`;
- `project-context/`;
- este guia de entrega.

---

## 7. Como fazer deploy na Vercel

### O que deve ser publicado

O deploy recomendado é do **app `frontend`**.

O backend não sobe separado.

### Por que `frontend` é a pasta certa

Porque nela existem:

- `frontend/package.json`
- `frontend/next.config.ts`
- `frontend/src/app`

E é dali que o Next carrega o app.

### Observação importante sobre a arquitetura

Mesmo publicando `frontend`, o repositório precisa continuar com a pasta `backend/`, porque o app importa código dela por alias TypeScript.

### Existe `vercel.json`?

Não.

Hoje o projeto **não possui**:

- `vercel.json`
- configuração específica de build da Vercel

Isso significa que o fluxo esperado é usar a detecção padrão da Vercel.

### Passo a passo recomendado

1. Suba o código no GitHub.
2. No painel da Vercel, clique em **Add New Project**.
3. Importe o repositório do GitHub.
4. Defina **Root Directory = `frontend`**.
5. Revise se a Vercel detectou **Next.js**.
6. Cadastre as variáveis de ambiente.
7. Faça o primeiro deploy.

### Variáveis de ambiente para a Vercel

Cadastre no painel da Vercel:

- `DATABASE_URL`
- `DATABASE_SSL_MODE`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `GOOGLE_SITE_VERIFICATION` se for usar
- `BING_SITE_VERIFICATION` se for usar

### Como preencher `NEXT_PUBLIC_SITE_URL` na Vercel

- preview: pode ficar em branco, porque o projeto usa fallback com `VERCEL_URL`;
- produção: preencha com o domínio final, por exemplo `https://seudominio.com`.

### Como validar o primeiro deploy

Depois de subir, valide:

- `https://SEU-DOMINIO-OU-PREVIEW/`
- `https://SEU-DOMINIO-OU-PREVIEW/cadastro`
- `https://SEU-DOMINIO-OU-PREVIEW/entrar`
- `https://SEU-DOMINIO-OU-PREVIEW/admin/login`
- `https://SEU-DOMINIO-OU-PREVIEW/api/health`

O endpoint `/api/health` deve responder com status `ok` quando o banco estiver configurado corretamente.

### Teste adicional recomendado

Depois do deploy:

```bash
npm run smoke:url -- https://SEU-DOMINIO-OU-PREVIEW
```

### Se algo der errado na Vercel

Verifique primeiro:

- Root Directory realmente em `frontend`;
- variáveis de ambiente cadastradas;
- banco acessível a partir da internet;
- `DATABASE_SSL_MODE` correto;
- repositório contendo a pasta `backend`.

### Domínio depois do primeiro deploy

Depois que o deploy estiver saudável, o domínio pode ser conectado no painel da Vercel e então configurado no Cloudflare.

---

## 8. Como fazer deploy no Railway

### Railway é necessário aqui?

Não obrigatoriamente.

Pela arquitetura atual, o uso mais coerente de Railway é:

- **hospedar o banco Postgres**

Isso acontece porque:

- o backend não é um serviço separado;
- o projeto roda como um único app Next.js;
- a Vercel continua sendo o destino mais direto para a aplicação.

### Cenário 1: Railway apenas para o banco

Este é o cenário mais prático.

Passo a passo:

1. Crie um projeto no Railway.
2. Adicione um serviço de **PostgreSQL**.
3. Copie a connection string gerada pelo Railway.
4. Use essa string em `DATABASE_URL`.
5. Defina `DATABASE_SSL_MODE=require`.
6. Use essa mesma configuração no ambiente local e na Vercel.
7. Valide `/api/health`.

### Cenário 2: Railway para a aplicação inteira

É possível, mas **não é o fluxo principal preparado pelo repositório**.

Motivos:

- não existe `railway.json`;
- não existe Dockerfile;
- não existe configuração específica de serviço separada para Railway.

Se ainda assim quiser seguir por esse caminho, os comandos reais existentes hoje são:

Na raiz do repositório:

```bash
npm install
npm run build
npm run start
```

Variáveis necessárias:

- `DATABASE_URL`
- `DATABASE_SSL_MODE`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Conclusão prática sobre Railway

Para esta entrega, pense assim:

- **Vercel** = aplicação
- **Railway** = opção de Postgres, se desejado

Se o cliente quiser um backend separado no futuro, isso exigirá nova arquitetura. Hoje ele não existe como serviço independente.

---

## 9. Como configurar domínio e DNS no Cloudflare

### Cenário mais provável desta entrega

O cenário mais natural para este projeto é:

- frontend/app publicado na Vercel;
- domínio gerenciado no Cloudflare;
- Postgres em provider externo;
- sem subdomínio de API separado por enquanto.

### Fluxo seguro para conectar domínio

1. Primeiro finalize o deploy na Vercel.
2. No painel da Vercel, adicione o domínio desejado.
3. A própria Vercel vai informar quais registros DNS precisam ser criados.
4. No Cloudflare, crie exatamente os registros que a Vercel solicitar.
5. Aguarde a validação da Vercel.
6. Só depois troque o domínio principal em produção.

### Conceitos que o cliente precisa entender

#### Registro `A`

Aponta um domínio direto para um IP.

Normalmente é usado em domínio raiz quando o provedor pedir isso.

#### Registro `CNAME`

Aponta um host para outro host.

Exemplo conceitual:

- `www.seudominio.com` apontando para o host informado pela Vercel

#### `Proxied` e `DNS only` no Cloudflare

- `DNS only`: o Cloudflare apenas resolve o DNS;
- `Proxied`: o tráfego passa pela camada do Cloudflare.

### Recomendação prática

Use o que o destino pedir e valide com calma.

Se houver falha de validação de domínio ou certificado:

- deixe temporariamente em `DNS only`;
- valide o domínio;
- depois decida se quer ativar `Proxied`.

### Se no futuro existir backend separado

Se um dia houver API externa em outro provedor, o padrão saudável costuma ser:

- site em `seudominio.com` ou `www.seudominio.com`
- API em `api.seudominio.com`

Nesse caso:

- o domínio do site continuaria apontando para a Vercel;
- o subdomínio `api` apontaria para o destino real da API.

### Como validar propagação

No Windows:

```bash
nslookup seudominio.com
nslookup www.seudominio.com
```

### Cuidados para não quebrar o site

- não apague o registro antigo antes de confirmar o novo;
- não troque raiz e `www` ao mesmo tempo sem validação;
- revise TTL e espere propagação;
- confirme o domínio no painel da Vercel antes de anunciar a troca;
- só altere `NEXT_PUBLIC_SITE_URL` para o domínio final depois que ele estiver definido.

> **Importante:** não invente IPs nem CNAMEs. Use sempre os registros que a Vercel ou o destino real mostrar no painel.

---

## 10. O que o cliente pode mexer sem quebrar

### Via painel administrativo

Com baixo risco operacional, o cliente pode:

- criar lotes;
- editar lotes;
- alterar status;
- alterar visibilidade;
- marcar ou remover destaque;
- acompanhar interesses;
- acompanhar pré-lances;
- registrar atividade manual.

> **Limite atual do admin:** ele opera bem os lotes, mas **não cria a estrutura institucional de eventos, páginas e FAQs do zero**. Essa parte continua vindo da seed local.

### Via conteúdo e mídia

Também é relativamente seguro alterar:

- textos institucionais;
- FAQ;
- dados de contato;
- banner;
- logo;
- imagens de lotes;
- markdowns de documentação.

Locais relacionados:

- `backend/src/features/content/data/local-seed.ts`
- `frontend/public/media/brand`
- `frontend/public/media/lots`
- `project-context`

### Observação importante sobre seed x banco

O conteúdo institucional continua vindo da seed local.

Mas o catálogo operacional de lotes é persistido no banco.

Na prática:

- **textos e conteúdo institucional** mudam no código/seed;
- **lotes operacionais** passam a viver no banco depois do bootstrap.

Isso significa que editar a seed de lotes **não atualiza automaticamente** lotes já existentes em um banco que já foi iniciado.

Para lotes já em operação, o caminho mais seguro é o painel admin.

---

## 11. O que o cliente não deve mexer sem cuidado

Evite alterar sem apoio técnico:

- `DATABASE_URL`
- `DATABASE_SSL_MODE`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `frontend/next.config.ts`
- aliases do `tsconfig`
- autenticação de usuário
- autenticação do admin
- regras de sessão por cookie
- repositórios server-side
- bootstrap do banco
- schema do banco
- rate limit
- slugs, ids e referências internas da seed
- estrutura de eventos e páginas institucionais sem revisar dependências

Arquivos especialmente sensíveis:

- `backend/src/features/platform/server/database.ts`
- `backend/src/features/platform/server/auth.ts`
- `backend/src/features/admin/server/auth.ts`
- `backend/src/features/platform/server/repository.ts`
- `backend/src/features/admin/server/repository.ts`
- `backend/src/features/content/data/local-seed.ts`

### Por que isso é sensível

- pode quebrar login;
- pode invalidar sessões;
- pode quebrar relação entre páginas, eventos e lotes;
- pode quebrar seed e referências internas;
- pode comprometer o painel administrativo;
- pode derrubar o build;
- pode deixar o site sem acesso ao banco.

### Atenção especial ao admin

O admin atual é propositalmente simples:

- credencial fixa via ambiente;
- sem múltiplos perfis;
- sem recuperação de senha;
- sem ACL;
- sem auditoria avançada.

Não trate esse painel como backoffice corporativo completo sem evolução técnica.

---

## 12. Checklist antes de publicar

- `frontend/.env.local` ou env vars da Vercel preenchidas
- `DATABASE_URL` válida
- `DATABASE_SSL_MODE` correto
- banco acessível
- `ADMIN_USERNAME` definido
- `ADMIN_PASSWORD` definido
- `npm install` executado
- `npm run lint` sem erro
- `npm run build` sem erro
- `/api/health` respondendo `ok`
- home carregando
- `/cadastro` carregando
- `/entrar` carregando
- `/admin/login` carregando
- cadastro de usuário testado
- login de usuário testado
- área logada testada
- criação/edição de lote no admin testada
- interesse em lote testado
- pré-lance testado
- redirecionamento de WhatsApp testado
- `NEXT_PUBLIC_SITE_URL` ajustado para produção
- domínio validado na Vercel
- DNS validado no Cloudflare
- Search Console/Bing configurados apenas se necessário
- CNPJ real revisado
- leiloeiro responsável revisado
- cronogramas e documentos revisados

---

## 13. Checklist rápido para continuidade

- Abrir este arquivo primeiro: `00-GUIA-DE-ENTREGA-CLIENTE.md`
- Consultar documentação técnica complementar em `project-context/`
- Editar conteúdo institucional em `backend/src/features/content/data/local-seed.ts`
- Editar imagens em `frontend/public/media/`
- Operar lotes no painel `/admin`
- Rodar localmente com `npm install` e `npm run dev`
- Validar build com `npm run lint` e `npm run build`
- Publicar o app pela Vercel usando a pasta `frontend`
- Usar Railway apenas se quiser Postgres ou um deploy alternativo
- Configurar domínio primeiro na Vercel e depois no Cloudflare

---

## 14. Pendências e observações importantes

### Pendências reais já identificadas na base

- publicação do CNPJ real;
- publicação do leiloeiro responsável e matrícula;
- publicação de URLs finais de editais/anexos;
- preenchimento de cronogramas definitivos por evento.

Essas pendências já aparecem no próprio conteúdo local como dependências operacionais.

### Limitações atuais do projeto

- não existe backend separado;
- não existe sistema formal de migrations;
- não existe `vercel.json`;
- não existe `railway.json`;
- não existe Dockerfile;
- não existe suíte de testes automatizados além de lint e smoke;
- o painel admin é simples e usa um único conjunto de credenciais;
- o catálogo inicial nasce da seed, mas depois vive no banco.

### O que depende de configuração externa

- banco Postgres;
- domínio;
- DNS;
- credenciais admin;
- tokens de verificação de buscadores;
- dados jurídicos/operacionais reais.

### Leitura prática do estado do projeto

Esta entrega é suficiente para:

- continuidade técnica;
- publicação controlada;
- operação de catálogo;
- captação comercial;
- uso com equipe pequena.

Ela ainda não deve ser tratada como uma plataforma enterprise fechada e definitiva sem rodada adicional de endurecimento técnico e operacional.

---

## Referências oficiais úteis

Estas referências são úteis principalmente para o cliente continuar deploy e DNS com segurança:

- [Vercel: configurar domínio](https://vercel.com/docs/domains)
- [Vercel: monorepo e Root Directory](https://vercel.com/docs/monorepos)
- [Railway: deploys e serviços](https://docs.railway.com/guides/deployments)
- [Railway: variáveis de ambiente](https://docs.railway.com/guides/variables)
- [Cloudflare: DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
