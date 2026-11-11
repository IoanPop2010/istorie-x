"use client";

import { setMode, useMode } from "@/lib/store";

export function ModeToggle() {
  const mode = useMode();
  return (
    <div>
      <div className="mod" role="group" aria-label="Mod de lucru">
        <button type="button" aria-pressed={mode === "elev"} onClick={() => setMode("elev")}>
          Elev
        </button>
        <button type="button" aria-pressed={mode === "profesor"} onClick={() => setMode("profesor")}>
          Profesor
        </button>
      </div>
      <p className="mod-nota">
        {mode === "profesor"
          ? "Răspunsurile și baremele sunt vizibile. Lecțiile pot fi proiectate la clasă."
          : "Răspunsurile apar după ce rezolvi. Progresul se salvează în acest browser."}
      </p>
    </div>
  );
}
