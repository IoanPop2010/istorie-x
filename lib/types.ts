export type ModuleNr = 1 | 2 | 3 | 4 | 5;

export type Source = {
  id: string;
  title: string;
  /** Text-sursă; paragrafele se separă prin rând gol. */
  text: string;
  /** Proveniența, ca în manuale: autor, lucrare, an. */
  ref: string;
};

export type Term = { term: string; def: string };

export type Scheme = {
  title: string;
  columns: { label: string; items: string[] }[];
};

export type TimelineEvent = {
  /** Anul folosit pentru sortare. */
  year: number;
  /** Data afișată, dacă e mai precisă decât anul (ex. „1 decembrie 1918”). */
  date?: string;
  text: string;
};

export type MapRef = {
  id: string;
  caption: string;
  /** Teritorii evidențiate (id-urile din content/maps/*.json). */
  highlight?: string[];
};

export type Grila = {
  kind: "grila";
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

export type Ordonare = {
  kind: "ordonare";
  q: string;
  /** Elementele în ordinea corectă. */
  items: { text: string; date: string }[];
};

export type Asociere = {
  kind: "asociere";
  q: string;
  pairs: [string, string][];
};

export type SursaBac = {
  kind: "sursa";
  sourceId: string;
  items: { q: string; points: number; barem: string[] }[];
};

export type HartaMuta = {
  kind: "harta";
  map: string;
  q: string;
  targets: { id: string; label: string }[];
};

export type Exercise = Grila | Ordonare | Asociere | SursaBac | HartaMuta;

export type Unit = {
  nr: number;
  slug: string;
  module: ModuleNr;
  title: string;
  /** Titlul unității de învățare din programă. */
  programTitle: string;
  period: string;
  hours: number;
  summary: string;
  body: string;
  sources: Source[];
  glossary: Term[];
  scheme: Scheme;
  map?: MapRef;
  timeline: TimelineEvent[];
  exercises: Exercise[];
};

export type MapFeature = {
  id: string;
  name: string;
  label: string | null;
  d: string;
  cx: number;
  cy: number;
  area: number;
};

export type MapData = {
  id: string;
  title: string;
  year: number;
  width: number;
  height: number;
  graticule: string;
  features: MapFeature[];
};
