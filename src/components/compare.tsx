import { Link } from "@tanstack/react-router";
import { Check, Plus, X } from "lucide-react";
import { compare, useCompare, MAX_COMPARE } from "@/lib/compare";
import { useQuery } from "@tanstack/react-query";
import { rowToTruck } from "@/lib/trucks";
import { trucksQuery } from "@/lib/trucks.functions";

export function CompareToggle({ id }: { id: string }) {
  const sel = useCompare();
  const on = sel.includes(id);
  const full = !on && sel.length >= MAX_COMPARE;
  return (
    <button
      type="button"
      disabled={full}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); compare.toggle(id); }}
      title={full ? `You can compare up to ${MAX_COMPARE} trucks` : undefined}
      className={`absolute right-3 top-3 flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-semibold shadow disabled:opacity-50 ${on ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}
    >
      {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{on ? "Comparing" : "Compare"}
    </button>
  );
}

export function CompareBar() {
  const sel = useCompare();
  const { data } = useQuery({ ...trucksQuery, enabled: sel.length > 0 });
  const getTruck = (id: string) => { const r = data?.find((x) => x.id === id); return r ? rowToTruck(r) : undefined; };
  if (sel.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-sm font-semibold">Compare ({sel.length}/{MAX_COMPARE})</span>
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {sel.map((id) => { const t = getTruck(id); return t ? (
            <span key={id} className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
              {t.year} {t.make} {t.model}
              <button onClick={() => compare.remove(id)} aria-label="Remove"><X className="h-3 w-3" /></button>
            </span>) : null; })}
        </div>
        <button onClick={() => compare.clear()} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>
        <Link to="/compare" className={`rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground ${sel.length < 2 ? "pointer-events-none opacity-50" : ""}`}>
          {sel.length < 2 ? "Pick 2+ trucks" : "Compare now"}
        </Link>
      </div>
    </div>
  );
}
