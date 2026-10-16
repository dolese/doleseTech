import { NextRequest } from "next/server";
import { z } from "zod";
import { applyRevisions } from "@/lib/examAgent/assemble";
import { examPlanSchema } from "@/lib/examAgent/plan";
import { revisePrompt } from "@/lib/examAgent/prompts";
import { runStep } from "@/lib/examAgent/step";
import { examSchema } from "@/lib/exams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  plan: examPlanSchema,
  exam: examSchema,
  requests: z
    .array(
      z.object({
        number: z.string().max(12),
        problems: z.array(z.string().max(20)).max(9),
        note: z.string().max(600),
        blind: z.string().max(600).optional(),
      }),
    )
    .min(1)
    .max(12),
  instruction: z.string().max(600).optional(),
  model: z.string().optional(),
});

/** The setter rewrites the questions the moderator sent back. */
export async function POST(req: NextRequest) {
  return runStep(
    req,
    schema,
    "revise",
    (body) => {
      const byNumber = new Map(body.exam.sections.flatMap((s) => s.questions).map((q) => [q.number, q]));
      const requests = body.requests
        .filter((r) => byNumber.has(r.number))
        .map((r) => ({ question: byNumber.get(r.number)!, problems: r.problems, note: r.note, blind: r.blind }));
      return { ...revisePrompt(body.plan, requests, body.instruction), maxTokens: 10000 };
    },
    (raw, body) => applyRevisions(body.exam, body.plan, raw, body.requests.map((r) => r.number)),
  );
}
