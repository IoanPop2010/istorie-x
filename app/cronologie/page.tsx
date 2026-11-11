import type { Metadata } from "next";
import { getUnits, MODULES, ROMAN } from "@/lib/content";
import { Chronology } from "@/components/Tools";

export const metadata: Metadata = { title: "Cronologie" };

export default function ChronologyPage() {
  const events = getUnits()
    .flatMap((u) =>
      u.timeline.map((e) => ({
        year: e.year,
        date: e.date ?? String(e.year),
        text: e.text,
        unit: `Unitatea ${u.nr}: ${u.title}`,
        slug: u.slug,
        module: u.module,
      }))
    )
    .sort((a, b) => a.year - b.year);
  return (
    <div className="unealta">
      <div className="cota">
        <span>Toate unitățile</span>
      </div>
      <h1 className="titlu-fila">Cronologie</h1>
      <p className="rezumat">Toate datele din lecții, pe o singură axă. Fiecare eveniment trimite la unitatea în care e explicat.</p>
      <Chronology events={events} modules={MODULES.map((m) => ({ nr: m.nr, label: `Modulul ${ROMAN[m.nr]}` }))} />
    </div>
  );
}
