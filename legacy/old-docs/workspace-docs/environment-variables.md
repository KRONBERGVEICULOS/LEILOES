# Variáveis de Ambiente

## Variáveis obrigatórias do projeto

| Variável | Ambientes | Obrigatória | Exemplo | Uso |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `production` | Sim | `https://www.seu-dominio.com` | Define host canônico, URLs absolutas, `metadataBase`, `robots`, `sitemap` e Open Graph em produção. |
| `GOOGLE_SITE_VERIFICATION` | `production` | Não | `google-site-verification=...` | Publica a meta tag de verificação do domínio no `layout` para Search Console. |
| `BING_SITE_VERIFICATION` | `production` | Não | `ms123456` | Publica a meta tag `msvalidate.01` no `layout` para Bing Webmaster Tools. |

## Variáveis automáticas da Vercel usadas como fallback

| Variável | Origem | Ambientes | Uso no projeto |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_VERCEL_URL` | Vercel | `preview`, `production` | Fallback público para montar a URL base do deployment quando `NEXT_PUBLIC_SITE_URL` não está definida. |
| `VERCEL_URL` | Vercel | `preview`, `production` | Fallback no servidor para resolver a URL do deployment. |
| `NEXT_PUBLIC_VERCEL_ENV` | Vercel | `preview`, `production` | Identifica se o app está em `preview`; usado para evitar indexação. |
| `VERCEL_ENV` | Vercel | `preview`, `production` | Versão server-side da informação de ambiente; usada para `robots.txt` e metadata. |

## Regras operacionais

- Em produção, `NEXT_PUBLIC_SITE_URL` deve sempre apontar para o domínio canônico final.
- Tokens de verificação só devem ser adicionados quando o domínio final já estiver definido.
- Em preview, não é obrigatório criar uma variável manual extra; o projeto já usa o hostname da própria Vercel como fallback.
- O MVP atual não possui segredos de backend nem chaves de terceiros para serem documentadas.
- Se uma nova integração surgir depois, a variável deve entrar aqui e em `.env.example` no mesmo PR.

## Rotina de atualização

1. Adicionar a variável nesta documentação.
2. Adicionar a variável em `.env.example` se ela for manual.
3. Configurar o valor na Vercel nos ambientes corretos.
4. Registrar no PR se a variável é nova, alterada ou removida.
