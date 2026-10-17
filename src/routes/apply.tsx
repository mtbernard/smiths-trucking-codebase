import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site";
import { ApplicationForm } from "@/components/forms";

export const Route = createFileRoute("/apply")({
  validateSearch: (s: Record<string, unknown>): { truck?: string | undefined } => ({ truck: typeof s["truck"] === "string" ? s["truck"].slice(0, 200) : undefined }),
  head: () => ({
    meta: [
      { title: "Apply for Truck Financing — Smith's Trucking Company" },
      { name: "description", content: "Submit a quick credit application for commercial truck financing. Decisions in as little as 24 hours." },
      { property: "og:title", content: "Truck Financing Application — Smith's Trucking" },
      { property: "og:description", content: "Apply online for commercial truck financing." },
    ],
  }),
  component: Apply,
});

function Apply() {
  const { truck } = Route.useSearch();
  return (
    <>
      <PageHero eyebrow="Get pre-approved" title="Credit application" sub="Takes about 3 minutes. No obligation." />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-md border bg-card p-8 card-elev"><ApplicationForm truck={truck} /></div>
      </div>
    </>
  );
}
