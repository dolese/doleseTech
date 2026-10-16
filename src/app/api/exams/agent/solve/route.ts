import { NextRequest } from "next/server";
import { z } from "zod";
import { blindReply, parseJson, withoutSchemes } from "@/lib/examAgent/assemble";
import { examPlanSchema } from "@/lib/examAgent/plan";
import { solvePrompt } from "@/lib/examAgent/prompts";
import { runStep } from "@/lib/examAgent/step";
import { examSchema } from "@/lib/exams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  plan: examPlanSchema,
  exam: examSchema,
  /** Only these questions (after a revision); all of them when omitted. */
  only: z.array(z.string().max(12)).max(120).optional(),
  model: z.string().optional(),
});

/**
 * A second examiner answers the paper without the marking scheme. The scheme
 * is removed here, on the server, so it can never reach this step's prompt.
 */
export async function POST(req: NextRequest) {
  return runStep(
    req,
    schema,
    "solve",
    (body) => {
      const questions = withoutSchemes(body.exam).filter((q) => !body.only || body.only.includes(q.number));
      return { ...solvePrompt(body.plan, questions), maxTokens: 6000 };
    },
    (raw) => ({ answers: parseJson(raw, blindReply)?.answers ?? [] }),
  );
}
