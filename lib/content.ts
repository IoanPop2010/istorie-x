import "server-only";
import fs from "node:fs";
import path from "node:path";
import { units } from "@/content/p2004";
import type { MapData, ModuleNr, Unit } from "./types";

export const PROGRAMA = {
  id: "2004",
  title: "Programa școlară OMEC 4598/2004",
  note: "Se aplică la clasa a X-a până în anul școlar 2026–2027 inclusiv.",
};

export const MODULES: { nr: ModuleNr; title: string }[] = [
  { nr: 1, title: "Statul modern și ideile Luminilor" },
  { nr: 2, title: "Țările Române și revoluțiile de la 1848" },
  { nr: 3, title: "Secolul al XIX-lea și Primul Război Mondial" },
  { nr: 4, title: "Perioada interbelică și al Doilea Război Mondial" },
  { nr: 5, title: "Lumea postbelică și începutul mileniului trei" },
];

export const ROMAN = ["", "I", "II", "III", "IV", "V"];

export function getUnits(): Unit[] {
  return units;
}

export function getUnit(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug);
}

export function getNeighbours(slug: string) {
  const i = units.findIndex((u) => u.slug === slug);
  return { prev: units[i - 1], next: units[i + 1] };
}

export function unitsOfModule(nr: ModuleNr): Unit[] {
  return units.filter((u) => u.module === nr);
}

const mapCache = new Map<string, MapData>();
export function getMap(id: string): MapData {
  if (!mapCache.has(id)) {
    const file = path.join(process.cwd(), "content", "maps", `${id}.json`);
    mapCache.set(id, JSON.parse(fs.readFileSync(file, "utf8")));
  }
  return mapCache.get(id)!;
}

/** Hărțile necesare unei unități: harta lecției + hărțile din exerciții. */
export function mapsForUnit(unit: Unit): Record<string, MapData> {
  const ids = new Set<string>();
  if (unit.map) ids.add(unit.map.id);
  for (const ex of unit.exercises) if (ex.kind === "harta") ids.add(ex.map);
  return Object.fromEntries([...ids].map((id) => [id, getMap(id)]));
}
