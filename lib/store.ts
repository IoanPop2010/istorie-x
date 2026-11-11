"use client";

import { useSyncExternalStore } from "react";

// Stare locală, salvată în browser. Structura e gândită să poată fi mutată
// într-o bază de date atunci când vor exista conturi.

export type Mode = "elev" | "profesor";

export type Progress = {
  v: 1;
  /** slug → momentul în care lecția a fost citită până la capăt */
  read: Record<string, number>;
  /** slug → index exercițiu → 1 corect / 0 greșit (sau punctaj relativ pentru sursă) */
  ex: Record<string, Record<number, number>>;
  /** număr modul → cel mai bun scor (0–100) */
  tests: Record<string, number>;
};

const KEY_PROGRESS = "pdi:progres:v1";
import { KEY_MODE } from "./shared";

const empty = (): Progress => ({ v: 1, read: {}, ex: {}, tests: {} });

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY_PROGRESS || e.key === KEY_MODE) {
      cachedRaw = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* stocare indisponibilă: progresul rămâne doar în sesiune */
  }
}

let cachedRaw: string | null = null;
let cached: Progress = empty();
const SERVER: Progress = empty();

function readProgress(): Progress {
  const raw = safeGet(KEY_PROGRESS);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const p = raw ? (JSON.parse(raw) as Progress) : empty();
      cached = p && p.v === 1 ? { ...empty(), ...p } : empty();
    } catch {
      cached = empty();
    }
  }
  return cached;
}

function writeProgress(p: Progress) {
  safeSet(KEY_PROGRESS, JSON.stringify(p));
  emit();
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, readProgress, () => SERVER);
}

export function markRead(slug: string) {
  const p = readProgress();
  if (p.read[slug]) return;
  writeProgress({ ...p, read: { ...p.read, [slug]: Date.now() } });
}

export function recordExercise(slug: string, index: number, score: number) {
  const p = readProgress();
  writeProgress({ ...p, ex: { ...p.ex, [slug]: { ...(p.ex[slug] ?? {}), [index]: score } } });
}

export function recordTest(module: number, score: number) {
  const p = readProgress();
  const best = Math.max(score, p.tests[module] ?? 0);
  writeProgress({ ...p, tests: { ...p.tests, [module]: best } });
}

export function exportProgress(): string {
  return JSON.stringify({ ...readProgress(), exportat: new Date().toISOString() }, null, 2);
}

export function importProgress(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data?.v !== 1 || typeof data.read !== "object") return false;
    writeProgress({ v: 1, read: data.read ?? {}, ex: data.ex ?? {}, tests: data.tests ?? {} });
    return true;
  } catch {
    return false;
  }
}

export function resetProgress() {
  writeProgress(empty());
}

// ---- Mod elev / profesor ----

function readMode(): Mode {
  return safeGet(KEY_MODE) === "profesor" ? "profesor" : "elev";
}

export function useMode(): Mode {
  return useSyncExternalStore(subscribe, readMode, () => "elev");
}

export function setMode(m: Mode) {
  safeSet(KEY_MODE, m);
  document.documentElement.dataset.mod = m;
  emit();
}
