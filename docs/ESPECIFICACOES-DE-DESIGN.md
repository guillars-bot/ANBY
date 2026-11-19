# ANBY · Especificações de design (Release 1.0)

Referência visual para implementar a ANBY. **Fonte de verdade: Figma "DAT – Anby", página "Nova Anby (Release 1.0)".** Os valores abaixo são os do protótipo (`src/index.css`), conferidos com o Figma. Os mesmos valores, em formato de dados, estão em `docs/tokens.json`.

Regra de texto: **"ANBY" sempre em maiúsculas.**

---

## 1. Cores

### Marca e ação
| Token | Valor | Uso |
|---|---|---|
| `color.brand.primary` | `#0095D9` | Botões primários, links, ícones de ação, destaque do título ("os dados do mercado?"), série única de gráfico |
| `color.brand.primary-hover` | `#0079B1` | Hover do botão primário; texto de cabeçalho de tabela |
| `color.brand.dark` | `#153D8A` | Números de destaque (11 TRI, 34.095), texto do CTA "Explore com a ANBY" |
| `color.brand.navy-text` | `#283E73` | Texto do card de gancho "Explore com a ANBY" |

### Texto
| Token | Valor | Uso |
|---|---|---|
| `color.text.strong` | `#161616` | Títulos da home |
| `color.text.title` | `#292929` | Títulos de modais, texto das respostas da ANBY, balão do usuário |
| `color.text.primary` | `#363636` | Texto padrão, itens de lista, campos |
| `color.text.secondary` | `#666666` | Textos de apoio, datas, legendas, **avisos de sistema da ANBY** |
| `color.text.tertiary` | `#484A4D` | Valores de legenda e gráficos |
| `color.text.placeholder` | `#B2B5BF` | Placeholder (não usar para texto essencial) |
| `color.text.on-brand` | `#FFFFFF` | Texto sobre azul |

### Superfícies e bordas
| Token | Valor | Uso |
|---|---|---|
| `color.surface.base` | `#FFFFFF` | Modal, cards, campos |
| `color.surface.input` | `#FEFEFE` | Campo do chat |
| `color.surface.sidebar` | `#F8F9FA` | Barra lateral; card de indicadores no chat (sem contorno e sem sombra) |
| `color.surface.notice` | `#F0F1F2` | Aviso legal, campos desabilitados |
| `color.surface.selected` | `#E5F4FB` | Balão do usuário, ícone selecionado, hover de ícones |
| `color.surface.hover` | `#EDF7FB` | Hover de listas; fundo de cabeçalho de tabela |
| `color.border.default` | `#D4D4D4` | Campos, divisória de resposta parcial |
| `color.border.subtle` | `#EDEDED` | Cards e linhas de lista |
| `color.border.close` | `#DFDFDF` | Botão fechar, divisória da barra lateral |
| `color.overlay` | `rgba(7, 31, 61, .56)` | Fundo atrás do modal de acesso |
| `color.overlay.dialog` | `rgba(18, 28, 38, .52)` | Fundo atrás dos modais de feedback e "como cheguei aqui" |

### Estados
| Token | Valor | Uso |
|---|---|---|
| `color.error` | `#BD3232` | Borda de campo com erro, mensagens de erro, contador no limite (1.000/1.000), "Não consegui excluir" |
| `color.danger` | `#D92D20` | "Apagar conversa" / "Excluir" no submenu |
| `color.success.text` | `#2E7D32` | Aviso "Obrigado pelo feedback!" (ícone e texto) |
| `color.success.inline` | `#1E7B34` | Rótulo "obrigada ✓" |
| `color.success.border` | `#5CB66A` | Borda do aviso de sucesso |
| `color.success.surface` | `#E3F4E5` | Fundo do aviso de sucesso |
| `color.badge.new` | `#F74A4A` | Selo "Novo" |

### Gradiente da home
`linear-gradient(180deg, #BADBFC 0%, #D1E8FD 14%, #EAF7FE 30%, #F6F9F1 48%, #FDF7E8 68%, #FCEED1 89%)` — topo da home e página "Aberta fora do ANBIMA Data".

### Paletas de gráficos
**Gráfico que nasce de um gancho da home** — mesmas cores do gráfico da home:
| Série | Cor |
|---|---|
| FIF | `#80C342` |
| Estruturados | `#DE761C` |
| ETF | `#275DD2` |
| Off-shore | `#FCAF17` |

**Gráfico novo gerado no chat** — série única `#0095D9`. Com categorias (priorizar até 6), nesta ordem:

| Ordem | Cor | Nome no ID Visual |
|---|---|---|
| 1ª | `#275DD2` | Azul (chart color) |
| 2ª | `#DE761C` | Apoio 05 |
| 3ª | `#034694` | Apoio 07 |
| 4ª | `#80C342` | Verde |
| 5ª | `#D6519D` | Rosa |
| 6ª | `#028A9B` | Verde Azulado |
| 7ª | `#FCAF17` | Amarelo (exceção) |
| 8ª | `#666A7A` | Apoio 06 — só para "Outros" |

Tabela no chat: cabeçalho com texto `#0079B1` sobre `#EDF7FB`; bordas `#E2E6EA`.

---

## 2. Tipografia

Família: **Lato** (Regular 400, Medium 500, SemiBold 600, Bold 700, ExtraBold 800). Botões do modal de acesso no Figma usam **Bai Jamjuree** Bold; os dígitos do código, Bai Jamjuree Regular.

> Em produção, hospedar a Lato (Google Fonts ou arquivos locais). O protótipo carrega as fontes de `static.figma.com`, o que não deve ir para produção.

| Estilo | Tamanho / altura de linha | Peso | Onde |
|---|---|---|---|
| Saudação (desktop) | 32 / 1.0 | Regular | "Olá, Maria, em que posso te ajudar sobre os dados do mercado?" |
| Saudação (mobile) | 25 / 1.05 | Regular | "Olá, Maria! / Vamos falar sobre os / dados do mercado?" |
| Título da home (desktop / mobile) | 30 / 20 | Regular + ExtraBold no trecho em destaque | "Os dados que orientam…" |
| Número de destaque | 40 (desktop) / 36 (mobile) | ExtraBold | 11 TRI, 67,9 BI |
| Título de modal | 20–22 | Regular | "Acesso rápido e seguro", "Nos ajude a melhorar", estados de sistema |
| Título de card / seção | 16 | SemiBold | "Fundos de investimento" |
| Texto padrão | 14 / 1.5 | Regular | Sugestões, itens do histórico, textos de apoio |
| Resposta da ANBY | 13 / 1.35 | Regular | Texto das respostas |
| Balão do usuário | 12 / 1.2 | Regular | Pergunta enviada |
| Campo do chat | 12 / 18 (desktop) · 14 / 18 (mobile) | Regular | Textarea |
| Legenda / apoio | 12 | Regular | Datas, aviso de IA, mensagens de erro |
| Rótulo de seção | 11, caixa alta, espaçamento .04em | Bold | "CONVERSAS RECENTES", "VER MAIS" |
| Tooltip | 10–12 | Regular | Ícones de ação e trilho da barra lateral |

Itálico (cinza `#666`): só para aviso de resposta cortada ou parcial.

---

## 3. Espaçamento, raios e sombras

**Escala de espaçamento (px):** 4 · 6 · 8 · 10 · 12 · 13 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 48 · 56.

| Raio | Uso |
|---|---|
| 2 px | Ícones de ação da resposta |
| 4 px | Campo do chat, tooltips, aviso de sucesso, submenu |
| 6 px | Campos e botões do acesso, itens do histórico |
| 8 px | Botões, chips de período, cards de dados, dígitos do código |
| 10 px | Botão "Nova conversa", balão do usuário (`10 10 0 10`), toast |
| 12 px | Modal da ANBY, modal de acesso, cards de estado |
| 13 px | Modal "Nos ajude a melhorar" |
| 16 px | Card de gancho "Explore com a ANBY" |
| 50% | Avatar da ANBY, botão fechar, botão "ir para o fim" |

| Sombra | Valor | Uso |
|---|---|---|
| `shadow.modal` | `0 12px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08)` | Modal da ANBY (desktop) |
| `shadow.dialog` | `0 7px 37px 6px rgba(0,0,0,.12), 0 19px 30px 2px rgba(0,0,0,.14)` | Modais de feedback e "como cheguei aqui" |
| `shadow.access` | `0 12px 36px rgba(0,0,0,.2)` | Modal de acesso |
| `shadow.menu` | `0 8px 24px rgba(0,0,0,.14)` | Submenu do histórico |
| `shadow.avatar` | `0 12px 20px rgba(0,0,0,.12)` | Avatar da ANBY |
| `shadow.toast` | `0 6px 20px rgba(0,0,0,.18)` | Toast |

---

## 4. Layout

| Item | Desktop (≥ 851 px) | Mobile (≤ 850 px) |
|---|---|---|
| Modal da ANBY | 1200 × 660, centralizado, redimensionável pela alça (mín. 1200 × 660) | Largura total; altura `100dvh − 64 px`; sobe de baixo para cima (320 ms) |
| Página ao fundo | Visível (o modal a sobrepõe) | Coberta pelo modal |
| Barra lateral | 280 px aberta · 72 px recolhida | Gaveta de 290 px sobre o chat, com fundo escurecido |
| Conteúdo do chat | Coluna de até 692 px; respostas até 643 px | Margens de 18 px |
| Botão fechar | Círculo de 50 px, borda `#DFDFDF`, "×" azul, metade para fora do modal | Só o "×" azul, 36 × 36, sem círculo |
| Header do ANBIMA Data | 64 px | 64 px |
| Botão "Pergunte à ANBY" | Avatar 62 px; balão só no hover | Avatar 48 px; balão sempre visível; fixo no scroll |

Breakpoint único: **850 px**.

---

## 5. Componentes e estados

### Botões
| Variante | Padrão | Hover | Desabilitado |
|---|---|---|---|
| Primário | fundo `#0095D9`, texto branco Bold 14, altura 44, raio 6–8 | `#0079B1` (ou `#0086C5`) | fundo `#D4D4D4` (acesso) ou `#F5F5F5` com texto `#C2C2C2` (feedback) |
| Secundário | borda 1 px `#0095D9`, texto `#0095D9`, fundo branco | fundo `#E5F4FB` | — |
| Loading | spinner branco no lugar do rótulo, botão bloqueado | — | — |
| "Nova conversa" | fundo `#0095D9`, raio 10, "＋" + texto Bold 14 | `#007DB7` | — |
| Link | texto `#0095D9`, sem sublinhado (Sair: sublinhado) | sublinhado | — |

### Campos (acesso)
| Estado | Estilo |
|---|---|
| Padrão | altura 44, borda `#D4D4D4`, raio 6, texto 14 `#363636`, placeholder `#B2B5BF` |
| Foco | borda `#0095D9` + halo `0 0 0 3px rgba(0,149,217,.16)` |
| Erro | borda `#BD3232`; mensagem 12 `#BD3232` logo abaixo |
| Desabilitado | fundo `#F0F1F2` |

**Código de 6 dígitos:** 6 caixas de 56 px de altura, raio 8, texto 22 centralizado; mesmos estados dos campos; bloqueado após 5 tentativas.

### Campo do chat
Borda `#D4D4D4` (foco `#0095D9`), raio 4, padding 13. Altura mínima 52 px (desktop) / 62 px (mobile); cresce até ~30% da tela e depois rola. Enviar: círculo de 24 px, cinza `#F0F1F2` quando vazio, azul quando há texto; vira "parar" durante a resposta.

### Sugestões de pergunta
Linhas de 56 px, borda inferior `#E6E6E6`, texto 14, ícone de lupa azul 18 px; hover `#EDF7FB`.

### Mensagens
- **Balão do usuário:** fundo `#E5F4FB`, raio `10 10 0 10`, padding 13, até 64% da largura (máx. 416 px), alinhado à direita.
- **Resposta da ANBY:** avatar 28 px + texto 13 `#292929`.
- **Aviso de sistema:** mesmo lugar da resposta, texto `#666`, sem ações.
- **Aviso de resposta cortada:** itálico `#666`, logo abaixo do texto parcial; com resultado parcial, divisória 1 px `#D4D4D4` antes.

### Ações da resposta
Ícones de 10 px em botões de 22 × 22, raio 2. Hover e selecionado: fundo `#E5F4FB`. Tooltip escuro (`#2D2F32`, texto branco 10 px) acima do ícone, no hover e no foco.
- Satisfatória selecionada: rótulo "obrigada ✓" em `#1E7B34`, Medium 12, sem tooltip.
- Insatisfatória enviada: ícone preenchido.
- "Mostrar como cheguei aqui": ícone azul de caminho.

### Modal "Nos ajude a melhorar"
458 px, padding 32 × 25, raio 13. Select de motivo (40 px) obrigatório; textarea de 105 px até 1.000 caracteres, com contador (vermelho no limite). "(opcional)" vira "(campo obrigatório)" em vermelho com "Outros…". Aviso legal em `#F0F1F2`. Botão Enviar largura total.
**Sucesso:** caixa `#E3F4E5`, borda 1 px `#5CB66A`, raio 4, padding 12 × 16; ícone de informação **preenchido** verde `#2E7D32` com "i" branco (16 px); texto 13 `#2E7D32` ("Obrigado pelo feedback!" em Bold).

### Modal "Como a ANBY chegou a esta resposta"
Até 860 px. Cabeçalho com título SemiBold 16 e subtítulo 12 `#666`. Cada passo: card com borda `#E6E8EB`, raio 10, número em círculo azul de 22 px, selo "Consulta concluída" (fundo `#E8F5EC`, texto `#1E7B34`), linhas Parâmetros / Fonte / Data de referência (rótulo `#666`, 180 px; valores de parâmetros e fonte em fonte monoespaçada 12). Rodapé com nota técnica 12 `#666`. Fecha pelo ×, por Esc ou clique fora.

### Barra lateral e histórico
Fundo `#F8F9FA`, borda direita `#DFDFDF`. Item: título 14 (reticências), data 11 `#777`; hover e ativo `#EDF7FB` (ativo com borda interna 2 px `#0095D9`). Botão "…" aparece no hover (fundo `#C9EAF8`, ícone azul).
- **Submenu:** 190 px, borda `#E6E6E6`, raio 4, sombra de menu; itens com ícone azul; "Apagar conversa" em `#D92D20`.
- **Confirmação de exclusão:** 220 px; "Excluir esta conversa?" 14 `#292929`; "Ela sai da sua lista e não dá para desfazer." 12 `#666`; "Cancelar"; divisória; lixeira + "Excluir" em `#D92D20`.
- **Falha na exclusão:** "Não consegui excluir. Tente de novo." em `#BD3232` no lugar da data, por 5 s.
- Rodapé: avatar 34 px (`#E1F4FB`, iniciais `#007CAF`), nome Bold 12, "Minha conta · Sair".

### Toast "Você saiu da ANBY!"
Fundo `#0095D9`, texto branco (título Bold 15, apoio 12), avatar 30 px, raio 10. Fixo na parte inferior central, sobre a página; some em 4 s.

### Botão "ir para o fim"
Círculo de 36 px `#0095D9` com seta branca; hover `#E5F4FB` com seta azul. Invisível no fim da conversa; aparece com fade (250 ms) ao rolar mais de 80 px para cima.

### Estado de sistema (erros ao abrir)
Centralizado na área do chat, até 400 px: avatar 72 px, título Regular 22 `#292929`, texto 14 `#666`, botão primário de 240 × 44. Variações: "Fechar a ANBY" (sessão expirada), "Tentar de novo" (indisponível; fora do ar sem barra lateral). Página "Aberta fora do ANBIMA Data": gradiente da home e card branco de até 496 px (raio 12, padding 40 × 48), sem botão.

### Home (mobile)
Cards de 340 px com borda `#EDEDED`, raio 8, padding 24; cabeçalho título + data na mesma linha; "Mais detalhes ⌄" (Bold 14 azul) abre: legenda com percentuais (linhas de 44 px), chips de período (28 px, raio 8; ativo azul), gráfico de barras empilhadas (coluna atual com fundo `#E5F4FB`), card de gancho (`rgba(40,62,115,.05)`, raio 16), quantidade de fundos com gráfico de linha e links relacionados.

---

## 6. Movimento

| Elemento | Animação |
|---|---|
| Modal (mobile) | Sobe de baixo, 320 ms, `cubic-bezier(.22, 1, .36, 1)` |
| Barra lateral | Recolher/expandir 300–450 ms; gaveta mobile 250 ms |
| Tooltips, ícones | 150 ms |
| Botão "ir para o fim", aviso de sucesso | Fade 250 ms |
| Toast | Entrada 300 ms (sobe 10 px) |

Com `prefers-reduced-motion`, as animações são desligadas.

---

## 7. Ícones e imagens
Exportados do Figma em `public/assets/` (SVG/PNG). Avatar da ANBY: `54cd1.png`; logotipo ANBY: `anby-logo.png`. Ícones novos da Release 1.0 (caminho, check, seta, informação preenchida) estão como SVG inline em `src/App.tsx`.
