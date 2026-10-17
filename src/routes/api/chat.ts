import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "Chat isn't configured yet." }, { status: 500 });
        let body: { messages?: unknown };
        try { body = await request.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }
        if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 60) {
          return Response.json({ error: "Invalid conversation." }, { status: 400 });
        }

        const { createOpenAI } = await import("@ai-sdk/openai");
        const { streamText, convertToModelMessages } = await import("ai");
        const { fetchPublishedTrucks } = await import("@/lib/trucks.server");
        const { CONTACT } = await import("@/lib/trucks");
        const { fetchContactSettings } = await import("@/lib/contact-settings.server");

        const trucks = await fetchPublishedTrucks().catch(() => []);
        const contact = await fetchContactSettings().catch(() => CONTACT);
        const catalog = trucks.map((t) => `- ${t.year} ${t.make} ${t.model} (${t.condition} ${t.type}), $${Number(t.price).toLocaleString()}, ${t.mileage.toLocaleString()} mi, ${t.engine}, ${t.hp} hp, ${t.transmission}. Link: /inventory/${t.id}`).join("\n");

        const system = `You are the friendly online assistant for Smith's Trucking Company, a dealer of new and used commercial trucks.
Help visitors find trucks, understand financing, and get in touch. Be concise (a few short sentences or a short list), use plain language, and use markdown links like [2022 Kenworth T680](/inventory/stc-1002) when mentioning a truck.
Current inventory:
${catalog || "(inventory unavailable right now)"}
Financing: down payment programs and installment plans for every credit profile; startups and owner-operators welcome. Payment calculator at [/financing](/financing), credit application at [/apply](/apply). Never promise approval, specific rates or terms — say a finance specialist will confirm.
Contact: phone ${contact.phone}, email ${contact.email}, ${contact.address}, hours ${contact.hours}. Contact form at [/contact](/contact).
Only recommend trucks from the inventory above. If you don't know something, suggest contacting the sales team.`;

        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const messages = await convertToModelMessages(body.messages as Parameters<typeof convertToModelMessages>[0]);
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          instructions: system,
          messages,
          abortSignal: request.signal,
          providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", include: ["reasoning.encrypted_content"] } },
        });
        return result.toUIMessageStreamResponse({
          onError: (e) => {
            const s = (e as { statusCode?: number }).statusCode;
            if (s === 429) return "I'm getting a lot of questions right now — please try again in a minute.";
            if (s === 402 || s === 403) return `Chat is temporarily unavailable. Please call us at ${contact.phone}.`;
            return "Sorry, something went wrong. Please try again.";
          },
        });
      },
    },
  },
});
