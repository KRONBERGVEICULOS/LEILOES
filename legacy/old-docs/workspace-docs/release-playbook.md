# Release Playbook

## Bloqueadores atuais sem esconder pendências

- O repositório local ainda não tem `origin`.
- Este diretório ainda não está vinculado a um projeto Vercel.
- O domínio final ainda não está declarado no projeto.
- A zona Cloudflare do domínio final não foi informada neste workspace.
- As páginas legais ainda precisam de validação jurídica final antes do go-live.

## Plano de deploy

### 1. GitHub

1. Criar o repositório remoto e configurar `main` como default branch.
2. Publicar a branch base no GitHub.
3. Proteger `main` com review obrigatório e bloqueio de push direto.
4. Habilitar squash merge.

### 2. Vercel

1. Importar o repositório na equipe correta da Vercel.
2. Confirmar `main` como production branch.
3. Manter preview deployments habilitados para toda branch com PR.
4. Configurar a variável de produção `NEXT_PUBLIC_SITE_URL`.
5. Revisar cada PR pelo link de preview antes do merge.

### 3. Comportamento esperado de ambiente

- Produção usa `NEXT_PUBLIC_SITE_URL` como origem canônica.
- Preview usa o hostname do deployment Vercel como fallback automático.
- Preview fica `noindex` no metadata e em `robots.txt`.
- Não criar ambiente customizado extra no MVP; `production` e `preview` bastam.

## Plano de preview deploy

### Regra operacional

- Todo PR aberto gera um preview único.
- O review funcional acontece no preview, nunca só em screenshot.
- Merge só ocorre após checagem do preview e confirmação de que o PR atualiza a documentação necessária.

### Aprovação mínima por PR

- Layout e conteúdo renderizam corretamente em desktop e mobile.
- Não há erro de build.
- Links e CTAs da superfície alterada funcionam.
- Metadata e OG não quebram.
- Não há promessa de pagamento, lance em tempo real ou integração inexistente.

## Uso recomendado da Cloudflare

### DNS

- Manter a zona do domínio final na Cloudflare.
- Adicionar na Cloudflare exatamente os registros que a Vercel pedir para o domínio final.
- Definir um único host canônico para produção e redirecionar o alternativo na Vercel.
- Iniciar a validação do domínio em modo `DNS only` se a emissão inicial do certificado precisar de isolamento; depois ativar proxy nos hosts públicos de web.

### Proteção

- Ativar proxy da Cloudflare nos registros públicos do site depois que o domínio estiver saudável.
- Configurar `SSL/TLS` em `Full (strict)`.
- Ativar `Always Use HTTPS`.
- Ativar WAF Managed Rules.
- Usar rate limiting somente em rotas sensíveis quando elas existirem. No MVP atual, isso se aplica principalmente a formulários ou APIs futuras, não a páginas estáticas.
- Não adicionar Turnstile ou Bot Management sem um endpoint real que justifique a fricção.

### Performance

- Usar a Cloudflare como camada de DNS, TLS, WAF e cache de borda, sem sobrepor a estratégia de renderização da Vercel.
- Não criar regra de `Cache Everything` para HTML do App Router.
- Se usar Cache Rules, limitar a cache agressiva a ativos estáticos e paths claramente cacheáveis.
- Manter compressão e HTTP/3 habilitados na borda.
- Deixar otimização de imagem e geração de páginas com a Vercel e o próprio Next.js.

## Variáveis de ambiente

As variáveis estão detalhadas em [docs/environment-variables.md](/Users/Pedro%20Spoto/Desktop/leilão/docs/environment-variables.md).

Regra de governança:

- Nada entra em produção sem estar documentado.
- Toda variável nova precisa aparecer em `.env.example`.
- Toda variável nova precisa dizer em quais ambientes existe.

## Checklist de QA

- [ ] `npm run lint` passou.
- [ ] `npm run build` passou.
- [ ] Home abre e renderiza sem erro.
- [ ] `/eventos` abre, busca e filtros básicos funcionam.
- [ ] Pelo menos um `/eventos/[slug]` foi validado manualmente.
- [ ] Pelo menos um `/lotes/[slug]` foi validado manualmente.
- [ ] `/documentos`, `/contato`, `/faq`, `/sobre` e páginas legais abrem sem quebra.
- [ ] `loading`, `error` e `not-found` foram exercitados ou validados por inspeção.
- [ ] Header, footer, breadcrumbs e links internos estão corretos.
- [ ] Links de WhatsApp e CTAs de contato abrem o destino esperado.
- [ ] `canonical`, `robots`, `sitemap.xml` e Open Graph estão corretos no ambiente revisado.
- [ ] O preview está `noindex`.
- [ ] Não existe referência a Stripe, checkout, pagamento ou lance em tempo real no MVP.
- [ ] Conteúdo institucional e jurídico foi aprovado por quem responde pelo negócio.

## Checklist de go-live

### Dados institucionais

- [ ] Razão social validada.
- [ ] Nome fantasia validado.
- [ ] CNPJ real publicado.
- [ ] Endereço institucional final publicado.
- [ ] Telefone e e-mail oficiais confirmados.
- [ ] Horário de atendimento confirmado.
- [ ] Leiloeiro responsável publicado.
- [ ] Matrícula e Junta Comercial publicadas.

### Conteúdo

- [ ] Página inicial revisada com copy final.
- [ ] Sobre, contato, FAQ e páginas legais revisadas com dados reais.
- [ ] Praças atendidas, cronogramas e observações operacionais atualizados.
- [ ] Nenhum texto restante sugere backend, lance ao vivo ou fluxo inexistente.

### Documentos

- [ ] URLs finais de edital por evento preenchidas quando houver publicação pública.
- [ ] Fichas de lote e anexos complementares versionados ou claramente marcados como sob solicitação.
- [ ] Status documental revisado evento a evento.
- [ ] Regras de comissão, pagamento, visitação e retirada confirmadas contra o material oficial.

### SEO

- [ ] `NEXT_PUBLIC_SITE_URL` está configurada com o domínio final.
- [ ] `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` foram configuradas se o projeto já estiver sendo verificado.
- [ ] Domínio canônico foi adicionado ao projeto Vercel.
- [ ] `robots.txt`, `sitemap.xml`, `manifest.webmanifest` e Open Graph retornam o host final.

### Deploy

- [ ] `main` está atualizada, limpa e com merge aprovado.
- [ ] O deployment de produção da Vercel está verde.
- [ ] DNS na Cloudflare aponta para a Vercel com os registros finais.
- [ ] SSL/TLS na Cloudflare está em `Full (strict)`.
- [ ] Proxy da Cloudflare está ativo nos hosts públicos corretos.
- [ ] Redirect entre host alternativo e host canônico foi validado.

### QA público

- [ ] Smoke test completo feito no domínio final em desktop e mobile.
- [ ] Links de contato, formulários e CTAs externos funcionam no domínio público.
- [ ] Home, eventos, lotes, documentos, FAQ, contato e páginas legais renderizam sem quebra.
- [ ] Preview continua `noindex` e produção está indexável.

### Operação comercial

- [ ] Time de atendimento recebeu roteiro de respostas para edital, documentação, visitação, pagamento e retirada.
- [ ] Dados bancários e instruções de cobrança só circulam por canal oficial validado.
- [ ] Plano de rollback está pronto: reverter para o último deployment saudável da Vercel se o smoke test falhar.

## Referências oficiais consultadas

- Vercel preview and environments: <https://vercel.com/docs/environment-variables/framework-environment-variables>
- Vercel environment management: <https://vercel.com/docs/environment-variables/manage-across-environments>
- Vercel custom domain setup: <https://vercel.com/docs/domains/set-up-custom-domain>
- Cloudflare proxy status: <https://developers.cloudflare.com/dns/proxy-status/>
- Cloudflare `Full (strict)`: <https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/>
- Cloudflare Cache Rules: <https://developers.cloudflare.com/cache/how-to/cache-rules/>
- Cloudflare Managed Rules: <https://developers.cloudflare.com/waf/managed-rules/>
- Cloudflare rate limiting: <https://developers.cloudflare.com/waf/rate-limiting-rules/>
