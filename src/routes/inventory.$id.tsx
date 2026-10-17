import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { money, monthlyPayment, rowToTruck } from "@/lib/trucks";
import { trucksQuery } from "@/lib/trucks.functions";
import { useContactSettings } from "@/lib/contact-settings.functions";
import { ContactForm } from "@/components/forms";
import { Phone } from "lucide-react";

export const Route = createFileRoute("/inventory/$id")({
  loader: async ({ params, context }) => {
    const rows = await context.queryClient.ensureQueryData(trucksQuery);
    const row = rows.find((r) => r.id === params.id);
    if (!row) throw notFound();
    return { truck: rowToTruck(row) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Truck not found" }, { name: "robots", content: "noindex" }] };
    const t = loaderData.truck;
    const title = `${t.year} ${t.make} ${t.model} — ${money(t.price)} | Smith's Trucking`;
    const d = `${t.condition} ${t.type}, ${t.mileage.toLocaleString()} miles, ${t.engine}.`;
    return { meta: [{ title }, { name: "description", content: d }, { property: "og:title", content: title }, { property: "og:description", content: d }, { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  notFoundComponent: () => <div className="py-32 text-center"><h1 className="text-4xl font-bold">Truck not found</h1><Link to="/inventory" className="btn btn-primary mt-6">Back to inventory</Link></div>,
  component: Detail,
});

function Detail() {
  const { truck: t } = Route.useLoaderData();
  const contact = useContactSettings();
  const est = monthlyPayment(t.price, t.price * 0.15, 9.9, 60);
  const specs = [["Condition", t.condition], ["Type", t.type], ["Year", t.year], ["Mileage", `${t.mileage.toLocaleString()} mi`], ["Engine", t.engine], ["Horsepower", `${t.hp} hp`], ["Transmission", t.transmission], ["Stock #", t.id.toUpperCase()]];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/inventory" className="text-sm text-muted-foreground hover:text-primary">← Back to inventory</Link>
      <div className="mt-4 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <img src={t.image} alt={`${t.year} ${t.make} ${t.model}`} className="aspect-[3/2] w-full rounded-md object-cover card-elev" />
          <h2 className="mt-10 text-3xl font-bold uppercase">Specifications</h2>
          <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-md border bg-card">
            {specs.map(([k, v]) => <div key={k} className="border-b p-4"><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
          </dl>
        </div>
        <div className="space-y-6">
          <div className="rounded-md border bg-card p-6 card-elev">
            <p className="eyebrow">{t.condition} {t.type}</p>
            <h1 className="mt-1 text-4xl font-extrabold uppercase">{t.year} {t.make} {t.model}</h1>
            <p className="mt-3 font-display text-5xl font-extrabold text-primary">{money(t.price)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Est. {money(est)}/mo · 15% down, 60 mo @ 9.9% APR (estimate only, subject to credit approval)</p>
            <div className="mt-5 grid gap-2">
              <Link to="/apply" search={{ truck: `${t.year} ${t.make} ${t.model} (${t.id})` }} className="btn btn-primary">Apply for Financing</Link>
              <a href={`tel:${contact.phone}`} className="btn btn-navy"><Phone className="h-4 w-4" />Call {contact.phone}</a>
            </div>
          </div>
          <div className="rounded-md border bg-card p-6 card-elev">
            <h2 className="text-2xl font-bold uppercase">Ask about this truck</h2>
            <ContactForm truckRef={`${t.year} ${t.make} ${t.model} (${t.id})`} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
