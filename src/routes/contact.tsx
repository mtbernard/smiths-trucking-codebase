import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageHero } from "@/components/site";
import { ContactForm } from "@/components/forms";
import { useContactSettings } from "@/lib/contact-settings.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Smith's Trucking Company" },
      { name: "description", content: "Reach our truck sales and finance team by phone, email or our contact form." },
      { property: "og:title", content: "Contact Smith's Trucking Company" },
      { property: "og:description", content: "Questions about trucks, financing or trade-ins? Get in touch." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const contact = useContactSettings();
  const items = [[MapPin, contact.address], [Phone, contact.phone], [Mail, contact.email], [Clock, contact.hours]] as const;
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to a specialist" sub="Questions about a truck, financing, trade-ins or rentals — we're here to help." />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-5">
          {items.map(([Icon, text]) => (
            <div key={text} className="flex items-center gap-4 rounded-md border bg-card p-5 card-elev"><Icon className="h-6 w-6 text-primary" /><span className="font-semibold">{text}</span></div>
          ))}
        </div>
        <div className="rounded-md border bg-card p-8 card-elev">
          <h2 className="text-3xl font-bold uppercase">Send a message</h2>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
