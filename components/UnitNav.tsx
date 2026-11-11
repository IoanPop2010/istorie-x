"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/store";

type Item = { slug: string; nr: number; title: string; module: number };
type Mod = { nr: number; title: string };

export function UnitNav({ units, modules, roman }: { units: Item[]; modules: Mod[]; roman: string[] }) {
  const path = usePathname();
  const progress = useProgress();
  return (
    <>
      {modules.map((m) => (
        <nav key={m.nr} aria-label={`Modulul ${roman[m.nr]}`}>
          <h2>Modulul {roman[m.nr]}</h2>
          <ol>
            {units
              .filter((u) => u.module === m.nr)
              .map((u) => {
                const href = `/lectii/${u.slug}`;
                const current = path === href || path.startsWith(href + "/");
                return (
                  <li key={u.slug}>
                    <Link href={href} aria-current={current ? "page" : undefined}>
                      <span className="nr">{u.nr}.</span>
                      <span>
                        {u.title}
                        {progress.read[u.slug] ? (
                          <span className="bifa" aria-label="citită">
                            ✓
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            <li>
              <Link
                href={`/module/${m.nr}/test`}
                aria-current={path === `/module/${m.nr}/test` ? "page" : undefined}
              >
                <span className="nr" />
                <span>
                  <em>Test de modul</em>
                  {progress.tests[m.nr] != null ? <span className="bifa">{progress.tests[m.nr]}%</span> : null}
                </span>
              </Link>
            </li>
          </ol>
        </nav>
      ))}
    </>
  );
}
