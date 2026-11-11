import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Programa din 2027" };

export default function NewProgramPage() {
  return (
    <div className="unealta">
      <div className="cota">
        <span>OMEC 4106/2026</span>
        <span>se aplică din anul școlar 2027–2028</span>
      </div>
      <h1 className="titlu-fila">Programa nouă, clasa a X-a</h1>
      <p className="rezumat">
        Din septembrie 2027, clasa a X-a studiază doar istorie universală, epoca modernă și contemporană, cu 1 oră de
        trunchi comun și 2 ore de curriculum de specialitate pe săptămână la științe sociale.
      </p>
      <p>
        Lecțiile pentru programa nouă se adaugă aici după textul oficial al anexei pentru specializarea științe sociale.
        Până atunci, materia actuală rămâne cea din{" "}
        <Link href="/">programa 2004</Link>, folosită de clasa a X-a în anul școlar 2026–2027.
      </p>
      <p className="muted">
        Multe teme se suprapun: revoluțiile moderne, ideologiile secolului al XIX-lea, cele două războaie mondiale,
        totalitarismele, Războiul Rece și construcția europeană. Lecțiile existente rămân utile și pentru noua programă.
      </p>
    </div>
  );
}
