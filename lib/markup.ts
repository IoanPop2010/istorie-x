// Parser minimal pentru textul lecțiilor.
//   ## Titlu         → secțiune nouă
//   paragraf         → bloc de text (paragrafele se separă prin rând gol)
//   > nota: text     → notă marginală atașată paragrafului anterior
//   > text           → citat
//   *italic*, **bold**

export type Block =
  | { type: "p"; html: string; notes: string[] }
  | { type: "quote"; html: string };

export type Section = { id: string; title: string; blocks: Block[] };

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function inline(s: string): string {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseBody(body: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  let para: string[] = [];
  let quote: string[] = [];

  const ensure = () => {
    if (!current) {
      current = { id: "introducere", title: "", blocks: [] };
      sections.push(current);
    }
    return current;
  };
  const flushPara = () => {
    if (para.length) ensure().blocks.push({ type: "p", html: inline(para.join(" ")), notes: [] });
    para = [];
  };
  const flushQuote = () => {
    if (quote.length) ensure().blocks.push({ type: "quote", html: inline(quote.join(" ")) });
    quote = [];
  };

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushPara();
      flushQuote();
      const title = line.slice(3).trim();
      current = { id: slugify(title), title, blocks: [] };
      sections.push(current);
    } else if (/^>\s*nota:/i.test(line)) {
      flushPara();
      flushQuote();
      const sec = ensure();
      const last = [...sec.blocks].reverse().find((b) => b.type === "p");
      const note = inline(line.replace(/^>\s*nota:\s*/i, ""));
      if (last && last.type === "p") last.notes.push(note);
    } else if (line.startsWith(">")) {
      flushPara();
      quote.push(line.replace(/^>\s?/, ""));
    } else if (line === "") {
      flushPara();
      flushQuote();
    } else {
      flushQuote();
      para.push(line);
    }
  }
  flushPara();
  flushQuote();
  return sections;
}

export function plainText(body: string): string {
  return body
    .split("\n")
    .filter((l) => !/^>\s*nota:/i.test(l.trim()))
    .join(" ")
    .replace(/^##\s*/gm, "")
    .replace(/[*>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(body: string): number {
  return plainText(body).split(" ").length;
}
