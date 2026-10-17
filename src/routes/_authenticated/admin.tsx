import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { money, resolveImage, CONTACT, type TruckRow } from "@/lib/trucks";
import { TRUCK_COLUMNS } from "@/lib/truck-columns";
import { contactSettingsQuery } from "@/lib/contact-settings.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smith's Trucking Company" },
      { name: "description", content: "Manage inventory, messages and credit applications." },
      { property: "og:title", content: "Staff Dashboard — Smith's Trucking" },
      { property: "og:description", content: "Manage inventory and customer requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Tab = "inventory" | "messages" | "applications" | "contact";

function Admin() {
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("inventory");
  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });

  async function signOut() { await supabase.auth.signOut(); nav({ to: "/auth" }); }

  if (role.isLoading) return <p className="py-32 text-center text-muted-foreground">Loading…</p>;
  if (!role.data) return (
    <div className="mx-auto max-w-md py-32 text-center">
      <h1 className="text-3xl font-bold uppercase">No access</h1>
      <p className="mt-2 text-muted-foreground">Your account ({user.email}) isn't a staff admin. Ask the owner to grant access.</p>
      <button onClick={signOut} className="btn btn-navy mt-6">Sign out</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0"><p className="eyebrow">Staff dashboard</p><h1 className="text-5xl font-extrabold uppercase">Admin</h1></div>
        <button onClick={signOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" />Sign out</button>
      </div>
      <div className="mt-6 flex gap-2 border-b">
        {(["inventory", "messages", "applications", "contact"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-4 py-2 font-display font-bold uppercase tracking-wider ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {t === "applications" ? "Credit apps" : t === "contact" ? "Contact info" : t}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "inventory" && <Inventory />}
        {tab === "messages" && <Messages />}
        {tab === "applications" && <Applications />}
        {tab === "contact" && <ContactSettingsEditor />}
      </div>
    </div>
  );
}

function ContactSettingsEditor() {
  const qc = useQueryClient();
  const settings = useQuery(contactSettingsQuery);
  const [values, setValues] = useState(CONTACT);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setValues({ phone: settings.data.phone, email: settings.data.email, address: settings.data.address, hours: settings.data.hours });
    }
  }, [settings.data]);

  const set = (key: keyof typeof CONTACT) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setSaved(false);
  };

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) as typeof CONTACT;
    if (Object.values(payload).some((value) => !value)) return setError("All contact fields are required.");
    setBusy(true);
    setError("");
    setSaved(false);
    const { error } = await supabase.from("contact_settings").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", 1).select("id").single();
    setBusy(false);
    if (error) return setError("Couldn't save contact information: " + error.message);
    setValues(payload);
    setSaved(true);
    await qc.invalidateQueries({ queryKey: ["contact-settings"] });
  }

  if (settings.isLoading) return <p className="text-muted-foreground">Loading contact information…</p>;
  if (settings.error) return <p className="text-destructive">Couldn't load contact information. Apply the contact settings database migration and try again.</p>;

  const fields: { label: string; name: keyof typeof CONTACT; type?: string; maxLength: number }[] = [
    { label: "Phone", name: "phone", type: "tel", maxLength: 50 },
    { label: "Email", name: "email", type: "email", maxLength: 255 },
    { label: "Address", name: "address", maxLength: 300 },
    { label: "Business hours", name: "hours", maxLength: 150 },
  ];

  return (
    <form onSubmit={save} className="max-w-3xl">
      <h2 className="text-2xl font-bold uppercase">Public contact information</h2>
      <p className="mt-1 text-sm text-muted-foreground">Changes appear across the website and in the customer chat assistant.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map(({ label, name, type = "text", maxLength }) => (
          <label key={name} className="block text-sm font-semibold">{label}<input className="field mt-1" type={type} value={values[name]} onChange={set(name)} maxLength={maxLength} required /></label>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {saved && <p className="mt-4 text-sm text-primary" role="status">Contact information saved.</p>}
      <button disabled={busy} className="btn btn-primary mt-5 disabled:opacity-60">{busy ? "Saving…" : "Save contact info"}</button>
    </form>
  );
}

function Inventory() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<TruckRow | "new" | null>(null);
  const q = useQuery({
    queryKey: ["admin-trucks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trucks").select(TRUCK_COLUMNS).order("created_at");
      if (error) throw error;
      return data as TruckRow[];
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-trucks"] }); qc.invalidateQueries({ queryKey: ["trucks"] }); };

  async function remove(t: TruckRow) {
    if (!confirm(`Delete ${t.year} ${t.make} ${t.model}? This can't be undone.`)) return;
    const { error } = await supabase.from("trucks").delete().eq("id", t.id);
    if (error) alert("Couldn't delete: " + error.message); else refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{q.data?.length ?? 0} trucks</p>
        <button onClick={() => setEditing("new")} className="btn btn-primary py-2 text-sm"><Plus className="h-4 w-4" />Add truck</button>
      </div>
      {q.error && <p className="text-destructive">Couldn't load trucks.</p>}
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary text-left"><tr>{["", "Truck", "Price", "Mileage", "Status", ""].map((h, i) => <th key={i} className="p-3">{h}</th>)}</tr></thead>
          <tbody>
            {q.data?.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3"><img src={resolveImage(t.image_url)} alt="" className="h-12 w-18 rounded object-cover" /></td>
                <td className="p-3"><p className="font-semibold">{t.year} {t.make} {t.model}</p><p className="text-xs text-muted-foreground">{t.condition} {t.type} · {t.id.toUpperCase()}</p></td>
                <td className="p-3">{money(Number(t.price))}</td>
                <td className="p-3">{t.mileage.toLocaleString()} mi</td>
                <td className="p-3">
                  <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${t.published ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t.published ? "Listed" : "Hidden"}</span>
                  {t.featured && <span className="ml-1 rounded-sm bg-navy px-2 py-0.5 text-xs font-semibold text-navy-foreground">Featured</span>}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(t)} aria-label="Edit" className="p-2 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(t)} aria-label="Delete" className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <TruckForm truck={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </div>
  );
}

function TruckForm({ truck, onClose, onSaved }: { truck: TruckRow | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    year: truck?.year ?? new Date().getFullYear(), make: truck?.make ?? "", model: truck?.model ?? "",
    condition: truck?.condition ?? "Used", type: truck?.type ?? "Sleeper", price: Number(truck?.price ?? 0),
    mileage: truck?.mileage ?? 0, engine: truck?.engine ?? "", transmission: truck?.transmission ?? "", hp: truck?.hp ?? 0,
    image_url: truck?.image_url ?? "", description: truck?.description ?? "", featured: truck?.featured ?? false, published: truck?.published ?? true,
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.type === "number" ? Number(e.target.value) : e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.make.trim() || !f.model.trim()) return setErr("Make and model are required.");
    if (f.image_url && !/^https:\/\//.test(f.image_url) && !f.image_url.startsWith("asset:")) return setErr("Photo link must start with https://");
    setBusy(true); setErr("");
    const payload = { ...f, make: f.make.trim(), model: f.model.trim(), image_url: f.image_url || null, description: f.description || null, updated_at: new Date().toISOString() };
    const { error } = truck
      ? await supabase.from("trucks").update(payload).eq("id", truck.id)
      : await supabase.from("trucks").insert({ ...payload, id: `stc-${Date.now().toString().slice(-6)}` });
    setBusy(false);
    if (error) return setErr("Couldn't save: " + error.message);
    onSaved();
  }

  const L = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block text-sm font-semibold">{label}<div className="mt-1">{children}</div></label>;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-card p-6 shadow-2xl">
        <h2 className="text-3xl font-bold uppercase">{truck ? "Edit truck" : "Add truck"}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <L label="Year"><input className="field" type="number" value={f.year} onChange={set("year")} /></L>
          <L label="Make *"><input className="field" value={f.make} onChange={set("make")} maxLength={50} /></L>
          <L label="Model *"><input className="field" value={f.model} onChange={set("model")} maxLength={50} /></L>
          <L label="Condition"><select className="field" value={f.condition} onChange={set("condition")}><option>New</option><option>Used</option></select></L>
          <L label="Type"><select className="field" value={f.type} onChange={set("type")}><option>Sleeper</option><option>Day Cab</option><option>Tractor</option></select></L>
          <L label="Price ($)"><input className="field" type="number" min={0} value={f.price} onChange={set("price")} /></L>
          <L label="Mileage"><input className="field" type="number" min={0} value={f.mileage} onChange={set("mileage")} /></L>
          <L label="Engine"><input className="field" value={f.engine} onChange={set("engine")} maxLength={60} /></L>
          <L label="Horsepower"><input className="field" type="number" min={0} value={f.hp} onChange={set("hp")} /></L>
          <div className="sm:col-span-3"><L label="Transmission"><input className="field" value={f.transmission} onChange={set("transmission")} maxLength={60} /></L></div>
          <div className="sm:col-span-3"><L label="Photo link (https://…)"><input className="field" value={f.image_url} onChange={set("image_url")} placeholder="Leave blank for a stock photo" /></L></div>
          <div className="sm:col-span-3"><L label="Description"><textarea className="field" rows={3} value={f.description} onChange={set("description")} maxLength={2000} /></L></div>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.published} onChange={set("published")} />Listed on website</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={set("featured")} />Featured on home page</label>
        </div>
        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-navy">Cancel</button>
          <button disabled={busy} className="btn btn-primary disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

const fmtDate = (s: string) => new Date(s).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

function Messages() {
  const q = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (q.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!q.data?.length) return <p className="py-10 text-center text-muted-foreground">No messages yet.</p>;
  return (
    <div className="grid gap-3">
      {q.data.map((m) => (
        <div key={m.id} className="rounded-md border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">{m.name} <span className="font-normal text-muted-foreground">· <a href={`mailto:${m.email}`} className="text-primary">{m.email}</a>{m.phone && ` · ${m.phone}`}</span></p>
            <p className="text-xs text-muted-foreground">{fmtDate(m.created_at)}</p>
          </div>
          {(m.subject || m.truck_ref) && <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{[m.subject, m.truck_ref].filter(Boolean).join(" · ")}</p>}
          <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

function Applications() {
  const q = useQuery({
    queryKey: ["admin-apps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("finance_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (q.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!q.data?.length) return <p className="py-10 text-center text-muted-foreground">No credit applications yet.</p>;
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-secondary text-left"><tr>{["Date", "Applicant", "Contact", "Business", "Truck", "Down / term", "Credit", "Notes"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody>
          {q.data.map((a) => (
            <tr key={a.id} className="border-t align-top">
              <td className="p-3 whitespace-nowrap">{fmtDate(a.created_at)}</td>
              <td className="p-3 font-semibold">{a.full_name}<p className="text-xs font-normal text-muted-foreground">{a.years_driving ? `${a.years_driving} driving` : ""}</p></td>
              <td className="p-3"><a href={`mailto:${a.email}`} className="text-primary">{a.email}</a><p>{a.phone}</p></td>
              <td className="p-3">{a.business_name ?? "—"}</td>
              <td className="p-3">{a.truck_interest ?? "—"}</td>
              <td className="p-3 whitespace-nowrap">{a.down_payment != null ? money(Number(a.down_payment)) : "—"}{a.term_months ? ` / ${a.term_months} mo` : ""}</td>
              <td className="p-3">{a.credit_range ?? "—"}</td>
              <td className="p-3 max-w-xs whitespace-pre-wrap">{a.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
