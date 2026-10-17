import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { recommendTrucks, type AdvisorResult } from "@/lib/truck-advisor.functions";
import { useTrucks } from "@/lib/trucks.functions";
import { TruckCard } from "@/components/site";

const examples = [
  "Long-haul reefer runs coast to coast, team drivers",
  "Local regional deliveries, home every night",
  "Heavy haul flatbed through mountain grades",
];

export function TruckAdvisor() {
  const run = useServerFn(recommendTrucks);
  const all = useTrucks();
  const getTruck = (id: string) => all.find((t) => t.id === id);
  const [needs, setNeeds] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<AdvisorResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (needs.trim().length < 5) return setError("Tell us a bit more about how you'll use the truck.");
    setLoading(true); setError(""); setRes(null);
    try {
      const b = Number(budget.replace(/[^0-9]/g, ""));
      setRes(await run({ data: { needs, budget: b > 0 ? b : null } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  }

  return (
    <section className="mb-10 rounded-md border bg-card p-6 card-elev">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold uppercase">Find my truck</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">Describe what you haul and your budget — our AI advisor will pick the best matches from our lot.</p>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <textarea className="field min-h-[44px]" rows={2} placeholder="e.g. Hauling dry van loads over the road, 2,500 miles a week…" value={needs} onChange={(e) => setNeeds(e.target.value)} maxLength={1500} />
        <input className="field" placeholder="Budget, e.g. 120000" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <button disabled={loading} className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60">{loading ? "Matching…" : "Get matches"}</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((x) => <button key={x} type="button" onClick={() => setNeeds(x)} className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">{x}</button>)}
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {res && (
        <div className="mt-6">
          {res.summary && <p className="mb-4">{res.summary}</p>}
          {res.picks.length === 0 && <p className="text-muted-foreground">No close matches right now — give us a call and we'll help you find one.</p>}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {res.picks.map((p) => {
              const t = getTruck(p.id);
              return t ? (
                <div key={p.id} className="space-y-2">
                  <TruckCard t={t} />
                  <p className="rounded-md bg-muted p-3 text-sm"><span className="font-semibold">Why it fits: </span>{p.reason}</p>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </section>
  );
}
