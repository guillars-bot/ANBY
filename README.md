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

## Pendências do design (marcadas "Em aberto")
Tela de Termos de uso; exceção do botão flutuante quando há drawer aberto; validação automática do código sem clicar em "Confirmar".
