import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Menu, X, Gauge, MapPin, Mail, Clock } from "lucide-react";
import { money, type Truck } from "@/lib/trucks";
import { useContactSettings } from "@/lib/contact-settings.functions";
import { CompareToggle } from "@/components/compare";

const nav = [
  { to: "/inventory", label: "Inventory" },
  { to: "/financing", label: "Financing" },
  { to: "/apply", label: "Apply" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex flex-col leading-none">
      <span className="font-display text-2xl font-extrabold tracking-wide">SMITH'S</span>
      <span className="font-display text-[0.65rem] font-semibold tracking-[0.3em] text-gold">TRUCKING COMPANY</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const contact = useContactSettings();
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span>New & used commercial trucks · Financing for every credit profile</span>
          <a href={`tel:${contact.phone}`} className="hidden items-center gap-1 font-semibold sm:flex"><Phone className="h-3 w-3" />{contact.phone}</a>
        </div>
      </div>
      <div className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="font-display text-sm font-semibold uppercase tracking-widest opacity-80 hover:opacity-100" activeProps={{ className: "!opacity-100 text-gold" }}>{n.label}</Link>
            ))}
            <Link to="/apply" search={{}} className="btn btn-primary py-2 text-sm">Get Pre-Approved</Link>
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <nav className="flex flex-col gap-3 px-4 pb-4 md:hidden">
            {nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-display uppercase tracking-widest">{n.label}</Link>)}
          </nav>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  const contact = useContactSettings();
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div><Logo /><p className="mt-4 text-sm opacity-70">Transparent pricing, flexible financing, and trucks that are ready to work.</p></div>
        <div>
          <h4 className="mb-3 text-lg font-bold uppercase">Shop</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/inventory">All Inventory</Link></li>
            {/* <li><Link to="/admin">Staff login</Link></li> */}
            <li><Link to="/inventory" search={{ condition: "New" }}>New Trucks</Link></li>
            <li><Link to="/inventory" search={{ condition: "Used" }}>Used Trucks</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-lg font-bold uppercase">Buy</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/financing">Financing & Calculator</Link></li>
            <li><Link to="/apply">Credit Application</Link></li>
            <li><Link to="/contact">Trade-In Inquiry</Link></li>
          </ul>
        </div>
        <div className="space-y-2 text-sm opacity-80">
          <h4 className="mb-3 text-lg font-bold uppercase opacity-100">Visit</h4>
          <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{contact.address}</p>
          <p className="flex gap-2"><Phone className="h-4 w-4" />{contact.phone}</p>
          <p className="flex gap-2"><Mail className="h-4 w-4" />{contact.email}</p>
          <p className="flex gap-2"><Clock className="h-4 w-4" />{contact.hours}</p>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10 py-4 text-center text-xs opacity-60">© {new Date().getFullYear()} Smith's Trucking Company. All rights reserved.</div>
    </footer>
  );
}

export function TruckCard({ t }: { t: Truck }) {
  return (
    <Link to="/inventory/$id" params={{ id: t.id }} className="group overflow-hidden rounded-md border bg-card card-elev transition hover:-translate-y-1">
      <div className="relative aspect-[3/2] overflow-hidden">
        <img src={t.image} alt={`${t.year} ${t.make} ${t.model}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className={`absolute left-3 top-3 rounded-sm px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider ${t.condition === "New" ? "bg-primary text-primary-foreground" : "bg-navy text-navy-foreground"}`}>{t.condition}</span>
        <CompareToggle id={t.id} />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.type} · Stock #{t.id.toUpperCase()}</p>
        <h3 className="mt-1 text-xl font-bold">{t.year} {t.make} {t.model}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-2xl font-extrabold text-primary">{money(t.price)}</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground"><Gauge className="h-4 w-4" />{t.mileage.toLocaleString()} mi</span>
        </div>
      </div>
    </Link>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-5xl font-extrabold uppercase md:text-6xl">{title}</h1>
        {sub && <p className="mt-3 max-w-2xl opacity-75">{sub}</p>}
      </div>
    </section>
  );
}
