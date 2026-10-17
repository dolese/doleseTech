/**
 * Exam papers written in the background.
 *
 * When the teacher approves a plan, the paper becomes a job in the database
 * and the server runs the examining panel itself: the teacher can close the
 * page, lose signal or switch phones, and the paper is waiting when they come
 * back. Progress is saved after every phase (see run.ts), so the work goes on
 * in slices:
 *
 *   - the request that creates the job starts the first slice, after it has
 *     replied, and each slice hands on to the next by calling the site again;
 *   - any status check that finds a job nobody is working on picks it up, so
 *     a slice lost to a crash or a missed hand-on only costs a short wait.
 *
 * A lease on the row keeps two slices from working on one job at once.
 *
 * Who can see a job: anyone with its id. Ids are 144 random bits, are never
 * listed, and reach only the teacher's browser and their own email, so a
 * paper cannot be found by guessing or enumeration — the same standard as a
 * private document link. Jobs are deleted after 30 days.
 *
 * Without a database (local development with no DATABASE_URL) jobs live in
 * this process's memory.
 */
import { randomBytes } from "node:crypto";
import { db, ensureSchema } from "../db";
import { sendPaperNotice } from "../email";
import { releasePaper, type Reservation } from "../entitlements";
import { SITE_URL } from "../site";
import type { ExamPlan } from "./plan";
import { createPanel } from "./panel";
import { advance, initialState, PanelError, type AgentState, type Panel } from "./run";

export interface JobInput {
  plan: ExamPlan;
  model: string;
  school?: string;
  instruction?: string;
}

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  input: JobInput;
  state: AgentState;
  error: string | null;
  notifyEmail: string | null;
  linkOrigin: string;
  /** The signed-in teacher, once papers are sold; null on a free site. */
  teacherId: string | null;
  /** The paper from their allowance that pays for this one: given back if it fails. */
  reservation: Reservation | null;
  slices: number;
  leaseUntil: number | null;
  createdAt: string;
}

/** Longest a slice keeps starting new phases. A phase is at most a couple of minutes, inside the 300 s limit. */
const SLICE_MS = 110_000;
/** A slice that dies keeps its lease this long, then anyone may take the job over. */
const LEASE_SECONDS = 310;
/** Slices before a job is given up on: a normal paper needs two or three. */
const MAX_SLICES = 10;
const KEEP_DAYS = 30;

// ── Storage ──────────────────────────────────────────────────────────

interface Row {
  id: string;
  status: JobStatus;
  input: JobInput;
  state: AgentState;
  error: string | null;
  notify_email: string | null;
  link_origin: string;
  teacher_id: string | null;
  reservation: Reservation | null;
  slices: number;
  lease_until: string | Date | null;
  created_at: string | Date;
}

function fromRow(r: Row): Job {
  return {
    id: r.id,
    status: r.status,
    input: r.input,
    state: r.state,
    error: r.error,
    notifyEmail: r.notify_email,
    linkOrigin: r.link_origin,
    teacherId: r.teacher_id,
    reservation: r.reservation,
    slices: Number(r.slices),
    leaseUntil: r.lease_until ? new Date(r.lease_until).getTime() : null,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

const memory = new Map<string, Job>();

async function sqlOrNull() {
  const sql = db();
  if (sql) await ensureSchema();
  return sql;
}

export async function createJob(
  input: JobInput,
  opts: { email?: string; linkOrigin: string; teacherId?: string | null; reservation?: Reservation | null },
): Promise<string> {
  const id = randomBytes(18).toString("base64url");
  const state = initialState();
  const sql = await sqlOrNull();
  if (!sql) {
    memory.set(id, {
      id, status: "queued", input, state, error: null, notifyEmail: opts.email ?? null,
      linkOrigin: opts.linkOrigin, teacherId: opts.teacherId ?? null, reservation: opts.reservation ?? null,
      slices: 0, leaseUntil: null, createdAt: new Date().toISOString(),
    });
    return id;
  }
  await sql`
    INSERT INTO exam_jobs (id, input, state, notify_email, link_origin, teacher_id, reservation)
    VALUES (${id}, ${JSON.stringify(input)}::jsonb, ${JSON.stringify(state)}::jsonb, ${opts.email ?? null}, ${opts.linkOrigin},
            ${opts.teacherId ?? null}, ${opts.reservation ? JSON.stringify(opts.reservation) : null}::jsonb)
  `;
  if (Math.random() < 0.05) {
    sql`DELETE FROM exam_jobs WHERE created_at < now() - make_interval(days => ${KEEP_DAYS})`.catch(() => {});
  }
  return id;
}

export async function readJob(id: string): Promise<Job | null> {
  const sql = await sqlOrNull();
  if (!sql) return memory.get(id) ?? null;
  const rows = (await sql`
    SELECT * FROM exam_jobs WHERE id = ${id} AND created_at > now() - make_interval(days => ${KEEP_DAYS})
  `) as Row[];
  return rows[0] ? fromRow(rows[0]) : null;
}

/** Take the job for one slice, if it is unfinished and nobody else holds it. */
async function claim(id: string): Promise<Job | null> {
  const sql = await sqlOrNull();
  if (!sql) {
    const job = memory.get(id);
    if (!job || job.status === "done" || job.status === "failed") return null;
    if (job.leaseUntil && job.leaseUntil > Date.now()) return null;
    Object.assign(job, { status: "running", slices: job.slices + 1, leaseUntil: Date.now() + LEASE_SECONDS * 1000 });
    return structuredClone(job);
  }
  const rows = (await sql`
    UPDATE exam_jobs
       SET status = 'running', slices = slices + 1, updated_at = now(),
           lease_until = now() + make_interval(secs => ${LEASE_SECONDS})
     WHERE id = ${id}
       AND status IN ('queued', 'running')
       AND (lease_until IS NULL OR lease_until < now())
    RETURNING *
  `) as Row[];
  return rows[0] ? fromRow(rows[0]) : null;
}

/** Save progress. A finished job, or one between slices, gives up its lease. */
async function save(id: string, state: AgentState, status: JobStatus, opts: { error?: string; release?: boolean } = {}) {
  const keepLease = status === "running" && !opts.release;
  const sql = await sqlOrNull();
  if (!sql) {
    const job = memory.get(id);
    if (job) {
      Object.assign(job, {
        state: structuredClone(state), status, error: opts.error ?? null,
        leaseUntil: keepLease ? Date.now() + LEASE_SECONDS * 1000 : null,
      });
    }
    return;
  }
  await sql`
    UPDATE exam_jobs
       SET state = ${JSON.stringify(state)}::jsonb, status = ${status}, error = ${opts.error ?? null}, updated_at = now(),
           lease_until = CASE WHEN ${keepLease}::boolean THEN now() + make_interval(secs => ${LEASE_SECONDS}) ELSE NULL END
     WHERE id = ${id}
  `;
}

async function forgetEmail(id: string) {
  const sql = await sqlOrNull();
  if (!sql) {
    const job = memory.get(id);
    if (job) job.notifyEmail = null;
    return;
  }
  await sql`UPDATE exam_jobs SET notify_email = NULL WHERE id = ${id}`;
}

// ── Running ──────────────────────────────────────────────────────────

/** True when a job is unfinished and nobody is working on it. */
export function isStalled(job: Job): boolean {
  return (job.status === "queued" || job.status === "running") && (!job.leaseUntil || job.leaseUntil < Date.now());
}

export function jobTitle(input: JobInput): string {
  const { plan, school } = input;
  return [school, `${plan.form} ${plan.subject} ${plan.examType}`].filter(Boolean).join(" — ");
}

/**
 * Work on the job for one slice: run phases, saving after each, until it is
 * finished or the slice is used up; then hand on to the next slice.
 */
export async function driveJob(
  id: string,
  origin: string,
  // Tests and scripts stand in their own examiners and slice length.
  opts: { panelFor?: (input: JobInput) => Panel; sliceMs?: number; handOn?: boolean } = {},
): Promise<void> {
  const job = await claim(id);
  if (!job) return;
  const { input } = job;
  let state = job.state;

  if (job.slices > MAX_SLICES) {
    await finish(job, state, "failed", "The panel took too long on this paper. Please try again.");
    return;
  }

  const panel = (opts.panelFor ?? createPanel)(input);
  const sliceMs = opts.sliceMs ?? SLICE_MS;
  const started = Date.now();
  try {
    do {
      state = await advance(input.plan, state, panel, { school: input.school });
      if (state.phase !== "done") await save(id, state, "running");
    } while (state.phase !== "done" && Date.now() - started < sliceMs);
  } catch (err) {
    if (!(err instanceof PanelError)) console.error(`Exam job ${id} failed:`, err);
    const message = err instanceof PanelError ? err.message : "The paper could not be written. Please try again.";
    // The step that was under way is the one that failed.
    const at = state.steps.findIndex((s) => s.state === "running" || s.state === "waiting");
    state = { ...state, steps: state.steps.map((s, i) => (i === at ? { ...s, state: "failed" } : s)) };
    await finish(job, state, "failed", message);
    return;
  }

  if (state.phase === "done") {
    await finish(job, state, "done");
    return;
  }
  await save(id, state, "running", { release: true });
  if (opts.handOn !== false) await handOn(id, origin);
}

async function finish(job: Job, state: AgentState, status: "done" | "failed", error?: string) {
  await save(job.id, state, status, { error });
  // No paper, no charge.
  if (status === "failed" && job.teacherId && job.reservation) {
    await releasePaper(job.teacherId, job.reservation).catch((err) => console.error(`Exam job ${job.id}: could not give back a paper:`, err));
  }
  if (!job.notifyEmail) return;
  try {
    await sendPaperNotice({
      to: job.notifyEmail,
      title: jobTitle(job.input),
      link: `${job.linkOrigin}/exams?job=${job.id}`,
      ok: status === "done",
      error,
    });
  } catch (err) {
    console.error(`Exam job ${job.id}: notice email failed:`, err);
  }
  // Kept only as long as it is needed.
  await forgetEmail(job.id);
}

/**
 * Start the next slice as a fresh request, so it gets its own time limit.
 * Only ever this deployment's own address: the bypass secret for preview
 * protection must not go anywhere else.
 */
async function handOn(id: string, origin: string) {
  const deployment = process.env.VERCEL_URL?.trim();
  const base = deployment ? `https://${deployment}` : origin;
  const headers: Record<string, string> = {};
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (deployment && bypass) headers["x-vercel-protection-bypass"] = bypass;
  try {
    const res = await fetch(`${base}/api/exams/jobs/${id}`, { method: "POST", headers });
    if (!res.ok) console.warn(`Exam job ${id}: hand-on returned ${res.status}; the next status check will resume it.`);
  } catch (err) {
    console.warn(`Exam job ${id}: hand-on failed; the next status check will resume it.`, err);
  }
}

/**
 * Where links in emails point. The request's own address when it is one of
 * ours (so a preview links to the preview), otherwise the public site.
 */
export function linkOriginFor(requestOrigin: string): string {
  try {
    const { hostname } = new URL(requestOrigin);
    const ours =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "dolese.tech" ||
      hostname.endsWith(".dolese.tech") ||
      (hostname.startsWith("dolese-tech-") && hostname.endsWith(".vercel.app"));
    return ours ? requestOrigin : SITE_URL;
  } catch {
    return SITE_URL;
  }
}

/** What the teacher's browser sees: progress, and the paper once it is ready. */
export function publicView(job: Job) {
  return {
    id: job.id,
    status: job.status,
    title: jobTitle(job.input),
    createdAt: job.createdAt,
    steps: job.state.steps,
    error: job.error,
    plan: job.input.plan,
    result: job.status === "done" ? job.state.result : null,
  };
}
export type JobView = ReturnType<typeof publicView>;
