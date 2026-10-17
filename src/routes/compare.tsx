import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { PageHero } from "@/components/site";
import { compare, useCompare } from "@/lib/compare";
import { money, monthlyPayment, type Truck } from "@/lib/trucks";
import { trucksQuery, useTrucks } from "@/lib/trucks.functions";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Trucks Side by Side — Smith's Trucking Company" },
      { name: "description", content: "Compare specs, mileage, engines and prices of semi trucks side by side." },
      { property: "og:title", content: "Compare Trucks — Smith's Trucking" },
      { property: "og:description", content: "Review truck specs and prices side by side." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trucksQuery),
  component: ComparePage,
});

const rows: { label: string; get: (t: Truck) => string; best?: (ts: Truck[]) => number }[] = [
  { label: "Price", get: (t) => money(t.price), best: (ts) => Math.min(...ts.map((t) => t.price)) },
  { label: "Est. monthly*", get: (t) => money(monthlyPayment(t.price, t.price * 0.1, 8.9, 60)) },
  { label: "Condition", get: (t) => t.condition },
  { label: "Type", get: (t) => t.type },
  { label: "Year", get: (t) => String(t.year) },
  { label: "Mileage", get: (t) => `${t.mileage.toLocaleString()} mi` },
  { label: "Engine", get: (t) => t.engine },
  { label: "Horsepower", get: (t) => `${t.hp} hp` },
  { label: "Transmission", get: (t) => t.transmission },
  { label: "Stock #", get: (t) => t.id.toUpperCase() },
];

function ComparePage() {
  const all = useTrucks();
  const ts = useCompare().map((id) => all.find((t) => t.id === id)).filter((t): t is Truck => !!t);
  const low = Math.min(...ts.map((t) => t.price));
  const lowMi = Math.min(...ts.map((t) => t.mileage));
  const hiHp = Math.max(...ts.map((t) => t.hp));
  const hl = (t: Truck, label: string) =>
    (label === "Price" && t.price === low) || (label === "Mileage" && t.mileage === lowMi) || (label === "Horsepower" && t.hp === hiHp);

  return (
    <>
      <PageHero eyebrow="Compare" title="Side by side" sub="Review specs and prices of the trucks you picked." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {ts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-muted-foreground">You haven't picked any trucks yet. Tap "Compare" on any truck to add it.</p>
            <Link to="/inventory" className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Browse inventory</Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border bg-card card-elev">
            <table className="w-full min-w-[640px] table-fixed text-sm">
              <thead>
                <tr>
                  <th className="w-36 p-4" />
                  {ts.map((t) => (
                    <th key={t.id} className="p-4 text-left align-top">
                      <div className="relative">
                        <img src={t.image} alt="" className="aspect-[3/2] w-full rounded object-cover" />
                        <button onClick={() => compare.remove(t.id)} aria-label="Remove" className="absolute right-2 top-2 rounded-full bg-card p-1 shadow"><X className="h-4 w-4" /></button>
                      </div>
                      <Link to="/inventory/$id" params={{ id: t.id }} className="mt-2 block text-base font-bold hover:text-primary">{t.year} {t.make} {t.model}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t">
                    <th className="p-4 text-left font-semibold text-muted-foreground">{r.label}</th>
                    {ts.map((t) => (
                      <td key={t.id} className={`p-4 ${ts.length > 1 && hl(t, r.label) ? "font-bold text-primary" : ""}`}>{r.get(t)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t p-4 text-xs text-muted-foreground">*Estimate with 10% down, 8.9% APR, 60 months. Best price, lowest mileage and highest horsepower are highlighted.</p>
          </div>
        )}
        {ts.length > 0 && ts.length < 4 && <Link to="/inventory" className="mt-6 inline-block text-sm font-semibold text-primary">+ Add another truck</Link>}
      </div>
    </>
  );
}
