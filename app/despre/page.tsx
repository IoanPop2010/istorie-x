import type { Metadata } from "next";
import { getUnits, PROGRAMA } from "@/lib/content";
import { OfflineButton } from "@/components/Client";
import { ProgressBackup } from "@/components/Tools";

export const metadata: Metadata = { title: "Despre și surse" };

export default function AboutPage() {
  const units = getUnits();
  const urls = [
    "/",
    "/cronologie",
    "/glosar",
    "/fise",
    "/cautare",
    "/search-index.json",
    ...units.map((u) => `/lectii/${u.slug}`),
    ...[1, 2, 3, 4, 5].map((m) => `/module/${m}/test`),
  ];
  return (
    <div className="unealta">
      <h1 className="titlu-fila">Despre și surse</h1>

      <section className="capitol">
        <h2>Progresul tău</h2>
        <p className="explicatie">
          Aplicația nu are conturi. Ce ai citit și ce ai rezolvat se păstrează în acest browser. Ca să nu pierzi progresul
          când schimbi telefonul sau calculatorul, descarcă-l într-un fișier și încarcă-l pe celălalt dispozitiv.
        </p>
        <ProgressBackup />
      </section>

      <section className="capitol">
        <h2>Folosire fără internet</h2>
        <p className="explicatie">
          Pe telefon, aplicația se poate adăuga pe ecranul principal din meniul browserului. Butonul de mai jos salvează
          toate lecțiile pe dispozitiv.
        </p>
        <OfflineButton urls={urls} />
      </section>

      <section className="capitol">
        <h2>Programa</h2>
        <p className="explicatie">
          {PROGRAMA.title}, anexa nr. 2, ciclul inferior al liceului. {PROGRAMA.note} Ordinea și titlurile unităților
          urmează o planificare calendaristică pe 3 ore pe săptămână, potrivită profilului umanist, specializarea științe
          sociale.
        </p>
      </section>

      <section className="capitol">
        <h2>Surse și licențe</h2>
        <p className="explicatie">
          Hărțile sunt desenate din setul de date „historical-basemaps”, realizat de André Ourednik și publicat sub licența
          GNU GPL v3. Granițele sunt aproximări istorice la scară continentală, potrivite pentru învățare, nu pentru
          cercetare.
        </p>
        <p className="explicatie">
          Fragmentele de surse provin din documente aflate în domeniul public, în traducere românească. Unde textul a fost
          scurtat sau adaptat, sursa este marcată „adaptat”, ca în subiectele de examen. Lecțiile sunt redactate pentru
          această aplicație.
        </p>
        <p className="explicatie">Codul aplicației este publicat sub licența GNU GPL v3.</p>
      </section>
    </div>
  );
}
