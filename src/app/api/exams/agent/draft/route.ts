import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pinQuestions } from "@/lib/examAgent/assemble";
import { examPlanSchema } from "@/lib/examAgent/plan";
import { draftPrompt } from "@/lib/examAgent/prompts";
import { runStep } from "@/lib/examAgent/step";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  plan: examPlanSchema,
  section: z.number().int().min(0).max(5),
  /** The plan's question numbers to write in this call. */
  numbers: z.array(z.string().max(8)).min(1).max(20),
  instruction: z.string().max(600).optional(),
  model: z.string().optional(),
});

/** The setter writes some of a section's questions to the plan. */
export async function POST(req: NextRequest) {
  return runStep(
    req,
    schema,
    "draft",
    (body) => {
      if (!body.plan.sections[body.section]) return NextResponse.json({ error: "No such section." }, { status: 422 });
      return { ...draftPrompt(body.plan, body.section, body.numbers, body.instruction), maxTokens: 12000 };
    },
    (raw, body) => {
      const items = body.plan.sections[body.section].items.filter((i) => body.numbers.includes(i.number));
      const { questions, missing } = pinQuestions(items, raw);
      if (!questions.length) {
        return NextResponse.json({ error: "The questions could not be written. Please try again." }, { status: 502 });
      }
      return { questions, missing };
    },
  );
}
