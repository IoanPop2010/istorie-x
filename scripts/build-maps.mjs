// Generează hărțile SVG pre-proiectate din setul open-source „historical-basemaps”
// (A. Ourednik, GPL-3.0, https://github.com/aourednik/historical-basemaps).
// Rulare: node scripts/build-maps.mjs <folder-cu-geojson> [--list]
// Fișierele world_YYYY.geojson nu sunt incluse în repo (≈30 MB); rezultatul (content/maps/*.json) este.

import fs from "node:fs";
import path from "node:path";
import { geoConicConformal, geoMercator, geoPath, geoArea, geoGraticule10 } from "d3-geo";
import { topology } from "topojson-server";
import { merge } from "topojson-client";
import { presimplify, simplify, quantile } from "topojson-simplify";
import { MAPS, NAMES_RO } from "./maps.config.mjs";

const [, , srcDir = "../geodata", flag] = process.argv;
const outDir = path.resolve("content/maps");
fs.mkdirSync(outDir, { recursive: true });

const W = 1000;

function fixWinding(geom) {
  // d3-geo cere inele în sens orar; poligoanele „inversate” acoperă tot globul.
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  const fixed = polys.map((rings) => {
    const a = geoArea({ type: "Polygon", coordinates: rings });
    return a > 2 * Math.PI ? rings.map((r) => [...r].reverse()) : rings;
  });
  return { type: "MultiPolygon", coordinates: fixed };
}

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const cache = new Map();
function load(year) {
  if (!cache.has(year)) {
    const raw = JSON.parse(fs.readFileSync(path.join(srcDir, `world_${year}.geojson`), "utf8"));
    cache.set(year, raw);
  }
  return cache.get(year);
}

for (const cfg of MAPS) {
  const raw = load(cfg.year);
  const [[lon0, lat0], [lon1, lat1]] = cfg.extent;
  const H = Math.round(W * cfg.ratio);

  const projection =
    cfg.projection === "mercator"
      ? geoMercator()
      : geoConicConformal().parallels(cfg.parallels ?? [40, 60]).rotate([-(lon0 + lon1) / 2, 0]);
  const frame = {
    type: "Polygon",
    coordinates: [[[lon0, lat0], [lon0, lat1], [lon1, lat1], [lon1, lat0], [lon0, lat0]]],
  };
  projection.fitExtent([[0, 0], [W, H]], frame).clipExtent([[0, 0], [W, H]]);
  const pathGen = geoPath(projection).digits(1);

  // Simplificare topologică (păstrează granițele comune) înainte de unire pe nume.
  const named = raw.features.filter((f) => f.properties?.NAME && f.geometry);
  let topo = topology({ c: { type: "FeatureCollection", features: named } }, 1e5);
  topo = presimplify(topo);
  topo = simplify(topo, quantile(topo, cfg.keep ?? 0.5));

  const groups = new Map();
  topo.objects.c.geometries.forEach((g, i) => {
    const name = named[i].properties.NAME;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(g);
  });

  const features = [];
  for (const [name, geoms] of groups) {
    const merged = fixWinding(merge(topo, geoms));
    const d = pathGen(merged);
    if (!d) continue;
    const [[x0, y0], [x1, y1]] = pathGen.bounds(merged);
    if (x1 < 0 || y1 < 0 || x0 > W || y0 > H) continue;
    const area = pathGen.area(merged);
    if (area < 4) continue;
    // Punct de etichetă: centroidul celui mai mare poligon vizibil.
    let best = null;
    for (const rings of merged.coordinates) {
      const p = { type: "Polygon", coordinates: rings };
      const a = pathGen.area(p);
      if (!best || a > best.a) best = { a, c: pathGen.centroid(p) };
    }
    const ro = NAMES_RO[name];
    features.push({
      id: slug(name),
      name,
      label: ro ?? null,
      d,
      cx: Math.round(best.c[0]),
      cy: Math.round(best.c[1]),
      area: Math.round(area),
    });
  }
  features.sort((a, b) => b.area - a.area);

  if (flag === "--list") {
    console.log(`\n# ${cfg.id}`);
    console.log(features.filter((f) => f.area > 300).map((f) => `${f.name}${f.label ? "" : " (!)"} ${f.area}`).join("\n"));
    continue;
  }

  const graticule = pathGen(geoGraticule10());
  const out = {
    id: cfg.id,
    title: cfg.title,
    year: cfg.year,
    width: W,
    height: H,
    graticule,
    features,
  };
  fs.writeFileSync(path.join(outDir, `${cfg.id}.json`), JSON.stringify(out));
  const kb = (fs.statSync(path.join(outDir, `${cfg.id}.json`)).size / 1024).toFixed(0);
  console.log(`${cfg.id}: ${features.length} teritorii, ${kb} KB`);
}
