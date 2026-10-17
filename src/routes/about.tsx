import { createFileRoute, Link } from "@tanstack/react-router";
import lot from "@/assets/lot.jpg";
import { PageHero } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Smith's Trucking Company" },
      { name: "description", content: "A family-run commercial truck dealership built on transparency, fair pricing and long-term relationships." },
      { property: "og:title", content: "About Smith's Trucking Company" },
      { property: "og:description", content: "Our story, values and commitment to truckers." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero eyebrow="About us" title="Built by truckers, for truckers" />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2">
        <img src={lot} alt="Our dealership lot" loading="lazy" width={1600} height={912} className="rounded-md card-elev" />
        <div>
          <h2 className="text-4xl font-extrabold uppercase">Straight talk. Fair deals.</h2>
          <p className="mt-4 text-muted-foreground">Smith's Trucking Company helps owner-operators and fleets find dependable trucks at honest prices. Every used truck is inspected and documented, and our finance team works with buyers at every stage — from first truck to fleet expansion.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Transparent pricing", "Inspected inventory", "Flexible financing", "Nationwide delivery"].map((v) => <li key={v} className="border-l-4 border-primary bg-card p-3 font-semibold">{v}</li>)}
          </ul>
          <Link to="/inventory" className="btn btn-primary mt-8">See our trucks</Link>
        </div>
      </section>
    </>
  );
}
