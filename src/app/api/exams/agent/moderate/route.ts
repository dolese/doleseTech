import { NextRequest } from "next/server";
import { z } from "zod";
import { cleanVerdicts, moderationReply, parseJson } from "@/lib/examAgent/assemble";
import { examPlanSchema } from "@/lib/examAgent/plan";
import { moderatePrompt } from "@/lib/examAgent/prompts";
import { runStep } from "@/lib/examAgent/step";
import { examSchema } from "@/lib/exams";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  plan: examPlanSchema,
  exam: examSchema,
  /** The independent examiner's answers, by question number. */
  blind: z.record(z.string().max(600)).default({}),
  /** Only re-check these questions (after a revision). */
  only: z.array(z.string().max(12)).max(120).optional(),
  model: z.string().optional(),
});

/** The chief examiner checks every question against the plan and the checklist. */
export async function POST(req: NextRequest) {
  return runStep(
    req,
    schema,
    "moderate",
    (body) => ({ ...moderatePrompt(body.plan, body.exam, new Map(Object.entries(body.blind)), body.only), maxTokens: 6000 }),
    (raw, body) => {
      const reply = parseJson(raw, moderationReply);
      // An unreadable review is not a pass: say so, and the run reports it.
      if (!reply) return { verdicts: [], summary: "", unreadable: true };
      const verdicts = cleanVerdicts(body.exam, reply.verdicts).filter((v) => !body.only || body.only.includes(v.number));
      return { verdicts, summary: reply.summary.slice(0, 1200) };
    },
  );
}
