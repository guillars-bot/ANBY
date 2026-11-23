import { useState } from "react";
import { SIZE_OPTIONS, perceivedItems, today, type AnswerSize, type Preferences } from "./preferences";

// Release 1.1 — Página "Suas preferências" (Figma: 117:80850 e estados 117:78708 · 117:80976 · 117:86682 · 117:91022 · 117:88708).
export default function PreferencesPanel({ prefs, onChange }: { prefs: Preferences; onChange: (next: Preferences) => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const off = !prefs.personalize;
  const items = off ? [] : perceivedItems(prefs);

  const chooseSize = (size: AnswerSize) => {
    if (off || size === prefs.size) return;
    onChange({ ...prefs, size });
    setStatus("Preferência salva.");
  };

  const togglePersonalize = () => {
    onChange({ ...prefs, personalize: !prefs.personalize });
    setStatus("Preferência salva.");
  };

  const restart = () => {
    onChange({ ...prefs, since: today(), questions: 0, shorterAsks: 0, longerAsks: 0 });
    setConfirmRestart(false);
    setStatus("Pronto: a ANBY recomeçou a aprender a partir de agora.");
  };

  const questions = off ? 0 : prefs.questions;

  return (
    <div className="prefs">
      <h2>Suas preferências</h2>
      <p className="prefs-sub">Como a ANBY ajusta o jeito de responder para você</p>
      <p className="prefs-text">A ANBY aprende com as suas perguntas o tamanho de resposta que funciona para você e os assuntos que você mais consulta. Isso muda só a forma: fontes, datas e números são os mesmos para todos, e as regras de sempre continuam valendo.</p>

      <h3 id="prefs-size-title">Tamanho das respostas</h3>
      {off && <p className="prefs-hint">Ligue a personalização, mais abaixo, para escolher o tamanho.</p>}
      <div className={off ? "prefs-options is-off" : "prefs-options"} role="radiogroup" aria-labelledby="prefs-size-title" aria-disabled={off || undefined}>
        {SIZE_OPTIONS.map((option) => {
          const selected = off ? option.value === "auto" : prefs.size === option.value;
          const description = off && option.value === "auto" ? "Personalização desligada: respostas equilibradas, no padrão" : option.description;
          return (
            <label key={option.value} className={selected ? "prefs-card selected" : "prefs-card"}>
              <input type="radio" name="anby-answer-size" value={option.value} checked={selected} disabled={off} onChange={() => chooseSize(option.value)} />
              <span className="prefs-radio" aria-hidden="true" />
              <span className="prefs-card-text">
                <b>{option.title}</b>
                <small>{description}</small>
              </span>
            </label>
          );
        })}
      </div>

      <hr className="prefs-divider" />
      <h3 className="prefs-section">O que a ANBY percebeu</h3>
      {off ? (
        <p className="prefs-hint prefs-hint-gap">Com a personalização desligada, a ANBY responde no padrão.</p>
      ) : items.length > 0 ? (
        <ul className="prefs-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>
      ) : (
        <p className="prefs-hint prefs-hint-gap">Ainda não há o suficiente: a ANBY vai aprendendo conforme você pergunta.</p>
      )}
      <p className="prefs-note">Com base em {questions} {questions === 1 ? "pergunta" : "perguntas"} desde {prefs.since}. Os interesses servem para sugerir perguntas na abertura; a ANBY não traz números de outras conversas.</p>

      <hr className="prefs-divider" />
      <div className="prefs-section">
        <div className="prefs-card prefs-switch-card">
          <button type="button" role="switch" aria-checked={prefs.personalize} aria-labelledby="prefs-switch-title" aria-describedby="prefs-switch-desc" className="prefs-switch" onClick={togglePersonalize}>
            <i aria-hidden="true" />
          </button>
          <span className="prefs-card-text">
            <b id="prefs-switch-title">Personalizar as respostas para mim</b>
            <small id="prefs-switch-desc">Desligado, a ANBY responde no padrão e a abertura mostra os exemplos de sempre.</small>
          </span>
        </div>
      </div>

      <hr className="prefs-divider" />
      <h3 className="prefs-section">Recomeçar do zero</h3>
      <p className="prefs-text prefs-text-tight">O aprendizado passa a contar só a partir de agora. Seu histórico de conversas não é apagado.</p>
      <div className="prefs-restart">
        {confirmRestart ? (
          <div className="prefs-confirm" role="group" aria-labelledby="prefs-confirm-title">
            <b id="prefs-confirm-title">Recomeçar do zero?</b>
            <button type="button" className="prefs-button primary" onClick={restart} autoFocus>Confirmar</button>
            <button type="button" className="prefs-button" onClick={() => setConfirmRestart(false)}>Cancelar</button>
          </div>
        ) : (
          <button type="button" className="prefs-button" onClick={() => { setStatus(null); setConfirmRestart(true); }}>Recomeçar do zero</button>
        )}
      </div>
      {status && <p className="prefs-status" role="status">{status}</p>}
    </div>
  );
}
