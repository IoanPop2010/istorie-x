"use client";

import { useEffect } from "react";

const all = () => Array.from(document.querySelectorAll<HTMLDetailsElement>("details.sectiune"));

/** Deschide/închide secțiunile, deschide secțiunea din adresă (#s-…) și pe toate la tipărire. */
export function SectionControls() {
  useEffect(() => {
    const openHash = () => {
      const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    };
    const openAll = () => all().forEach((d) => (d.open = true));
    openHash();
    window.addEventListener("hashchange", openHash);
    window.addEventListener("beforeprint", openAll);
    return () => {
      window.removeEventListener("hashchange", openHash);
      window.removeEventListener("beforeprint", openAll);
    };
  }, []);
  return (
    <div className="rand-butoane control-sectiuni nu-tipari">
      <button type="button" className="btn mic" onClick={() => all().forEach((d) => (d.open = true))}>
        Deschide toate secțiunile
      </button>
      <button type="button" className="btn mic secundar" onClick={() => all().forEach((d) => (d.open = false))}>
        Închide-le
      </button>
    </div>
  );
}
