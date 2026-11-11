"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { markRead } from "@/lib/store";

/** Închide sertarul de cuprins (mobil) după navigare. */
export function DrawerCloser() {
  const path = usePathname();
  useEffect(() => {
    document.querySelectorAll<HTMLDetailsElement>("details.sertar[open]").forEach((d) => (d.open = false));
  }, [path]);
  return null;
}

/** Marchează lecția drept citită când elevul ajunge la finalul textului. */
export function ReadMarker({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          markRead(slug);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);
  return <div ref={ref} aria-hidden="true" />;
}

/** Înregistrează service worker-ul pentru folosire offline. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

export function PrintButton() {
  return (
    <button type="button" className="btn secundar" onClick={() => window.print()}>
      Tipărește lecția
    </button>
  );
}

/** Descarcă toate paginile în memoria offline a browserului. */
export function OfflineButton({ urls }: { urls: string[] }) {
  const [state, setState] = useState<"idle" | "lucru" | "gata" | "eroare">("idle");
  const [done, setDone] = useState(0);
  async function run() {
    if (!("caches" in window)) return setState("eroare");
    setState("lucru");
    try {
      const cache = await caches.open("pdi-pagini-v1");
      let n = 0;
      for (const u of urls) {
        try {
          const res = await fetch(u, { credentials: "same-origin" });
          if (res.ok) await cache.put(u, res);
        } catch {
          /* pagina rămâne disponibilă doar online */
        }
        setDone(++n);
      }
      setState("gata");
    } catch {
      setState("eroare");
    }
  }
  return (
    <div className="rand-butoane">
      <button type="button" className="btn secundar" onClick={run} disabled={state === "lucru"}>
        Salvează pentru folosire offline
      </button>
      <span className="muted" aria-live="polite">
        {state === "lucru" && `${done} din ${urls.length} pagini`}
        {state === "gata" && "Gata. Aplicația merge și fără internet pe acest dispozitiv."}
        {state === "eroare" && "Browserul nu permite salvarea offline."}
      </span>
    </div>
  );
}
