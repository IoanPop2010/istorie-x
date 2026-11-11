// Verifică trimiterile din conținut: hărți, teritorii, surse, răspunsuri.
import fs from "node:fs";
const dir = "content/p2004";
const maps = Object.fromEntries(fs.readdirSync("content/maps").map((f) => [f.replace(".json", ""), JSON.parse(fs.readFileSync(`content/maps/${f}`, "utf8"))]));
let errors = 0;
const err = (m) => { errors++; console.log("EROARE", m); };
const { units } = await import(new URL(process.argv[2], `file://${process.cwd()}/`).href);
for (const u of units) {
  const ids = (m) => new Set(maps[m]?.features.map((f) => f.id));
  if (u.map) {
    if (!maps[u.map.id]) err(`${u.slug}: harta ${u.map.id} lipsește`);
    for (const h of u.map.highlight ?? []) if (!ids(u.map.id).has(h)) err(`${u.slug}: teritoriul ${h} nu există în ${u.map.id}`);
  }
  u.exercises.forEach((e, i) => {
    if (e.kind === "grila" && (e.answer < 0 || e.answer >= e.options.length)) err(`${u.slug} ex ${i}: răspuns invalid`);
    if (e.kind === "sursa" && !u.sources.find((s) => s.id === e.sourceId)) err(`${u.slug} ex ${i}: sursa ${e.sourceId} lipsește`);
    if (e.kind === "harta") for (const t of e.targets) if (!ids(e.map).has(t.id)) err(`${u.slug} ex ${i}: ${t.id} nu există în ${e.map}`);
    if (e.kind === "asociere" && new Set(e.pairs.map((p) => p[1])).size !== e.pairs.length) err(`${u.slug} ex ${i}: perechi duplicate`);
  });
  if (!u.essentials || u.essentials.length !== 5) err(`${u.slug}: lipsesc ideile esențiale`);
  const words = u.body.replace(/^>.*$/gm, "").split(/\s+/).filter(Boolean).length;
  console.log(`${String(u.nr).padStart(2)} ${u.slug.padEnd(42)} ${words} cuvinte, ${u.exercises.length} ex., ${u.glossary.length} termeni, ${u.sources.length} surse`);
}
console.log(errors ? `${errors} erori` : "Conținut valid.");
process.exit(errors ? 1 : 0);
