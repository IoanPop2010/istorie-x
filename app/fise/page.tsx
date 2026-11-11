import type { Metadata } from "next";
import { getUnits, MODULES, ROMAN } from "@/lib/content";
import { Flashcards } from "@/components/Tools";

export const metadata: Metadata = { title: "Fișe de termeni" };

export default function CardsPage() {
  const cards = getUnits().flatMap((u) =>
    u.glossary.map((t) => ({ ...t, unit: `Unitatea ${u.nr}`, slug: u.slug, module: u.module }))
  );
  return (
    <div className="unealta">
      <h1 className="titlu-fila">Fișe de termeni</h1>
      <p className="rezumat">Pe față e termenul, pe verso definiția. Spune definiția cu voce tare înainte să întorci fișa.</p>
      <Flashcards cards={cards} modules={MODULES.map((m) => ({ nr: m.nr, label: `Modulul ${ROMAN[m.nr]}` }))} />
    </div>
  );
}
