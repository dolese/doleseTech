import { NextRequest, NextResponse } from "next/server";
import { isAllowedModel, modelProvider } from "@/lib/chatModels";
import { complete, providerConfigError, EXAM_MAX_TOKENS } from "@/lib/aiComplete";
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
  const configError = providerConfigError(modelProvider(model));
  if (configError) return NextResponse.json({ error: configError }, { status: 503 });

  try {
    const { system, user } = buildExamPrompt(cfg, cfg.instruction);
    const first = parseExam(await complete(model, system, user, EXAM_MAX_TOKENS));
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
        const repaired = parseExam(await complete(model, repairPrompt.system, repairPrompt.user, EXAM_MAX_TOKENS));
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
