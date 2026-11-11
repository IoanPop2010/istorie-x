import type { Metadata } from "next";
import Link from "next/link";
import { getUnits } from "@/lib/content";

export const metadata: Metadata = { title: "Glosar" };

export default function GlossaryPage() {
  const terms = getUnits()
    .flatMap((u) => u.glossary.map((t) => ({ ...t, unit: u.title, slug: u.slug, nr: u.nr })))
    .sort((a, b) => a.term.localeCompare(b.term, "ro"));
  const letters = [...new Set(terms.map((t) => t.term[0].toLocaleUpperCase("ro")))];
  return (
    <div className="unealta">
      <h1 className="titlu-fila">Glosar</h1>
      <p className="rezumat">{terms.length} de termeni-cheie din toate unitățile, în ordine alfabetică.</p>
      <p className="filtre">
        {letters.map((l) => (
          <a key={l} href={`#litera-${l}`} style={{ padding: "0 0.35rem" }}>
            {l}
          </a>
        ))}
      </p>
      {letters.map((l) => (
        <section key={l} id={`litera-${l}`}>
          <h2 style={{ fontSize: "var(--t-xl)", color: "var(--rubrica)", margin: "2rem 0 0.5rem" }}>{l}</h2>
          <dl className="glosar" style={{ gridTemplateColumns: "1fr" }}>
            {terms
              .filter((t) => t.term[0].toLocaleUpperCase("ro") === l)
              .map((t) => (
                <div key={t.term + t.slug}>
                  <dt>{t.term}</dt>
                  <dd>
                    {t.def}{" "}
                    <Link href={`/lectii/${t.slug}#glosar`}>Unitatea {t.nr}</Link>
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
