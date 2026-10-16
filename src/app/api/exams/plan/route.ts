import { NextRequest, NextResponse } from "next/server";
import { examConfigSchema } from "@/lib/exams";
import { buildPlan, planWarnings } from "@/lib/examAgent/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The examiner's plan (table of specifications) for a paper. Built by code,
 * not a model: instant and free, and the teacher reviews it before anything
 * is written.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = examConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid configuration.", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const plan = buildPlan(parsed.data);
  return NextResponse.json({ plan, warnings: planWarnings(plan) });
}
