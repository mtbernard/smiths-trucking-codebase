import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { TruckRow } from "@/lib/trucks";

import { TRUCK_COLUMNS } from "@/lib/truck-columns";

// Public (anon) read of published trucks. Call only inside server handlers.
export async function fetchPublishedTrucks(): Promise<TruckRow[]> {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await sb.from("trucks").select(TRUCK_COLUMNS).eq("published", true).order("created_at");
  if (error) throw new Error("Could not load inventory.");
  return data as TruckRow[];
}
