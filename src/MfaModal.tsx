import { useEffect, useRef, useState } from "react";

// Regras de validação definidas no design (anotações "Inputs de dados pessoais").
const nameOk = (v: string) => /^\S+(\s+\S+)+$/.test(v.trim());
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.com(\.[a-z]{2})?$/i.test(v.trim());

const MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 60;
const LOCK_SECONDS = 15 * 60;
// Protótipo: o back-end é simulado. 123456 valida; 000000 simula código expirado.
const DEMO_CODE = "123456";
const EXPIRED_CODE = "000000";
const PORTAL_URL = "https://www.anbima.com.br/pt_br/institucional/protecao-de-dados.htm";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

type Props = {
  open: boolean;
  expired: boolean;
  onClose: () => void;
  onVerified: (data: { name: string; email: string }) => void;
};

export default function MfaModal({ open, expired, onClose, onVerified }: Props) {
  // O estado vive no componente, que fica montado: fechar e reabrir devolve o usuário ao mesmo ponto.
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [resendLeft, setResendLeft] = useState(0);
  const sentEmail = useRef("");

  useEffect(() => {
    if (resendLeft <= 0) return;
    const id = window.setTimeout(() => setResendLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendLeft]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const locked = attempts >= MAX_ATTEMPTS;
  const nameError = touched.name && !nameOk(name);
  const emailError = touched.email && !emailOk(email);
  const canContinue = nameOk(name) && emailOk(email) && !loading;
  const canConfirm = code.length === 6 && !locked && !loading;

  const goNext = async () => {
    setLoading(true);
    await wait(900);
    // Se o e-mail mudou, um novo código é enviado e o tempo de reenvio recomeça.
    if (email.trim() !== sentEmail.current) {
      sentEmail.current = email.trim();
      setCode(""); setAttempts(0); setError(""); setResendLeft(RESEND_SECONDS);
    }
    setLoading(false);
    setStep(2);
  };

  const confirm = async () => {
    setLoading(true);
    await wait(900);
    setLoading(false);
    if (code === DEMO_CODE) {
      onVerified({ name: name.trim(), email: email.trim() });
      return;
    }
    if (code === EXPIRED_CODE) { setError("Token inválido. Código expirado ou já utilizado."); return; }
    const used = attempts + 1;
    setAttempts(used);
    if (used >= MAX_ATTEMPTS) { setError("Você atingiu o limite de tentativas. Tente novamente mais tarde."); setResendLeft(LOCK_SECONDS); return; }
    const left = MAX_ATTEMPTS - used;
    setError(`Código incorreto. Você tem mais ${left} ${left === 1 ? "tentativa" : "tentativas"}.`);
  };

  const resend = () => { setCode(""); setAttempts(0); setError(""); setResendLeft(RESEND_SECONDS); };

  return (
    <div className="mfa-backdrop">
      <section className="mfa" role="dialog" aria-modal="true" aria-labelledby="mfa-title">
        <button className="mfa-close" onClick={onClose} aria-label="Fechar">×</button>
        {expired && <p className="mfa-banner">Seu acesso expirou. Para conversar com a ANBY, valide seu e-mail novamente.</p>}
        <h2 id="mfa-title">Acesso rápido e seguro</h2>
        <p className="mfa-step">Passo {step}/2</p>

        {step === 1 ? (
          <form onSubmit={(event) => { event.preventDefault(); if (canContinue) void goNext(); }} noValidate>
            <h3>Dados pessoais</h3>
            <p>Para garantir sua segurança, pedimos seu nome e e-mail. Em seguida, você receberá um código para validar o acesso.</p>
            <label className="mfa-field">
              <span>Nome completo</span>
              <input value={name} onChange={(event) => setName(event.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Digite seu nome completo" autoComplete="name" aria-invalid={nameError} className={nameError ? "invalid" : ""} autoFocus />
              {nameError && <small role="alert">Insira o nome completo</small>}
            </label>
            <label className="mfa-field">
              <span>E-mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="Digite seu email" autoComplete="email" aria-invalid={emailError} className={emailError ? "invalid" : ""} />
              {emailError && <small role="alert">Insira um e-mail válido</small>}
            </label>
            <button className="mfa-primary" type="submit" disabled={!canContinue}>{loading ? <i className="mfa-spinner" aria-label="Validando" /> : "Continuar"}</button>
          </form>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); if (canConfirm) void confirm(); }} noValidate>
            <h3>Validação de acesso</h3>
            <p>Enviamos um código de confirmação para o seu e-mail:<br /><b>{email.trim()}</b></p>
            <label className="mfa-field">
              <span>Código de confirmação</span>
              <input value={code} inputMode="numeric" maxLength={6} placeholder="000000" autoComplete="one-time-code" autoFocus
                onChange={(event) => { setCode(event.target.value.replace(/\D/g, "")); if (!locked) setError(""); }}
                disabled={locked} aria-invalid={!!error} className={error ? "invalid code" : "code"} />
              {error && <small role="alert">{error}</small>}
            </label>
            {resendLeft > 0
              ? <p className="mfa-resend">Reenviar código em {clock(resendLeft)}min</p>
              : <button type="button" className="mfa-link" onClick={resend}>Reenviar código</button>}
            <p className="mfa-demo">Protótipo: use o código 123456 (000000 simula código expirado).</p>
            <div className="mfa-actions">
              <button type="button" className="mfa-secondary" onClick={() => setStep(1)}>Voltar</button>
              <button className="mfa-primary" type="submit" disabled={!canConfirm}>{loading ? <i className="mfa-spinner" aria-label="Validando" /> : "Confirmar"}</button>
            </div>
          </form>
        )}

        <p className="mfa-legal">
          A ANBY consiste em sistema de inteligência artificial desenvolvido pela Anbima para auxiliar nas dúvidas relacionadas à autorregulação da associação. Apesar de todo o esforço para assegurar a exatidão e a atualização das respostas, as informações fornecidas têm fins exclusivamente informativos, podendo conter imprecisões, omissões e/ou interpretações equivocadas. As respostas fornecidas pela ANBY não constituem, nem devem ser interpretadas como aconselhamento, consultoria, parecer ou orientação de natureza profissional, jurídica e/ou financeira, tampouco como recomendação, conselho, indicação, sugestão, aviso ou garantia de resultado da Anbima. Os dados pessoais usados serão coletados e tratados em conformidade com a LGPD (Lei 13.709/18). Caso o titular dos dados pessoais deseje exercer algum de seus direitos, pode acessar nosso <a href={PORTAL_URL} target="_blank" rel="noreferrer">portal</a>.
        </p>
      </section>
    </div>
  );
}
