import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

function Success({ text }: { text: string }) {
  return <div className="mt-4 flex items-start gap-3 rounded-md bg-secondary p-4"><CheckCircle2 className="h-6 w-6 shrink-0 text-primary" /><p>{text}</p></div>;
}

export function ContactForm({ truckRef, compact }: { truckRef?: string; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = contactSchema.safeParse(fd);
    if (!parsed.success) return setErr(parsed.error.issues[0]?.message ?? "Invalid input");
    setErr(""); setState("sending");
    const { error } = await supabase.from("contact_submissions").insert(clean({ ...parsed.data, truck_ref: truckRef ?? null }));
    if (error) { setErr("Something went wrong. Please call us instead."); setState("idle"); return; }
    setState("done");
  }

  if (state === "done") return <Success text="Thanks! A truck specialist will get back to you shortly." />;
  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <input name="name" className="field" placeholder="Full name *" maxLength={100} />
        <input name="email" type="email" className="field" placeholder="Email *" maxLength={255} />
        <input name="phone" className="field" placeholder="Phone" maxLength={30} />
        {!compact && <select name="subject" className="field"><option>General inquiry</option><option>Truck availability</option><option>Financing question</option><option>Trade-in</option><option>Rental</option></select>}
      </div>
      <textarea name="message" className="field min-h-28" placeholder="How can we help? *" maxLength={2000} defaultValue={truckRef ? `I'm interested in the ${truckRef}.` : ""} />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button disabled={state === "sending"} className="btn btn-primary disabled:opacity-60">{state === "sending" ? "Sending…" : "Send Message"}</button>
    </form>
  );
}

const appSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Phone is required").max(30),
  business_name: z.string().trim().max(150).optional(),
  years_driving: z.string().max(20).optional(),
  truck_interest: z.string().trim().max(200).optional(),
  down_payment: z.coerce.number().min(0).max(1000000).optional(),
  term_months: z.coerce.number().int().min(12).max(84).optional(),
  credit_range: z.string().max(30).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export function ApplicationForm({ truck }: { truck?: string | undefined }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  const [agree, setAgree] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agree) return setErr("Please confirm the authorization to continue.");
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = appSchema.safeParse(Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== "")));
    if (!parsed.success) return setErr(parsed.error.issues[0]?.message ?? "Invalid input");
    setErr(""); setState("sending");
    const { error } = await supabase.from("finance_applications").insert(clean(parsed.data));
    if (error) { setErr("Something went wrong. Please try again or call us."); setState("idle"); return; }
    setState("done");
  }

  if (state === "done") return <Success text="Application received! A finance specialist will contact you within one business day." />;
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="full_name" className="field" placeholder="Full name *" maxLength={100} />
        <input name="email" type="email" className="field" placeholder="Email *" maxLength={255} />
        <input name="phone" className="field" placeholder="Phone *" maxLength={30} />
        <input name="business_name" className="field" placeholder="Business name (optional)" maxLength={150} />
        <select name="years_driving" className="field" defaultValue=""><option value="">Years of CDL experience</option><option>Less than 1</option><option>1–2</option><option>3–5</option><option>5+</option></select>
        <select name="credit_range" className="field" defaultValue=""><option value="">Estimated credit</option><option>Excellent (720+)</option><option>Good (660–719)</option><option>Fair (600–659)</option><option>Rebuilding (&lt;600)</option></select>
        <input name="truck_interest" className="field sm:col-span-2" placeholder="Truck of interest" defaultValue={truck} maxLength={200} />
        <input name="down_payment" type="number" min={0} className="field" placeholder="Planned down payment ($)" />
        <select name="term_months" className="field" defaultValue="60"><option value="36">36 months</option><option value="48">48 months</option><option value="60">60 months</option><option value="72">72 months</option></select>
      </div>
      <textarea name="notes" className="field min-h-24" placeholder="Anything else we should know?" maxLength={2000} />
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-primary" />
        I authorize Smith's Trucking Company to contact me about financing. Submitting does not guarantee approval.
      </label>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button disabled={state === "sending"} className="btn btn-primary disabled:opacity-60">{state === "sending" ? "Submitting…" : "Submit Application"}</button>
    </form>
  );
}

// Drop undefined keys so optional fields match the database insert types.
function clean<T extends Record<string, unknown>>(o: T) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as { [K in keyof T]-?: Exclude<T[K], undefined> };
}
