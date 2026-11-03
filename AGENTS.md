# ANBY · Assistente de IA do ANBIMA Data — guia do projeto

Este arquivo orienta **quem vai desenvolver** a ANBY e **assistentes de IA** (Claude, Copilot etc.) que trabalhem neste repositório. Leia antes de alterar qualquer coisa.

- **O que é:** protótipo navegável da ANBY, a assistente de IA da ANBIMA que responde sobre os dados do ANBIMA Data (ANBIMA Feed e boletins de Fundos de Investimento e Mercado de Capitais). Ela abre como um modal sobre o portal ANBIMA Data.
- **Natureza do código:** protótipo de design. Os fluxos e estados são reais; o back-end é **simulado** (respostas, código de acesso, sessão). Ver "O que é simulado" abaixo.
- **Fontes de verdade, nesta ordem:** 1) Figma, arquivo "DAT – Anby", página "Nova Anby (Release 1.0)" (seções Desktop, Mobile, Mobile Ajustes e "Anby – Erros e exceções (Release 1.0)"); 2) este guia; 3) `docs/ESPECIFICACOES-DE-DESIGN.md`; 4) o código. Se o código divergir do Figma, vale o Figma.
- **Especificações visuais** (cores, tipografia, espaçamentos, componentes e estados): `docs/ESPECIFICACOES-DE-DESIGN.md` e `docs/tokens.json`.
- **Histórico de versões:** `README.md`.

## Como rodar

```bash
npm install
npm run dev       # servidor local (Vite)
npm run build     # gera dist/ (o Netlify usa este comando)
npx tsc --noEmit  # checagem de tipos
```

Código de acesso de demonstração: **123456** (`000000` simula código vencido).

## Estrutura do código

| Arquivo | Conteúdo |
|---|---|
| `src/App.tsx` | Portal ANBIMA Data (home desktop e mobile), modal da ANBY, barra lateral, chat, respostas, feedback, "Mostrar como cheguei aqui", toast, painel de cenários de erro |
| `src/MfaModal.tsx` | Acesso por e-mail e código (passos 1/2 e 2/2), validações e mensagens oficiais |
| `src/scenarios.ts` | Os 39 cenários de erro e exceção, com os textos oficiais |
| `src/features.ts` | Chaves para ligar/desligar funcionalidades |
| `src/session.ts` | Sessão do usuário (protótipo: navegador, 30 dias) |
| `src/index.css` | Todos os estilos. Os blocos no fim do arquivo (marcados com `/* ===== vX.Y · … ===== */`) sobrepõem os anteriores |
| `public/assets/` | Imagens e ícones exportados do Figma |

## Escopo da Release 1.0 e chaves de funcionalidade

Em `src/features.ts`. Funcionalidade oculta continua no código; **não apague**, só troque a chave.

| Chave | Valor | Motivo |
|---|---|---|
| `conectarClaude` | `false` | Oculto na Release 1.0 |
| `ditadoPorVoz` | `false` | Microfone oculto na Release 1.0 |
| `compartilharConversa` | `false` | Submenu do histórico só com Renomear e Apagar |
| `sobreAnby` | `false` | Não aparece nas telas da Release 1.0 |
| `painelCenarios` | `true` | Só do protótipo: painel para revisar os cenários de erro. **Desligar em produção** |

## Regras de texto

1. **"ANBY" sempre em maiúsculas** em qualquer texto visível (inclusive em "ANBY Data"). Exceções: nomes técnicos (`perguntar_anby`, `sobreAnby`) e nomes de arquivos/frames do Figma.
2. **Textos oficiais não se reescrevem.** As mensagens de erro e exceção estão em `src/scenarios.ts` e em `MSG` dentro de `src/MfaModal.tsx`, copiadas do documento "Anby: cenários de erro e exceção" (29/10/2026). Mudança de texto passa pelo time de design.
3. Textos marcados como "exemplo" nos cenários (respostas que a IA escreve na hora) mostram o **sentido** esperado, não a frase exata.
4. Português do Brasil, tom cordial e direto. A ANBY fala em 1ª pessoa no feminino ("Obrigada pelo uso!").

## Regras de comportamento

### Abertura e modal
- O botão "Pergunte à ANBY" aparece em todas as páginas do ANBIMA Data e acompanha o scroll. No desktop, o balão do texto só aparece no hover; no mobile fica sempre visível.
- **Desktop:** o modal (1200 × 660, redimensionável) **sobrepõe a página em que a pessoa estava**; a página continua visível ao fundo.
- **Mobile (≤ 850 px):** o modal sobe de baixo para cima e ocupa toda a largura e a altura abaixo do menu do ANBIMA Data.
- Fechar (×) devolve a pessoa à página, na mesma posição. O botão Voltar do navegador também fecha.
- Ganchos contextuais da home ("Explore com a ANBY" nos painéis de dados) abrem o chat já com o contexto daquele gráfico.

### Acesso (e-mail e código)
- Sem sessão, qualquer clique no chat (exceto fechar e menu) abre o modal de dados pessoais. A pergunta clicada antes do login é enviada automaticamente depois da validação.
- Passo 1: nome (pelo menos 2 palavras) e e-mail (formato válido, qualquer domínio). Validação ao sair do campo; "Continuar" só habilita com os dois válidos; loading no botão enquanto valida.
- Passo 2: código de 6 dígitos, reenvio após 60 s, até 5 tentativas (depois, bloqueio de 15 min). Mesma mensagem para código errado, vencido ou de e-mail sem acesso (de propósito).
- Fechar o modal no meio guarda o que foi preenchido e o passo; ao reabrir, a pessoa volta exatamente ao mesmo ponto. Clique fora do modal não fecha.
- Sessão terminada ou acesso retirado: a tela de entrada volta na hora e a pergunta pendente é enviada após o novo login (cenário 25).

### Chat
- Campo de pergunta cresce com o texto até ~30% da altura da tela e depois rola. **Enter envia; Shift+Enter quebra a linha.** O cursor começa no topo do campo.
- Degradê no início e no fim da área de mensagens ao rolar (desktop 48/40 px; mobile 36/32 px). O botão "ir para o fim" só aparece quando a pessoa rola para cima (fade-in).
- Durante a resposta, o botão de enviar vira "parar"; parar interrompe e mostra "Resposta interrompida…".
- Respostas com gráfico, tabela ou big numbers vão num card #F8F9FA sem contorno nem sombra.

### Ações de cada resposta
Copiar · Satisfatória · Insatisfatória · Mostrar como cheguei aqui.
- **Satisfatória:** o ícone vira o rótulo "obrigada ✓" (verde, sem tooltip). Clicar de novo desfaz.
- **Insatisfatória:** abre o modal "Nos ajude a melhorar". Motivo obrigatório (Resposta incorreta, Fontes incorretas, Não resolveu minha dúvida, Confuso ou pouco claro, Não gostei da formatação, Outros…). Detalhes opcionais, até 1.000 caracteres; com "Outros…" passam a ser obrigatórios. Ao enviar, aparece "Obrigado pelo feedback! Isso nos ajuda a melhorar a assistente." abaixo do botão e o modal fecha sozinho. Fechar sem enviar não marca o ícone.
- **Mostrar como cheguei aqui:** modal "Como a ANBY chegou a esta resposta" com, para cada consulta: Parâmetros, Fonte (ex.: "ANBIMA Feed", "Boletim de fundos de investimento") e Data de referência. Não mostrar quando não houve consulta de dados (recusas, fora do tema).

### Histórico de conversas
- Abre expandido com até 3 conversas; "Ver mais" mostra a 4ª e, acima disso, a lista rola. Clicar em "Conversas recentes" recolhe.
- Submenu "…": Renomear e Apagar conversa. Apagar pede confirmação no próprio submenu ("Excluir esta conversa? Ela sai da sua lista e não dá para desfazer." · Cancelar · Excluir).
- Se a exclusão falhar, "Não consegui excluir. Tente de novo." aparece por 5 s no lugar da data e a conversa continua na lista.
- "Nova conversa" sempre mostra a tela inicial.

### Sair e Termos de uso
- "Sair" encerra a sessão, fecha a ANBY (a pessoa volta à página onde estava) e mostra o toast "Você saiu da ANBY! Até a próxima." sobre a página, na parte inferior.
- "Termos de uso" abre na área do chat, com "← Voltar ao chat" fixo no topo.

### Gráficos
- **Gráfico que nasce de um gancho da home:** mesmas cores do gráfico da home (FIF #80C342, Estruturados #DE761C, ETF #275DD2, Off-shore #FCAF17).
- **Gráfico novo do chat:** série única #0095D9; categorias (até 6) na ordem #275DD2, #DE761C, #034694, #80C342, #D6519D, #028A9B (7ª #FCAF17; 8ª #666A7A só para "Outros"). Cabeçalho de tabela: texto #0079B1 sobre #EDF7FB.

### Erros e exceções (39 cenários)
Textos em `src/scenarios.ts`; telas no Figma, seção "Anby – Erros e exceções (Release 1.0)".
- **Aviso de sistema** (não respondeu, lotação, limites): no lugar da resposta, cinza #666, sem ações de resposta; o campo de pergunta continua ativo.
- **Resposta cortada:** o texto parcial fica e o aviso vem em itálico cinza; com resultado parcial, uma linha divisória #D4D4D4 separa conteúdo e aviso.
- **Recusas** (fora do tema, regras, ofensa, impróprio, recomendação): resposta normal, com copiar e avaliar, sem "Mostrar como cheguei aqui".
- **Erros de acesso:** campo com borda #BD3232 e mensagem vermelha sob o campo ou sob o botão.
- **Estados ao abrir:** bloco centralizado (avatar, título, texto, botão) na área do chat; "fora do ar" sem barra lateral; "aberta fora do ANBIMA Data" é página própria.

## O que é simulado no protótipo (o back-end precisa entregar)

| No protótipo | Na implementação real |
|---|---|
| Respostas e diálogos fixos (`dialogueByConversation`, `genericDialogue`) | Respostas da ANBY via API, com streaming |
| Código 123456 / 000000 | Envio e validação reais do código (validade de 10 min) |
| Sessão no `localStorage` por 30 dias | Sessão no servidor (expira em 12 h na mesma aba, conforme cenário 02) |
| Histórico em memória | Histórico persistido por usuário (renomear, excluir) |
| Dados do "Mostrar como cheguei aqui" (`TRACE_BY_QUESTION`) | Registro real das consultas (parâmetros, fonte, data de referência) |
| Feedback não é enviado | Envio do feedback com a conversa |
| Painel "Cenários de erro" e `?cenario=NN` | Remover: os estados devem vir das respostas reais da API |

## Acessibilidade (manter)
- Todo botão só de ícone tem `aria-label`; avisos usam `role="status"` e erros `role="alert"`.
- Esc fecha os modais; o foco vai para o primeiro campo ao abrir o acesso.
- Respeitar `prefers-reduced-motion` (animações já desligam).
- Contraste: textos sobre branco em #363636 / #666; não usar #B2B5BF para texto essencial (só placeholder).

## O que não fazer
- Não reativar funcionalidades ocultas sem pedido do design (use as chaves em `features.ts`).
- Não alterar os textos oficiais nem escrever "Anby" fora de maiúsculas.
- Não apagar código de funcionalidades ocultas.
- Não usar dados pessoais reais no protótipo (os links do Netlify são públicos).
- Não carregar fontes de `static.figma.com` em produção: hospedar a Lato (ver especificações).

## Pendência em aberto: regra do nome completo
- **Figma (anotação do passo 1 do acesso):** o nome só é válido com pelo menos 2 palavras separadas por espaço. O protótipo segue essa regra e, com uma palavra só, mostra "Insira o nome completo".
- **Documento de cenários de erro (29/10/2026):** só define o nome em branco ("Informe o seu nome."). Nos prints da implementação atual, um nome de uma palavra só ("Guilherme") é aceito e o código é enviado.
- **Decisão necessária (design):** manter a exigência de 2 palavras (e então oficializar a mensagem "Insira o nome completo" no documento de textos) ou aceitar qualquer nome não vazio (e remover a regra do protótipo). Até a decisão, não alterar o comportamento atual.
