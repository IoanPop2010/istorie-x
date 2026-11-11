import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMap, MODULES, ROMAN, unitsOfModule } from "@/lib/content";
import type { MapData, ModuleNr } from "@/lib/types";
import { ModuleTest } from "@/components/ModuleTest";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.map((m) => ({ nr: String(m.nr) }));
}

export async function generateMetadata({ params }: { params: Promise<{ nr: string }> }): Promise<Metadata> {
  return { title: `Test, modulul ${ROMAN[Number((await params).nr)]}` };
}

export default async function TestPage({ params }: { params: Promise<{ nr: string }> }) {
  const nr = Number((await params).nr) as ModuleNr;
  const mod = MODULES.find((m) => m.nr === nr);
  if (!mod) notFound();
  const units = unitsOfModule(nr);
  if (!units.length) notFound();
  // Testul folosește doar itemii cu corectare automată.
  const pool = units.flatMap((u) =>
    u.exercises
      .filter((e) => e.kind === "grila" || e.kind === "ordonare" || e.kind === "asociere" || e.kind === "harta")
      .map((ex) => ({ ex, unit: u.title, slug: u.slug }))
  );
  const maps: Record<string, MapData> = {};
  for (const p of pool) if (p.ex.kind === "harta") maps[p.ex.map] = getMap(p.ex.map);

  return (
    <>
      <div className="cota">
        <span>Modulul {ROMAN[nr]}</span>
        <span>Test de recapitulare</span>
      </div>
      <h1 className="titlu-fila">{mod.title}</h1>
      <p className="rezumat">
        {Math.min(18, pool.length)} întrebări alese din unitățile {units[0].nr}–{units[units.length - 1].nr}. La final
        afli scorul și ce unități merită recitite.
      </p>
      <ModuleTest module={nr} pool={pool} maps={maps} />
    </>
  );
}
