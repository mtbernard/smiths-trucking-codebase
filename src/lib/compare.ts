import { useEffect, useSyncExternalStore } from "react";

const KEY = "stc-compare";
export const MAX_COMPARE = 4;
const listeners = new Set<() => void>();
let ids: string[] = [];
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { ids = JSON.parse(localStorage.getItem(KEY) || "[]").filter((x: unknown) => typeof x === "string").slice(0, MAX_COMPARE); } catch { ids = []; }
}
function set(next: string[]) {
  ids = next;
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export const compare = {
  toggle(id: string) {
    load();
    if (ids.includes(id)) set(ids.filter((x) => x !== id));
    else if (ids.length < MAX_COMPARE) set([...ids, id]);
  },
  remove(id: string) { load(); set(ids.filter((x) => x !== id)); },
  clear() { set([]); },
};

const EMPTY: string[] = [];
export function useCompare(): string[] {
  const v = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => ids,
    () => EMPTY,
  );
  useEffect(() => { if (!loaded) { load(); listeners.forEach((l) => l()); } }, []);
  return v;
}
