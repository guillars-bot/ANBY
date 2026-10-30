import { useEffect, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import MfaModal from "./MfaModal";
import { features } from "./features";
import { clearSession, firstName, initials, loadSession, saveSession, type Session } from "./session";

const A = "/assets";

const initialConversations = [
  { id: 4, title: "Evolução mensal do IMA-B 5", date: "Hoje, 11:20", questions: 1 },
  { id: 1, title: "Panorama dos fundos de investimento", date: "Hoje, 10:42", questions: 6 },
  { id: 2, title: "Como está o mercado de debêntures?", date: "Ontem, 16:18", questions: 6 },
  { id: 3, title: "Indicadores de renda fixa", date: "10 de out.", questions: 6 },
];

const suggestions = [
  "Qual a taxa indicativa da NTN-B 2035?",
  "Qual o PL e o número de cotistas de um fundo da Kinea?",
  "Como está a curva de crédito AAA de debêntures?",
  "Mostra o resultado do IMA-B com a composição",
  "Qual a estimativa da taxa Selic de hoje?",
  "Debêntures IPCA+ com maior taxa indicativa no secundário",
];

const dialogueByConversation = {
  1: {
    answer: "A indústria de fundos segue diversificada, com movimentos de captação diferentes entre renda fixa, multimercados e ações. Posso ajudar a analisar patrimônio, fluxos e composição das carteiras.",
    followups: [
      ["Quais classes tiveram maior captação?", "Os fundos de renda fixa concentraram parte relevante dos fluxos recentes, enquanto outras classes apresentaram movimentos mais seletivos."],
      ["Quais indicadores devo observar primeiro?", "Acompanhe patrimônio líquido, captação líquida, quantidade de contas e rentabilidade por classe e categoria."],
      ["Os dados possuem séries históricas?", "Sim. As séries permitem comparar períodos e identificar mudanças no comportamento da indústria de fundos."],
      ["Consigo filtrar por categoria de fundo?", "Você pode segmentar a consulta por classe e categoria, refinando a análise conforme o recorte desejado."],
      ["Onde encontro a metodologia?", "A metodologia e as notas técnicas ficam disponíveis junto aos conjuntos de dados e boletins de fundos."],
    ],
  },
  2: {
    answer: "O mercado de debêntures pode ser acompanhado por volume emitido, remuneração, prazo, setor e perfil das ofertas. Esses recortes ajudam a entender as condições recentes do crédito privado.",
    followups: [
      ["Como evoluiu o volume de emissões?", "Os volumes variam ao longo do ano e podem ser analisados por mês, setor emissor e tipo de oferta."],
      ["Quais setores aparecem com mais frequência?", "Infraestrutura, energia e serviços financeiros costumam ter presença relevante, dependendo do período selecionado."],
      ["É possível comparar taxas e prazos?", "Sim. Você pode observar remuneração, indexador, duration e vencimento para comparar características das emissões."],
      ["Há dados de debêntures incentivadas?", "Os recortes permitem identificar emissões incentivadas e acompanhar sua participação no mercado."],
      ["Onde consulto as ofertas?", "Consulte os dados de mercado de capitais e as publicações periódicas disponíveis na ANBIMA Data."],
    ],
  },
  3: {
    answer: "Para acompanhar renda fixa, observe curvas de juros, índices de mercado, taxas indicativas e desempenho dos títulos. Cada indicador oferece uma leitura complementar do mercado.",
    followups: [
      ["Quais índices posso acompanhar?", "Os índices da família IMA ajudam a observar diferentes carteiras de títulos públicos por indexador e prazo."],
      ["O que são taxas indicativas?", "São referências apuradas a partir de informações de mercado, seguindo metodologia e critérios publicados pela ANBIMA."],
      ["Posso comparar diferentes vencimentos?", "Sim. A comparação por vencimento ajuda a visualizar a estrutura a termo e mudanças na percepção de risco."],
      ["Os dados são atualizados diariamente?", "A frequência varia conforme o indicador. A data de referência aparece junto a cada série ou publicação."],
      ["Onde encontro as séries completas?", "As séries históricas estão disponíveis nos datasets e nas páginas dos respectivos indicadores de renda fixa."],
    ],
  },
} satisfies Record<number, { answer: string; followups: string[][] }>;

const genericDialogue = {
  answer: "A ANBIMA acompanha a evolução da indústria e reúne dados consolidados para apoiar sua análise. Posso detalhar indicadores, publicações e séries históricas relacionadas a este tema.",
  followups: [
    ["Quais publicações posso consultar?", "Você pode começar pelos boletins e relatórios disponíveis na área de Publicações da ANBIMA Data."],
    ["Quais indicadores devo observar?", "A escolha depende do tema, período e objetivo da análise. Posso ajudar a construir um recorte inicial."],
    ["Os dados possuem séries históricas?", "Sim. Diversos indicadores permitem comparar períodos e identificar mudanças ao longo do tempo."],
    ["Consigo aplicar filtros?", "Os filtros disponíveis variam por conjunto de dados e ajudam a refinar a consulta."],
    ["Onde encontro a metodologia?", "A metodologia fica disponível junto às publicações e aos conjuntos de dados correspondentes."],
  ],
};

const imaBRows = [
  ["out/2025 (31/10)", "+1,03%", "10.428,01", 1.03],
  ["nov/2025 (28/11)*", "+1,08%", "10.540,21", 1.08],
  ["dez/2025 (31/12)", "+0,95%", "10.640,13", 0.95],
  ["jan/2026 (30/01)*", "+1,20%", "10.768,29", 1.2],
  ["fev/2026 (27/02)*", "+1,22%", "10.899,42", 1.22],
  ["mar/2026 (31/03)", "+1,39%", "11.051,37", 1.39],
  ["abr/2026 (30/04)", "+1,32%", "11.196,92", 1.32],
  ["mai/2026 (29/05)*", "+0,97%", "11.305,27", 0.97],
  ["jun/2026 (30/06)", "+0,22%", "11.329,97", 0.22],
  ["jul/2026 (31/07)", "+1,24%", "11.470,06", 1.24],
  ["ago/2026 (31/08)", "+1,28%", "11.616,57", 1.28],
  ["set/2026 (30/09)", "+2,01%", "11.849,51", 2.01],
] as const;

// "Mostrar como cheguei aqui": consultas que a ANBY fez para montar cada resposta (dados simulados).
type TraceStep = { title: string; params: string; source: string; date: string };
const TRACE_BY_QUESTION: Record<string, TraceStep[]> = {
  "Qual a taxa indicativa da NTN-B 2035?": [
    { title: "Consultando títulos públicos", params: "tipo_titulo: NTN-B · ano_vencimento: 2035", source: "ANBIMA Feed", date: "26/10/2026" },
  ],
  "Qual o PL e o número de cotistas de um fundo da Kinea?": [
    { title: "Consultando fundos de investimento", params: "gestor: Kinea · campos: patrimonio_liquido, numero_cotistas", source: "Boletim de fundos de investimento", date: "30/09/2026" },
  ],
  "Como está a curva de crédito AAA de debêntures?": [
    { title: "Consultando curvas de crédito", params: "ativo: debêntures · rating: AAA", source: "ANBIMA Feed", date: "26/10/2026" },
  ],
  "Mostra o resultado do IMA-B com a composição": [
    { title: "Consultando índices IMA", params: "indice: IMA-B · campos: composicao, variacao_mensal", source: "ANBIMA Feed", date: "19/10/2026" },
  ],
  "Mostre o resultado do IMA-B com a composição e traga em gráfico de evolução os valores de variação mês a mês": [
    { title: "Consultando índices IMA", params: "indice: IMA-B 5 · periodo: out/2025–set/2026", source: "ANBIMA Feed", date: "19/10/2026" },
  ],
  "Compare as categorias de fundos e entenda a composição do PL": [
    { title: "Consultando fundos de investimento", params: "campo: patrimonio_liquido · categorias: FIF, Estruturados, ETF, Off-shore", source: "Boletim de fundos de investimento", date: "31/07/2026" },
  ],
};
const traceFor = (question: string): TraceStep[] =>
  TRACE_BY_QUESTION[question] ?? [{ title: "Consultando publicações", params: `tema: ${question}`, source: "ANBIMA Feed", date: "26/10/2026" }];

type MenuDef = { key: string; label: string; sections: string[]; counter?: string; items: { label: string; badge?: string }[]; promo: { tag?: string; text: string } };
const API_PROMO = "Consuma dados de mercado via API de forma automatizada.";
const DATA_SECTIONS = ["Dados em tela", "Publicações", "Preços", "Índices", "Datasets (via arquivo)", "Datasets (via API)"];
const MENUS: MenuDef[] = [
  { key: "fundos", label: "Fundos", sections: DATA_SECTIONS, counter: "1", promo: { text: API_PROMO },
    items: [{ label: "Fundos (RCVM-175)", badge: "NOVO" }, { label: "Taxas de FIDCs" }, { label: "Dados de negociação (prévias do REUNE)" }, { label: "Painel de preços de renda fixa" }, { label: "Transparência de taxas de fundos" }] },
  { key: "privados", label: "Títulos Privados", sections: [...DATA_SECTIONS, "Ferramentas"], promo: { text: API_PROMO },
    items: [{ label: "Debêntures" }, { label: "Taxas de certificados de recebíveis (CRI e CRA)" }, { label: "Taxas de letras financeiras" }, { label: "Dados de negociação (prévias do REUNE)" }, { label: "Painel de preços de renda fixa" }, { label: "Curvas de crédito" }] },
  { key: "publicos", label: "Títulos Públicos", sections: [...DATA_SECTIONS, "Ferramentas"], promo: { text: API_PROMO },
    items: [{ label: "Monitoramento intradiário de títulos públicos federais" }, { label: "Títulos públicos" }, { label: "Valor nominal atualizado (VNA)" }] },
  { key: "mais", label: "Mais", sections: ["Distribuição", "Macroeconômico", "Análises de mercado", "Carteiras administradas", "Datasets (via API)"],
    promo: { tag: "NOVIDADE", text: "Uma nova forma de buscar informações e conteúdos sobre o mercado financeiro." },
    items: [{ label: "Boletim de private e varejo" }, { label: "Estatísticas de gestores de patrimônio" }, { label: "Estatísticas de private" }, { label: "Estatísticas de varejo" }, { label: "Estatísticas de distribuição" }] },
];

function MegaMenu({ menu }: { menu: MenuDef }) {
  const [section, setSection] = useState(0);
  return (
    <div className="mega-menu" role="menu">
      <ul className="mega-sections">
        {menu.sections.map((label, index) => (
          <li key={label}>
            <button className={section === index ? "on" : ""} onMouseEnter={() => setSection(index)} onFocus={() => setSection(index)} role="menuitem">
              <span>{label}</span>
              {index === 0 && menu.counter && <i className="mega-badge">{menu.counter}</i>}
              {section === index && <svg width="11" height="8" viewBox="0 0 11 8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m1 1.5 4.5 4.5L10 1.5" /></svg>}
            </button>
          </li>
        ))}
      </ul>
      <ul className="mega-items">
        {menu.items.map((item) => (
          <li key={item.label}><button role="menuitem"><span>{item.label}</span>{item.badge && <i className="mega-new">{item.badge}</i>}</button></li>
        ))}
      </ul>
      <div className="mega-promo">
        <div className="mega-card">
          {menu.promo.tag && <span className="mega-tag">{menu.promo.tag}</span>}
          <p>{menu.promo.text}</p>
          <button>Acessar <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 6h15M11 1l5 5-5 5" /></svg></button>
        </div>
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <div className="about">
      <div className="about-note">
        <InfoIcon />
        <div>
          <p>A ANBY consiste em sistema de inteligência artificial desenvolvido pela Anbima para auxiliar nas dúvidas relacionadas à autorregulação da associação.</p>
          <p>Apesar de todo o esforço para assegurar a exatidão e a atualização das respostas, as informações fornecidas têm fins exclusivamente informativos, podendo conter imprecisões, omissões e/ou interpretações equivocadas.</p>
          <p>As respostas fornecidas pela ANBY não constituem, nem devem ser interpretadas como aconselhamento, consultoria, parecer ou orientação de natureza profissional, jurídica e/ou financeira, tampouco como recomendação, conselho, indicação, sugestão, aviso ou garantia de resultado da Anbima.</p>
          <p>Para quaisquer tomadas de decisão, recomenda-se a verificação independente das informações e a consulta a profissionais habilitados, bem como as fontes oficiais.</p>
        </div>
      </div>
      <h2>Eu sou a ANBY!</h2>
      <p className="about-sub">Sua assistente virtual de autorregulação da Anbima</p>
      <p>Estou aqui para tornar mais simples o seu dia a dia com os códigos, regras e procedimentos da autorregulação. Se você tiver dificuldade para encontrar alguma informação nessa documentação, pode contar comigo!</p>
      <p>Por enquanto, meu foco é exclusivamente em autorregulação. Isso significa que alguns assuntos ainda estão fora do meu alcance, como: dados de mercado, dúvidas sobre exames de certificação, orientações regulatórias ou jurídicas que não constem nos documentos da Anbima.</p>
      <p>Para outras questões, acesse <a href="https://www.anbima.com.br" target="_blank" rel="noreferrer">www.anbima.com.br</a></p>
      <hr />
      <h3>Não ficou satisfeito com alguma resposta?</h3>
      <p>Durante nossa interação no chat, utilize as ferramentas de feedback disponíveis para avaliar a utilidade da resposta. Assim, você contribui para o meu aprimoramento.</p>
      <div className="about-step">
        <div className="about-shot" aria-hidden="true" />
        <div><span className="about-num">1</span><p>As ferramentas de feedback estão localizadas ao fim de cada resposta.</p><p>A caixa de comentários é ativada quando você seleciona “Resposta insatisfatória”.</p></div>
      </div>
      <div className="about-step">
        <div className="about-shot" aria-hidden="true" />
        <div><span className="about-num">2</span><p>No espaço de comentários, selecione o motivo e compartilhe sugestões detalhadas sobre o que poderia melhorar na resposta.</p></div>
      </div>
    </div>
  );
}

function ConnectPanel() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const desktopConfig = `{
  "mcpServers": {
    "anby-data": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://abda.liqi.com.br/mcp",
               "--header", "Authorization: Bearer SEU_TOKEN"]
    }
  }
}`;
  return (
    <div className="connect">
      <h2>Conectar no Anby Data via MCP</h2>
      <p className="connect-lead">Conecte a Anby Data ao seu Claude (Claude Code ou Claude Desktop) e faça perguntas — e baterias de teste — direto pelo assistente, via MCP (Model Context Protocol).</p>
      <section className="connect-card">
        <h3>O que é</h3>
        <p>Um servidor MCP que expõe a ferramenta <b>perguntar_anby</b>: você (ou o seu Claude) manda uma pergunta e recebe a resposta da Anby Data — os mesmos dados e o mesmo comportamento do chat (fundos, títulos públicos, crédito privado, índices ANBIMA, curvas, projeções, Selic), sempre com fonte e data. Ideal para rodar baterias de teste automatizadas (cobertura de dados, recusas, prompt injection, segurança).</p>
        <p><b>Endpoint:</b> <a href="https://abda.liqi.com.br/mcp" target="_blank" rel="noreferrer">https://abda.liqi.com.br/mcp</a> · transporte <b>HTTP (Streamable)</b> · autenticação <b>Bearer token</b>.</p>
      </section>
      <section className="connect-card">
        <h3>🔑 Gerar o seu token</h3>
        <p>Digite o e-mail com que você acessa a Anby Data. Se ele estiver na lista de acesso, o token chega nesse e-mail em instantes. Nos comandos abaixo, troque <code>SEU_TOKEN</code> pelo token recebido.</p>
        <form className="connect-form" onSubmit={(event) => { event.preventDefault(); if (valid) setSent(true); }}>
          <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSent(false); }} placeholder="seu.nome@anbima.com.br" aria-label="E-mail de acesso" />
          <button type="submit" disabled={!valid}>Enviar meu token</button>
        </form>
        {sent && <p className="connect-sent" role="status">Solicitação registrada. Se o e-mail estiver na lista de acesso, o token chega em instantes. (Protótipo: nenhum e-mail é enviado.)</p>}
        <small>O token é pessoal: as perguntas feitas com ele ficam registradas no seu nome e contam no mesmo limite de uso do chat. Vale por 90 dias. Pedir um novo não cancela o anterior. Se o seu e-mail sair da lista de acesso, o token deixa de funcionar. Não compartilhe o token; se ele vazar, peça à equipe da Liqi para cancelá-lo.</small>
      </section>
      <h3 className="connect-h">Claude Code (terminal)</h3>
      <section className="connect-card">
        <div className="connect-step"><i>1</i><div><p>No terminal, adicione o servidor:</p>
          <pre><code>{`claude mcp add --transport http anby-data https://abda.liqi.com.br/mcp \\
  --header "Authorization: Bearer SEU_TOKEN"`}</code></pre></div></div>
        <div className="connect-step"><i>2</i><div><p>Abra o Claude e use naturalmente: <em>“pergunte à Anby a estimativa da Selic de hoje”</em> ou <em>“rode uma bateria de perguntas de dados na Anby”</em>. O Claude chamará a tool <code>perguntar_anby</code> sozinho.</p></div></div>
      </section>
      <h3 className="connect-h">Claude Desktop</h3>
      <section className="connect-card">
        <div className="connect-step"><i>1</i><div><p>Em <b>Settings → Developer → Edit Config</b>, adicione (usa o conector <code>mcp-remote</code> para transporte HTTP com header):</p>
          <pre><code>{desktopConfig}</code></pre></div></div>
        <div className="connect-step"><i>2</i><div><p>Reinicie o Claude Desktop. A ferramenta <b>perguntar_anby</b> aparecerá disponível.</p></div></div>
      </section>
      <h3 className="connect-h">A ferramenta</h3>
      <div className="connect-tool">
        <b>perguntar_anby(mensagem, sessionId?)</b>
        <p>• <b>mensagem</b> — a pergunta (em qualquer idioma; a Anby responde em pt-BR).</p>
        <p>• <b>sessionId</b> (opcional) — para continuar uma conversa (teste multi-turno). Use um prefixo único por testador.</p>
        <p>Retorna a resposta da Anby + <code>sessionId</code>, número de consultas à base e latência.</p>
      </div>
      <p className="connect-warn">Cada pergunta feita pelo MCP fica registrada no nome de quem pediu o token, como no chat. As respostas têm finalidade informativa; não constituem recomendação de investimento. Dúvidas? Fale com a equipe da Liqi.</p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="3.9" y="0.9" width="4.2" height="6.8" rx="2.1" stroke="#0095d9" strokeWidth="1.2" />
      <path d="M1.9 6.1a4.1 4.1 0 008.2 0M6 10.2v1" stroke="#0095d9" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
      <rect width="9" height="9" rx="1.5" fill="#fff" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <rect width="10" height="10" rx="2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 9.6 9.6" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.51567 2.54414L5.51567 8.91429H4.08435L4.08435 2.54414L1.0121 5.39694L8.2016e-06 4.45714L4.80001 -1.90735e-07L9.60001 4.45714L8.58791 5.39694L5.51567 2.54414Z" />
    </svg>
  );
}

function TraceIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="2.5" cy="2.5" r="1.5" /><circle cx="9.5" cy="9.5" r="1.5" />
      <path d="M4 2.5h3.5a2 2 0 0 1 0 4h-3a2 2 0 0 0 0 4H8" />
    </svg>
  );
}

function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2.5 6.5 2.3 2.3L9.5 3.5" /></svg>;
}

function ArrowDownIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 2v10M3 8l4 4 4-4" /></svg>;
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0095d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4a8 8 0 0 0-6.9 12.1L4 20l3.9-1.1A8 8 0 1 0 12 4z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0095d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.01" />
    </svg>
  );
}

function RichMarketResponse({ actions }: { actions: ReactNode }) {
  return (
    <>
      <div className="user-row"><p>Mostre o resultado do IMA-B com a composição e traga em gráfico de evolução os valores de variação mês a mês</p></div>
      <div className="ai-row rich-ai-row">
        <img src={`${A}/54cd1.png`} alt="ANBY" />
        <div className="ai-content rich-response">
          <p>Os resultados vieram pelo subíndice <strong>IMA-B 5</strong> (os dados da família trazem os subíndices; o IMA-B 5 é o que aparece com histórico consistente por data). Aqui está a evolução da variação mensal, com o gráfico pedido:</p>
          <section className="chat-chart" aria-label="Gráfico da variação mensal do IMA-B 5">
            <h3>IMA-B 5 — variação mensal (%)</h3>
            {imaBRows.map(([month, variation, , value]) => (
              <div className="chat-bar-row" key={month}>
                <span>{month.slice(0, 6)}</span>
                <i><b style={{ width: `${(value / 2.01) * 100}%` }} /></i>
                <em>{variation.replace("+", "").replace("%", "")}</em>
              </div>
            ))}
          </section>
          <div className="chat-table-wrap">
            <table className="chat-data-table">
              <thead><tr><th>Mês de referência</th><th>Variação no mês</th><th>Nº-índice (fechamento)</th></tr></thead>
              <tbody>{imaBRows.map(([month, variation, index]) => <tr key={month}><td>{month}</td><td>{variation}</td><td>{index}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="chat-note">*Meses em que não houve divulgação no último dia (fim de semana/feriado): usei o último dia útil anterior, indicado entre parênteses.</p>
          <p><strong>Fonte:</strong> ANBIMA, índices IMA (IMA-B 5) — cada “variação no mês” é o acumulado do próprio mês até a data de referência.</p>
          <p>Observações:</p>
          <ul>
            <li>Esses são os números do subíndice <strong>IMA-B 5</strong> (NTN-B com vencimento em até 5 anos). Se você quiser o <strong>IMA-B cheio</strong> ou o <strong>IMA-B 5+</strong> mês a mês, consigo montar a mesma série.</li>
            <li>Quer que eu estenda o período ou troque a visualização para o número-índice acumulado?</li>
          </ul>
          {actions}
        </div>
      </div>
    </>
  );
}

function FundCompositionResponse({ actions }: { actions: ReactNode }) {
  const bars = [
    [70,11,8,11,"Ago 25"],[42,27,20,11,"Set 25"],[58,10,17,15,"Out 25"],[46,25,12,17,"Nov 25"],
    [33,31,27,9,"Dez 25"],[45,13,24,18,"Jan 26"],[57,17,9,17,"Fev 26"],[40,10,22,28,"Mar 26"],
    [43,23,20,14,"Abr 26"],[30,42,19,9,"Mai 26"],[62,14,11,13,"Jun 26"],[66,7,5,22,"Jul 26"],
  ] as const;
  return (
    <>
      <div className="user-row"><p>Compare as categorias de fundos e entenda a composição do PL</p></div>
      <div className="ai-row rich-ai-row">
        <img src={`${A}/54cd1.png`} alt="ANBY" />
        <div className="ai-content rich-response">
          <p>O patrimônio líquido dos fundos alcançou <strong>R$ 11 trilhões em julho de 2026</strong>. O gráfico abaixo mostra a evolução e a composição entre FIF, Estruturados, ETF e Off-shore nos últimos 12 meses.</p>
          <section className="chat-composition-chart" aria-label="Evolução da composição do patrimônio líquido">
            <div className="chat-composition-legend"><span><i className="fif" />FIF</span><span><i className="structured" />Estruturados</span><span><i className="etf" />ETF</span><span><i className="offshore" />Off-shore</span></div>
            <div className="chat-composition-plot">
              {bars.map(([a,b,c,d,label]) => <div key={label}><span className="chat-stack"><i className="offshore" style={{height:`${d}%`}}/><i className="etf" style={{height:`${c}%`}}/><i className="structured" style={{height:`${b}%`}}/><i className="fif" style={{height:`${a}%`}}/></span><small>{label}</small></div>)}
            </div>
          </section>
          <p>Os <strong>FIF</strong> representam a maior parcela do patrimônio, enquanto fundos estruturados ganharam participação em alguns períodos. ETF e Off-shore mantêm participação menor, mas complementam a diversificação da indústria.</p>
          {actions}
        </div>
      </div>
    </>
  );
}

function AssistantThinking({ stage, question = "Compare as categorias de fundos e entenda a composição do PL", labels = ["Iniciando...", "Pensando...", "Analisando...", "Gerando a resposta..."] }: { stage: number; question?: string; labels?: string[] }) {
  return (
    <>
      <div className="user-row"><p>{question}</p></div>
      <div className="ai-row thinking-row">
        <img src={`${A}/54cd1.png`} alt="ANBY" />
        <div className="thinking-status" role="status" aria-live="polite">
          <i aria-hidden="true" />
          <span>{labels[stage]}</span>
        </div>
      </div>
    </>
  );
}

function MenuIcon({ name }: { name: "rename" | "share" | "delete" | "more" }) {
  if (name === "more") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>;
  }
  if (name === "share") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L8 7m4-4 4 4M8 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2" /></svg>;
  }
  if (name === "rename") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.2-1 10.6-10.6a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" /><path d="m14.5 6.7 3 3M4 20h5" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" /></svg>;
}

// Home mobile (Figma "Anby MOBILE - Release 1.0 - AJUSTES"): o painel de dados de fundos fica dentro do card,
// aberto por "Mais detalhes". As cores seguem as da home (gráficos de gancho da ANBY usam a mesma paleta).
const MOBILE_FUND_LEGEND = [
  ["fif", "FIF", "79,6%"],
  ["structured", "Estruturados", "2,4%"],
  ["etf", "ETF", "17,1%"],
  ["offshore", "Off-shore", "0,9%"],
] as const;
// Altura de cada segmento (px, escala de 240px = 50 milhões): FIF, Estruturados, ETF, Off-shore.
const MOBILE_FUND_BARS = [
  ["Fev", "2026", 128, 8, 6, 9],
  ["Mar", "", 89, 39, 30, 9],
  ["Abr", "", 80, 43, 60, 9],
  ["Mai", "", 101, 39, 47, 16],
  ["Jun", "", 101, 39, 47, 16],
  ["Jul", "", 82, 39, 34, 16],
] as const;

function PeriodChips({ active = "6M" }: { active?: string }) {
  return (
    <div className="m-chips" role="group" aria-label="Período">
      {["6M", "12M", "24M", "36M"].map((label) => <button key={label} className={label === active ? "on" : ""} aria-pressed={label === active}>{label}</button>)}
    </div>
  );
}

function MobileFundDetails({ onOpenAssistant }: { onOpenAssistant: (scenario?: "fund-composition") => void }) {
  return (
    <div className="m-details" id="m-fund-details">
      <ul className="m-legend">
        {MOBILE_FUND_LEGEND.map(([key, label, share]) => <li key={key}><i className={key} /><span>{label}</span><b>{share}</b></li>)}
      </ul>
      <div className="m-block">
        <PeriodChips />
        <p className="m-fixed"><span>Jul 2026</span><b>11 TRI</b><span>total do mês</span></p>
        <div className="m-stack-chart" aria-label="Composição do patrimônio líquido nos últimos 6 meses">
          <span className="m-unit">milhões</span>
          <div className="m-y"><span>50</span><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
          <div className="m-plot">
            {MOBILE_FUND_BARS.map(([month, year, fif, structured, etf, offshore], index) => (
              <div key={month} className={index === MOBILE_FUND_BARS.length - 1 ? "m-col current" : "m-col"}>
                <div className="m-bar">
                  <i className="offshore" style={{ height: offshore }} /><i className="etf" style={{ height: etf }} />
                  <i className="structured" style={{ height: structured }} /><i className="fif" style={{ height: fif }} />
                </div>
                <small>{month}{year && <><br />{year}</>}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Gancho contextual: abre a ANBY com o contexto deste gráfico (Figma: frame chat 1.2). */}
      <button className="m-anby-cta" onClick={() => onOpenAssistant("fund-composition")}>
        <span>Compare as categorias de fundos e entenda a composição do PL</span>
        <b><img src={`${A}/54cd1.png`} alt="" />Explore com a <img className="m-anby-logo" src={`${A}/anby-logo.png`} alt="ANBY" /></b>
      </button>
      <div className="m-block">
        <div className="m-card-head"><h3>Fundos de investimento</h3><small>Julho 2026</small></div>
        <strong className="m-number">34.095</strong>
        <p className="m-caption">Quantidade de fundos (estoque)</p>
        <p className="m-filter">Filtrar por:</p>
        <PeriodChips />
        <p className="m-fixed"><span>Mai 2026</span><i className="m-dot" /><b>33.626</b></p>
        <div className="m-line-chart">
          <span className="m-unit">mil</span>
          <div className="m-y"><span>34</span><span>33</span><span>32</span></div>
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-label="Evolução da quantidade de fundos">
            <defs><linearGradient id="mAreaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0095d9" stopOpacity=".3" /><stop offset="1" stopColor="#0095d9" stopOpacity=".08" /></linearGradient></defs>
            <polygon points="0,62 60,60 120,48 180,30 240,40 300,26 300,100 0,100" fill="url(#mAreaFill)" />
            <polyline points="0,62 60,60 120,48 180,30 240,40 300,26" fill="none" stroke="#0095d9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <line x1="180" y1="0" x2="180" y2="100" stroke="#b2b5bf" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          </svg>
          <i className="m-line-point" style={{ left: "calc(34px + (100% - 34px) * .6)", top: "58px" }} />
          <div className="m-months"><span>Fev<br />2026</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span></div>
        </div>
      </div>
      <div className="m-related">
        <h3>Mais dados e publicações de fundos de investimento</h3>
        {["Boletim de fundos de investimento", "Dashboard radar 175", "Dashboard de FIDCs"].map((title) => (
          <article key={title}><img src={`${A}/c95e1.svg`} alt="" /><span>{title}</span><a href="#acessar" onClick={(event) => event.preventDefault()}>Acessar</a></article>
        ))}
      </div>
    </div>
  );
}

function PortalHome({ onOpenAssistant }: { onOpenAssistant: (scenario?: "fund-composition") => void }) {
  const [fundDetailsOpen, setFundDetailsOpen] = useState(false);
  return (
    <div className="portal-home">
      <section className="portal-hero">
        <div className="portal-container">
          <h1>Os dados que orientam o mercado financeiro<br className="desktop-break" /> <strong>de forma gratuita e com a transparência ANBIMA</strong></h1>
          <div className="portal-metrics">
            <article className={fundDetailsOpen ? "metric-card has-details open" : "metric-card has-details"}>
              <div><h2>Fundos de Investimento</h2><small>Julho 2026</small></div>
              <div><strong>11 TRI</strong><p>Patrimônio líquido</p></div>
              <div className="metric-bar funds"><i /><i /><i /><i /></div>
              <button className="m-more" onClick={() => setFundDetailsOpen(!fundDetailsOpen)} aria-expanded={fundDetailsOpen} aria-controls="m-fund-details">
                {fundDetailsOpen ? "Menos detalhes" : "Mais detalhes"}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
              </button>
              {fundDetailsOpen && <MobileFundDetails onOpenAssistant={onOpenAssistant} />}
            </article>
            <article className="metric-card">
              <div><h2>Títulos Privados</h2><small>Julho 2026</small></div>
              <div><strong>67,9 BI</strong><p>Volume captado</p></div>
              <div className="metric-bar private"><i /><i /><i /></div>
            </article>
            <article className="metric-card">
              <div><h2>Títulos Públicos</h2><small>Julho 2026</small></div>
              <div><strong>84,2 BI</strong><p>Volume negociado (Selic)</p></div>
              <div className="metric-bar public"><i /><i /></div>
            </article>
            <article className="anby-highlight">
              <img src={`${A}/d4db0.png`} alt="" />
              <span>Novidade</span>
              <div>
                <h2>Pergunte a ANBY</h2>
                <p>Uma nova forma de buscar informações e conteúdos sobre o mercado financeiro.</p>
                <button onClick={() => onOpenAssistant()}>Acessar ↗</button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="portal-data">
        <nav className="data-tabs" aria-label="Categorias de dados">
          <button className="active">Fundos de investimento</button>
          <button>Títulos privados</button>
          <button>Títulos públicos</button>
        </nav>
        <div className="data-grid">
          <article className="data-card chart-card fidelity-card">
            <div className="data-card-header">
              <div><small>Fundos de Investimento</small><strong>11 TRILHÕES</strong><p>Patrimônio líquido - Julho 2026</p></div>
              <div className="periods"><button>6M</button><button className="active">12M</button><button>24M</button><button>36M</button></div>
            </div>
            <div className="fund-chart-toolbar">
              <div className="chart-legend"><span><i className="fif" />FIF</span><span><i className="structured" />Estruturados</span><span><i className="etf" />ETF</span><span><i className="offshore" />Off-shore</span></div>
              <div className="chart-tools"><img src={`${A}/af9b5.svg`} alt="Aumentar zoom" /><img src={`${A}/87297.svg`} alt="Diminuir zoom" /><img src={`${A}/16055.svg`} alt="Restaurar zoom" /><img src={`${A}/99a07.svg`} alt="Mover gráfico" /></div>
            </div>
            <div className="fund-chart" aria-label="Composição do patrimônio líquido dos fundos">
              <div className="chart-y-axis"><span>25 Mi</span><span>20 Mi</span><span>15 Mi</span><span>10 Mi</span><span>5 Mi</span><span>0</span></div>
              <div className="stacked-plot">
                {[
                  [70,11,8,11,"Ago 25"],[42,27,20,11,"Set 25"],[58,10,17,15,"Out 25"],[46,25,12,17,"Nov 25"],
                  [33,31,27,9,"Dez 25"],[45,13,24,18,"Jan 26"],[57,17,9,17,"Fev 26"],[40,10,22,28,"Mar 26"],
                  [43,23,20,14,"Abr 26"],[30,42,19,9,"Mai 26"],[62,14,11,13,"Jun 26"],[66,7,5,22,"Jul 26"],
                ].map(([a,b,c,d,label]) => (
                  <div className="stack-column" key={label}>
                    <div className="bar-stack">
                      <i className="offshore" style={{ height: `${d}%` }} /><i className="etf" style={{ height: `${c}%` }} />
                      <i className="structured" style={{ height: `${b}%` }} /><i className="fif" style={{ height: `${a}%` }} />
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="chart-anby-cta" onClick={() => onOpenAssistant("fund-composition")}><span>Compare as categorias de fundos e entenda a composição do PL.</span><img src={`${A}/54cd1.png`} alt="" /><b>Explore com a ANBY</b></button>
          </article>
          <article className="data-card number-card fidelity-card">
            <div><small>Fundos de Investimento</small><strong>34.095</strong><p>Quantidade de fundos (estoque) - Julho 2026</p></div>
            <div className="line-filter"><b>Filtrar por:</b><div className="periods"><button className="active">6M</button><button>12M</button><button>24M</button><button>36M</button></div></div>
            <div className="line-chart">
              <span className="line-unit">mil</span>
              <div className="line-y-axis"><span>34</span><span>33</span><span>32</span></div>
              <svg viewBox="0 0 300 125" preserveAspectRatio="none" aria-label="Evolução da quantidade de fundos">
                <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0095d9" stopOpacity=".3" /><stop offset="1" stopColor="#0095d9" stopOpacity=".08" /></linearGradient></defs>
                <polygon points="0,85 50,82 100,70 150,58 200,63 250,72 300,55 300,125 0,125" fill="url(#areaFill)" />
                <polyline points="0,85 50,82 100,70 150,58 200,63 250,72 300,55" fill="none" stroke="#0095d9" strokeWidth="2" />
                <line x1="150" y1="0" x2="150" y2="125" stroke="#b2b5bf" strokeDasharray="3 3" />
                <circle cx="150" cy="58" r="5" fill="#0095d9" stroke="#fff" strokeWidth="2" />
              </svg>
              <div className="line-tooltip"><b>Maio 2026</b><span><i />33.626</span></div>
              <div className="line-months"><span>Fev<br />2026</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span></div>
            </div>
          </article>
        </div>

        <section className="resources">
          <h2>Mais dados e publicações de fundos de investimento</h2>
          <div className="resource-grid">
            {[
              ["Boletim de fundos de investimento", "Acessar"],
              ["Dashboard Radar 175", "Acessar"],
              ["Dashboard de FIDC", "Acessar"],
            ].map(([title, action]) => (
              <article key={title}><img src={`${A}/c95e1.svg`} alt="" /><span>{title}</span><button>{action} ↗</button></article>
            ))}
          </div>
        </section>
      </section>

      <section className="market-strip">
        {[
          ["IMA-Geral", "10.206,883519", "#0095d9"],
          ["IMA-C", "4.621,869615", "#80c342"],
          ["IDA-DI", "2.052,750264", "#9a56d6"],
          ["IDA-IPCA", "8.615,052591", "#de761c"],
          ["IRF-M", "6.296,840000", "#666"],
        ].map(([label, value, color], itemIndex) => (
          <article key={label}>
            <small><i style={{ background: color }} /> {label}</small>
            <strong>{value}</strong>
            <svg viewBox="0 0 150 38" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={itemIndex % 2 ? "0,28 15,22 30,25 45,13 60,18 75,10 90,19 105,15 120,24 135,12 150,17" : "0,24 15,26 30,17 45,22 60,10 75,15 90,9 105,17 120,12 135,26 150,14"} style={{ stroke: color }} />
            </svg>
            <span>12M</span>
          </article>
        ))}
      </section>

      <section className="explore-section">
        <div className="explore-wrap">
          <h2>Novidades para você explorar</h2>
          <p>Acompanhe os lançamentos mais recentes em dados, publicações e ferramentas do mercado financeiro.</p>
          <div className="explore-card">
            <div className="explore-copy">
              <small>Lançamento</small>
              <h3>Fundos de Investimento em Direitos Creditórios</h3>
              <p>Com uma interface intuitiva e conteúdo estratégico, o dashboard reúne indicadores essenciais para apoiar consultas de forma mais segura, fácil e ágil.</p>
              <ul>
                <li>Quantidade de classes e contas por segmento do investidor</li>
                <li>Volume captado nas ofertas</li>
                <li>Índice FIDC e composição do investimento</li>
              </ul>
              <button>Acessar ↗</button>
            </div>
            <div className="explore-visual">
              <div className="visual-window">
                <span></span><span></span><span></span>
                <div className="visual-columns"><i /><i /><i /><i /><i /><i /></div>
              </div>
            </div>
          </div>
          <div className="explore-controls"><i /><button>‹</button><button>›</button></div>
        </div>
      </section>

      <footer className="portal-footer">
        <div className="footer-wrap">
          <img src={`${A}/d19e1.svg`} alt="ANBIMA Data" />
          <div><strong>ANBIMA</strong><a>Portal ANBIMA</a><a>ANBIMA Feed</a><a>ANBIMA Edu</a><a>Dúvidas e feedbacks</a></div>
          <div><strong>Mais informações</strong><a>Regras de privacidade</a><a>Termos de uso</a><a>Transparência e governança</a></div>
          <div className="footer-legal"><strong>Versão 7.39.77</strong><p>As fontes das informações apresentadas são ANBIMA, B3, CVM, demais participantes dos setores de crédito privado e responsáveis pelos fundos de investimento. Este site é protegido por reCAPTCHA.</p><p>Neste portal se aplicam as regras de privacidade e os termos de uso.</p></div>
        </div>
      </footer>

      <button className="anby-launcher" onClick={() => onOpenAssistant()} aria-label="Abrir assistente ANBY">
        <span>Pergunte à ANBY</span>
        <img src={`${A}/b864c.png`} alt="ANBY" />
      </button>
    </div>
  );
}

export default function App() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [entryScenario, setEntryScenario] = useState<"fund-composition" | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [conversations, setConversations] = useState(initialConversations);
  const [active, setActive] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [sentQuestion, setSentQuestion] = useState("");
  // Ações por resposta (índice 0 = primeira resposta, 1+ = respostas seguintes da conversa).
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [ratings, setRatings] = useState<Record<number, "up" | "down">>({});
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(0);
  // Pergunta clicada antes do login: é enviada automaticamente após a validação.
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  // Feedback negativo enviado: mostra o aviso de agradecimento abaixo do botão antes de fechar o modal.
  const [feedbackThanks, setFeedbackThanks] = useState(false);
  // "Mostrar como cheguei aqui": pergunta da resposta cujo caminho está aberto.
  const [traceQuestion, setTraceQuestion] = useState<string | null>(null);
  // Toast de saída ("Você saiu da ANBY!").
  const [logoutToast, setLogoutToast] = useState(false);
  // Botão "ir para o fim" do chat: só aparece quando o usuário rola para cima.
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  // Campo do chat cresce com o texto (como no Claude) até um limite; depois rola.
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [conversationOverflows, setConversationOverflows] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [sharedId, setSharedId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentExpanded, setRecentExpanded] = useState(true);
  const [showAllConversations, setShowAllConversations] = useState(false);
  const [voice, setVoice] = useState<"idle" | "recording">("idle");
  const [seconds, setSeconds] = useState(0);
  const [transcribed, setTranscribed] = useState(false);
  const [tip, setTip] = useState<{ text: string; top: number; left: number; dir: "r" | "l" } | null>(null);
  const assistantRef = useRef<HTMLDivElement>(null);
  const [initialSession] = useState(loadSession);
  const [session, setSession] = useState<Session | null>(initialSession.session);
  const [sessionExpired, setSessionExpired] = useState(initialSession.expired);
  const [mfaOpen, setMfaOpen] = useState(false);
  const [panel, setPanel] = useState<null | "about" | "connect">(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const menuTimer = useRef<number | undefined>(undefined);
  const openMenu = (key: string) => { window.clearTimeout(menuTimer.current); setMenuOpen(key); };
  const scheduleCloseMenu = () => { window.clearTimeout(menuTimer.current); menuTimer.current = window.setTimeout(() => setMenuOpen(null), 120); };
  const [responding, setResponding] = useState(false);
  const [thinkStage, setThinkStage] = useState(0);
  const [interrupted, setInterrupted] = useState(false);

  const newConversation = () => {
    setEntryScenario(null);
    setScenarioLoading(false);
    setPanel(null);
    setActive(null);
    setQuestion("");
    setSentQuestion("");
    setResponding(false);
    setInterrupted(false);
    setCopiedIndex(null);
    setRatings({});
    setDrawerOpen(false);
  };

  const askQuestion = (text: string) => {
    setSentQuestion(text);
    setQuestion("");
    setTranscribed(false);
    setInterrupted(false);
    setThinkStage(0);
    setResponding(true);
  };
  const sendQuestion = () => {
    if (question.trim() && !responding) askQuestion(question.trim());
  };
  // Pausar interrompe a resposta; para reiniciar é preciso enviar a pergunta de novo.
  const pauseResponse = () => {
    setResponding(false);
    setInterrupted(true);
  };

  // Tooltip posicionado em relação ao painel do assistente (evita cortes por overflow)
  const showTip = (element: HTMLElement, text: string, dir: "r" | "l" = "r") => {
    const host = assistantRef.current;
    if (!host) return;
    const hostRect = host.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    setTip({
      text,
      dir,
      top: rect.top - hostRect.top + rect.height / 2,
      left: dir === "r" ? rect.right - hostRect.left + 10 : rect.left - hostRect.left - 10,
    });
  };
  const hideTip = () => setTip(null);
  const tipProps = (text: string, dir: "r" | "l" = "r", enabled = true) => ({
    onMouseEnter: (event: MouseEvent<HTMLElement>) => { if (enabled) showTip(event.currentTarget, text, dir); },
    onMouseLeave: hideTip,
    onFocus: (event: FocusEvent<HTMLElement>) => { if (enabled && event.currentTarget.matches(":focus-visible")) showTip(event.currentTarget, text, dir); },
    onBlur: hideTip,
  });

  // Ditado por voz (simulado: não acessa o microfone)
  useEffect(() => {
    if (voice !== "recording") return;
    setSeconds(0);
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [voice]);

  const toggleRecording = (event: MouseEvent<HTMLElement>) => {
    if (voice === "idle") {
      setQuestion("");
      setTranscribed(false);
      setVoice("recording");
      showTip(event.currentTarget, "Parar e transcrever", "l");
    } else {
      setVoice("idle");
      setQuestion("Exemplo de texto ditado por áudio.");
      setTranscribed(true);
      showTip(event.currentTarget, "Ditar a pergunta", "l");
    }
  };

  const cancelRecording = () => {
    setVoice("idle");
    setTranscribed(false);
  };

  const recordingTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const copyAnswer = async (index: number, text: string) => {
    try { await navigator.clipboard?.writeText(text); } catch { /* clipboard indisponível */ }
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1800);
  };

  const toggleLike = (index: number) => {
    setRatings((current) => {
      const next = { ...current };
      if (next[index] === "up") delete next[index]; else next[index] = "up";
      return next;
    });
  };

  const openFeedback = (index: number) => {
    setFeedbackTarget(index);
    setFeedbackOpen(true);
  };

  const renderActions = (index: number, text: string, answerQuestion: string) => {
    const copiedHere = copiedIndex === index;
    const rating = ratings[index];
    return (
      <div className="response-actions" aria-label="Ações da resposta">
        <button onClick={() => copyAnswer(index, text)} data-tooltip={copiedHere ? "Copiado!" : "Copiar"} aria-label={copiedHere ? "Resposta copiada" : "Copiar resposta"}>
          <img src={`${A}/${copiedHere ? "bddb2.svg" : "6030c.svg"}`} alt="" />
        </button>
        {rating === "up" ? (
          // Feedback positivo: o ícone dá lugar a "obrigada ✓" (Figma: input chat - positive feedback). Clicar desfaz.
          <button className="feedback-thanks-inline" onClick={() => toggleLike(index)} aria-label="Resposta marcada como satisfatória. Desfazer" aria-pressed="true">
            <span>obrigada</span><CheckIcon />
          </button>
        ) : (
          <button onClick={() => toggleLike(index)} data-tooltip="Resposta satisfatória" aria-label="Marcar resposta como satisfatória" aria-pressed="false">
            <img src={`${A}/4a340.svg`} alt="" />
          </button>
        )}
        <button
          className={rating === "down" ? "selected" : ""}
          onClick={() => openFeedback(index)}
          data-tooltip="Resposta insatisfatória"
          aria-label="Marcar resposta como insatisfatória"
          aria-pressed={rating === "down"}
        >
          <img src={`${A}/${rating === "down" ? "8531e.svg" : "4e98f.svg"}`} alt="" />
        </button>
        <button className="trace-button" onClick={() => setTraceQuestion(answerQuestion)} data-tooltip="Mostrar como cheguei aqui" aria-label="Mostrar como cheguei aqui">
          <TraceIcon />
        </button>
      </div>
    );
  };

  const closeFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackThanks(false);
    setFeedbackReason("");
    setFeedbackDetails("");
  };

  // "Outros..." torna o campo de informações adicionais obrigatório.
  const detailsRequired = feedbackReason === "Outros...";
  const feedbackReady = Boolean(feedbackReason) && (!detailsRequired || feedbackDetails.trim().length > 0);

  const submitFeedback = () => {
    if (!feedbackReady || feedbackThanks) return;
    setRatings((current) => ({ ...current, [feedbackTarget]: "down" }));
    setFeedbackThanks(true);
    window.setTimeout(() => {
      setFeedbackOpen(false);
      setFeedbackThanks(false);
      setFeedbackReason("");
      setFeedbackDetails("");
    }, 2500);
  };

  const startRename = (id: number, title: string) => {
    setRenamingId(id);
    setRenameDraft(title);
    setOpenMenuId(null);
  };

  const saveRename = () => {
    if (renamingId !== null && renameDraft.trim()) {
      setConversations((items) => items.map((item) => item.id === renamingId ? { ...item, title: renameDraft.trim() } : item));
    }
    setRenamingId(null);
  };

  const shareConversation = async (id: number) => {
    const item = conversations.find((conversation) => conversation.id === id);
    const shareData = { title: item?.title || "Conversa com a ANBY", url: `${window.location.href}#conversa-${id}` };
    if (navigator.share) await navigator.share(shareData);
    else await navigator.clipboard?.writeText(shareData.url);
    setSharedId(id);
    setOpenMenuId(null);
    window.setTimeout(() => setSharedId(null), 1800);
  };

  const deleteConversation = (id: number) => {
    setConversations((items) => items.filter((item) => item.id !== id));
    setOpenMenuId(null);
    if (active === id) newConversation();
  };

  // Fechar mantém a conversa (e qualquer resposta em andamento segue em segundo plano).
  const closeAssistant = () => {
    setAssistantOpen(false);
    setTermsOpen(false);
    setDrawerOpen(false);
    setFeedbackOpen(false);
    setTraceQuestion(null);
    setMfaOpen(false);
    setVoice("idle");
    setTranscribed(false);
    setTip(null);
    if (window.history.state?.anby) window.history.back();
  };

  const openAssistant = (scenario?: "fund-composition") => {
    if (scenario) {
      setEntryScenario(scenario);
      setScenarioLoading(true);
      setActive(null);
      setSentQuestion("");
      setResponding(false);
      setInterrupted(false);
    }
    setSidebarCollapsed(false);
    setAssistantOpen(true);
    window.history.pushState({ anby: true }, "");
  };

  const openPanel = (kind: "about" | "connect") => {
    setPanel(kind);
    setDrawerOpen(false);
    setOpenMenuId(null);
  };

  // Modal redimensionável (desktop): cresce a partir do centro, entre 1200 × 660 e a área disponível.
  const startResize = (event: ReactPointerEvent<HTMLElement>) => {
    const host = assistantRef.current;
    if (!host || !host.parentElement) return;
    event.preventDefault();
    const box = host.getBoundingClientRect();
    const area = host.parentElement.getBoundingClientRect();
    const maxW = area.width - 64;
    const maxH = area.height - 44;
    const startX = event.clientX;
    const startY = event.clientY;
    const move = (e: PointerEvent) => {
      setSize({
        w: Math.min(maxW, Math.max(Math.min(1200, maxW), box.width + 2 * (e.clientX - startX))),
        h: Math.min(maxH, Math.max(Math.min(660, maxH), box.height + 2 * (e.clientY - startY))),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const handleVerified = (data: { name: string; email: string }) => {
    saveSession(data);
    setSession({ ...data, at: Date.now() });
    setSessionExpired(false);
    setMfaOpen(false);
    if (pendingQuestion) {
      askQuestion(pendingQuestion);
      setPendingQuestion(null);
    }
  };

  // Sair encerra a sessão, fecha a ANBY (o usuário volta à página onde estava) e mostra o toast sobre a página.
  const logout = () => {
    clearSession();
    setSession(null);
    closeAssistant();
    setLogoutToast(true);
    window.setTimeout(() => setLogoutToast(false), 4000);
  };

  // O botão voltar do navegador devolve o usuário à tela de onde abriu o assistente.
  const openRef = useRef(false);
  const closeRef = useRef(closeAssistant);
  openRef.current = assistantOpen;
  closeRef.current = closeAssistant;
  useEffect(() => {
    const onPop = () => { if (openRef.current) closeRef.current(); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!responding) return;
    const timers = [
      window.setTimeout(() => setThinkStage(1), 1100),
      window.setTimeout(() => setThinkStage(2), 2300),
      window.setTimeout(() => setResponding(false), 3500),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [responding]);

  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = Math.round(window.innerHeight * 0.3);
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [question, assistantOpen]);

  // Esc fecha o modal "Como a Anby chegou a esta resposta".
  useEffect(() => {
    if (!traceQuestion) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setTraceQuestion(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [traceQuestion]);

  const hasConversation = entryScenario !== null || active !== null || sentQuestion.length > 0;
  const currentQuestion = entryScenario === "fund-composition" ? "Compare as categorias de fundos e entenda a composição do PL" : sentQuestion || conversations.find((item) => item.id === active)?.title || "";
  const currentDialogue = active ? (dialogueByConversation as Record<number, { answer: string; followups: string[][] } | undefined>)[active] || genericDialogue : genericDialogue;

  useEffect(() => {
    const element = conversationRef.current;
    if (!element) {
      setConversationOverflows(false);
      return;
    }

    setShowScrollBottom(false);
    const checkOverflow = () => setConversationOverflows(element.scrollHeight > element.clientHeight + 1);
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    window.addEventListener("resize", checkOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [hasConversation, currentQuestion]);

  useEffect(() => {
    if (!scenarioLoading || entryScenario !== "fund-composition") return;
    setLoadingStage(0);
    const timers = [
      window.setTimeout(() => setLoadingStage(1), 1000),
      window.setTimeout(() => setLoadingStage(2), 2300),
      window.setTimeout(() => setLoadingStage(3), 3600),
      window.setTimeout(() => setScenarioLoading(false), 5000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [scenarioLoading, entryScenario]);

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="header-primary">
          <button className="brand-button" onClick={assistantOpen ? closeAssistant : undefined} aria-label={assistantOpen ? "Voltar para o portal" : "ANBIMA Data"}>
            <img className="brand" src={`${A}/d19e1.svg`} alt="ANBIMA Data" />
          </button>
          <nav aria-label="Navegação principal">
            {MENUS.map((menu) => (
              <div
                key={menu.key}
                className="nav-item"
                onMouseEnter={() => openMenu(menu.key)}
                onMouseLeave={scheduleCloseMenu}
                onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) scheduleCloseMenu(); }}
              >
                <button className={menuOpen === menu.key ? "nav-open" : ""} aria-expanded={menuOpen === menu.key} aria-haspopup="true" onClick={() => (menuOpen === menu.key ? setMenuOpen(null) : openMenu(menu.key))}>
                  <span className="nav-label">{menu.label}</span><img src={`${A}/7facb.svg`} alt="" />
                </button>
                {menuOpen === menu.key && <MegaMenu menu={menu} />}
              </div>
            ))}
          </nav>
        </div>
        <button className="header-search" aria-label="Buscar"><img src={`${A}/fe6a2.svg`} alt="" /></button>
        <button className="menu-toggle" aria-label={mobileMenu ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileMenu} onClick={() => { setMobileMenu(!mobileMenu); setMobileSection(null); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{mobileMenu ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
        </button>
        {mobileMenu && (
          <div className="mob-menu">
            {MENUS.map((menu) => (
              <div key={menu.key} className="mob-section">
                <button aria-expanded={mobileSection === menu.key} onClick={() => setMobileSection(mobileSection === menu.key ? null : menu.key)}>
                  <span>{menu.label}</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={mobileSection === menu.key ? "up" : ""}><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {mobileSection === menu.key && <ul>{menu.items.map((item) => <li key={item.label}><button>{item.label}</button></li>)}</ul>}
              </div>
            ))}
          </div>
        )}
      </header>

      <PortalHome onOpenAssistant={openAssistant} />
      {assistantOpen && <div className={active === 4 ? "assistant-overlay rich-overlay" : "assistant-overlay"}>
      <section
        className={termsOpen ? "workspace terms-workspace" : "workspace"}
        onClick={termsOpen ? () => setTermsOpen(false) : undefined}
      >
        {termsOpen ? (
          <article className="terms-panel" onClick={(event) => event.stopPropagation()}>
            <div className="terms-notice">
              <img src={`${A}/39ace.svg`} alt="" />
              <div>
                <p>A ANBY consiste em sistema de inteligência artificial desenvolvido pela Anbima para auxiliar nas dúvidas relacionadas à autorregulação da associação.</p>
                <p>Apesar de todo o esforço para assegurar a exatidão e a atualização das respostas, as informações fornecidas têm fins exclusivamente informativos, podendo conter imprecisões, omissões e/ou interpretações equivocadas.</p>
                <p>As respostas fornecidas pela ANBY não constituem, nem devem ser interpretadas como aconselhamento, consultoria, parecer ou orientação de natureza profissional, jurídica e/ou financeira, tampouco como recomendação, conselho, indicação, sugestão, aviso ou garantia de resultado da Anbima.</p>
                <p>Para quaisquer tomadas de decisão, recomenda-se a verificação independente das informações e a consulta a profissionais habilitados, bem como às fontes oficiais.</p>
              </div>
            </div>

            <section className="terms-intro">
              <h1>Eu sou a ANBY!</h1>
              <strong>Sua assistente virtual de autorregulação da Anbima</strong>
              <p>Estou aqui para tornar mais simples o seu dia a dia com os códigos, regras e procedimentos da autorregulação. Se você tiver dificuldade para encontrar alguma informação nessa documentação, pode contar comigo!</p>
              <p>Por enquanto, meu foco é exclusivamente em autorregulação. Isso significa que alguns assuntos ainda estão fora do meu alcance, como: dados de mercado, dúvidas sobre exames de certificação, orientações regulatórias ou jurídicas que não constem nos documentos da Anbima.</p>
              <p>Para outras questões, acesse <a href="https://www.anbima.com.br" target="_blank" rel="noreferrer">www.anbima.com.br</a></p>
            </section>

            <div className="terms-divider" />

            <section className="terms-feedback">
              <strong>Não ficou satisfeito com alguma resposta?</strong>
              <p>Durante nossa interação no chat, utilize as ferramentas de feedback disponíveis para avaliar a utilidade da resposta. Assim, você contribui para o meu aprimoramento.</p>
              <div className="terms-step">
                <div className="step-preview action-preview">
                  <img src={`${A}/6030c.svg`} alt="" />
                  <img src={`${A}/4a340.svg`} alt="" />
                  <img src={`${A}/4e98f.svg`} alt="" />
                </div>
                <span>1</span>
                <p>As ferramentas de feedback estão localizadas ao fim de cada resposta.<br /><br />A caixa de comentários é ativada quando você seleciona “Resposta insatisfatória”.</p>
              </div>
              <div className="terms-step">
                <div className="step-preview form-preview">
                  <i></i><i></i><i></i>
                </div>
                <span>2</span>
                <p>No espaço de comentários, selecione o motivo e compartilhe sugestões detalhadas sobre o que poderia melhorar na resposta.</p>
              </div>
            </section>
          </article>
        ) : (
        <div
        ref={assistantRef}
        className={sidebarCollapsed ? "assistant sidebar-collapsed" : "assistant"}
        style={size ? { width: size.w, height: size.h } : undefined}
        onClickCapture={(event) => {
          // Sem sessão válida, qualquer clique (exceto fechar e o menu) abre o modal de dados pessoais.
          if (session || mfaOpen) return;
          const target = event.target as HTMLElement;
          if (target.closest(".close, .brand-button, .mobile-history, .drawer-close, .scrim, .resize-handle")) return;
          // No mobile, a barra lateral (drawer) precisa funcionar para navegar.
          if (window.matchMedia("(max-width: 850px)").matches && target.closest(".history")) return;
          event.preventDefault();
          event.stopPropagation();
          const suggestion = target.closest<HTMLElement>("[data-question]");
          setPendingQuestion(suggestion?.dataset.question ?? null);
          setMfaOpen(true);
        }}
      >
          {drawerOpen && <button className="scrim" onClick={() => setDrawerOpen(false)} aria-label="Fechar histórico" />}
          <button className="mobile-history" onClick={() => setDrawerOpen(true)} aria-label="Expandir barra lateral">
            <img src={`${A}/e2d38.svg`} alt="" />
          </button>

          <aside className={`${drawerOpen ? "history open" : "history"}${sidebarCollapsed ? " collapsed" : ""}`} aria-label="Histórico de conversas">
            <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Recolher barra lateral"><img src={`${A}/a4d07.svg`} alt="" /></button>
            <div className="history-fixed">
              <div className="history-brand">
                <div className="brand-expanded"><img className="history-anby-avatar" src={`${A}/54cd1.png`} alt="" /><img className="history-anby-logo" src={`${A}/anby-logo.png`} alt="ANBY" /></div>
                <button
                  className="sidebar-toggle"
                  onClick={() => { hideTip(); setSidebarCollapsed(true); }}
                  aria-label="Recolher barra lateral"
                  title="Recolher barra lateral"
                >
                  <img src={`${A}/a4d07.svg`} alt="" />
                </button>
                <button
                  className="brand-collapsed"
                  onClick={() => { hideTip(); setSidebarCollapsed(false); }}
                  aria-label="Expandir barra lateral"
                >
                  <img className="history-anby-avatar" src={`${A}/54cd1.png`} alt="" />
                  <img className="brand-unfold" src={`${A}/e2d38.svg`} alt="" />
                </button>
              </div>
              <div className="history-actions">
                <button className="new-chat" onClick={newConversation} aria-label="Nova conversa" {...tipProps("Nova conversa", "r", sidebarCollapsed)}>
                  <span className="new-chat-plus">＋</span><span className="new-chat-label">Nova conversa</span>
                </button>
              </div>
            </div>
            <div className="history-scroll">
            <div className="expanded-content">
            <button className="history-label" onClick={() => setRecentExpanded(!recentExpanded)} aria-expanded={recentExpanded}>
              Conversas recentes <img className={recentExpanded ? "" : "rotated"} src={`${A}/cc7eb.svg`} alt="" />
            </button>
            {recentExpanded && <div className={showAllConversations ? "conversation-list show-all" : "conversation-list"}>
              {(showAllConversations ? conversations : conversations.slice(0, 3)).map((item) => (
                <div
                  key={item.id}
                  className={`conversation-item${active === item.id ? " selected" : ""}${openMenuId === item.id ? " menu-open" : ""}`}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenuId(null);
                  }}
                >
                  {renamingId === item.id ? (
                    <div className="conversation conversation-edited conversation-editing">
                      <input
                        autoFocus
                        value={renameDraft}
                        onChange={(event) => setRenameDraft(event.target.value)}
                        onBlur={saveRename}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveRename();
                          if (event.key === "Escape") setRenamingId(null);
                        }}
                        aria-label="Novo nome da conversa"
                      />
                      <small>Enter para salvar</small>
                    </div>
                  ) : (
                    <button
                      className={`${active === item.id ? "conversation active" : "conversation"} conversation-edited`}
                      onClick={() => { setPanel(null); setEntryScenario(null); setActive(item.id); setSentQuestion(""); setResponding(false); setInterrupted(false); setDrawerOpen(false); setOpenMenuId(null); }}
                    >
                      <span>{item.title}</span>
                      <small>
                        {sharedId === item.id
                          ? "Link copiado"
                          : `${item.date} · ${item.questions} ${item.questions === 1 ? "pergunta" : "perguntas"}`}
                      </small>
                    </button>
                  )}
                  {renamingId !== item.id && (
                  <button
                    className="conversation-menu-trigger"
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    aria-label={`Editar conversa ${item.title}`}
                    aria-expanded={openMenuId === item.id}
                  >
                    <MenuIcon name="more" />
                  </button>
                  )}
                  {openMenuId === item.id && (
                    <div className="conversation-menu" role="menu">
                      <button onClick={() => startRename(item.id, item.title)} role="menuitem"><MenuIcon name="rename" /><span>Renomear</span></button>
                      {features.compartilharConversa && <button onClick={() => shareConversation(item.id)} role="menuitem"><MenuIcon name="share" /><span>Compartilhar</span></button>}
                      <div className="menu-divider" />
                      <button className="delete-action" onClick={() => deleteConversation(item.id)} role="menuitem"><MenuIcon name="delete" /><span>Apagar conversa</span></button>
                    </div>
                  )}
                </div>
              ))}
              {conversations.length > 3 && <button className="show-all-conversations" onClick={() => setShowAllConversations(!showAllConversations)}>{showAllConversations ? "Ver menos" : "Ver mais"}</button>}
            </div>}
            {features.conectarClaude && <div className="sidebar-group">
              <p>Soluções</p>
              <button className="sidebar-link" onClick={() => openPanel("connect")}><img src={`${A}/b1265.svg`} alt="" /><span>Conectar no Claude</span><b>Novo</b></button>
            </div>}
            {features.sobreAnby && <div className="sidebar-group">
              <p>Saiba mais</p>
              <button className="sidebar-link" onClick={() => openPanel("about")}><InfoIcon /><span>Sobre a ANBY</span></button>
            </div>}
            </div>
            <div className="collapsed-nav">
              <button className="rail-button" aria-label="Minhas conversas" onClick={() => { hideTip(); setSidebarCollapsed(false); }} {...tipProps("Minhas conversas", "r", sidebarCollapsed)}><ChatIcon /></button>
              {features.conectarClaude && <button className="rail-button" aria-label="Conectar no Claude" onClick={() => openPanel("connect")} {...tipProps("Conectar no Claude", "r", sidebarCollapsed)}><img src={`${A}/b1265.svg`} alt="" /></button>}
              {features.sobreAnby && <button className="rail-button" aria-label="Sobre a ANBY" onClick={() => openPanel("about")} {...tipProps("Sobre a ANBY", "r", sidebarCollapsed)}><InfoIcon /></button>}
            </div>
            </div>
            <div className="history-footer">
              <button className="avatar-small account-button" aria-label="Minha conta" onClick={() => { if (sidebarCollapsed) { hideTip(); setSidebarCollapsed(false); } }} {...tipProps("Minha conta", "r", sidebarCollapsed)}>{session ? initials(session.name) : "?"}</button>
              <span className="footer-text">
                <b>{session ? session.name.trim() : "Visitante"}</b>
                <small>Minha conta <span aria-hidden="true">·</span> <a href="#sair" onClick={(event) => { event.preventDefault(); logout(); }}>Sair</a></small>
              </span>
            </div>
          </aside>

          <button className="close" onClick={closeAssistant} aria-label="Fechar assistente">×</button>
          <button className="resize-handle" onPointerDown={startResize} onDoubleClick={() => setSize(null)} aria-label="Redimensionar janela (duplo clique restaura)" title="Arraste para redimensionar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5 5 12M12 9l-3 3" /></svg>
          </button>
          {panel && (
            <section className="panel-view" aria-label={panel === "about" ? "Sobre a ANBY" : "Conectar no Claude"}>
              <div className="panel-bar"><button className="panel-back" onClick={() => setPanel(null)}>← Voltar ao chat</button></div>
              <div className="panel-body">{panel === "about" ? <AboutPanel /> : <ConnectPanel />}</div>
            </section>
          )}
          {tip && <div className={`side-tip ${tip.dir}`} style={{ top: tip.top, left: tip.left }} role="tooltip">{tip.text}</div>}
          <div className={active === 4 ? "chat-home rich-chat" : "chat-home"}>
            {!hasConversation && <div className="intro">
              <img className="anby-avatar" src={`${A}/54cd1.png`} alt="ANBY" />
              <h1>
                <span className="greeting-desktop">{session ? `Olá, ${firstName(session.name)}, em que posso te ajudar` : "Olá, em que posso te ajudar"}<br />sobre <em>os dados do mercado?</em></span>
                {/* Mobile (Figma Release 1.0 - ajustes): saudação em três linhas. */}
                <span className="greeting-mobile">{session ? `Olá, ${firstName(session.name)}!` : "Olá!"}<br />Vamos falar sobre os<br /><em>dados do mercado?</em></span>
              </h1>
            </div>}

            {!hasConversation && (
              <div className="suggestions">
                <p>Faça uma pergunta ou tente um exemplo:</p>
                <div className="question-list">
                  {suggestions.slice(0, 4).map((text) => (
                    <button key={text} data-question={text} onClick={() => askQuestion(text)}>
                      <span>{text}</span>
                      <img src={`${A}/70745.svg`} alt="" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasConversation && (
              <div className="conversation-viewport has-overflow">
              <div
                className="conversation-scroll"
                aria-live="polite"
                ref={conversationRef}
                onScroll={(event) => {
                  const el = event.currentTarget;
                  setShowScrollBottom(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
                }}
              >
                {entryScenario === "fund-composition" ? (scenarioLoading ? <AssistantThinking stage={loadingStage} /> : <FundCompositionResponse actions={renderActions(101, "O patrimônio líquido dos fundos alcançou R$ 11 trilhões em julho de 2026.", "Compare as categorias de fundos e entenda a composição do PL")} />) : active === 4 ? <RichMarketResponse actions={renderActions(100, "Os resultados vieram pelo subíndice IMA-B 5. Aqui está a evolução da variação mensal.", "Mostre o resultado do IMA-B com a composição e traga em gráfico de evolução os valores de variação mês a mês")} /> : (responding || interrupted) && sentQuestion ? (
                  responding
                    ? <AssistantThinking stage={thinkStage} question={sentQuestion} labels={["Consultando memoria...", "Analisando...", "Gerando a resposta..."]} />
                    : <>
                      <div className="user-row"><p>{sentQuestion}</p></div>
                      <div className="ai-row"><img src={`${A}/54cd1.png`} alt="ANBY" /><p className="interrupted" role="status">Resposta interrompida. Para reiniciar, envie a pergunta novamente.</p></div>
                    </>
                ) : <>
                <div className="user-row">
                  <p>{currentQuestion}</p>
                </div>
                <div className="ai-row">
                  <img src={`${A}/54cd1.png`} alt="ANBY" />
                  <div className="ai-content">
                    <p>{currentDialogue.answer}</p>
                    {renderActions(0, currentDialogue.answer, currentQuestion)}
                  </div>
                </div>
                <div className="user-row second-message">
                  <p>{currentDialogue.followups[0][0]}</p>
                </div>
                <div className="ai-row">
                  <img src={`${A}/54cd1.png`} alt="ANBY" />
                  <div className="ai-content">
                    <p>{currentDialogue.followups[0][1]}</p>
                    {renderActions(1, currentDialogue.followups[0][1], currentDialogue.followups[0][0])}
                  </div>
                </div>
                {currentDialogue.followups.slice(1).map(([followupQuestion, followupAnswer]: string[], followupIndex: number) => (
                  <div className="dialogue-pair" key={followupQuestion}>
                    <div className="user-row">
                      <p>{followupQuestion}</p>
                    </div>
                    <div className="ai-row">
                      <img src={`${A}/54cd1.png`} alt="ANBY" />
                      <div className="ai-content">
                        <p>{followupAnswer}</p>
                        {renderActions(followupIndex + 2, followupAnswer, followupQuestion)}
                      </div>
                    </div>
                  </div>
                ))}
                </>}
              </div>
              <button
                className={showScrollBottom ? "scroll-bottom visible" : "scroll-bottom"}
                onClick={() => conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" })}
                aria-label="Ir para o fim da conversa"
                tabIndex={showScrollBottom ? 0 : -1}
                aria-hidden={!showScrollBottom}
              >
                <ArrowDownIcon />
              </button>
              </div>
            )}

            <div className="composer-area">
              <div className={voice === "recording" ? "composer recording" : "composer"}>
                <div className="composer-main">
                  <textarea
                    ref={composerRef}
                    rows={2}
                    value={question}
                    onChange={(event) => { setQuestion(event.target.value); setTranscribed(false); }}
                    onKeyDown={(event) => {
                      // Enter envia; Shift+Enter quebra a linha (como no Claude).
                      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        sendQuestion();
                      }
                    }}
                    placeholder="Pergunte sobre fundos, renda fixa e mercado de capitais"
                    aria-label="Mensagem para a ANBY"
                    disabled={voice === "recording" || responding}
                  />
                  <div className="composer-actions">
                    {features.ditadoPorVoz && <button
                      className={voice === "recording" ? "mic-button is-recording" : "mic-button"}
                      onClick={toggleRecording}
                      disabled={responding}
                      aria-label={voice === "recording" ? "Parar e transcrever" : "Ditar a pergunta"}
                      {...tipProps(voice === "recording" ? "Parar e transcrever" : "Ditar a pergunta", "l")}
                    >
                      {voice === "recording" ? <StopIcon /> : <MicIcon />}
                    </button>}
                    {responding ? (
                      <button className="send-button pause-button" onClick={pauseResponse} aria-label="Parar resposta" {...tipProps("Parar resposta", "l")}><PauseIcon /></button>
                    ) : (
                    <button
                      className={question.trim() && voice === "idle" ? "send-button send-active" : "send-button"}
                      disabled={!question.trim() || voice === "recording"}
                      onClick={sendQuestion}
                      aria-label="Enviar pergunta"
                    >
                      <SendIcon />
                    </button>
                    )}
                  </div>
                </div>
                {voice === "recording" && (
                  <div className="recording-line">
                    <div className="recording-meter" aria-hidden="true">
                      <i className="recording-dot" />
                      <span className="waveform">
                        {Array.from({ length: 36 }, (_, index) => <i key={index} style={{ animationDelay: `${-index * 70}ms` }} />)}
                      </span>
                    </div>
                    <div className="recording-meta">
                      <span className="recording-time">{recordingTime}</span>
                      <button className="recording-cancel" onClick={cancelRecording}>cancelar</button>
                    </div>
                  </div>
                )}
              </div>
              {transcribed && voice === "idle" && <p className="transcribed-status">Transcrito - Revise e envie</p>}
              <p>A ANBY é uma ferramenta de IA da Anbima com finalidade exclusivamente informativa, não constituindo aconselhamento ou recomendação profissional, sendo recomendada a verificação das informações em fontes oficiais para tomada de decisão. Consulte os <button className="terms-link" onClick={() => setTermsOpen(true)}>Termos de uso</button> da IA antes de utilizar.</p>
            </div>
          </div>
        </div>
        )}
      </section>
      {feedbackOpen && (
        <div className="feedback-backdrop" role="presentation">
          <section className="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <div className="feedback-heading">
              <h2 id="feedback-title">Nos ajude a melhorar</h2>
              <button className="feedback-close" onClick={closeFeedback} aria-label="Fechar">
                <img src={`${A}/c9d78.svg`} alt="" />
              </button>
            </div>
            <div className="feedback-fields">
              <label className="field-label" htmlFor="feedback-reason">Por que essa resposta não foi útil para você?</label>
              <div className="select-wrap">
                <select id="feedback-reason" value={feedbackReason} onChange={(event) => setFeedbackReason(event.target.value)} required>
                  <option value="" disabled>Selecione um motivo</option>
                  <option>Resposta incorreta</option>
                  <option>Fontes incorretas</option>
                  <option>Não resolveu minha dúvida</option>
                  <option>Confuso ou pouco claro</option>
                  <option>Não gostei da formatação</option>
                  <option>Outros...</option>
                </select>
                <img src={`${A}/6d1f0.svg`} alt="" />
              </div>

              <label className="field-label details-label" htmlFor="feedback-details">
                Informações adicionais {detailsRequired ? <span className="required-flag">(campo obrigatório)</span> : "(opcional)"}
              </label>
              <textarea
                id="feedback-details"
                value={feedbackDetails}
                onChange={(event) => setFeedbackDetails(event.target.value)}
                maxLength={1000}
                required={detailsRequired}
                aria-required={detailsRequired}
                placeholder="Adicione mais detalhes"
              />
              <span className={feedbackDetails.length === 1000 ? "character-count limit" : "character-count"}>
                {feedbackDetails.length.toLocaleString("pt-BR")}/1.000
              </span>
            </div>
            <div className="legal-notice">
              <img src={`${A}/02411.svg`} alt="" />
              <p>Enviar feedback incluirá toda a conversa para aprimorar a ANBY.</p>
            </div>
            <button className="feedback-submit" disabled={!feedbackReady || feedbackThanks} onClick={submitFeedback}>Enviar</button>
            {feedbackThanks && (
              <p className="feedback-success" role="status">
                <InfoIcon /><span><b>Obrigado pelo feedback!</b> Isso nos ajuda a melhorar a assistente.</span>
              </p>
            )}
          </section>
        </div>
      )}
      </div>}
      {traceQuestion && (
        <div className="feedback-backdrop" role="presentation" onClick={() => setTraceQuestion(null)}>
          <section className="trace-modal" role="dialog" aria-modal="true" aria-labelledby="trace-title" onClick={(event) => event.stopPropagation()}>
            <header className="trace-heading">
              <div>
                <h2 id="trace-title">Como a Anby chegou a esta resposta</h2>
                <p>{traceFor(traceQuestion).length} {traceFor(traceQuestion).length === 1 ? "passo" : "passos"} · consultas feitas ao ANBIMA Feed no momento da pergunta</p>
              </div>
              <button className="feedback-close" onClick={() => setTraceQuestion(null)} aria-label="Fechar"><img src={`${A}/c9d78.svg`} alt="" /></button>
            </header>
            <div className="trace-body">
              {traceFor(traceQuestion).map((step, index) => (
                <article className="trace-step" key={step.title + index}>
                  <div className="trace-step-head">
                    <span className="trace-index">{index + 1}</span>
                    <h3>{step.title}</h3>
                    <span className="trace-status">Consulta concluída</span>
                  </div>
                  <dl>
                    <div><dt>Parâmetros</dt><dd className="mono">{step.params}</dd></div>
                    <div><dt>Fonte</dt><dd className="mono">{step.source}</dd></div>
                    <div><dt>Data de referência</dt><dd>{step.date}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <footer className="trace-footer">
              <p>Registro técnico para validação: os números da resposta vêm destas consultas. Dado pessoal e conteúdo exclusivo de associados não aparecem.</p>
            </footer>
          </section>
        </div>
      )}
      {logoutToast && (
        <div className="anby-toast" role="status">
          <img src={`${A}/54cd1.png`} alt="" />
          <div><b>Você saiu da ANBY!</b><span>Até a próxima.</span></div>
        </div>
      )}
      <MfaModal open={mfaOpen && assistantOpen} expired={sessionExpired} onClose={() => setMfaOpen(false)} onVerified={handleVerified} />
    </main>
  );
}
