import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { providerConfigError } from "@/lib/aiComplete";
import { isAllowedModel, modelProvider } from "@/lib/chatModels";
import { createJob, driveJob, linkOriginFor } from "@/lib/examAgent/jobs";
import { DEFAULT_AGENT_MODEL } from "@/lib/examAgent/panel";
import { examPlanSchema, planTotalMarks } from "@/lib/examAgent/plan";
import { expectedCalls } from "@/lib/examAgent/run";
import { paperAllowance, releasePaper, reservePaper, sellingEnabled, type Reservation } from "@/lib/entitlements";
import { guardAi } from "@/lib/limits";
import { sessionTeacherId } from "@/lib/teacherAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** The first slice of work runs after the reply, inside this request's time. */
export const maxDuration = 300;

const schema = z.object({
  plan: examPlanSchema,
  model: z.string().optional(),
  school: z.string().max(120).optional(),
  instruction: z.string().max(600).optional(),
  /** Optional: where to say the paper is ready. Forgotten once the email is sent. */
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
});

/**
 * Hand an approved plan to the examining panel. Replies at once with the
 * job's id; the panel works in the background, and the teacher's browser —
 * or their email — finds the paper when it is ready.
 */
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const { plan, school, instruction, email } = parsed.data;
  if (planTotalMarks(plan) !== plan.totalMarks) {
    return NextResponse.json({ error: "The plan's marks do not add up to the paper's total." }, { status: 422 });
  }
  const model = parsed.data.model && isAllowedModel(parsed.data.model) ? parsed.data.model : DEFAULT_AGENT_MODEL;
  const configError = providerConfigError(modelProvider(model));
  if (configError) return NextResponse.json({ error: configError }, { status: 503 });

  // Each paper comes from the teacher's allowance: free ones each month,
  // then bought ones. Taken now, and given back if the panel cannot write it.
  let teacherId: string | null = null;
  if (sellingEnabled()) {
    teacherId = sessionTeacherId(req);
    if (!teacherId) {
      return NextResponse.json(
        { error: "Sign in to write papers. It's free, with 2 papers every month.", code: "SIGN_IN" },
        { status: 401 },
      );
    }
  }

  // The whole paper is paid for up front: the background slices have no visitor to charge.
  const denied = await guardAi(req, "exams", model, { calls: expectedCalls(plan) });
  if (denied) return denied;

  let reservation: Reservation | null = null;
  if (teacherId) {
    reservation = await reservePaper(teacherId, plan.subject);
    if (!reservation) {
      return NextResponse.json(
        { error: "You've used this month's free papers. Buy more papers to keep going.", code: "NO_PAPERS" },
        { status: 402 },
      );
    }
  }

  const origin = req.nextUrl.origin;
  let id: string;
  try {
    id = await createJob(
      { plan, model, school: school || undefined, instruction: instruction || undefined },
      { email: email || undefined, linkOrigin: linkOriginFor(origin), teacherId, reservation },
    );
  } catch (err) {
    if (teacherId && reservation) await releasePaper(teacherId, reservation).catch(() => {});
    throw err;
  }
  waitUntil(driveJob(id, origin).catch((err) => console.error(`Exam job ${id}:`, err)));
  const allowance = teacherId ? await paperAllowance(teacherId) : undefined;
  return NextResponse.json({ id, allowance }, { status: 202 });
}
