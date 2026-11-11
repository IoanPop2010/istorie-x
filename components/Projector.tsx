"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Exercise, MapData, Scheme, Source } from "@/lib/types";
import type { Section } from "@/lib/markup";
import { ExerciseView } from "./Exercises";
import { MapView } from "./MapView";

type Slide =
  | { kind: "titlu" }
  | { kind: "text"; title: string; html: string[] }
  | { kind: "harta" }
  | { kind: "schema" }
  | { kind: "sursa"; source: Source }
  | { kind: "ex"; ex: Exercise; n: number };

function Timer() {
  const [left, setLeft] = useState(300);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? (setRun(false), 0) : l - 1)), 1000);
    return () => clearInterval(t);
  }, [run]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="rand-butoane">
      <span className="cronometru" aria-live="off">
        {mm}:{ss}
      </span>
      <button type="button" className="btn secundar" onClick={() => setRun((r) => !r)}>
        {run ? "Pauză" : "Pornește"}
      </button>
      {[3, 5, 10].map((m) => (
        <button
          key={m}
          type="button"
          className="btn secundar"
          onClick={() => {
            setLeft(m * 60);
            setRun(false);
          }}
        >
          {m} min
        </button>
      ))}
    </div>
  );
}

export function Projector({
  slug,
  title,
  summary,
  sections,
  sources,
  scheme,
  map,
  mapCaption,
  highlight,
  exercises,
}: {
  slug: string;
  title: string;
  summary: string;
  sections: Section[];
  sources: Source[];
  scheme: Scheme;
  map?: MapData;
  mapCaption?: string;
  highlight?: string[];
  exercises: Exercise[];
}) {
  const router = useRouter();
  const slides: Slide[] = [{ kind: "titlu" }];
  for (const s of sections) {
    const paras = s.blocks.map((b) => (b.type === "list" ? b.items.join("<br>") : b.html));
    for (let k = 0; k < paras.length; k += 2) slides.push({ kind: "text", title: s.title || title, html: paras.slice(k, k + 2) });
  }
  if (map) slides.push({ kind: "harta" });
  slides.push({ kind: "schema" });
  sources.forEach((source) => slides.push({ kind: "sursa", source }));
  exercises.filter((e) => e.kind !== "sursa").forEach((ex, n) => slides.push({ kind: "ex", ex, n: n + 1 }));

  const [i, setI] = useState(0);
  const go = useCallback((d: number) => setI((x) => Math.min(slides.length - 1, Math.max(0, x + d))), [slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("select, textarea, input")) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key.toLowerCase() === "f") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      } else if (e.key === "Escape" && !document.fullscreenElement) {
        router.push(`/lectii/${slug}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, router, slug]);

  const s = slides[i];
  return (
    <div className="proiectie" role="region" aria-label="Proiecție">
      <header>
        <span>{title}</span>
        <Timer />
      </header>
      <main key={i}>
        {s.kind === "titlu" && (
          <>
            <h2>{title}</h2>
            <p style={{ fontStyle: "italic" }}>{summary}</p>
          </>
        )}
        {s.kind === "text" && (
          <>
            <h2 style={{ fontSize: "1.5em" }}>{s.title}</h2>
            {s.html.map((h, k) => (
              <p key={k} dangerouslySetInnerHTML={{ __html: h }} />
            ))}
          </>
        )}
        {s.kind === "harta" && map && <MapView map={map} caption={mapCaption ?? ""} highlight={highlight} />}
        {s.kind === "schema" && (
          <>
            <h2 style={{ fontSize: "1.4em" }}>{scheme.title}</h2>
            <div className="schema">
              {scheme.columns.map((c) => (
                <div key={c.label}>
                  <h3>{c.label}</h3>
                  <ul>
                    {c.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
        {s.kind === "sursa" && (
          <>
            <h2 style={{ fontSize: "1.3em" }}>{s.source.title}</h2>
            <div className="slide-sursa">
              {s.source.text.split(/\n\s*\n/).map((p, k) => (
                <p key={k}>{p}</p>
              ))}
              <p style={{ fontSize: "0.7em", textAlign: "right" }}>{s.source.ref}</p>
            </div>
          </>
        )}
        {s.kind === "ex" && (
          <>
            <h2 style={{ fontSize: "1.1em" }} className="sc">
              Exercițiul {s.n}
            </h2>
            <ExerciseView ex={s.ex} sources={sources} maps={map ? { [map.id]: map } : {}} teacher />
          </>
        )}
      </main>
      <footer>
        <button type="button" className="btn secundar" onClick={() => router.push(`/lectii/${slug}`)}>
          Închide proiecția
        </button>
        <span className="muted">
          {i + 1} / {slides.length}. Săgeți sau telecomandă pentru navigare, F pentru ecran complet.
        </span>
        <span className="rand-butoane">
          <button type="button" className="btn secundar" onClick={() => go(-1)} disabled={i === 0}>
            Înapoi
          </button>
          <button type="button" className="btn" onClick={() => go(1)} disabled={i === slides.length - 1}>
            Înainte
          </button>
        </span>
      </footer>
    </div>
  );
}
