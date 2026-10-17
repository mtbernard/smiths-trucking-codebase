import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Banknote, Truck as TruckIcon, Wrench, FileText, Repeat } from "lucide-react";
import hero from "@/assets/hero.jpg";
import lot from "@/assets/lot.jpg";
import { trucksQuery, useTrucks } from "@/lib/trucks.functions";
import { TruckCard } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smith's Trucking Company — New & Used Commercial Trucks" },
      { name: "description", content: "Shop new and used semi trucks, sleepers and day cabs with transparent pricing and flexible financing at Smith's Trucking Company." },
      { property: "og:title", content: "Smith's Trucking Company — Commercial Truck Sales" },
      { property: "og:description", content: "New and used semi trucks with flexible financing and down payment programs." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trucksQuery),
  component: Home,
});

const services = [
  { icon: TruckIcon, title: "New & Used Sales", text: "Sleepers, day cabs and tractors from top manufacturers." },
  { icon: Banknote, title: "Flexible Financing", text: "Down payment programs and installment plans for every credit profile." },
  { icon: Repeat, title: "Trade-Ins", text: "Get a fair, fast offer on your current truck." },
  { icon: Wrench, title: "Inspections", text: "Every used unit is inspected before it hits the lot." },
  { icon: FileText, title: "Documentation", text: "Vehicle history and title paperwork handled for you." },
  { icon: ShieldCheck, title: "Delivery", text: "Delivery arrangements available nationwide." },
];

function Home() {
  const featured = useTrucks().filter((t) => t.featured);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
        <img src={hero} alt="Navy semi truck on highway at sunset" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/70 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-28 md:py-40">
          <p className="eyebrow">Smith's Trucking Company</p>
          <h1 className="mt-3 max-w-3xl text-6xl font-extrabold uppercase leading-[0.95] md:text-8xl">Drive further.<br />We've got you covered.</h1>
          <p className="mt-6 max-w-xl text-lg opacity-85">Quality new and used commercial trucks, transparent pricing, and financing built for owner-operators and fleets.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/inventory" className="btn btn-primary">Browse Inventory</Link>
            <Link to="/apply" className="btn btn-outline-light">Get Pre-Approved</Link>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center md:grid-cols-4">
          {[["500+", "Trucks sold"], ["20+ yrs", "In business"], ["$0 down", "Programs available"], ["24 hr", "Credit decisions"]].map(([a, b]) => (
            <div key={b}><p className="font-display text-4xl font-extrabold text-primary">{a}</p><p className="text-sm uppercase tracking-wider text-muted-foreground">{b}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">Featured</p><h2 className="text-5xl font-extrabold uppercase">Ready to roll</h2></div>
          <Link to="/inventory" className="btn btn-navy hidden sm:inline-flex">View all</Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t) => <TruckCard key={t.id} t={t} />)}
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="eyebrow text-center">What we do</p>
          <h2 className="text-center text-5xl font-extrabold uppercase">Everything you need to buy right</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.title} className="rounded-md bg-card p-6 card-elev">
                <s.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-2xl font-bold uppercase">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <img src={lot} alt="Truck dealership lot" loading="lazy" width={1600} height={912} className="h-full min-h-72 w-full object-cover" />
        <div className="bg-navy p-10 text-navy-foreground md:p-16">
          <p className="eyebrow">Financing</p>
          <h2 className="mt-2 text-5xl font-extrabold uppercase">Payments that fit your route</h2>
          <p className="mt-4 opacity-80">Estimate your monthly payment in seconds, then apply online. Startups, owner-operators and fleets welcome.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/financing" className="btn btn-primary">Payment Calculator</Link>
            <Link to="/apply" className="btn btn-outline-light">Apply Now</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-5xl font-extrabold uppercase">Find your next truck today</h2>
        <p className="mt-3 text-muted-foreground">Talk to a truck specialist — no pressure, just straight answers.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/contact" className="btn btn-primary">Contact Sales</Link>
          <Link to="/inventory" className="btn btn-navy">Shop Inventory</Link>
        </div>
      </section>
    </>
  );
}
