"use client";

import { useMemo, useState } from "react";
import type { MapData } from "@/lib/types";

export function HatchDefs() {
  return (
    <defs>
      <pattern id="hasura" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="#efdcc8" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="#a3301f" strokeWidth="1.4" />
      </pattern>
      <pattern id="hasura-activ" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="#e9cdb4" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="#a3301f" strokeWidth="2" />
      </pattern>
    </defs>
  );
}

/** Hartă istorică interactivă: numele teritoriului apare la atingere sau la trecerea cursorului. */
export function MapView({
  map,
  caption,
  highlight = [],
}: {
  map: MapData;
  caption: string;
  highlight?: string[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const hi = useMemo(() => new Set(highlight), [highlight]);
  const labelled = useMemo(
    () =>
      map.features.filter(
        (f) => f.label && (f.area > map.width * map.height * 0.004 || hi.has(f.id))
      ),
    [map, hi]
  );
  const activeF = map.features.find((f) => f.id === active);

  return (
    <div className="harta">
      <figure>
        <svg
          viewBox={`0 0 ${map.width} ${map.height}`}
          role="img"
          aria-label={`${map.title}. ${caption}`}
          onMouseLeave={() => setActive(null)}
        >
          <HatchDefs />
          <path className="retea" d={map.graticule} />
          {map.features.map((f) => (
            <path
              key={f.id}
              d={f.d}
              className={`teritoriu${hi.has(f.id) ? " evidentiat" : ""}${active === f.id ? " activ" : ""}`}
              onMouseEnter={() => setActive(f.id)}
              onClick={() => setActive(f.id)}
            >
              <title>{f.label ?? f.name}</title>
            </path>
          ))}
          {labelled.map((f) => (
            <text
              key={f.id}
              x={f.cx}
              y={f.cy}
              textAnchor="middle"
              className={`eticheta${f.area > map.width * map.height * 0.05 ? " mare" : ""}`}
            >
              {f.label}
            </text>
          ))}
        </svg>
        <figcaption>
          <span>
            {map.title}. {caption}
          </span>
          <span className="info" aria-live="polite">
            {activeF ? activeF.label ?? activeF.name : "Atinge un teritoriu pentru a-i vedea numele."}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
