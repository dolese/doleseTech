import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { isAllowedModel, DEFAULT_MODEL, modelSupportsThinking } from "@/lib/chatModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
  model: z.string().optional(),
  thinking: z.boolean().optional(),
});

const SYSTEM = `You are an AI assistant for Dolese Tech, a technology company based in Tanzania. Dolese Tech specialises in software development, cloud infrastructure, education portals (Tanzania TIE/NECTA materials), cybersecurity, IT consulting, and digital transformation for businesses, schools, and organisations.

Help visitors understand services, answer technology questions, and guide them. Be professional, concise, and friendly. If asked about pricing, encourage them to contact the team for a custom quote. Do not invent capabilities Dolese Tech does not offer.`;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parse = chatBodySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parse.error.flatten() },
      { status: 422 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured." }, { status: 503 });
  }

  const model = parse.data.model && isAllowedModel(parse.data.model) ? parse.data.model : DEFAULT_MODEL;
  const useThinking = parse.data.thinking === true && modelSupportsThinking(model);

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        const aiStream = client.messages.stream({
          model,
          max_tokens: useThinking ? 8192 : 4096,
          system: SYSTEM,
          messages: parse.data.messages,
          // Adaptive thinking on supported models; summarized so it can be shown.
          ...(useThinking ? { thinking: { type: "adaptive", display: "summarized" } } : {}),
        });

        for await (const event of aiStream) {
          if (event.type === "content_block_delta") {
            if (event.delta.type === "text_delta") {
              send({ content: event.delta.text });
            } else if (event.delta.type === "thinking_delta") {
              send({ thinking: event.delta.thinking });
            }
          }
        }
        send({ done: true });
      } catch (err) {
        console.error("Anthropic stream error:", err);
        send({ error: "AI service error. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
