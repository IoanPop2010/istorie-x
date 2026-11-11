"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { seededShuffle } from "@/lib/shared";
import { exportProgress, importProgress, resetProgress } from "@/lib/store";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ---------- Cronologie ----------

type Ev = { year: number; date: string; text: string; unit: string; slug: string; module: number };

export function Chronology({ events, modules }: { events: Ev[]; modules: { nr: number; label: string }[] }) {
  const [mod, setMod] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const nq = norm(q.trim());
    return events.filter((e) => (mod == null || e.module === mod) && (!nq || norm(`${e.date} ${e.text}`).includes(nq)));
  }, [events, mod, q]);
  let lastCentury = 0;
  return (
    <>
      <div className="filtre" role="group" aria-label="Filtrează după modul">
        <button type="button" aria-pressed={mod == null} onClick={() => setMod(null)}>
          Toate
        </button>
        {modules.map((m) => (
          <button key={m.nr} type="button" aria-pressed={mod === m.nr} onClick={() => setMod(m.nr)}>
            {m.label}
          </button>
        ))}
      </div>
      <input
        className="camp"
        type="search"
        placeholder="Caută un an sau un eveniment, de exemplu 1848"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Caută în cronologie"
        style={{ marginBottom: "1.5rem", fontSize: "var(--t-m)" }}
      />
      <p className="muted" aria-live="polite">
        {list.length} evenimente
      </p>
      <ol className="cronologie-mare">
        {list.flatMap((e, i) => {
          const c = Math.floor((e.year - 1) / 100) + 1;
          const out = [];
          if (c !== lastCentury) {
            lastCentury = c;
            out.push(
              <li className="secol" key={`c${c}-${i}`}>
                <span />
                <h2>Secolul {["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "XVII", "XVIII", "XIX", "XX", "XXI"][c]}</h2>
              </li>
            );
          }
          out.push(
            <li key={i}>
              <span className="data">{e.date}</span>
              <span>
                {e.text}
                <Link className="unitate" href={`/lectii/${e.slug}`}>
                  {e.unit}
                </Link>
              </span>
            </li>
          );
          return out;
        })}
      </ol>
    </>
  );
}

// ---------- Fișe de termeni ----------

type Card = { term: string; def: string; unit: string; slug: string; module: number };

export function Flashcards({ cards, modules }: { cards: Card[]; modules: { nr: number; label: string }[] }) {
  const [mod, setMod] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const deck = useMemo(
    () => seededShuffle(cards.filter((c) => mod == null || c.module === mod), `f${mod}-${round}`),
    [cards, mod, round]
  );
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState<Card[]>([]);
  const done = i >= deck.length;
  const card = deck[i];

  const answer = (ok: boolean) => {
    if (ok) setKnown((k) => k + 1);
    else setAgain((a) => [...a, card]);
    setFlip(false);
    setI((x) => x + 1);
  };
  const restart = (m: number | null) => {
    setMod(m);
    setI(0);
    setKnown(0);
    setAgain([]);
    setFlip(false);
    setRound((r) => r + 1);
  };

  return (
    <>
      <div className="filtre" role="group" aria-label="Alege modulul">
        <button type="button" aria-pressed={mod == null} onClick={() => restart(null)}>
          Toate
        </button>
        {modules.map((m) => (
          <button key={m.nr} type="button" aria-pressed={mod === m.nr} onClick={() => restart(m.nr)}>
            {m.label}
          </button>
        ))}
      </div>
      {done ? (
        <div>
          <p style={{ fontSize: "var(--t-l)" }}>
            Ai știut {known} din {deck.length} termeni.
          </p>
          {again.length > 0 && (
            <>
              <p>De repetat:</p>
              <ul>
                {again.map((c) => (
                  <li key={c.term}>
                    <strong>{c.term}</strong>{" "}
                    <Link className="muted" href={`/lectii/${c.slug}#glosar`}>
                      ({c.unit})
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button type="button" className="btn" onClick={() => restart(mod)}>
            Amestecă și reia
          </button>
        </div>
      ) : (
        <>
          <p className="muted">
            Fișa {i + 1} din {deck.length}. Atinge fișa ca să vezi definiția.
          </p>
          <button type="button" className={`fisa${flip ? " intoarsa" : ""}`} onClick={() => setFlip((f) => !f)} aria-label={flip ? card.def : `Termen: ${card.term}. Atinge pentru definiție.`}>
            <div className="fisa-interior">
              <div className="fisa-fata">
                <small>{card.unit}</small>
                {card.term}
              </div>
              <div className="fisa-verso">
                <small>{card.term}</small>
                {card.def}
              </div>
            </div>
          </button>
          <div className="rand-butoane">
            <button type="button" className="btn" onClick={() => answer(true)} disabled={!flip}>
              Am știut
            </button>
            <button type="button" className="btn secundar" onClick={() => answer(false)} disabled={!flip}>
              Mai am de repetat
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ---------- Căutare ----------

type Doc = { url: string; title: string; kind: string; text: string };

export function Search() {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
    const initial = new URLSearchParams(location.search).get("q");
    if (initial) setQ(initial);
    fetch("/search-index.json")
      .then((r) => r.json())
      .then(setDocs)
      .catch(() => setDocs([]));
  }, []);

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
    if (!docs || !terms.length) return [];
    const out: { d: Doc; score: number; snippet: string }[] = [];
    for (const d of docs) {
      const nt = norm(d.text);
      const ntitle = norm(d.title);
      if (!terms.every((t) => nt.includes(t) || ntitle.includes(t))) continue;
      const score = terms.reduce((s, t) => s + (ntitle.includes(t) ? 10 : 0) + nt.split(t).length - 1, 0);
      const pos = Math.max(0, nt.indexOf(terms[0]) - 80);
      let snippet = d.text.slice(pos, pos + 220);
      if (pos > 0) snippet = "…" + snippet;
      if (pos + 220 < d.text.length) snippet += "…";
      out.push({ d, score, snippet });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 40);
  }, [docs, q]);

  const highlight = (s: string) => {
    const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
    const ns = norm(s);
    const marks: [number, number][] = [];
    for (const t of terms) {
      let k = ns.indexOf(t);
      while (k >= 0) {
        marks.push([k, k + t.length]);
        k = ns.indexOf(t, k + t.length);
      }
    }
    marks.sort((a, b) => a[0] - b[0]);
    const parts: React.ReactNode[] = [];
    let last = 0;
    marks.forEach(([a, b], idx) => {
      if (a < last) return;
      parts.push(s.slice(last, a), <mark key={idx}>{s.slice(a, b)}</mark>);
      last = b;
    });
    parts.push(s.slice(last));
    return parts;
  };

  return (
    <>
      <input
        ref={input}
        className="camp"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Personaj, eveniment, termen sau an"
        aria-label="Caută în toată materia"
      />
      <p className="muted" aria-live="polite" style={{ marginTop: "0.75rem" }}>
        {docs === null ? "Se încarcă indexul…" : q.trim().length < 2 ? "Scrie cel puțin două litere. Diacriticele nu contează." : `${results.length} rezultate`}
      </p>
      <ul className="rezultate">
        {results.map(({ d, snippet }) => (
          <li key={d.url}>
            <span className="tip">{d.kind}</span>
            <div>
              <Link href={d.url}>{highlight(d.title)}</Link>
            </div>
            <p>{highlight(snippet)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------- Salvarea progresului ----------

export function ProgressBackup() {
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className="rand-butoane">
        <button
          type="button"
          className="btn"
          onClick={() => {
            const blob = new Blob([exportProgress()], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `pagini-de-istorie-progres-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            setMsg("Fișierul a fost descărcat.");
          }}
        >
          Descarcă progresul
        </button>
        <button type="button" className="btn secundar" onClick={() => file.current?.click()}>
          Încarcă progresul dintr-un fișier
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setMsg(importProgress(await f.text()) ? "Progresul a fost încărcat." : "Fișierul nu este un export din Pagini de istorie.");
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="btn secundar"
          onClick={() => {
            if (confirm("Ștergi tot progresul salvat în acest browser?")) {
              resetProgress();
              setMsg("Progresul a fost șters.");
            }
          }}
        >
          Șterge progresul
        </button>
      </div>
      <p className="muted" aria-live="polite" style={{ marginTop: "0.5rem" }}>
        {msg}
      </p>
    </div>
  );
}
