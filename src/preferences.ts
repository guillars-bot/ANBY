// Release 1.1 — Preferências de resposta da ANBY (protótipo).
// Guardadas no navegador (localStorage). No produto, ficam no perfil do usuário no sistema da ANBY.

export type AnswerSize = "auto" | "diretas" | "equilibradas" | "completas";

export type Preferences = {
  /** Tamanho das respostas escolhido em "Suas preferências" (ou no prompt do chat). */
  size: AnswerSize;
  /** "Personalizar as respostas para mim". Desligado: a ANBY responde no padrão. */
  personalize: boolean;
  /** Início do aprendizado (dd/mm/aaaa). "Recomeçar do zero" reinicia esta data. */
  since: string;
  /** Perguntas feitas desde `since` (só contam com a personalização ligada). */
  questions: number;
  /** Vezes que o usuário pediu "Mais direta" / "Mais completa" em uma resposta. */
  shorterAsks: number;
  longerAsks: number;
};

const KEY = "anby.prefs";

export const today = () => new Date().toLocaleDateString("pt-BR");

export const defaultPreferences = (): Preferences => ({
  size: "auto",
  personalize: true,
  since: today(),
  questions: 0,
  shorterAsks: 0,
  longerAsks: 0,
});

export function loadPreferences(): Preferences {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultPreferences();
    return { ...defaultPreferences(), ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return defaultPreferences();
  }
}

export function savePreferences(prefs: Preferences) {
  try { window.localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* armazenamento indisponível */ }
}

export const SIZE_OPTIONS: { value: AnswerSize; title: string; description: string }[] = [
  { value: "auto", title: "A ANBY decide", description: "Hoje: equilibradas, o padrão, até ela aprender com você" },
  { value: "diretas", title: "Mais diretas", description: "O número, com fonte e data, sem rodeio" },
  { value: "equilibradas", title: "Equilibradas", description: "O número com um pouco de contexto" },
  { value: "completas", title: "Mais completas", description: "Com contexto, comparação e análise" },
];

/** Frase de "O que a ANBY percebeu" para a escolha explícita de tamanho. */
export const SIZE_PERCEIVED: Record<Exclude<AnswerSize, "auto">, string> = {
  diretas: "Você escolheu respostas mais diretas.",
  equilibradas: "Você escolheu respostas equilibradas.",
  completas: "Você escolheu respostas mais completas.",
};

const vezes = (n: number) => (n === 1 ? "1 vez" : `${n} vezes`);

export function perceivedItems(prefs: Preferences): string[] {
  const items: string[] = [];
  if (prefs.size !== "auto") items.push(SIZE_PERCEIVED[prefs.size]);
  if (prefs.shorterAsks > 0) items.push(`Você pediu ${vezes(prefs.shorterAsks)} uma versão mais curta de uma resposta.`);
  if (prefs.longerAsks > 0) items.push(`Você pediu ${vezes(prefs.longerAsks)} uma versão mais completa de uma resposta.`);
  return items;
}

/** Resposta refeita no protótipo: mais direta = primeira frase; mais completa = acrescenta contexto. */
export function regenerateAnswer(text: string, kind: "direta" | "completa"): string {
  const clean = text.trim();
  if (kind === "direta") {
    const first = clean.match(/^.+?[.!?](\s|$)/)?.[0]?.trim() || clean;
    return `${first} Fonte: ANBIMA Data.`;
  }
  return `${clean} Para dar mais contexto: vale comparar com o mesmo período do ano anterior e com a média dos últimos 12 meses, que ajudam a separar o movimento pontual da tendência. Se quiser, detalho a série histórica e a metodologia usada no cálculo.`;
}
