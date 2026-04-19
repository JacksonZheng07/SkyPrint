import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { buildAeroSystemPrompt } from "@/lib/ai/aero-system";
import { aeroTools } from "@/lib/ai/aero-tools";
import { checkGeminiKey } from "@/lib/ai/key-check";
import type { AeroPageContext } from "@/lib/types/aero";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    context,
  }: { messages: UIMessage[]; context: AeroPageContext } = await req.json();

  const systemPrompt = buildAeroSystemPrompt(context ?? { page: "generic" });

  const keyStatus = checkGeminiKey();
  if (!keyStatus.ok) {
    console.error("[aero/chat] Gemini key missing:", keyStatus.reason);
    return createFallbackResponse(messages);
  }

  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: aeroTools,
      stopWhen: stepCountIs(3),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[aero/chat] Gemini call failed:", error);
    return createFallbackResponse(messages);
  }
}

function createFallbackResponse(messages: UIMessage[]) {
  const lastMessage = messages[messages.length - 1];
  const text =
    lastMessage?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ") ?? "";

  let response: string;

  if (text.includes("[SYSTEM_TRIGGER:compare_opened]")) {
    response =
      "I can see you're comparing flights! The key difference between these options isn't just CO2 — it's contrail formation. Flights through ice-supersaturated air produce persistent contrails that can double the total warming effect. Look for the flight with the lowest Impact Score for the cleanest choice.";
  } else if (text.includes("[SYSTEM_TRIGGER:flight_selected]")) {
    response =
      "Great choice! Remember, contrails cause about 35% of aviation's warming effect. By picking a lower-impact flight, you're making a real difference. The contrail risk rating shows how likely this route is to produce persistent warming contrails.";
  } else if (text.toLowerCase().includes("contrail")) {
    response =
      "Contrails form when hot, humid engine exhaust meets cold air at cruise altitude. In ice-supersaturated regions, these thin clouds persist for hours, trapping heat. Research shows they cause ~35% of aviation's climate warming — sometimes 2-4x more than the CO2 from the same flight. The good news: small altitude adjustments (1,000-2,000 ft) can avoid most contrail-forming regions.";
  } else if (text.toLowerCase().includes("co2") || text.toLowerCase().includes("carbon")) {
    response =
      "CO2 is the well-known part of aviation's climate impact — each kg of jet fuel produces about 3.16 kg of CO2. But here's what most people miss: contrails can add 2-4x more warming on top of that. SkyPrint shows you both so you can see the full picture.";
  } else if (text.toLowerCase().includes("score") || text.toLowerCase().includes("impact")) {
    response =
      "The Impact Score combines CO2 emissions and contrail radiative forcing into a single number. Lower is better. Contrails are weighted more heavily because they're often the larger climate factor — and they're the part you can actually influence by choosing different flights.";
  } else {
    response =
      "Hi! I'm Aero, your climate aviation guide. I can help you understand contrail science, compare flight impacts, and make cleaner choices. What would you like to know about?";
  }

  // Return a streaming-compatible response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // AI SDK UI message stream format
      controller.enqueue(encoder.encode(`0:${JSON.stringify(response)}\n`));
      controller.enqueue(
        encoder.encode(
          `d:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}\n`
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
