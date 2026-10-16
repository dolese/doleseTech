import { randomUUID } from "node:crypto";
import { db, ensureSchema, isDbConfigured, type Sql } from "./db";
import { accountsAvailable } from "./teacherAuth";
import { FREE_PAPERS_PER_MONTH, PRODUCTS, accessTerms, monthKey, termEndLabel, termLabel, type TermKey } from "./catalog";

/**
 * What a teacher may use: exam papers (free each month, then bought credits)
 * and subject packs (by school term).
 *
 * Every change to a balance is a single UPDATE with its condition in the
 * WHERE clause. Two papers requested at the same moment are then queued by
 * the row lock and the second sees the first's result, so a balance can never
 * be spent twice.
 */

async function requireDb(): Promise<Sql> {
  const sql = db();
  if (!sql) throw new Error("Accounts need a database (set DATABASE_URL).");
  await ensureSchema();
  return sql;
}

export interface PaperAllowance {
  freeLeft: number;
  freePerMonth: number;
  credits: number;
}

export async function paperAllowance(teacherId: string): Promise<PaperAllowance> {
  const sql = await requireDb();
  const rows = await sql`SELECT month, free_used, credits FROM paper_balances WHERE teacher_id = ${teacherId}`;
  const row = rows[0];
  const used = row && row.month === monthKey() ? Number(row.free_used) : 0;
  return {
    freeLeft: Math.max(0, FREE_PAPERS_PER_MONTH - used),
    freePerMonth: FREE_PAPERS_PER_MONTH,
    credits: row ? Number(row.credits) : 0,
  };
}

export interface Reservation {
  id: string;
  source: "free" | "credit";
  month: string;
}

/**
 * Take one paper from the teacher's allowance before generating it: a free
 * one if any are left this month, otherwise a credit. Null when there are
 * none. Give it back with `releasePaper` if generation fails.
 */
export async function reservePaper(teacherId: string, subject: string): Promise<Reservation | null> {
  const sql = await requireDb();
  const month = monthKey();
  await sql`INSERT INTO paper_balances (teacher_id) VALUES (${teacherId}) ON CONFLICT (teacher_id) DO NOTHING`;

  let source: Reservation["source"] | null = null;
  const free = await sql`
    UPDATE paper_balances
       SET free_used = CASE WHEN month = ${month} THEN free_used + 1 ELSE 1 END,
           month = ${month}
     WHERE teacher_id = ${teacherId}
       AND (month <> ${month} OR free_used < ${FREE_PAPERS_PER_MONTH})
    RETURNING teacher_id`;
  if (free.length > 0) {
    source = "free";
  } else {
    const paid = await sql`
      UPDATE paper_balances SET credits = credits - 1
       WHERE teacher_id = ${teacherId} AND credits > 0
      RETURNING teacher_id`;
    if (paid.length > 0) source = "credit";
  }
  if (!source) return null;

  const id = randomUUID();
  await sql`INSERT INTO paper_usage (id, teacher_id, source, subject) VALUES (${id}, ${teacherId}, ${source}, ${subject})`;
  return { id, source, month };
}

/** Give back a paper whose generation failed. */
export async function releasePaper(teacherId: string, reservation: Reservation): Promise<void> {
  const sql = await requireDb();
  if (reservation.source === "free") {
    await sql`
      UPDATE paper_balances SET free_used = free_used - 1
       WHERE teacher_id = ${teacherId} AND month = ${reservation.month} AND free_used > 0`;
  } else {
    await sql`UPDATE paper_balances SET credits = credits + 1 WHERE teacher_id = ${teacherId}`;
  }
  await sql`DELETE FROM paper_usage WHERE id = ${reservation.id}`;
}

// ── Subject packs ───────────────────────────────────────────────────────────

export async function hasPackAccess(teacherId: string | null, subject: string): Promise<boolean> {
  if (!teacherId || !db()) return false;
  const sql = await requireDb();
  const [now, next] = accessTerms();
  const rows = await sql`
    SELECT 1 FROM subject_access
     WHERE teacher_id = ${teacherId} AND subject = ${subject} AND term IN (${now}, ${next})
     LIMIT 1`;
  return rows.length > 0;
}

/** Whether the teacher already has a pack for this subject and term. */
export async function ownsPackTerm(teacherId: string, subject: string, term: TermKey): Promise<boolean> {
  const sql = await requireDb();
  const rows = await sql`
    SELECT 1 FROM subject_access WHERE teacher_id = ${teacherId} AND subject = ${subject} AND term = ${term}`;
  return rows.length > 0;
}

export interface OwnedPack {
  subject: string;
  name: string;
  term: TermKey;
  termLabel: string;
  until: string;
  active: boolean;
}

/** Every pack the teacher has bought, newest term first. */
export async function teacherPacks(teacherId: string): Promise<OwnedPack[]> {
  const sql = await requireDb();
  const rows = await sql`SELECT subject, term FROM subject_access WHERE teacher_id = ${teacherId} ORDER BY term DESC, subject`;
  const live = new Set(accessTerms());
  return rows.map((r) => {
    const subject = String(r.subject);
    const term = String(r.term);
    const product = PRODUCTS.find((p) => p.kind === "pack" && p.subject === subject);
    return {
      subject,
      name: product?.name ?? subject,
      term,
      termLabel: termLabel(term),
      until: termEndLabel(term),
      active: live.has(term),
    };
  });
}

/**
 * Whether paid features are switched on: accounts (AUTH_SECRET) and a
 * database are both configured. Until then the site behaves as it always has
 * — exams open to everyone within the spend limits, materials free — so this
 * code can ship before the launch settings are in place.
 */
export function sellingEnabled(): boolean {
  return accountsAvailable() && isDbConfigured();
}
