import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { driveJob, isStalled, publicView, readJob } from "@/lib/examAgent/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** A resumed slice runs after the reply, inside this request's time. */
export const maxDuration = 300;

const ID = /^[A-Za-z0-9_-]{24}$/;

function resume(req: NextRequest, id: string) {
  waitUntil(driveJob(id, req.nextUrl.origin).catch((err) => console.error(`Exam job ${id}:`, err)));
}

/** A job's progress, and the paper once it is ready. Picks up a job nobody is working on. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!ID.test(params.id)) return NextResponse.json({ error: "No such paper." }, { status: 404 });
  const job = await readJob(params.id);
  if (!job) return NextResponse.json({ error: "No such paper. Papers are kept for 30 days." }, { status: 404 });
  if (isStalled(job)) resume(req, job.id);
  return NextResponse.json(publicView(job), { headers: { "Cache-Control": "no-store" } });
}

/**
 * Carry on with a job: how one slice of work hands on to the next. Safe to
 * call any number of times — a job already being worked on is left alone,
 * and the work was paid for when the job was created.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!ID.test(params.id)) return NextResponse.json({ error: "No such paper." }, { status: 404 });
  const job = await readJob(params.id);
  if (!job) return NextResponse.json({ error: "No such paper." }, { status: 404 });
  if (isStalled(job)) resume(req, job.id);
  return NextResponse.json({ status: job.status }, { status: 202 });
}
