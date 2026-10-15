import { createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { db, ensureSchema } from "./db";
import { SITE_URL } from "./site";

/**
 * Teacher accounts: sign in with a phone number (6-digit code by SMS) or an
 * email address (one-time link). Either one creates the account on first use.
 *
 * Nothing secret is stored readably. A code or link token is kept only as an
 * HMAC under AUTH_SECRET, bound to the channel and the number or address it
 * was sent to, so a leaked database row cannot be replayed. Each one works
 * once, expires, and allows five guesses. The session is a signed, httpOnly
 * cookie holding the teacher's id and an expiry.
 */

export const SESSION_COOKIE = "dt_session";
const SESSION_DAYS = 30;
const CODE_MINUTES = 10;
const LINK_MINUTES = 20;
const MAX_ATTEMPTS = 5;

export class AuthUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
  }
}

/**
 * The signing key. Production refuses to run accounts without one — a
 * missing secret must never quietly become a guessable default. Development
 * gets a fixed key so it works out of the box; it signs nothing real.
 */
function secret(): string {
  const value = process.env.AUTH_SECRET?.trim();
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV !== "production") return "development-only-auth-secret-not-for-production-use";
  throw new AuthUnavailableError("AUTH_SECRET is not set (at least 32 characters).");
}

export function accountsAvailable(): boolean {
  if (!db()) return false;
  try {
    secret();
    return true;
  } catch {
    return false;
  }
}

function hmac(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function requireDb() {
  const sql = db();
  if (!sql) throw new AuthUnavailableError("Accounts need a database (DATABASE_URL).");
  return sql;
}

// ── Challenges: what was sent, and whether it has been used ─────────────────

export type Channel = "sms" | "email";

/** Create a 6-digit code for a phone number. Returns the code to send. */
export async function createSmsChallenge(phone: string): Promise<string> {
  const sql = requireDb();
  await ensureSchema();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await sql`
    INSERT INTO sign_in_challenges (id, channel, target, secret_hash, expires_at)
    VALUES (${randomUUID()}, 'sms', ${phone}, ${hmac(`sms:${phone}:${code}`)},
            now() + make_interval(mins => ${CODE_MINUTES}))
  `;
  return code;
}

/**
 * Where an emailed sign-in link should point.
 *
 * Production always uses the configured site address and never anything taken
 * from the request: a link built from a forged Host header would send a
 * teacher's sign-in token to someone else's site. Previews use their own
 * branch address, so a link opens the preview it was requested from; local
 * development uses whatever address the developer is on.
 */
export function linkOrigin(requestOrigin: string): string {
  if (process.env.VERCEL_ENV === "production") return SITE_URL;
  if (process.env.VERCEL_ENV === "preview") {
    const branch = process.env.VERCEL_BRANCH_URL?.trim();
    return branch ? `https://${branch}` : SITE_URL;
  }
  return process.env.NODE_ENV === "production" ? SITE_URL : requestOrigin;
}

/** Create a one-time sign-in link for an email address. Returns the URL. */
export async function createEmailChallenge(email: string, origin: string = SITE_URL): Promise<string> {
  const sql = requireDb();
  await ensureSchema();
  const token = randomBytes(32).toString("base64url");
  await sql`
    INSERT INTO sign_in_challenges (id, channel, target, secret_hash, expires_at)
    VALUES (${randomUUID()}, 'email', ${email}, ${hmac(`email:${token}`)},
            now() + make_interval(mins => ${LINK_MINUTES}))
  `;
  return `${origin}/api/account/email-link?token=${encodeURIComponent(token)}`;
}

export type VerifyResult =
  | { ok: true; teacherId: string }
  | { ok: false; reason: "invalid" | "expired" | "too-many-attempts" };

/** Check a phone code. Consumes it on success; counts a guess either way. */
export async function verifySmsCode(phone: string, code: string): Promise<VerifyResult> {
  const sql = requireDb();
  await ensureSchema();

  // The newest live code for this number. Spending a guess and reading the
  // row happen in one statement, so parallel guesses cannot share an attempt.
  const rows = await sql`
    UPDATE sign_in_challenges SET attempts = attempts + 1
     WHERE id = (
       SELECT id FROM sign_in_challenges
        WHERE channel = 'sms' AND target = ${phone} AND consumed_at IS NULL AND expires_at > now()
        ORDER BY created_at DESC LIMIT 1)
    RETURNING id, secret_hash, attempts
  `;
  if (rows.length === 0) return { ok: false, reason: "expired" };
  const row = rows[0];
  if (Number(row.attempts) > MAX_ATTEMPTS) return { ok: false, reason: "too-many-attempts" };
  if (!safeEqual(String(row.secret_hash), hmac(`sms:${phone}:${code}`))) {
    return { ok: false, reason: "invalid" };
  }
  if (!(await consume(String(row.id)))) return { ok: false, reason: "expired" };
  return { ok: true, teacherId: await upsertTeacher({ phone }) };
}

/** Check an email link token. Consumes it on success. */
export async function verifyEmailToken(token: string): Promise<VerifyResult> {
  const sql = requireDb();
  await ensureSchema();
  const rows = await sql`
    SELECT id, target FROM sign_in_challenges
     WHERE channel = 'email' AND secret_hash = ${hmac(`email:${token}`)}
       AND consumed_at IS NULL AND expires_at > now()
     LIMIT 1
  `;
  if (rows.length === 0) return { ok: false, reason: "expired" };
  if (!(await consume(String(rows[0].id)))) return { ok: false, reason: "expired" };
  return { ok: true, teacherId: await upsertTeacher({ email: String(rows[0].target) }) };
}

/** Mark a challenge used. False if something else got there first. */
async function consume(id: string): Promise<boolean> {
  const sql = requireDb();
  const rows = await sql`
    UPDATE sign_in_challenges SET consumed_at = now()
     WHERE id = ${id} AND consumed_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

// ── Teachers ─────────────────────────────────────────────────────────────────

export interface Teacher {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  createdAt: string;
}

async function upsertTeacher(by: { phone?: string; email?: string }): Promise<string> {
  const sql = requireDb();
  const rows = by.phone
    ? await sql`
        INSERT INTO teachers (id, phone, last_sign_in_at) VALUES (${randomUUID()}, ${by.phone}, now())
        ON CONFLICT (phone) DO UPDATE SET last_sign_in_at = now()
        RETURNING id`
    : await sql`
        INSERT INTO teachers (id, email, last_sign_in_at) VALUES (${randomUUID()}, ${by.email}, now())
        ON CONFLICT (email) DO UPDATE SET last_sign_in_at = now()
        RETURNING id`;
  return String(rows[0].id);
}

export async function getTeacher(id: string): Promise<Teacher | null> {
  const sql = db();
  if (!sql) return null;
  await ensureSchema();
  const rows = await sql`SELECT id, phone, email, name, created_at FROM teachers WHERE id = ${id}`;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: String(r.id),
    phone: r.phone ? String(r.phone) : null,
    email: r.email ? String(r.email) : null,
    name: r.name ? String(r.name) : null,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export function createSession(teacherId: string): { value: string; maxAge: number } {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const payload = [
    Buffer.from(teacherId).toString("base64url"),
    String(Date.now() + maxAge * 1000),
    randomBytes(9).toString("base64url"),
  ].join(".");
  return { value: `${payload}.${hmac(`session:${payload}`)}`, maxAge };
}

/** The teacher id a session cookie vouches for, or null. */
export function readSession(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [id64, expiresAt, nonce, signature] = parts;
  let expected: string;
  try {
    expected = hmac(`session:${id64}.${expiresAt}.${nonce}`);
  } catch {
    return null;
  }
  if (!safeEqual(signature, expected)) return null;
  if (!(Number(expiresAt) > Date.now())) return null;
  return Buffer.from(id64, "base64url").toString();
}

export function sessionTeacherId(req: NextRequest): string | null {
  return readSession(req.cookies.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Lower-cased and trimmed, or null when it isn't plausibly an address. */
export function normaliseEmail(input: string): string | null {
  const email = String(input ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254 ? email : null;
}
