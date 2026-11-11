import { parseBody } from "@/lib/markup";

/** Textul lecției, cu note marginale aliniate paragrafelor. */
export function LessonBody({ body }: { body: string }) {
  const sections = parseBody(body);
  let noteNr = 0;
  let first = true;
  return (
    <div className="lectie">
      {sections.map((s, si) => (
        <section className="sectiune" key={s.id + si} aria-labelledby={s.title ? `s-${s.id}` : undefined}>
          {s.title && (
            <h2 id={`s-${s.id}`}>
              <span className="par">§ {si + (sections[0].title ? 1 : 0)}</span>
              <span>{s.title}</span>
            </h2>
          )}
          {s.blocks.map((b, bi) => {
            if (b.type === "quote") {
              return <blockquote className="citat" key={bi} dangerouslySetInnerHTML={{ __html: b.html }} />;
            }
            const nrs = b.notes.map(() => ++noteNr);
            const cls = first ? "bloc bloc-intai" : "bloc";
            first = false;
            return [
              <div className={cls} key={`p${bi}`}>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: b.html }} />
                  {nrs.map((n) => (
                    <sup className="nota-marcaj" key={n}>
                      {n}
                    </sup>
                  ))}
                </p>
              </div>,
              ...b.notes.map((n, ni) => (
                <aside className="nota" key={`n${bi}-${ni}`}>
                  <span className="nr">{nrs[ni]}</span>
                  <span dangerouslySetInnerHTML={{ __html: n }} />
                </aside>
              )),
            ];
          })}
        </section>
      ))}
    </div>
  );
}
