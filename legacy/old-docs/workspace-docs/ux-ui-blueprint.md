# Blueprint UX/UI

Versão alinhada ao briefing de uma operação real de leilão de veículos no Brasil: clara, confiável, comercial, humana e moderna sem parecer startup, agência ou interface "premium artificial".

## 0. Síntese das referências

### 0.1 Padrões úteis observados em `kronleiloes.com.br`

- cabeçalho direto com logo, busca, links institucionais e acesso claro a atendimento
- hero comercial sem discurso conceitual, com imagem real e chamada objetiva
- densidade operacional alta: status, praça, datas, lote, edital e filtros aparecem cedo
- páginas internas com anatomia forte: título, cronograma, documentos, galeria, dados do processo e CTA
- azul institucional com laranja pontual, sem sofisticação excessiva

### 0.2 Padrões úteis observados em `kronbergveiculos.github.io/LEIL-O/`

- home muito direta: banner, leilões em destaque, FAQ e rodapé
- cards simples com foto, código do lote, localização e CTA
- jornada curta e fácil de entender para quem chegou sem contexto

### 0.3 O que aproveitar sem copiar

- clareza de navegação
- evidência de operação real logo no topo
- busca e filtros como ferramenta, não como enfeite
- documentos e editais como parte central da experiência
- rodapé institucional robusto

### 0.4 O que evitar

- banner promocional genérico
- grid infinita logo na abertura
- excesso de informação já no hero
- mascote, caricatura ou elementos que enfraquecem seriedade
- visual marketplace genérico com cards idênticos do começo ao fim
- qualquer simulação de lance ao vivo sem backend real

## 1. Tese de experiência

### Visual thesis

Um site de leilão de veículos com postura administrativa-comercial: fundo claro, azul institucional forte, laranja só nos pontos de ação, tipografia robusta, fotos reais de veículos e blocos objetivos que passam confiança antes de vender velocidade.

### Content plan

1. orientar rapidamente
2. mostrar leilões e lotes com critérios claros
3. comprovar processo, documentação e atendimento
4. levar para o próximo passo sem fricção

### Interaction thesis

- header sticky com redução discreta ao scroll
- hover leve em cards e miniaturas para reforçar clique, sem animação chamativa
- expansão simples em FAQ, filtros e documentos, sempre com sensação de ferramenta operacional

## 2. Sitemap final

### Estrutura principal

- `/`
- `/eventos`
- `/eventos/[slug]`
- `/lotes/[slug]`
- `/documentos`
- `/como-participar`
- `/faq`
- `/contato`
- `/sobre`
- `/privacidade`
- `/cookies`
- `/termos-de-uso`

### Navegação principal

- Início
- Leilões
- Documentos
- Como participar
- FAQ
- Contato
- CTA: `Solicitar atendimento`

### Estrutura do footer

- Leilões
- Atendimento
- Institucional
- Jurídico
- endereço, horários, canal oficial, CNPJ e observação operacional

## 3. Wireframe da Home

### Objetivo

Dar leitura imediata de operação real, abrir acesso rápido ao catálogo e sustentar confiança antes da conversão.

### Desktop

```text
+------------------------------------------------------------------------------------------------------------------+
| Barra utilitária: Atendimento oficial | Curitiba/PR | Seg-Sex 9h-18h | WhatsApp                                |
+------------------------------------------------------------------------------------------------------------------+
| Header: Logo | Leilões | Documentos | Como participar | FAQ | Contato | CTA Solicitar atendimento              |
+------------------------------------------------------------------------------------------------------------------+
| HERO DIRETO                                                                                                      |
| Título forte (7 col)                                     | Foto real de pátio/lote em destaque (5 col)         |
| Texto curto                                               | Faixa com 3 provas: edital | praça | equipe          |
| Busca por evento, lote, código ou cidade                  |                                                   |
| CTA primário: Ver leilões   CTA secundário: Como participar                                                  |
+------------------------------------------------------------------------------------------------------------------+
| ACESSO RÁPIDO                                                                                                    |
| [Leilões abertos] [Leilões encerrados] [Documentos e editais] [Falar com a equipe]                            |
+------------------------------------------------------------------------------------------------------------------+
| EVENTOS EM DESTAQUE                                                                                            |
| Evento 1: imagem 35% | título | status | praça | data | resumo | CTA Ver evento                               |
| Evento 2: imagem 35% | título | status | praça | data | resumo | CTA Ver evento                               |
| Evento 3: imagem 35% | título | status | praça | data | resumo | CTA Ver evento                               |
+------------------------------------------------------------------------------------------------------------------+
| DESTAQUES DE LOTES                                                                                              |
| 4 cards objetivos: foto | lote | modelo/ano | localização | status | CTA Ver lote                               |
+------------------------------------------------------------------------------------------------------------------+
| COMO FUNCIONA                                                                                                   |
| 1 Cadastro | 2 Leitura do edital | 3 Participação | 4 Pagamento e retirada                                     |
+------------------------------------------------------------------------------------------------------------------+
| CONFIANÇA                                                                                                       |
| Documentação conferível | Atendimento humano | Informações por praça | Regras transparentes                    |
+------------------------------------------------------------------------------------------------------------------+
| FAQ RESUMIDO                                                                                                    |
| 4 perguntas principais + link Ver FAQ completa                                                                  |
+------------------------------------------------------------------------------------------------------------------+
| CTA FINAL                                                                                                       |
| Precisa confirmar edital, visitação ou documentação? [Solicitar atendimento]                                   |
+------------------------------------------------------------------------------------------------------------------+
| FOOTER COMPLETO                                                                                                 |
+------------------------------------------------------------------------------------------------------------------+
```

### Notas

- o hero não deve parecer campanha; ele abre a operação
- a busca fica dentro do hero porque é ferramenta principal
- eventos em destaque usam layout horizontal e não mosaico de template
- a faixa de prova institucional entra antes da primeira listagem

## 4. Wireframe da página de Eventos/Leilões

### Objetivo

Permitir leitura rápida dos eventos disponíveis e dar filtros claros por status, praça e tipo de veículo.

### Desktop

```text
+------------------------------------------------------------------------------------------------------------------+
| Header                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Home / Leilões                                                                                       |
+------------------------------------------------------------------------------------------------------------------+
| Título da página                                    | Busca por evento, lote, código ou cidade                  |
| Texto curto de orientação                            |                                                           |
+------------------------------------------------------------------------------------------------------------------+
| Filtros ativos em chips: Em andamento | Carros | Motos | Curitiba/PR                                             |
+------------------------------------------------------------------------------------------------------------------+
| Aside filtros (3 col)                                | Resultado (9 col)                                          |
| Status                                               | Barra de topo: XX eventos encontrados | Ordenar por data   |
| Tipo de veículo                                      |                                                            |
| Praça                                                | Evento card horizontal                                     |
| Modalidade                                           | imagem | título | status | praça | datas | resumo | CTA   |
| Órgão/comitente                                      | --------------------------------------------------------   |
| Limpar filtros                                       | Evento card horizontal                                     |
|                                                      | --------------------------------------------------------   |
|                                                      | Evento card horizontal                                     |
|                                                      | --------------------------------------------------------   |
|                                                      | Paginação / carregar mais                                  |
+------------------------------------------------------------------------------------------------------------------+
| Bloco de suporte: não encontrou? fale com a equipe                                                              |
+------------------------------------------------------------------------------------------------------------------+
| Footer                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
```

### Padrões do card de evento

- selo de status visível
- título forte com praça e tipo de evento
- linha de metadados com datas, local, quantidade de lotes e edital
- CTA primário `Ver evento`
- CTA secundário textual `Solicitar edital`

## 5. Wireframe da página de Evento

### Objetivo

Dar contexto institucional do evento, expor documentos e organizar os lotes relacionados sem parecer um feed descontrolado.

### Desktop

```text
+------------------------------------------------------------------------------------------------------------------+
| Header                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Home / Leilões / Evento                                                                              |
+------------------------------------------------------------------------------------------------------------------+
| CABEÇALHO DO EVENTO                                                                                              |
| Logo/órgão ou imagem auxiliar (2 col)                 | Título do evento (7 col)                                  |
|                                                        | Status                                                     |
|                                                        | Datas de praça / encerramento                              |
|                                                        | Local / praça                                              |
|                                                        | Resumo objetivo                                            |
|                                                        | CTA Ver edital | CTA Falar com a equipe                    |
+------------------------------------------------------------------------------------------------------------------+
| Navegação âncora: Visão geral | Documentos | Lotes | Dúvidas                                                    |
+------------------------------------------------------------------------------------------------------------------+
| Visão geral (8 col)                                   | Aside operacional (4 col)                                 |
| Texto curto do evento                                 | Status                                                     |
| Tipo de bens                                          | Cronograma                                                 |
| Regras-chave                                          | Canal oficial                                              |
| Orientação para participação                          | CTA Solicitar atendimento                                  |
+------------------------------------------------------------------------------------------------------------------+
| DOCUMENTOS E EDITAIS                                                                                            |
| Lista de arquivos: nome | tipo | atualização | CTA baixar / solicitar                                            |
+------------------------------------------------------------------------------------------------------------------+
| LOTES RELACIONADOS                                                                                                |
| Busca interna por lote/código/modelo                                                                             |
| Cards ou linhas horizontais com foto, título, localização, status e CTA                                          |
+------------------------------------------------------------------------------------------------------------------+
| DÚVIDAS FREQUENTES                                                                                                |
| 3 a 5 perguntas específicas do evento                                                                           |
+------------------------------------------------------------------------------------------------------------------+
| CTA FINAL                                                                                                        |
| Precisa validar documentos, visitação ou condições deste evento? [Falar com a equipe]                          |
+------------------------------------------------------------------------------------------------------------------+
| Footer                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
```

### Regras

- o evento é página de contexto e confiança, não só uma lista de lotes
- documentos precisam aparecer acima da dobra ou muito perto dela
- status, datas e praça ficam visíveis sem rolar

## 6. Wireframe da página de Lote

### Objetivo

Permitir análise prática do veículo e deixar o próximo passo cristalino.

### Desktop

```text
+------------------------------------------------------------------------------------------------------------------+
| Header                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Home / Leilões / Evento / Lote                                                                       |
+------------------------------------------------------------------------------------------------------------------+
| CABEÇALHO DO LOTE                                                                                                |
| Título do lote (8 col)                                | Status + CTA Solicitar atendimento (4 col)               |
| Código do lote | evento | localização | praça         | Próximo passo                                            |
+------------------------------------------------------------------------------------------------------------------+
| GALERIA (7 col)                                       | Aside operacional (5 col)                                 |
| imagem principal                                      | Status                                                     |
| thumbnails úteis                                      | Encerramento / visitação / praça                           |
| zoom simples                                          | Evento relacionado                                         |
|                                                       | CTA Ver edital                                             |
|                                                       | CTA Manifestar interesse                                   |
+------------------------------------------------------------------------------------------------------------------+
| INFORMAÇÕES TÉCNICAS                                                                                            |
| Grade 2 ou 3 colunas: marca | modelo | ano | combustível | câmbio | cor | km | documento | observação          |
+------------------------------------------------------------------------------------------------------------------+
| DESCRIÇÃO                                                                                                        |
| Texto objetivo sobre estado, origem, uso e cuidados de análise                                                   |
+------------------------------------------------------------------------------------------------------------------+
| DOCUMENTOS                                                                                                       |
| edital | laudo | observações | termo complementar                                                                |
+------------------------------------------------------------------------------------------------------------------+
| OBSERVAÇÕES                                                                                                      |
| itens de atenção: avarias, pendências, visitação, retirada, regularização                                        |
+------------------------------------------------------------------------------------------------------------------+
| PRÓXIMO PASSO                                                                                                    |
| 1 Leia o edital | 2 Valide documentação | 3 Fale com a equipe | 4 Participe                                     |
+------------------------------------------------------------------------------------------------------------------+
| LOTES RELACIONADOS                                                                                               |
+------------------------------------------------------------------------------------------------------------------+
| FAQ                                                                                                              |
+------------------------------------------------------------------------------------------------------------------+
| Footer                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
```

### Regras

- a galeria precisa parecer ferramenta de análise, não carrossel decorativo
- o bloco lateral não vende urgência falsa; ele orienta ação
- documentos e observações entram antes dos lotes relacionados

## 7. Wireframe de Como Participar

### Objetivo

Reduzir insegurança operacional e explicar o processo com linguagem de leilão real.

### Desktop

```text
+------------------------------------------------------------------------------------------------------------------+
| Header                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Home / Como participar                                                                               |
+------------------------------------------------------------------------------------------------------------------+
| Hero curto: título + texto + CTA falar com a equipe                                                             |
+------------------------------------------------------------------------------------------------------------------+
| ETAPAS                                                                                                           |
| 1 Cadastro aprovado | 2 Leitura do edital | 3 Participação | 4 Pagamento | 5 Retirada                          |
+------------------------------------------------------------------------------------------------------------------+
| O QUE VOCÊ PRECISA TER                                                                                            |
| documentos pessoais | comprovantes | dados para faturamento | observações por evento                            |
+------------------------------------------------------------------------------------------------------------------+
| REGRAS IMPORTANTES                                                                                                |
| comissão | prazo | visitação | retirada | regularização                                                        |
+------------------------------------------------------------------------------------------------------------------+
| DÚVIDAS COMUNS                                                                                                   |
| mini FAQ com 4 perguntas                                                                                         |
+------------------------------------------------------------------------------------------------------------------+
| CTA FINAL                                                                                                        |
| Ainda tem dúvida sobre cadastro ou documentação? [Solicitar atendimento]                                        |
+------------------------------------------------------------------------------------------------------------------+
| Footer                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
```

## 8. Wireframe de FAQ

### Objetivo

Resolver objeções rápidas e encaminhar o usuário para atendimento quando a dúvida exigir validação.

### Desktop

```text
+------------------------------------------------------------------------------------------------------------------+
| Header                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Home / FAQ                                                                                            |
+------------------------------------------------------------------------------------------------------------------+
| Título + texto curto + busca por pergunta                                                                        |
+------------------------------------------------------------------------------------------------------------------+
| Categorias (3 col)                                     | Lista de perguntas (9 col)                               |
| Cadastro                                               | Accordion 1                                               |
| Edital e documentos                                    | Accordion 2                                               |
| Pagamento                                              | Accordion 3                                               |
| Retirada                                               | Accordion 4                                               |
| Veículos                                               | Accordion 5                                               |
| Atendimento                                            | CTA lateral com canais oficiais                           |
+------------------------------------------------------------------------------------------------------------------+
| Footer                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
```

### Regras

- perguntas devem ser práticas e não institucionais
- o CTA lateral precisa ficar visível sem competir com o conteúdo

## 9. Wireframe de Contato

### Objetivo

Tornar inequívoco qual é o canal oficial e que tipo de informação o usuário precisa enviar para ser atendido.

### Desktop

```text
+------------------------------------------------------------------------------------------------------------------+
| Header                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
| Breadcrumb: Home / Contato                                                                                        |
+------------------------------------------------------------------------------------------------------------------+
| Título da página + texto curto                                                                                   |
+------------------------------------------------------------------------------------------------------------------+
| Canais principais (5 col)                               | Formulário objetivo (7 col)                              |
| WhatsApp oficial                                        | Nome                                                      |
| Telefone                                                | E-mail                                                    |
| E-mail                                                  | Cidade / estado                                           |
| Horário de atendimento                                  | Evento ou lote de interesse                               |
| Endereço                                                | Mensagem                                                  |
|                                                         | CTA Enviar                                                |
+------------------------------------------------------------------------------------------------------------------+
| O QUE INFORMAR NO PRIMEIRO CONTATO                                                                             |
| código do lote | evento | cidade | dúvida sobre edital, visitação, pagamento ou retirada                       |
+------------------------------------------------------------------------------------------------------------------+
| FAQ curta de contato                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
| Mapa ou bloco de endereço                                                                                      |
+------------------------------------------------------------------------------------------------------------------+
| Footer                                                                                                           |
+------------------------------------------------------------------------------------------------------------------+
```

## 10. Direção visual

### Personalidade

- empresa real
- clara
- confiável
- comercial
- humana
- moderna sem parecer startup

### Composição

- fundo branco ou off-white predominante
- áreas principais muito bem alinhadas em grid
- hero direto, com texto forte à esquerda e imagem real à direita
- cards objetivos, com borda leve, sem flutuação exagerada
- listas horizontais para eventos e lotes importantes
- seções separadas por respiro e divisórias, não por efeitos

### Tipografia

- títulos robustos, secos e fáceis de ler
- textos institucionais curtos, com vocabulário de operação
- números, datas e códigos com destaque suficiente para escaneabilidade

### Imagem

- fotos reais de veículos, pátios, vistoria e ambiente de retirada
- evitar mockups, renderizações ou abstrações
- usar fotos em enquadramentos úteis para análise, não só para "embelezar"

### Copy

- títulos curtos e concretos
- exemplo de tom: `Leilões de veículos com edital, fotos e atendimento oficial`
- evitar frases como `a melhor experiência`, `soluções inteligentes`, `performance premium`

### Movimento

- shrink discreto no header
- hover curto em cards, botões e miniaturas
- transições rápidas em accordion e filtros
- nada de paralaxe, glow, vidro ou animações de showcase

### Sinais obrigatórios de credibilidade

- status visível
- praça/localização visível
- datas visíveis
- documentos/editais visíveis
- contato oficial visível
- rodapé institucional forte

## 11. Design system inicial

### Paleta

| Token | Uso | Hex |
| --- | --- | --- |
| `brand-blue-700` | header, títulos fortes, CTAs secundários | `#103B66` |
| `brand-blue-800` | áreas institucionais e footer | `#0C2D4F` |
| `brand-orange-500` | CTA principal e pontos de ação | `#F07A24` |
| `brand-orange-050` | destaque suave de ação | `#FFF1E5` |
| `brand-paper` | fundo principal | `#F7F6F2` |
| `brand-surface` | cartões e áreas brancas | `#FFFFFF` |
| `brand-ink` | texto principal | `#1E2A35` |
| `brand-muted` | texto secundário | `#66727F` |
| `brand-line` | bordas e divisórias | `#D6DEE6` |
| `brand-success` | status aberto | `#2F7D4A` |
| `brand-warning` | atenção operacional | `#A35B17` |
| `brand-danger` | status encerrado/indisponível | `#B42318` |

### Tipografia

- `Archivo` para títulos e números de destaque
- `Public Sans` para texto corrido, navegação, formulários e tabelas
- pesos prioritários: 500, 600 e 700
- sem serifas e sem terceira família tipográfica

### Escala tipográfica

| Estilo | Desktop | Mobile | Uso |
| --- | --- | --- | --- |
| `Display` | 52/58 | 36/42 | hero da Home |
| `H1` | 40/46 | 32/38 | páginas internas |
| `H2` | 30/36 | 24/30 | seções |
| `H3` | 22/28 | 20/26 | cards e blocos |
| `Body L` | 18/28 | 17/27 | textos principais |
| `Body` | 16/26 | 16/24 | textos corridos |
| `Meta` | 13/18 | 13/18 | datas, praça, código, status |

### Grid e espaçamento

- container máximo: `1200px`
- gutter desktop: `32px`
- gutter mobile: `20px`
- ritmo vertical de seção: `72px` a `96px`
- cards com `padding` entre `20px` e `24px`

### Bordas, sombras e raios

- raio principal: `12px`
- raio secundário: `8px`
- borda padrão: `1px solid brand-line`
- sombra leve e curta; se a sombra sumir, o layout continua funcionando

### Componentes-base

- `Header` com barra utilitária opcional
- `Breadcrumbs`
- `SearchBar`
- `FilterPanel`
- `QuickAccessCard`
- `EventRowCard`
- `LotCard`
- `StatusChip`
- `DocumentRow`
- `FaqAccordion`
- `TrustStrip`
- `FooterInstitutional`

### Estados visuais

- `Aberto`
- `Em preparação`
- `Encerrado`
- `Edital disponível`
- `Visitação sob agendamento`
- `Documentação sob consulta`

### Regras de componente

- CTA principal sempre em laranja
- CTA secundário em azul com borda ou fundo sólido, dependendo do contexto
- badges de status com fundo suave e texto escuro
- documentos sempre em lista clara, com nome do arquivo e ação explícita
- cards de evento e lote com foco em foto, título e metadados, nunca em decoração

## 12. Checklist de validação visual

- parece uma operação brasileira de leilão de veículos, não um template
- o primeiro viewport explica onde o usuário está e o que pode fazer
- datas, praça, edital e status aparecem cedo
- a home abre com busca e acesso rápido, não com discurso
- o rodapé sustenta confiança institucional
- a interface continua séria mesmo sem sombras ou animações
