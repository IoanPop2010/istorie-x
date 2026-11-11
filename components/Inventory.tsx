"use client";

import { useProgress } from "@/lib/store";

export function UnitStatus({ slug, total }: { slug: string; total: number }) {
  const p = useProgress();
  const ex = p.ex[slug] ? Object.keys(p.ex[slug]).length : 0;
  if (!p.read[slug] && !ex) return <span className="stare-necitit">necitită</span>;
  return (
    <span className="stare-citit">
      {p.read[slug] ? "citită" : "începută"}
      {ex ? `, ${ex}/${total} ex.` : ""}
    </span>
  );
}

export function TestStatus({ module }: { module: number }) {
  const p = useProgress();
  const s = p.tests[module];
  return s == null ? <span className="stare-necitit">nesusținut</span> : <span className="stare-citit">cel mai bun: {s}%</span>;
}

export function OverallBar({ slugs }: { slugs: string[] }) {
  const p = useProgress();
  const read = slugs.filter((s) => p.read[s]).length;
  const pct = Math.round((read / slugs.length) * 100);
  return (
    <div className="bara-parcurs">
      <span>
        {read === 0 ? "Nicio unitate citită încă" : `${read} din ${slugs.length} unități citite`}
      </span>
      <span className="linie" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <span>{pct}%</span>
    </div>
  );
}
