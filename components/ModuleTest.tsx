"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Exercise, MapData } from "@/lib/types";
import { seededShuffle } from "@/lib/shared";
import { recordTest } from "@/lib/store";
import { ExerciseView } from "./Exercises";

type Item = { ex: Exercise; unit: string; slug: string };

export function ModuleTest({ module, pool, maps, size = 18 }: { module: number; pool: Item[]; maps: Record<string, MapData>; size?: number }) {
  const [round, setRound] = useState(0);
  const items = useMemo(() => seededShuffle(pool, `m${module}-${round}`).slice(0, size), [pool, module, round, size]);
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const finished = i >= items.length;
  const total = Math.round((scores.reduce((s, v) => s + v, 0) / items.length) * 100);

  if (finished) {
    const wrong = items.filter((_, k) => !scores[k]);
    return (
      <div className="unealta">
        <p style={{ fontSize: "var(--t-xl)" }}>
          Scor: {total}% <span className="muted">({scores.filter(Boolean).length} din {items.length} corecte)</span>
        </p>
        {wrong.length > 0 && (
          <>
            <p>Unitățile de recitit, după întrebările greșite:</p>
            <ul>
              {[...new Map(wrong.map((w) => [w.slug, w.unit])).entries()].map(([slug, title]) => (
                <li key={slug}>
                  <Link href={`/lectii/${slug}`}>{title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <button
          type="button"
          className="btn"
          onClick={() => {
            setRound((r) => r + 1);
            setI(0);
            setScores([]);
            setAnswered(false);
          }}
        >
          Începe un test nou
        </button>
      </div>
    );
  }

  const cur = items[i];
  return (
    <div className="exercitii">
      <section className="ex" key={`${round}-${i}`}>
        <header>
          <span className="sc muted">
            Întrebarea {i + 1} din {items.length}
          </span>
          <span className="sc muted">{cur.unit}</span>
        </header>
        <ExerciseView
          ex={cur.ex}
          sources={[]}
          maps={maps}
          onDone={(s) => {
            setScores((arr) => [...arr, s >= 1 ? 1 : 0]);
            setAnswered(true);
          }}
        />
      </section>
      <div className="rand-butoane">
        <button
          type="button"
          className="btn"
          disabled={!answered}
          onClick={() => {
            const next = i + 1;
            setI(next);
            setAnswered(false);
            if (next >= items.length) {
              const final = Math.round(([...scores].reduce((s, v) => s + v, 0) / items.length) * 100);
              recordTest(module, final);
            }
          }}
        >
          {i + 1 < items.length ? "Următoarea întrebare" : "Vezi rezultatul"}
        </button>
      </div>
    </div>
  );
}
