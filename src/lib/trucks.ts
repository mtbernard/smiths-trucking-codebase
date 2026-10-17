import hero from "@/assets/hero.jpg";
import red from "@/assets/truck-red.jpg";
import white from "@/assets/truck-white.jpg";

export type Truck = {
  id: string; year: number; make: string; model: string; condition: "New" | "Used";
  type: "Sleeper" | "Day Cab" | "Tractor"; price: number; mileage: number;
  engine: string; transmission: string; hp: number; image: string; featured: boolean;
  description: string | null; published: boolean; imageUrl: string | null;
};

export type TruckRow = {
  id: string; year: number; make: string; model: string; condition: string; type: string;
  price: number; mileage: number; engine: string; transmission: string; hp: number;
  image_url: string | null; description: string | null; featured: boolean; published: boolean;
};

const assets: Record<string, string> = { white, red, hero };
export const resolveImage = (url: string | null) =>
  !url ? white : url.startsWith("asset:") ? (assets[url.slice(6)] ?? white) : url;

export const rowToTruck = (r: TruckRow): Truck => ({
  id: r.id, year: r.year, make: r.make, model: r.model,
  condition: r.condition as Truck["condition"], type: r.type as Truck["type"],
  price: Number(r.price), mileage: r.mileage, engine: r.engine, transmission: r.transmission, hp: r.hp,
  image: resolveImage(r.image_url), imageUrl: r.image_url, featured: r.featured,
  description: r.description, published: r.published,
});

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function monthlyPayment(price: number, down: number, aprPct: number, months: number) {
  const p = Math.max(price - down, 0);
  const r = aprPct / 100 / 12;
  if (r === 0) return p / months;
  return (p * r) / (1 - Math.pow(1 + r, -months));
}

export const CONTACT = {
  phone: "(555) 010-2468",
  email: "sales@smithstrucking.com",
  address: "1200 Freight Way, Dallas, TX 75201",
  hours: "Mon–Fri 8am–6pm · Sat 9am–3pm",
};
