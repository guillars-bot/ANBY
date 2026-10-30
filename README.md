# Nova ANBY · Protótipo ANBIMA Data (V1.0)

Protótipo navegável do assistente ANBY sobre a Home do ANBIMA Data. React 19 + Vite 8 + Tailwind CSS 4.

## Rodar localmente
```bash
npm install   # ou: pnpm install
npm run dev
```

## Publicar na Netlify
1. Suba este repositório no GitHub (inclua a pasta `.figma/make/`, que define título e `noindex` do site).
2. Na Netlify: **Add new site → Import from Git**. O `netlify.toml` já define build (`npm run build`), pasta (`dist`) e Node 22.
3. Alternativa sem Git: rode `npm run build` e arraste a pasta `dist` em app.netlify.com/drop.

## O que o protótipo cobre (design V1.0)
- Modal do assistente 1200 × 660; sidebar 280 px (aberta) e 72 px (recolhida), transição deslizante, tooltips e zonas fixas/rolável.
- Botão flutuante com tooltip à esquerda apenas no hover; abrir/fechar integra o botão voltar do navegador.
- Sem sessão, qualquer clique no chat (exceto fechar e menu) abre o modal de dados pessoais:
  validação de nome (2+ palavras) e e-mail (formato válido, qualquer domínio: .com, .com.br, .org.br, .gov.br…) ao sair do campo, loading no botão, passo 2 com código,
  timer de reenvio (1:00), limite de 5 tentativas (bloqueio de 15:00) e retomada exata ao fechar/reabrir.
- Sessão de 30 dias no navegador (`localStorage`) e saudação com o primeiro nome. "Sair" encerra a sessão.
- Chat: pausa de resposta (campo desabilitado + mensagem de interrompida), degradê no scroll, cards `#F8F9FA` sem contorno/sombra nos indicadores,
  copiar com feedback, feedback negativo com motivo obrigatório e limite de 1.000 caracteres, ditado por voz **simulado**.

## Dados e back-end simulados
- Código de validação de demonstração: **123456** (`000000` simula código expirado). Constantes em `src/MfaModal.tsx`.
- Nenhum dado sai do navegador. Use apenas dados fictícios; URLs da Netlify são públicas por padrão.

## Versões
Cada versão aprovada recebe uma tag no Git (`v1.0`, `v1.1`…). O ramo `main` é sempre a versão aprovada; cada pacote de trabalho nasce num ramo próprio (ex.: `v1.1-ajustes-figma`).

### Funcionalidades ligáveis (`src/features.ts`)
Funcionalidades ocultas numa entrega continuam no código. Para reativar, troque a chave para `true`:
`conectarClaude`, `ditadoPorVoz`, `compartilharConversa`, `sobreAnby`.

### v1.1 — Release 1.0 do Figma (em validação)
- Ocultos (chaves em `false`): Conectar no Claude, ditado por voz, "Compartilhar" no submenu das conversas e "Sobre a ANBY" na barra lateral.
- "Mostrar como cheguei aqui": novo ícone nas ações de cada resposta, abre o passo a passo com Parâmetros, Fonte e Data de referência.
- Feedback positivo mostra "obrigada ✓"; no negativo, "Outros…" torna o campo de detalhes obrigatório e o envio exibe "Obrigado pelo feedback!".
- Botão de ir para o fim do chat (aparece só ao rolar para cima).
- Toast "Você saiu da ANBY! Até a próxima." ao sair.
- "Ver mais" nas conversas recentes; acima de 4 conversas a lista rola.

#### Correções de 30/out (v1.1)
- Desktop: o modal da ANBY sobrepõe a página em que o usuário estava (a página continua visível ao fundo).
- "Sair" fecha a ANBY, devolve o usuário à página onde estava e mostra o toast sobre a página, na parte inferior.
- Campo do chat cresce com o texto (como no Claude) até ~30% da tela; Enter envia e Shift+Enter quebra a linha.
- Removido o link "Todas as fontes que a Anby consulta".
- Mobile (Figma "Anby MOBILE - Release 1.0- AJUSTES"): home com títulos e cards no novo layout, "Mais detalhes" no card de Fundos com o painel de dados e o gancho "Explore com a ANBY"; botão "Pergunte à ANBY" fixo durante o scroll; modal sobe de baixo para cima e ocupa toda a área abaixo do menu; saudação em três linhas; "×" sem círculo; campo do chat mais alto.

### Cores dos gráficos
- **Gráfico que nasce de um gancho da home** (ex.: "Explore com a ANBY" no painel de fundos): usa as mesmas cores do gráfico da home (FIF #80C342, Estruturados #DE761C, ETF #275DD2, Off-shore #FCAF17).
- **Gráfico novo gerado no chat**: série única em #0095D9; com categorias, até 6 na ordem #275DD2, #DE761C, #034694, #80C342, #D6519D, #028A9B (7ª #FCAF17, 8ª #666A7A para "Outros"). Tabela: cabeçalho com texto #0079B1 sobre #EDF7FB. Card do indicador em #F8F9FA, sem contorno nem sombra.
- As variáveis ficam em `src/index.css` (`--chat-series-*`).

### v1.0 — 29/out/2026
- Protótipo completo (inclui Conectar no Claude e ditado por voz).
- Correções dos testes: e-mail aceita qualquer domínio válido, ações em todas as respostas, nome do usuário da sessão na barra lateral, pergunta retomada após o login.

## Pendências do design (marcadas "Em aberto")
Tela de Termos de uso; exceção do botão flutuante quando há drawer aberto; validação automática do código sem clicar em "Confirmar".
