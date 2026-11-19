# v1.3 · Aviso legal no acesso (passos 1 e 2)

Troca o aviso legal antigo do modal de acesso (texto da ANBY de autorregulação, em linha corrida) pelo bloco novo do Figma "ANBY / Gate / Legal Notice": caixa cinza #F0F1F2 com ícone de informação azul e o texto em parágrafos. O aviso aparece abaixo dos campos, igual nos passos 1 e 2.

Base: ramo `v1.2-erros`, commit 8f9d5b9.

## Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/MfaModal.tsx` | Substituir o arquivo. Novo componente `LegalNotice` com o texto oficial; o `<p className="mfa-legal">` antigo saiu. O resto do arquivo não mudou. |
| `src/mfa-legal.css` | Arquivo novo, importado pelo `MfaModal.tsx`. Não precisa mexer no `index.css`. |

## Como subir no GitHub (pelo site)

1. Abra o repositório `guillars-bot/ANBY` e troque para o ramo `v1.2-erros` (ou crie um ramo `v1.3-aviso-legal` a partir dele).
2. Clique em **Add file → Upload files** e arraste a pasta `src` deste pacote. O GitHub substitui o `MfaModal.tsx` e cria o `mfa-legal.css`.
3. Mensagem do commit sugerida: `v1.3: aviso legal novo no acesso (passos 1 e 2)`.
4. A Netlify publica sozinha se estiver ligada a esse ramo.

## Texto aplicado (Figma, 19/11/2026)

Fonte Lato 12 / 1,2, cor #666666, com uma linha em branco entre os parágrafos. O Figma está em escala 0,8; no código, as medidas estão no tamanho real (padding 16 px, raio 8 px, ícone 16 px, espaço de 10 px entre o ícone e o texto).

## Pontos para revisar

- **Link "portal".** No Figma, o link aponta para um endereço do Outlook (Safe Links) que leva o e-mail de uma pessoa. No código, ele aponta direto para https://www.anbima.com.br/pt_br/institucional/protecao-de-dados.htm, o mesmo destino.
- **Ponto final em azul.** O ponto depois de "portal" está azul no Figma e foi mantido assim.
- **Crase.** O texto oficial diz "não substitui a consulta as fontes oficiais". Pela regra do projeto, textos oficiais não são reescritos, então ficou como está. Vale confirmar com o jurídico se o certo é "às fontes oficiais".
