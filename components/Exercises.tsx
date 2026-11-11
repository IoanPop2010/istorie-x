"use client";

import { useMemo, useState } from "react";
import type { Asociere, Exercise, Grila, HartaMuta, MapData, Ordonare, Source, SursaBac } from "@/lib/types";
import { seededShuffle } from "@/lib/shared";
import { recordExercise, useMode, useProgress } from "@/lib/store";
import { HatchDefs } from "./MapView";

const LITERE = "abcdefgh";
const TIP: Record<Exercise["kind"], string> = {
  grila: "Item cu alegere multiplă",
  ordonare: "Ordonare cronologică",
  asociere: "Asociere",
  sursa: "Analiză de sursă, tip bacalaureat",
  harta: "Hartă mută",
};

type Done = (score: number) => void;

function Verdict({ ok, children }: { ok: boolean; children?: React.ReactNode }) {
  return (
    <span className={`verdict ${ok ? "bine" : "gresit"}`} role="status">
      {children ?? (ok ? "Corect" : "Greșit")}
    </span>
  );
}

// ---------- Grilă ----------

export function GrilaEx({ ex, onDone, reveal }: { ex: Grila; onDone?: Done; reveal?: boolean }) {
  const [ales, setAles] = useState<number | null>(null);
  const answered = ales !== null || reveal;
  return (
    <>
      <p className="intrebare">{ex.q}</p>
      <ol className="variante">
        {ex.options.map((o, i) => {
          let cls = "";
          if (answered && i === ex.answer) cls = "corect";
          else if (ales === i) cls = "ales-gresit";
          return (
            <li key={i}>
              <button
                type="button"
                data-litera={LITERE[i] + ")"}
                className={cls}
                disabled={answered}
                onClick={() => {
                  setAles(i);
                  onDone?.(i === ex.answer ? 1 : 0);
                }}
              >
                {o}
              </button>
            </li>
          );
        })}
      </ol>
      {answered && <p className="explicatie">{ex.explain}</p>}
    </>
  );
}

// ---------- Ordonare cronologică ----------

export function OrdonareEx({ ex, onDone, reveal }: { ex: Ordonare; onDone?: Done; reveal?: boolean }) {
  const initial = useMemo(() => {
    let s = seededShuffle(ex.items, ex.q);
    // Evită ca amestecarea să lase ordinea corectă.
    if (s.every((it, i) => it === ex.items[i])) s = [...s.slice(1), s[0]];
    return s;
  }, [ex]);
  const [order, setOrder] = useState(initial);
  const [checked, setChecked] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const shown = reveal ? ex.items : order;
  const done = checked || reveal;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const a = [...order];
    const [x] = a.splice(from, 1);
    a.splice(to, 0, x);
    setOrder(a);
  };
  const correctCount = order.filter((it, i) => it === ex.items[i]).length;

  return (
    <>
      <p className="intrebare">{ex.q}</p>
      <ol className="ordine">
        {shown.map((it, i) => (
          <li
            key={it.text}
            draggable={!done}
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag !== null) move(drag, i);
              setDrag(null);
            }}
            onDragEnd={() => setDrag(null)}
            className={`${drag === i ? "trage" : ""} ${done ? (it === ex.items[i] ? "corect" : "gresit") : ""}`}
          >
            <span className="poz">{i + 1}.</span>
            <span>
              {it.text} {done && <span className="data">({it.date})</span>}
            </span>
            {!done && (
              <span className="muta">
                <button type="button" aria-label={`Mută mai sus: ${it.text}`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Mută mai jos: ${it.text}`}
                  disabled={i === shown.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  ↓
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!done ? (
        <button
          type="button"
          className="btn"
          onClick={() => {
            setChecked(true);
            onDone?.(correctCount === ex.items.length ? 1 : 0);
          }}
        >
          Verifică ordinea
        </button>
      ) : (
        !reveal && (
          <Verdict ok={correctCount === ex.items.length}>
            {correctCount === ex.items.length
              ? "Ordine corectă"
              : `${correctCount} din ${ex.items.length} la locul potrivit. Datele sunt afișate acum.`}
          </Verdict>
        )
      )}
    </>
  );
}

// ---------- Asociere ----------

export function AsociereEx({ ex, onDone, reveal }: { ex: Asociere; onDone?: Done; reveal?: boolean }) {
  const right = useMemo(() => seededShuffle(ex.pairs.map((p) => p[1]), ex.q + "r"), [ex]);
  const [sel, setSel] = useState<string[]>(() => ex.pairs.map(() => ""));
  const [checked, setChecked] = useState(false);
  const done = checked || reveal;
  const good = ex.pairs.filter((p, i) => sel[i] === p[1]).length;
  return (
    <>
      <p className="intrebare">{ex.q}</p>
      <div className="perechi">
        {ex.pairs.map(([l, r], i) => (
          <label key={l} className={checked ? (sel[i] === r ? "corect" : "gresit") : ""}>
            <span>{l}</span>
            <select
              value={reveal ? r : sel[i]}
              disabled={done}
              onChange={(e) => setSel((s) => s.map((v, j) => (j === i ? e.target.value : v)))}
            >
              <option value="">Alege…</option>
              {right.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {checked && sel[i] !== r && <span className="corect-era">Corect: {r}</span>}
          </label>
        ))}
      </div>
      {!done ? (
        <button
          type="button"
          className="btn"
          disabled={sel.some((v) => !v)}
          onClick={() => {
            setChecked(true);
            onDone?.(good === ex.pairs.length ? 1 : 0);
          }}
        >
          Verifică asocierile
        </button>
      ) : (
        !reveal && <Verdict ok={good === ex.pairs.length}>{`${good} din ${ex.pairs.length} asocieri corecte`}</Verdict>
      )}
    </>
  );
}

// ---------- Sursă, tip bacalaureat (autoevaluare cu barem) ----------

export function SourceBox({ source }: { source: Source }) {
  return (
    <div className="sursa">
      <h3>{source.title}</h3>
      <div className="text">
        {source.text.split(/\n\s*\n/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="ref">{source.ref}</p>
    </div>
  );
}

export function SursaEx({ ex, source, onDone, teacher }: { ex: SursaBac; source?: Source; onDone?: Done; teacher?: boolean }) {
  const total = ex.items.reduce((s, it) => s + it.points, 0);
  const [answers, setAnswers] = useState<string[]>(() => ex.items.map(() => ""));
  const [shown, setShown] = useState(false);
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const perTick = (i: number) => ex.items[i].points / ex.items[i].barem.length;
  const score = Object.entries(ticks).reduce((s, [k, v]) => {
    if (!v) return s;
    const i = Number(k.split(":")[0]);
    return s + perTick(i);
  }, 0);
  const visible = shown || teacher;

  return (
    <>
      <p className="intrebare">Citește sursa, apoi răspunde. La final, compară-ți răspunsurile cu baremul și bifează ce ai atins.</p>
      {source && <SourceBox source={source} />}
      <ol className="itemi-bac">
        {ex.items.map((it, i) => (
          <li key={i}>
            <p>
              {it.q} <span className="puncte">({it.points} p)</span>
            </p>
            {!teacher && (
              <textarea
                aria-label={`Răspuns la cerința ${i + 1}`}
                value={answers[i]}
                onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
              />
            )}
            {visible && (
              <div className="barem">
                {it.barem.map((b, j) => (
                  <label key={j}>
                    {!teacher && (
                      <input
                        type="checkbox"
                        checked={!!ticks[`${i}:${j}`]}
                        onChange={(e) => setTicks((t) => ({ ...t, [`${i}:${j}`]: e.target.checked }))}
                      />
                    )}
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      {!teacher && (
        <div className="rand-butoane" style={{ marginTop: "1rem" }}>
          {!shown ? (
            <button type="button" className="btn" onClick={() => setShown(true)}>
              Arată baremul
            </button>
          ) : (
            <>
              <span className="puncte">
                Punctaj autoevaluat: {Math.round(score * 10) / 10} din {total} p
              </span>
              <button type="button" className="btn secundar" onClick={() => onDone?.(score / total)}>
                Salvează punctajul
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ---------- Hartă mută ----------

export function HartaEx({ ex, map, onDone, reveal }: { ex: HartaMuta; map: MapData; onDone?: Done; reveal?: boolean }) {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);
  const finished = step >= ex.targets.length;
  const target = ex.targets[step];
  const labels = reveal ? ex.targets.map((t) => t.id) : found;

  function pick(id: string) {
    if (finished || reveal) return;
    if (id === target.id) {
      const next = step + 1;
      setFound((f) => [...f, id]);
      setStep(next);
      setWrong(null);
      if (next >= ex.targets.length) onDone?.(errors === 0 ? 1 : Math.max(0, 1 - errors / ex.targets.length));
    } else {
      setWrong(id);
      setErrors((e) => e + 1);
    }
  }

  return (
    <>
      <p className="intrebare">{ex.q}</p>
      {!reveal && (
        <p aria-live="polite">
          {finished ? (
            <Verdict ok={errors === 0}>
              {errors === 0 ? "Toate teritoriile identificate din prima" : `Ai terminat, cu ${errors} ${errors === 1 ? "greșeală" : "greșeli"}`}
            </Verdict>
          ) : (
            <>
              Indică pe hartă: <strong>{target.label}</strong>{" "}
              <span className="muted">
                ({step + 1} din {ex.targets.length})
              </span>
            </>
          )}
        </p>
      )}
      <div className="harta harta-muta">
        <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label={`Hartă mută: ${map.title}`}>
          <HatchDefs />
          <path className="retea" d={map.graticule} />
          {map.features.map((f) => (
            <path
              key={f.id}
              d={f.d}
              className={`teritoriu${labels.includes(f.id) ? " gasit" : ""}${wrong === f.id ? " gresit" : ""}`}
              onClick={() => pick(f.id)}
            />
          ))}
          {ex.targets
            .filter((t) => labels.includes(t.id))
            .map((t) => {
              const f = map.features.find((x) => x.id === t.id);
              return f ? (
                <text key={t.id} x={f.cx} y={f.cy} textAnchor="middle" className="eticheta mare">
                  {t.label}
                </text>
              ) : null;
            })}
        </svg>
      </div>
      {!reveal && finished && (
        <button
          type="button"
          className="btn secundar"
          style={{ marginTop: "0.75rem" }}
          onClick={() => {
            setStep(0);
            setFound([]);
            setErrors(0);
            setWrong(null);
          }}
        >
          Reia harta
        </button>
      )}
    </>
  );
}

// ---------- Setul de exerciții al unei lecții ----------

export function ExerciseView({
  ex,
  sources,
  maps,
  onDone,
  teacher,
}: {
  ex: Exercise;
  sources: Source[];
  maps: Record<string, MapData>;
  onDone?: Done;
  teacher?: boolean;
}) {
  const [reveal, setReveal] = useState(false);
  const r = reveal;
  switch (ex.kind) {
    case "grila":
      return (
        <>
          <GrilaEx key={String(r)} ex={ex} onDone={onDone} reveal={r} />
          {teacher && !r && <RevealBtn onClick={() => setReveal(true)} />}
        </>
      );
    case "ordonare":
      return (
        <>
          <OrdonareEx key={String(r)} ex={ex} onDone={onDone} reveal={r} />
          {teacher && !r && <RevealBtn onClick={() => setReveal(true)} />}
        </>
      );
    case "asociere":
      return (
        <>
          <AsociereEx key={String(r)} ex={ex} onDone={onDone} reveal={r} />
          {teacher && !r && <RevealBtn onClick={() => setReveal(true)} />}
        </>
      );
    case "sursa":
      return <SursaEx ex={ex} source={sources.find((s) => s.id === ex.sourceId)} onDone={onDone} teacher={teacher} />;
    case "harta":
      return maps[ex.map] ? (
        <>
          <HartaEx key={String(r)} ex={ex} map={maps[ex.map]} onDone={onDone} reveal={r} />
          {teacher && !r && <RevealBtn onClick={() => setReveal(true)} />}
        </>
      ) : null;
  }
}

function RevealBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="btn ceara" style={{ marginTop: "0.75rem" }} onClick={onClick}>
      Arată răspunsul
    </button>
  );
}

export function ExerciseSet({
  slug,
  exercises,
  sources,
  maps,
}: {
  slug: string;
  exercises: Exercise[];
  sources: Source[];
  maps: Record<string, MapData>;
}) {
  const mode = useMode();
  const progress = useProgress();
  const results = progress.ex[slug] ?? {};
  const solved = Object.keys(results).length;
  const good = Object.values(results).reduce((s, v) => s + v, 0);
  return (
    <>
      <p className="muted">
        {solved === 0
          ? `${exercises.length} exerciții. Rezultatele se salvează în acest browser.`
          : `Ai rezolvat ${solved} din ${exercises.length} exerciții, cu un scor de ${Math.round((good / solved) * 100)}%.`}
      </p>
      <div className="exercitii">
        {exercises.map((ex, i) => (
          <section className="ex" key={i}>
            <header>
              <span className="tip">{TIP[ex.kind]}</span>
              {results[i] != null && (
                <span className={`verdict ${results[i] >= 0.5 ? "bine" : "gresit"}`}>
                  {ex.kind === "sursa" ? `${Math.round(results[i] * 100)}%` : results[i] ? "rezolvat corect" : "de reluat"}
                </span>
              )}
            </header>
            <ExerciseView
              ex={ex}
              sources={sources}
              maps={maps}
              teacher={mode === "profesor"}
              onDone={(score) => recordExercise(slug, i, score)}
            />
          </section>
        ))}
      </div>
    </>
  );
}
