import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAllowedModel, modelProvider, type Provider } from "@/lib/chatModels";
import { geminiKey, geminiComplete } from "@/lib/gemini";
import {
  buildExamPrompt,
  extractExamJson,
  examConfigSchema,
  examSchema,
  normalizeExam,
  validateExam,
  type Exam,
  type ExamConfig,
} from "@/lib/exams";
import { classifyAiError } from "@/lib/aiErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Exam generation is intelligence-heavy; default to a balanced model.
const DEFAULT_EXAM_MODEL = "claude-sonnet-4-6";

/** Run one completion against the chosen provider and return the raw text. */
async function complete(model: string, provider: Provider, system: string, user: string): Promise<string> {
  if (provider === "google") {
    return geminiComplete(model, system, user, { json: true });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("AI service not configured. Set ANTHROPIC_API_KEY.");
  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    // A full 100-mark NECTA paper carries a complete marking scheme inline,
    // so 8k tokens truncated large papers into invalid JSON. Give room.
    model,
    max_tokens: 16000,
    system,
    messages: [{ role: "user", content: user }],
  });
  const message = await stream.finalMessage();
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** Parse model text into a validated exam, or return null if unusable. */
function parseExam(text: string): Exam | null {
  let json: unknown;
  try {
    json = extractExamJson(text);
  } catch {
    return null;
  }
  const parsed = examSchema.safeParse(json);
  if (!parsed.success) return null;
  const questionCount = parsed.data.sections.reduce((n, s) => n + s.questions.length, 0);
  return questionCount > 0 ? parsed.data : null;
}

/** How far a normalized paper's total is from what the teacher requested. */
function drift(exam: Exam, cfg: ExamConfig): number {
  return Math.abs((exam.totalMarks || 0) - cfg.totalMarks);
}

/** Lower is better: content faults dominate, then distance from the target total. */
function score(exam: Exam, cfg: ExamConfig): number {
  return validateExam(exam).length * 1000 + drift(exam, cfg);
}

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

  const cfg = parsed.data;
  const model = cfg.model && isAllowedModel(cfg.model) ? cfg.model : DEFAULT_EXAM_MODEL;
  const provider = modelProvider(model);

  if (provider === "google" && !geminiKey()) {
    return NextResponse.json({ error: "Gemini not configured. Set GEMINI_API_KEY." }, { status: 503 });
  }
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY?.trim()) {
    return NextResponse.json({ error: "AI service not configured. Set ANTHROPIC_API_KEY." }, { status: 503 });
  }

  try {
    const { system, user } = buildExamPrompt(cfg, cfg.instruction);
    const first = parseExam(await complete(model, provider, system, user));
    if (!first) {
      return NextResponse.json({ error: "The model did not return a valid exam. Please try again." }, { status: 502 });
    }

    let best = normalizeExam(first);
    // Try ONE corrective pass when the paper misses the target total (beyond a
    // little rounding slack) OR has "not answerable" content faults, so the
    // teacher gets a paper that hits the marks and is actually usable rather
    // than one silently reconciled to a different number.
    const tolerance = Math.max(2, Math.round(cfg.totalMarks * 0.05));
    const defects = validateExam(best.exam);
    if (drift(best.exam, cfg) > tolerance || defects.length > 0) {
      try {
        const notes: string[] = [];
        if (drift(best.exam, cfg) > tolerance) {
          notes.push(
            `The paper currently totals ${best.exam.totalMarks} marks but must total EXACTLY ${cfg.totalMarks}. ` +
              `Adjust question marks and/or counts so every section and the whole paper sum exactly to ${cfg.totalMarks}, keeping the same sections and question types.`,
          );
        }
        if (defects.length > 0) {
          notes.push(
            "Ensure EVERY multiple-choice question has exactly four options (A–D) with no blank option, and EVERY question has a complete, non-trivial marking-scheme answer.",
          );
        }
        const repairNote = notes.join(" ");
        const refine = cfg.instruction ? `${cfg.instruction} ${repairNote}` : repairNote;
        const repairPrompt = buildExamPrompt(cfg, refine);
        const repaired = parseExam(await complete(model, provider, repairPrompt.system, repairPrompt.user));
        if (repaired) {
          const candidate = normalizeExam(repaired);
          if (score(candidate.exam, cfg) < score(best.exam, cfg)) best = candidate;
        }
      } catch (repairErr) {
        console.error("Exam repair pass failed:", repairErr);
        // Keep the first (already consistent) paper.
      }
    }

    return NextResponse.json({ exam: best.exam, model, issues: best.issues });
  } catch (err) {
    console.error("Exam generation error:", err);
    const { status, message } = classifyAiError(err, "Exam generation");
    return NextResponse.json({ error: message }, { status });
  }
}
