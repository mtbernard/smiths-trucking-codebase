import { createServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { CONTACT } from "@/lib/trucks";

export const getContactSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchContactSettings } = await import("@/lib/contact-settings.server");
  return fetchContactSettings();
});

export const contactSettingsQuery = queryOptions({
  queryKey: ["contact-settings"],
  queryFn: () => getContactSettings(),
  staleTime: 60_000,
});

export function useContactSettings() {
  const { data } = useQuery(contactSettingsQuery);
  return data ? {
    phone: data.phone,
    email: data.email,
    address: data.address,
    hours: data.hours,
  } : CONTACT;
}