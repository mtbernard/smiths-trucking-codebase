import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  needs: z.string().trim().min(5).max(1500),
  budget: z.number().min(0).max(1_000_000).nullable(),
});

export type Recommendation = { id: string; reason: string };
export type AdvisorResult = { summary: string; picks: Recommendation[] };

export const recommendTrucks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AdvisorResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("The truck advisor isn't configured yet.");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");

    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const { fetchPublishedTrucks } = await import("@/lib/trucks.server");
    const trucks = await fetchPublishedTrucks();
    const catalog = trucks.map(({ image_url: _i, featured: _f, published: _p, ...t }) => t);
    const system = `You are a commercial truck sales advisor for Smith's Trucking Company.
Recommend up to 3 trucks ONLY from this inventory (JSON): ${JSON.stringify(catalog)}
Consider haul type (long-haul needs sleepers, local/regional suits day cabs, heavy haul favors high hp/torque), mileage, condition and budget. Prefer trucks at or under budget; if none fit, say so and suggest the closest.
Reply with JSON only, no markdown: {"summary": string (1-2 sentences), "picks": [{"id": string, "reason": string (1-2 sentences, specific to the buyer)}]}`;

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: system,
      messages: [
        { role: "user", content: `Hauling needs: ${data.needs}\nBudget: ${data.budget ? `$${data.budget}` : "not specified"}` },
      ],
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", include: ["reasoning.encrypted_content"] } },
    });

    let text: string;
    try {
      text = await result.text;
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) throw new Error("The advisor is busy right now. Please try again in a minute.");
      if (status === 402 || status === 403) throw new Error("The advisor is temporarily unavailable. Please call us instead.");
      throw new Error("Something went wrong getting recommendations. Please try again.");
    }

    const match = text.match(/\{[\s\S]*\}/);
    let parsed: { summary?: unknown; picks?: unknown } = {};
    try { parsed = match ? JSON.parse(match[0]) : {}; } catch { /* fall through */ }
    const ids = new Set(trucks.map((t) => t.id));
    const picks = (Array.isArray(parsed.picks) ? parsed.picks : [])
      .filter((p): p is Recommendation => !!p && typeof p.id === "string" && ids.has(p.id) && typeof p.reason === "string")
      .slice(0, 3);
    return { summary: typeof parsed.summary === "string" ? parsed.summary : "", picks };
  });
