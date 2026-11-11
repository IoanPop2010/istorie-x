import { parseBody } from "@/lib/markup";
import { SectionControls } from "./SectionControls";

const firstSentence = (html: string) => {
  const text = html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const m = text.match(/^(.{40,180}?[.!?])(\s|$)/);
  return m ? m[1] : text.slice(0, 160) + "…";
};

/** Lecția pe larg: fiecare secțiune se deschide la cerere, cu notele pe margine. */
export function LessonBody({ body }: { body: string }) {
  const sections = parseBody(body);
  let noteNr = 0;
  const offset = sections[0]?.title ? 1 : 0;
  return (
    <div className="pe-larg">
      <SectionControls />
      {sections.map((s, si) => {
        const firstP = s.blocks.find((b) => b.type === "p");
        return (
          <details className="sectiune" key={s.id + si} id={`s-${s.id}`}>
            <summary>
              <span className="par">{si + offset}</span>
              <span className="sectiune-titlu">
                <strong>{s.title || "Introducere"}</strong>
                {firstP && firstP.type === "p" && <span className="teaser">{firstSentence(firstP.html)}</span>}
              </span>
            </summary>
            <div className="lectie">
              {s.blocks.map((b, bi) => {
                if (b.type === "list") {
                  return (
                    <ul className="bloc lista" key={bi}>
                      {b.items.map((it, k) => (
                        <li key={k} dangerouslySetInnerHTML={{ __html: it }} />
                      ))}
                    </ul>
                  );
                }
                if (b.type === "quote") {
                  return <blockquote className="citat" key={bi} dangerouslySetInnerHTML={{ __html: b.html }} />;
                }
                const nrs = b.notes.map(() => ++noteNr);
                return [
                  <div className={bi === 0 ? "bloc bloc-intai" : "bloc"} key={`p${bi}`}>
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
            </div>
          </details>
        );
      })}
    </div>
  );
}
