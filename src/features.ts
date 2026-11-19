// Chaves de funcionalidades do protótipo.
// Release 1.0 (Figma "Nova Anby (Release 1.0)"): estas funcionalidades ficam ocultas na primeira entrega.
// O código continua no projeto; para reativar, troque a chave para `true`.
export const features = {
  /** "Conectar no Claude" (barra lateral, trilho recolhido e painel de conexão). */
  conectarClaude: false,
  /** Microfone para ditar a pergunta no campo do chat. */
  ditadoPorVoz: false,
  /** Opção "Compartilhar" no submenu das conversas recentes (Release 1.0: só renomear e apagar). */
  compartilharConversa: false,
  /** Atalho "Sobre a ANBY" na barra lateral (não aparece nas telas da Release 1.0). */
  sobreAnby: false,
  /** Painel "Cenários de erro" do protótipo (simula os 39 cenários de erro e exceção). Desligar para apresentar sem ele. */
  painelCenarios: true,
} as const;

export type FeatureKey = keyof typeof features;
