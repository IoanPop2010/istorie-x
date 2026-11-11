import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNeighbours, getUnit, getUnits, mapsForUnit, ROMAN } from "@/lib/content";
import { LessonBody } from "@/components/LessonBody";
import { MapView } from "@/components/MapView";
import { ExerciseSet, SourceBox } from "@/components/Exercises";
import { PrintButton, ReadMarker } from "@/components/Client";

export const dynamicParams = false;

export function generateStaticParams() {
  return getUnits().map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const u = getUnit((await params).slug);
  return u ? { title: u.title, description: u.summary } : {};
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const unit = getUnit((await params).slug);
  if (!unit) notFound();
  const { prev, next } = getNeighbours(unit.slug);
  const maps = mapsForUnit(unit);

  return (
    <article>
      <div className="cota">
        <span>Modulul {ROMAN[unit.module]}</span>
        <span>Unitatea {unit.nr} din 20</span>
        <span>{unit.period}</span>
        <span>
          {unit.hours} {unit.hours === 1 ? "oră" : "ore"} în planificare
        </span>
      </div>
      <h1 className="titlu-fila">{unit.title}</h1>
      <p className="rezumat">{unit.summary}</p>

      <div className="rand-butoane nu-tipari" style={{ marginBottom: "2rem" }}>
        <Link className="btn ceara doar-profesor" href={`/proiectie/${unit.slug}`}>
          Proiectează la clasă
        </Link>
        <a className="btn secundar" href="#exercitii">
          Mergi la exerciții
        </a>
        <PrintButton />
      </div>

      <LessonBody body={unit.body} />
      <ReadMarker slug={unit.slug} />

      {unit.map && maps[unit.map.id] && (
        <section className="capitol" aria-labelledby="harta">
          <h2 id="harta">Harta</h2>
          <MapView map={maps[unit.map.id]} caption={unit.map.caption} highlight={unit.map.highlight} />
        </section>
      )}

      <section className="capitol" aria-labelledby="schema">
        <h2 id="schema">Schema lecției</h2>
        <p className="explicatie">{unit.scheme.title}</p>
        <div className="schema">
          {unit.scheme.columns.map((c) => (
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
      </section>

      <section className="capitol" aria-labelledby="surse">
        <h2 id="surse">Surse istorice</h2>
        <p className="explicatie">Fragmente din documente și lucrări ale epocii. Unele sunt adaptate pentru lizibilitate, ca în subiectele de examen.</p>
        {unit.sources.map((s) => (
          <SourceBox key={s.id} source={s} />
        ))}
      </section>

      <section className="capitol" aria-labelledby="cronica">
        <h2 id="cronica">Cronologie</h2>
        <ol className="cronica">
          {unit.timeline.map((e, i) => (
            <li key={i}>
              <span className="data">{e.date ?? e.year}</span>
              <span>{e.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="capitol" aria-labelledby="glosar">
        <h2 id="glosar">Termeni-cheie</h2>
        <dl className="glosar">
          {unit.glossary.map((t) => (
            <div key={t.term}>
              <dt>{t.term}</dt>
              <dd>{t.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="capitol" id="exercitii" aria-labelledby="exercitii-titlu">
        <h2 id="exercitii-titlu">Exerciții</h2>
        <ExerciseSet slug={unit.slug} exercises={unit.exercises} sources={unit.sources} maps={maps} />
      </section>

      <nav className="paginatie" aria-label="Unități vecine">
        {prev ? (
          <Link href={`/lectii/${prev.slug}`}>
            <small>Unitatea anterioară</small>
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/lectii/${next.slug}`} style={{ textAlign: "right" }}>
            <small>Unitatea următoare</small>
            {next.title}
          </Link>
        ) : (
          <Link href={`/module/${unit.module}/test`} style={{ textAlign: "right" }}>
            <small>Final</small>
            Testul modulului {ROMAN[unit.module]}
          </Link>
        )}
      </nav>
    </article>
  );
}
