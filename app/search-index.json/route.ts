import { getUnits } from "@/lib/content";
import { parseBody } from "@/lib/markup";

export const dynamic = "force-static";

const strip = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

export function GET() {
  const docs: { url: string; title: string; kind: string; text: string }[] = [];
  for (const u of getUnits()) {
    for (const s of parseBody(u.body)) {
      docs.push({
        url: `/lectii/${u.slug}#s-${s.id}`,
        title: s.title ? `${u.title}: ${s.title}` : u.title,
        kind: `Lecție, unitatea ${u.nr}`,
        text: s.blocks.map((b) => strip(b.type === "list" ? b.items.join(" ") : b.html)).join(" "),
      });
    }
    for (const t of u.glossary) docs.push({ url: `/lectii/${u.slug}#glosar`, title: t.term, kind: `Termen, unitatea ${u.nr}`, text: t.def });
    for (const src of u.sources)
      docs.push({ url: `/lectii/${u.slug}#surse`, title: src.title, kind: `Sursă, unitatea ${u.nr}`, text: `${src.text} ${src.ref}` });
    for (const e of u.timeline)
      docs.push({ url: `/cronologie`, title: `${e.date ?? e.year}`, kind: `Cronologie, unitatea ${u.nr}`, text: e.text });
  }
  return Response.json(docs);
}
