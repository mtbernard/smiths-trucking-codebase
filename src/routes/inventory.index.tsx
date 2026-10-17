import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { trucksQuery, useTrucks } from "@/lib/trucks.functions";
import { PageHero, TruckCard } from "@/components/site";
import { TruckAdvisor } from "@/components/truck-advisor";

type Search = { condition?: "New" | "Used" | undefined };

export const Route = createFileRoute("/inventory/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    condition: s["condition"] === "New" || s["condition"] === "Used" ? s["condition"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Truck Inventory — Smith's Trucking Company" },
      { name: "description", content: "Browse new and used sleepers, day cabs and tractors for sale. Filter by make, type, price and condition." },
      { property: "og:title", content: "Commercial Truck Inventory — Smith's Trucking" },
      { property: "og:description", content: "Browse new and used semi trucks for sale." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trucksQuery),
  component: Inventory,
});

function Inventory() {
  const search = Route.useSearch();
  const trucks = useTrucks();
  const [q, setQ] = useState("");
  const [condition, setCondition] = useState<string>(search.condition ?? "");
  const [type, setType] = useState("");
  const [make, setMake] = useState("");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [sort, setSort] = useState("price-asc");
  const makes = [...new Set(trucks.map((t) => t.make))].sort();

  const list = useMemo(() => {
    const r = trucks.filter((t) =>
      (!q || `${t.year} ${t.make} ${t.model}`.toLowerCase().includes(q.toLowerCase())) &&
      (!condition || t.condition === condition) && (!type || t.type === type) &&
      (!make || t.make === make) && t.price <= maxPrice);
    const [k, d] = sort.split("-");
    return r.sort((a, b) => {
      const v = k === "price" ? a.price - b.price : k === "year" ? a.year - b.year : a.mileage - b.mileage;
      return d === "asc" ? v : -v;
    });
  }, [trucks, q, condition, type, make, maxPrice, sort]);

  return (
    <>
      <PageHero eyebrow="Inventory" title="Trucks for sale" sub="Every truck is inspected, documented and ready to work." />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-5 self-start rounded-md border bg-card p-5 card-elev">
          <h2 className="text-xl font-bold uppercase">Filter</h2>
          <input className="field" placeholder="Search make, model…" value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="block text-sm font-semibold">Condition
            <select className="field mt-1" value={condition} onChange={(e) => setCondition(e.target.value)}><option value="">All</option><option>New</option><option>Used</option></select></label>
          <label className="block text-sm font-semibold">Type
            <select className="field mt-1" value={type} onChange={(e) => setType(e.target.value)}><option value="">All</option><option>Sleeper</option><option>Day Cab</option><option>Tractor</option></select></label>
          <label className="block text-sm font-semibold">Make
            <select className="field mt-1" value={make} onChange={(e) => setMake(e.target.value)}><option value="">All</option>{makes.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label className="block text-sm font-semibold">Max price: ${maxPrice.toLocaleString()}
            <input type="range" min={40000} max={200000} step={5000} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="mt-2 w-full accent-primary" /></label>
        </aside>
        <div>
          <TruckAdvisor />

          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{list.length} trucks found</p>
            <select className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
              <option value="year-desc">Newest first</option><option value="mileage-asc">Lowest mileage</option>
            </select>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{list.map((t) => <TruckCard key={t.id} t={t} />)}</div>
          {list.length === 0 && <p className="py-20 text-center text-muted-foreground">No trucks match those filters.</p>}
        </div>
      </div>
    </>
  );
}
