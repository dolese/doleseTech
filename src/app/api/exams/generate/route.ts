import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAllowedModel } from "@/lib/chatModels";
import { buildExamPrompt, extractExamJson, examConfigSchema, examSchema } from "@/lib/exams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Exam generation is intelligence-heavy; default to a balanced model.
const DEFAULT_EXAM_MODEL = "claude-sonnet-4-6";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = examConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid configuration.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured. Set ANTHROPIC_API_KEY." }, { status: 503 });
  }

  const cfg = parsed.data;
  const model = cfg.model && isAllowedModel(cfg.model) ? cfg.model : DEFAULT_EXAM_MODEL;
  const { system, user } = buildExamPrompt(cfg, cfg.instruction);

  const client = new Anthropic({ apiKey });

  try {
    const stream = client.messages.stream({
      model,
      max_tokens: 8192,
      system,
      messages: [{ role: "user", content: user }],
    });
    const message = await stream.finalMessage();
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let json: unknown;
    try {
      json = extractExamJson(text);
    } catch {
      return NextResponse.json({ error: "The model did not return a valid exam. Please try again." }, { status: 502 });
    }

    const exam = examSchema.safeParse(json);
    if (!exam.success) {
      return NextResponse.json({ error: "The generated exam was malformed. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ exam: exam.data, model });
  } catch (err) {
    console.error("Exam generation error:", err);
    return NextResponse.json({ error: "Exam generation failed. Please try again." }, { status: 500 });
  }
}
