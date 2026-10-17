import { createServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { rowToTruck, type TruckRow } from "@/lib/trucks";

export const listTrucks = createServerFn({ method: "GET" }).handler(async (): Promise<TruckRow[]> => {
  const { fetchPublishedTrucks } = await import("@/lib/trucks.server");
  return fetchPublishedTrucks();
});

export const trucksQuery = queryOptions({
  queryKey: ["trucks"],
  queryFn: () => listTrucks(),
  staleTime: 60_000,
});

export function useTrucks() {
  const { data } = useSuspenseQuery(trucksQuery);
  return data.map(rowToTruck);
}
