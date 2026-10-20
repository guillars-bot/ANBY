// Sessão do usuário validado por e-mail (protótipo: armazenada no navegador por 30 dias).
const KEY = "anby.session";
const DAYS = 30;

export type Session = { name: string; email: string; at: number };

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";

export function loadSession(): { session: Session | null; expired: boolean } {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { session: null, expired: false };
    const stored = JSON.parse(raw) as Session;
    const valid = Date.now() - stored.at < DAYS * 24 * 60 * 60 * 1000;
    return valid ? { session: stored, expired: false } : { session: null, expired: true };
  } catch {
    return { session: null, expired: false };
  }
}

export function saveSession(data: { name: string; email: string }) {
  try { window.localStorage.setItem(KEY, JSON.stringify({ ...data, at: Date.now() })); } catch { /* storage indisponível */ }
}

export function clearSession() {
  try { window.localStorage.removeItem(KEY); } catch { /* storage indisponível */ }
}
