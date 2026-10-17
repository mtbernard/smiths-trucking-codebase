import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { money, monthlyPayment } from "@/lib/trucks";
import { PageHero } from "@/components/site";

export const Route = createFileRoute("/financing")({
  head: () => ({
    meta: [
      { title: "Truck Financing & Payment Calculator — Smith's Trucking" },
      { name: "description", content: "Estimate monthly payments on a commercial truck and explore down payment and installment programs." },
      { property: "og:title", content: "Commercial Truck Financing — Smith's Trucking" },
      { property: "og:description", content: "Payment calculator, down payment programs and installment options." },
    ],
  }),
  component: Financing,
});

function Financing() {
  const [price, setPrice] = useState(120000);
  const [down, setDown] = useState(18000);
  const [apr, setApr] = useState(9.9);
  const [term, setTerm] = useState(60);
  const pay = monthlyPayment(price, down, apr, term);
  const total = pay * term + down;

  const Slider = ({ label, value, set, min, max, step, fmt }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; fmt: (n: number) => string }) => (
    <label className="block">
      <div className="flex justify-between text-sm font-semibold"><span>{label}</span><span className="text-primary">{fmt(value)}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} className="mt-2 w-full accent-primary" />
    </label>
  );

  return (
    <>
      <PageHero eyebrow="Financing" title="Financing made simple" sub="Down payment programs, installment plans and options for startups and rebuilding credit." />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div className="space-y-6 rounded-md border bg-card p-8 card-elev">
          <h2 className="text-3xl font-bold uppercase">Payment calculator</h2>
          <Slider label="Truck price" value={price} set={setPrice} min={30000} max={250000} step={1000} fmt={money} />
          <Slider label="Down payment" value={down} set={setDown} min={0} max={Math.round(price * 0.5)} step={500} fmt={money} />
          <Slider label="Interest rate (APR)" value={apr} set={setApr} min={4} max={24} step={0.1} fmt={(n) => `${n.toFixed(1)}%`} />
          <div>
            <p className="text-sm font-semibold">Term</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[36, 48, 60, 72].map((m) => <button key={m} onClick={() => setTerm(m)} className={`btn py-2 text-sm ${term === m ? "btn-primary" : "border"}`}>{m} mo</button>)}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-md bg-navy p-8 text-navy-foreground">
          <div>
            <p className="eyebrow">Estimated monthly payment</p>
            <p className="mt-2 font-display text-7xl font-extrabold">{money(pay)}</p>
            <dl className="mt-8 grid grid-cols-2 gap-6 text-sm">
              <div><dt className="opacity-60">Amount financed</dt><dd className="text-xl font-semibold">{money(price - down)}</dd></div>
              <div><dt className="opacity-60">Total cost</dt><dd className="text-xl font-semibold">{money(total)}</dd></div>
              <div><dt className="opacity-60">Down payment</dt><dd className="text-xl font-semibold">{Math.round((down / price) * 100)}%</dd></div>
              <div><dt className="opacity-60">Term</dt><dd className="text-xl font-semibold">{term} months</dd></div>
            </dl>
          </div>
          <div className="mt-8">
            <Link to="/apply" className="btn btn-primary w-full">Apply for this payment</Link>
            <p className="mt-3 text-xs opacity-60">Estimates only. Actual rates and terms depend on credit approval, truck and lender.</p>
          </div>
        </div>
      </section>
      <section className="bg-secondary py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3">
          {[["Down payment programs", "Low down options to get you on the road sooner."], ["Installment plans", "Fixed monthly payments over 36–72 months."], ["All credit profiles", "First-time buyers, startups and rebuilding credit welcome."]].map(([h, p]) => (
            <div key={h} className="rounded-md bg-card p-6 card-elev"><h3 className="text-2xl font-bold uppercase">{h}</h3><p className="mt-2 text-muted-foreground">{p}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
