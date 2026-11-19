import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { MfaPreset } from "./scenarios";

// Textos oficiais (documento de cenários de erro e exceção, 29/10/2026).
const MSG = {
  nameEmpty: "Informe o seu nome.",
  nameIncomplete: "Insira o nome completo",
  email: "Informe um e-mail válido, como voce@empresa.com.br.",
  codeInvalid: "Código inválido ou expirado. Confira os 6 dígitos ou peça um novo código.",
  tooManyAttempts: "Muitas tentativas com código errado para este e-mail. Aguarde 15 minutos e peça um novo código.",
};

// Regras de validação definidas no design (anotações "Inputs de dados pessoais").
const nameOk = (v: string) => /^\S+(\s+\S+)+$/.test(v.trim());
// Aceita qualquer domínio com extensão válida (.com, .com.br, .org.br, .gov.br, .net...).
const emailOk = (v: string) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i.test(v.trim());

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
  /** Cenário de erro do protótipo: preenche o modal no estado do cenário. */
  preset?: MfaPreset | null;
};

export default function MfaModal({ open, expired, onClose, onVerified, preset }: Props) {
  // O estado vive no componente, que fica montado: fechar e reabrir devolve o usuário ao mesmo ponto.
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false });
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [resendLeft, setResendLeft] = useState(0);
  const sentEmail = useRef("");
  // Erros vindos do "servidor" (cenários): aparecem sob os campos ou sob o botão Continuar.
  const [forced, setForced] = useState<{ name?: string; email?: string; form?: string }>({});
  const [forceLock, setForceLock] = useState(false);

  useEffect(() => {
    if (!preset) return;
    setStep(preset.step);
    setName(preset.name ?? "");
    setEmail(preset.email ?? "");
    sentEmail.current = preset.email ?? "";
    setTouched({ name: !!preset.nameError, email: !!preset.emailError });
    setDigits(Array.from({ length: 6 }, (_, i) => (preset.code ?? "")[i] ?? ""));
    setForced({ name: preset.nameError, email: preset.emailError, form: preset.formError });
    setError(preset.codeError ?? "");
    setForceLock(!!preset.locked);
    setAttempts(preset.locked ? MAX_ATTEMPTS : 0);
    setResendLeft(preset.locked ? LOCK_SECONDS : preset.step === 2 ? RESEND_SECONDS : 0);
    setLoading(false);
  }, [preset]);

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

  const locked = attempts >= MAX_ATTEMPTS || forceLock;
  const nameMessage = forced.name || (touched.name && !nameOk(name) ? (name.trim() ? MSG.nameIncomplete : MSG.nameEmpty) : "");
  const emailMessage = forced.email || (touched.email && !emailOk(email) ? MSG.email : "");
  const nameError = !!nameMessage;
  const emailError = !!emailMessage;
  const canContinue = nameOk(name) && emailOk(email) && !loading;
  const canConfirm = code.length === 6 && !locked && !loading;

  const goNext = async () => {
    setLoading(true);
    await wait(900);
    // Se o e-mail mudou, um novo código é enviado e o tempo de reenvio recomeça.
    if (email.trim() !== sentEmail.current) {
      sentEmail.current = email.trim();
      setDigits(Array(6).fill("")); setAttempts(0); setError(""); setResendLeft(RESEND_SECONDS);
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
    // Código errado, vencido ou de e-mail sem acesso: a mensagem é a mesma de propósito.
    if (code === EXPIRED_CODE) { setError(MSG.codeInvalid); return; }
    const used = attempts + 1;
    setAttempts(used);
    if (used >= MAX_ATTEMPTS) { setError(MSG.tooManyAttempts); setResendLeft(LOCK_SECONDS); return; }
    setError(MSG.codeInvalid);
  };

  const changeDigit = (index: number, value: string) => {
    const typed = value.replace(/\D/g, "").slice(0, 6 - index);
    const next = [...digits];
    if (!typed) next[index] = "";
    else typed.split("").forEach((char, offset) => { next[index + offset] = char; });
    setDigits(next);
    if (!locked) setError("");
    if (typed) inputs.current[Math.min(index + typed.length, 5)]?.focus();
  };
  const keyDigit = (index: number, event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  };

  const resend = () => { setDigits(Array(6).fill("")); setAttempts(0); setForceLock(false); setError(""); setResendLeft(RESEND_SECONDS); };

  return (
    <div className="mfa-backdrop">
      <section className="mfa" role="dialog" aria-modal="true" aria-labelledby="mfa-title">
        <button className="mfa-close" onClick={onClose} aria-label="Fechar">×</button>
        {expired && <p className="mfa-banner">Seu acesso expirou. Para conversar com a ANBY, valide seu e-mail novamente.</p>}
        <h2 id="mfa-title">Acesso rápido e seguro</h2>
        <div className="mfa-progress" role="progressbar" aria-label="Etapas do acesso" aria-valuemin={0} aria-valuemax={2} aria-valuenow={step}><i style={{ width: step === 1 ? "50%" : "100%" }} /></div>
        <p className="mfa-step">Passo {step}/2</p>

        {step === 1 ? (
          <form onSubmit={(event) => { event.preventDefault(); if (canContinue) void goNext(); }} noValidate>
            <h3>Dados pessoais</h3>
            <p>Para garantir sua segurança, pedimos seu nome e e-mail. Em seguida, você receberá um código para validar o acesso.</p>
            <label className="mfa-field">
              <span>Nome completo</span>
              <input value={name} onChange={(event) => { setName(event.target.value); setForced((f) => ({ ...f, name: undefined, form: undefined })); }} onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Digite seu nome completo" autoComplete="name" aria-invalid={nameError} className={nameError ? "invalid" : ""} autoFocus />
              {nameError && <small role="alert">{nameMessage}</small>}
            </label>
            <label className="mfa-field">
              <span>E-mail</span>
              <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setForced((f) => ({ ...f, email: undefined, form: undefined })); }} onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="Digite seu email" autoComplete="email" aria-invalid={emailError} className={emailError ? "invalid" : ""} />
              {emailError && <small role="alert">{emailMessage}</small>}
            </label>
            <button className="mfa-primary" type="submit" disabled={!canContinue}>{loading ? <i className="mfa-spinner" aria-label="Validando" /> : "Continuar"}</button>
            {forced.form && <small className="mfa-form-error" role="alert">{forced.form}</small>}
          </form>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); if (canConfirm) void confirm(); }} noValidate>
            <h3>Validação de acesso</h3>
            <p>Enviamos um código de confirmação para o seu e-mail:<br /><b>{email.trim()}</b></p>
            <fieldset className="mfa-otp">
              <legend>Código de confirmação</legend>
              <div className="mfa-otp-row">
                {digits.map((digit, index) => (
                  <input key={index} ref={(el) => { inputs.current[index] = el; }} value={digit} inputMode="numeric" maxLength={6}
                    autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`Dígito ${index + 1} de 6`} autoFocus={index === 0}
                    disabled={locked} className={error ? "invalid" : ""}
                    onChange={(event) => changeDigit(index, event.target.value)} onKeyDown={(event) => keyDigit(index, event)}
                    onFocus={(event) => event.currentTarget.select()} />
                ))}
              </div>
              {error && <small role="alert">{error}</small>}
            </fieldset>
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
