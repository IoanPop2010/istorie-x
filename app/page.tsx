import Link from "next/link";
import { getUnits, MODULES, PROGRAMA, ROMAN, unitsOfModule } from "@/lib/content";
import { OverallBar, TestStatus, UnitStatus } from "@/components/Inventory";

export default function Home() {
  const units = getUnits();
  const first = units[0];
  return (
    <>
      <header className="frontispiciu">
        <h1>
          Pagini de istorie
          <span className="ani">de la 1688 până azi</span>
        </h1>
        <p>
          Materia de istorie a clasei a X-a, la profilul umanist, specializarea științe sociale. Fiecare unitate are
          lecția, sursele, harta epocii, cronologia, termenii-cheie și exerciții de tip bacalaureat.
        </p>
        <div className="rand-butoane">
          <Link className="btn" href={`/lectii/${first.slug}`}>
            Începe cu unitatea 1
          </Link>
          <Link className="btn secundar" href="/cronologie">
            Vezi cronologia
          </Link>
          <Link className="btn secundar" href="/programa-2027">
            Programa nouă (din 2027)
          </Link>
        </div>
      </header>

      <div className="module-carduri">
        {MODULES.map((m) => (
          <a key={m.nr} href={`#modul-${m.nr}`} data-modul={m.nr}>
            <span className="mn">{ROMAN[m.nr]}</span>
            <span className="mt">{m.title}</span>
          </a>
        ))}
      </div>
      <OverallBar slugs={units.map((u) => u.slug)} />

      {MODULES.map((m) => (
        <table className="inventar" key={m.nr} id={`modul-${m.nr}`} data-modul={m.nr}>
          <caption>
            Modulul {ROMAN[m.nr]}: {m.title}
            <small>{PROGRAMA.title}</small>
          </caption>
          <thead>
            <tr>
              <th className="nr" scope="col">
                Nr.
              </th>
              <th scope="col">Unitatea de învățare</th>
              <th className="ani" scope="col">
                Perioada
              </th>
              <th scope="col">Parcurs</th>
            </tr>
          </thead>
          <tbody>
            {unitsOfModule(m.nr).map((u) => (
              <tr key={u.slug}>
                <td className="nr">{u.nr}</td>
                <td>
                  <Link href={`/lectii/${u.slug}`}>{u.title}</Link>
                </td>
                <td className="ani">{u.period}</td>
                <td className="stare">
                  <UnitStatus slug={u.slug} total={u.exercises.length} />
                </td>
              </tr>
            ))}
            <tr className="modul-test">
              <td className="nr" />
              <td>
                <Link href={`/module/${m.nr}/test`}>Test de recapitulare, modulul {ROMAN[m.nr]}</Link>
              </td>
              <td className="ani" />
              <td className="stare">
                <TestStatus module={m.nr} />
              </td>
            </tr>
          </tbody>
        </table>
      ))}

      <p className="subsol">
        {PROGRAMA.title}. {PROGRAMA.note} Ordinea unităților urmează planificarea pe 3 ore pe săptămână.
      </p>
    </>
  );
}
