import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from "react";

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

function SendIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 9.6 9.6" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.51567 2.54414L5.51567 8.91429H4.08435L4.08435 2.54414L1.0121 5.39694L8.2016e-06 4.45714L4.80001 -1.90735e-07L9.60001 4.45714L8.58791 5.39694L5.51567 2.54414Z" />
    </svg>
  );
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

function RichMarketResponse() {
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
          <div className="response-actions">
            <button data-tooltip="Copiar" aria-label="Copiar resposta"><img src={`${A}/6030c.svg`} alt="" /></button>
            <button data-tooltip="Resposta satisfatória" aria-label="Resposta satisfatória"><img src={`${A}/4a340.svg`} alt="" /></button>
            <button data-tooltip="Resposta insatisfatória" aria-label="Resposta insatisfatória"><img src={`${A}/4e98f.svg`} alt="" /></button>
          </div>
        </div>
      </div>
    </>
  );
}

function FundCompositionResponse() {
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
          <div className="response-actions">
            <button data-tooltip="Copiar" aria-label="Copiar resposta"><img src={`${A}/6030c.svg`} alt="" /></button>
            <button data-tooltip="Resposta satisfatória" aria-label="Resposta satisfatória"><img src={`${A}/4a340.svg`} alt="" /></button>
            <button data-tooltip="Resposta insatisfatória" aria-label="Resposta insatisfatória"><img src={`${A}/4e98f.svg`} alt="" /></button>
          </div>
        </div>
      </div>
    </>
  );
}

function AssistantThinking({ stage }: { stage: number }) {
  const labels = ["Iniciando...", "Pensando...", "Analisando...", "Gerando a resposta..."];
  return (
    <>
      <div className="user-row"><p>Compare as categorias de fundos e entenda a composição do PL</p></div>
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

function PortalHome({ onOpenAssistant }: { onOpenAssistant: (scenario?: "fund-composition") => void }) {
  return (
    <div className="portal-home">
      <section className="portal-hero">
        <div className="portal-container">
          <h1>Os dados que orientam o mercado financeiro<br /><strong>de forma gratuita e com a transparência ANBIMA</strong></h1>
          <div className="portal-metrics">
            <article className="metric-card">
              <div><h2>Fundos de Investimento</h2><small>Julho 2026</small></div>
              <div><strong>11 TRI</strong><p>Patrimônio líquido</p></div>
              <div className="metric-bar funds"><i /><i /><i /><i /></div>
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
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<"first" | "second" | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<"first" | "second">("first");
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

  const newConversation = () => {
    setEntryScenario(null);
    setScenarioLoading(false);
    setActive(null);
    setQuestion("");
    setSentQuestion("");
    setCopied(false);
    setLiked(false);
    setFeedbackSent(null);
    setDrawerOpen(false);
  };

  const sendQuestion = () => {
    if (!question.trim()) return;
    setSentQuestion(question.trim());
    setQuestion("");
    setTranscribed(false);
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

  const copyAnswer = async () => {
    await navigator.clipboard?.writeText("A ANBIMA acompanha a evolução da indústria e reúne dados consolidados para apoiar sua análise.");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const closeFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackSent(null);
    setFeedbackReason("");
    setFeedbackDetails("");
  };

  const submitFeedback = () => {
    if (!feedbackReason) return;
    setFeedbackOpen(false);
    setFeedbackSent(feedbackTarget);
    setLiked(false);
    setFeedbackReason("");
    setFeedbackDetails("");
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

  const closeAssistant = () => {
    setAssistantOpen(false);
    setTermsOpen(false);
    setDrawerOpen(false);
    setFeedbackOpen(false);
    setEntryScenario(null);
    setScenarioLoading(false);
    setVoice("idle");
    setTranscribed(false);
    setTip(null);
  };

  const hasConversation = entryScenario !== null || active !== null || sentQuestion.length > 0;
  const currentQuestion = entryScenario === "fund-composition" ? "Compare as categorias de fundos e entenda a composição do PL" : sentQuestion || conversations.find((item) => item.id === active)?.title || "";
  const currentDialogue = active ? dialogueByConversation[active] || genericDialogue : genericDialogue;

  useEffect(() => {
    const element = conversationRef.current;
    if (!element) {
      setConversationOverflows(false);
      return;
    }

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
            <button>Fundos <img src={`${A}/7facb.svg`} alt="" /></button>
            <button>Títulos Privados <img src={`${A}/7facb.svg`} alt="" /></button>
            <button>Títulos Públicos <img src={`${A}/7facb.svg`} alt="" /></button>
            <button>Mais <img src={`${A}/7facb.svg`} alt="" /></button>
          </nav>
        </div>
        <button className="header-search" aria-label="Buscar"><img src={`${A}/fe6a2.svg`} alt="" /></button>
      </header>

      <PortalHome onOpenAssistant={(scenario) => { setEntryScenario(scenario || null); setScenarioLoading(scenario === "fund-composition"); setActive(null); setSentQuestion(""); setSidebarCollapsed(false); setAssistantOpen(true); }} />
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
        <div ref={assistantRef} className={sidebarCollapsed ? "assistant sidebar-collapsed" : "assistant"}>
          <button className="mobile-history" onClick={() => setDrawerOpen(true)} aria-label="Abrir histórico">
            <span></span><span></span><span></span>
          </button>

          <aside className={`${drawerOpen ? "history open" : "history"}${sidebarCollapsed ? " collapsed" : ""}`} aria-label="Histórico de conversas">
            <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Fechar histórico">×</button>
            <div className="history-fixed">
              <div className="history-brand">
                <div className="brand-expanded"><img className="history-anby-avatar" src={`${A}/54cd1.png`} alt="" /><img className="history-anby-logo" src={`${A}/3dd9a.png`} alt="ANBY" /></div>
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
            {recentExpanded && <div className="conversation-list">
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
                      onClick={() => { setEntryScenario(null); setActive(item.id); setSentQuestion(""); setDrawerOpen(false); setOpenMenuId(null); }}
                    >
                      <span>{item.title}</span>
                      <small>
                        {sharedId === item.id
                          ? "Link copiado"
                          : `${item.date} · ${item.questions} ${item.questions === 1 ? "pergunta" : "perguntas"}`}
                      </small>
                    </button>
                  )}
                  <button
                    className="conversation-menu-trigger"
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    aria-label={`Editar conversa ${item.title}`}
                    aria-expanded={openMenuId === item.id}
                  >
                    <img src={`${A}/7d544.svg`} alt="" />
                  </button>
                  {openMenuId === item.id && (
                    <div className="conversation-menu" role="menu">
                      <button onClick={() => startRename(item.id, item.title)} role="menuitem"><MenuIcon name="rename" /><span>Renomear</span></button>
                      <button onClick={() => shareConversation(item.id)} role="menuitem"><MenuIcon name="share" /><span>Compartilhar</span></button>
                      <div className="menu-divider" />
                      <button className="delete-action" onClick={() => deleteConversation(item.id)} role="menuitem"><MenuIcon name="delete" /><span>Apagar conversa</span></button>
                    </div>
                  )}
                </div>
              ))}
              {conversations.length > 3 && <button className="show-all-conversations" onClick={() => setShowAllConversations(!showAllConversations)}>{showAllConversations ? "Ver menos" : "Ver todas"}</button>}
            </div>}
            <div className="sidebar-group">
              <p>Soluções</p>
              <button className="sidebar-link"><img src={`${A}/b1265.svg`} alt="" /><span>Conectar no Claude</span><b>Novo</b></button>
            </div>
            <div className="sidebar-group">
              <p>Saiba mais</p>
              <button className="sidebar-link" onClick={() => setTermsOpen(true)}><InfoIcon /><span>Sobre a ANBY</span></button>
            </div>
            </div>
            <div className="collapsed-nav">
              <button className="rail-button" aria-label="Minhas conversas" onClick={() => { hideTip(); setSidebarCollapsed(false); }} {...tipProps("Minhas conversas", "r", sidebarCollapsed)}><ChatIcon /></button>
              <button className="rail-button" aria-label="Conectar no Claude" {...tipProps("Conectar no Claude", "r", sidebarCollapsed)}><img src={`${A}/b1265.svg`} alt="" /></button>
              <button className="rail-button" aria-label="Sobre a ANBY" onClick={() => setTermsOpen(true)} {...tipProps("Sobre a ANBY", "r", sidebarCollapsed)}><InfoIcon /></button>
            </div>
            </div>
            <div className="history-footer">
              <span className="avatar-small">GC</span>
              <span className="footer-text">
                <b>Guilherme Cademartori</b>
                <small>Minha conta <span aria-hidden="true">·</span> <a href="#sair" onClick={(event) => event.preventDefault()}>Sair</a></small>
              </span>
            </div>
          </aside>

          <button className="close" onClick={closeAssistant} aria-label="Fechar assistente">×</button>
          {tip && <div className={`side-tip ${tip.dir}`} style={{ top: tip.top, left: tip.left }} role="tooltip">{tip.text}</div>}
          <div className={active === 4 ? "chat-home rich-chat" : "chat-home"}>
            {!hasConversation && <div className="intro">
              <img className="anby-avatar" src={`${A}/54cd1.png`} alt="ANBY" />
              <h1>Olá, em que posso te ajudar<br />sobre <em>os dados do mercado?</em></h1>
            </div>}

            {!hasConversation && (
              <div className="suggestions">
                <p>Faça uma pergunta ou tente um exemplo:</p>
                <div className="question-list">
                  {suggestions.slice(0, 4).map((text) => (
                    <button key={text} onClick={() => { setSentQuestion(text); setQuestion(""); }}>
                      <span>{text}</span>
                      <img src={`${A}/70745.svg`} alt="" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasConversation && (
              <div className={conversationOverflows ? "conversation-viewport has-overflow" : "conversation-viewport"}>
              <div className="conversation-scroll" aria-live="polite" ref={conversationRef}>
                {entryScenario === "fund-composition" ? (scenarioLoading ? <AssistantThinking stage={loadingStage} /> : <FundCompositionResponse />) : active === 4 ? <RichMarketResponse /> : <>
                <div className="user-row">
                  <p>{currentQuestion}</p>
                </div>
                <div className="ai-row">
                  <img src={`${A}/54cd1.png`} alt="ANBY" />
                  <div className="ai-content">
                    <p>{currentDialogue.answer}</p>
                    <div className="response-actions" aria-label="Ações da resposta">
                      <button onClick={copyAnswer} data-tooltip={copied ? "Copiado!" : "Copiar"} aria-label={copied ? "Resposta copiada" : "Copiar resposta"}>
                        <img src={`${A}/${copied ? "bddb2.svg" : "6030c.svg"}`} alt="" />
                      </button>
                      <button
                        className={liked ? "selected" : ""}
                        onClick={() => { setLiked(!liked); setFeedbackSent(null); }}
                        data-tooltip="Resposta satisfatória"
                        aria-label="Marcar resposta como satisfatória"
                      >
                        <img src={`${A}/${liked ? "757a8.svg" : "4a340.svg"}`} alt="" />
                      </button>
                      <button
                        className={feedbackSent === "first" ? "selected" : ""}
                        onClick={() => { setFeedbackTarget("first"); setFeedbackOpen(true); }}
                        data-tooltip="Resposta insatisfatória"
                        aria-label="Marcar resposta como insatisfatória"
                      >
                        <img src={`${A}/${feedbackSent === "first" ? "8531e.svg" : "4e98f.svg"}`} alt="" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="user-row second-message">
                  <p>{currentDialogue.followups[0][0]}</p>
                </div>
                <div className="ai-row">
                  <img src={`${A}/54cd1.png`} alt="ANBY" />
                  <div className="ai-content">
                    <p>{currentDialogue.followups[0][1]}</p>
                    <div className="response-actions">
                      <button data-tooltip="Copiar" aria-label="Copiar resposta"><img src={`${A}/6030c.svg`} alt="" /></button>
                      <button data-tooltip="Resposta satisfatória" aria-label="Resposta satisfatória"><img src={`${A}/4a340.svg`} alt="" /></button>
                      <button
                        className={feedbackSent === "second" ? "selected" : ""}
                        onClick={() => { setFeedbackTarget("second"); setFeedbackOpen(true); }}
                        data-tooltip="Resposta insatisfatória"
                        aria-label="Resposta insatisfatória"
                      >
                        <img src={`${A}/${feedbackSent === "second" ? "8531e.svg" : "4e98f.svg"}`} alt="" />
                      </button>
                    </div>
                  </div>
                </div>
                {currentDialogue.followups.slice(1).map(([followupQuestion, followupAnswer]) => (
                  <div className="dialogue-pair" key={followupQuestion}>
                    <div className="user-row">
                      <p>{followupQuestion}</p>
                    </div>
                    <div className="ai-row">
                      <img src={`${A}/54cd1.png`} alt="ANBY" />
                      <div className="ai-content">
                        <p>{followupAnswer}</p>
                        <div className="response-actions">
                          <button data-tooltip="Copiar" aria-label="Copiar resposta"><img src={`${A}/6030c.svg`} alt="" /></button>
                          <button data-tooltip="Resposta satisfatória" aria-label="Resposta satisfatória"><img src={`${A}/4a340.svg`} alt="" /></button>
                          <button data-tooltip="Resposta insatisfatória" aria-label="Resposta insatisfatória"><img src={`${A}/4e98f.svg`} alt="" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </>}
              </div>
              </div>
            )}

            <div className="composer-area">
              <div className={voice === "recording" ? "composer recording" : "composer"}>
                <div className="composer-main">
                  <textarea
                    value={question}
                    onChange={(event) => { setQuestion(event.target.value); setTranscribed(false); }}
                    placeholder="Pergunte sobre fundos, renda fixa e mercado de capitais"
                    aria-label="Mensagem para a ANBY"
                    disabled={voice === "recording"}
                  />
                  <div className="composer-actions">
                    <button
                      className={voice === "recording" ? "mic-button is-recording" : "mic-button"}
                      onClick={toggleRecording}
                      aria-label={voice === "recording" ? "Parar e transcrever" : "Ditar a pergunta"}
                      {...tipProps(voice === "recording" ? "Parar e transcrever" : "Ditar a pergunta", "l")}
                    >
                      {voice === "recording" ? <StopIcon /> : <MicIcon />}
                    </button>
                    <button
                      className={question.trim() && voice === "idle" ? "send-button send-active" : "send-button"}
                      disabled={!question.trim() || voice === "recording"}
                      onClick={sendQuestion}
                      aria-label="Enviar pergunta"
                    >
                      <SendIcon />
                    </button>
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
      {drawerOpen && <button className="scrim" onClick={() => setDrawerOpen(false)} aria-label="Fechar histórico" />}
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

              <label className="field-label details-label" htmlFor="feedback-details">Informações adicionais (opcional)</label>
              <textarea
                id="feedback-details"
                value={feedbackDetails}
                onChange={(event) => setFeedbackDetails(event.target.value)}
                maxLength={1000}
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
            <button className="feedback-submit" disabled={!feedbackReason} onClick={submitFeedback}>Enviar</button>
          </section>
        </div>
      )}
      </div>}
    </main>
  );
}
