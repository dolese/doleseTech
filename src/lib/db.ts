import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

/**
 * Postgres behind the contact pipeline, the admin inbox, accounts and
 * payments.
 *
 * Production runs on Neon through its HTTP driver. Neon's driver only speaks
 * to Neon, so any other address — a local Postgres in development or tests —
 * goes through the standard `pg` driver instead. Both are wrapped in the same
 * tagged-template shape, so no caller knows or cares which one it has.
 *
 * Optional by design: with no DATABASE_URL the contact form falls back to the
 * JSONL file store. Accounts and payments need a real database.
 */

/** A query as a tagged template: sql`SELECT … WHERE id = ${id}` → rows. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<any[]>;

let client: Sql | null | undefined;
let schemaReady: Promise<void> | null = null;

function isNeonUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

/** Turn a tagged template into a `pg` parameterised query ($1, $2, …). */
function pgSql(url: string): Sql {
  const pool = new Pool({ connectionString: url, max: 5 });
  return async (strings, ...values) => {
    const text = strings.reduce((acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ""), "");
    const result = await pool.query(text, values);
    return result.rows;
  };
}

/**
 * Vercel's Neon integration injects the connection string under its own
 * names, so accept those as well as a hand-set DATABASE_URL. The unpooled
 * variant is last: fine for the few queries this app makes, and it avoids
 * failing outright when only that one is present.
 */
const URL_VARS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
] as const;

function connectionString(): string | null {
  for (const name of URL_VARS) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

export function db(): Sql | null {
  if (client !== undefined) return client;
  const url = connectionString();
  if (!url) {
    client = null;
  } else if (isNeonUrl(url)) {
    const neonSql = neon(url);
    client = (strings, ...values) => neonSql(strings, ...values) as Promise<Record<string, unknown>[]>;
  } else {
    client = pgSql(url);
  }
  return client;
}

export function isDbConfigured(): boolean {
  return connectionString() !== null;
}

/**
 * Create the table on first use. Cheap enough to run per cold start and it
 * keeps deployment to "set DATABASE_URL" with no migration step to forget.
 * The promise is cached so concurrent requests wait on one round trip.
 */
export function ensureSchema(): Promise<void> {
  const sql = db();
  if (!sql) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id                TEXT PRIMARY KEY,
          name              TEXT NOT NULL,
          email             TEXT NOT NULL,
          company           TEXT,
          message           TEXT NOT NULL,
          ip                TEXT,
          user_agent        TEXT,
          created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
          status            TEXT NOT NULL DEFAULT 'new',
          note              TEXT NOT NULL DEFAULT '',
          status_updated_at TIMESTAMPTZ
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC)`;
      // Teacher accounts (see teacherAuth.ts). A teacher signs in by phone,
      // by email, or both; each is unique when present.
      await sql`
        CREATE TABLE IF NOT EXISTS teachers (
          id              TEXT PRIMARY KEY,
          phone           TEXT UNIQUE,
          email           TEXT UNIQUE,
          name            TEXT,
          created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_sign_in_at TIMESTAMPTZ
        )
      `;
      // One row per code or link sent. Only a keyed hash of the secret is kept.
      await sql`
        CREATE TABLE IF NOT EXISTS sign_in_challenges (
          id          TEXT PRIMARY KEY,
          channel     TEXT NOT NULL,
          target      TEXT NOT NULL,
          secret_hash TEXT NOT NULL,
          expires_at  TIMESTAMPTZ NOT NULL,
          attempts    INTEGER NOT NULL DEFAULT 0,
          consumed_at TIMESTAMPTZ,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS sign_in_challenges_target_idx
                ON sign_in_challenges (channel, target, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS sign_in_challenges_secret_idx
                ON sign_in_challenges (secret_hash)`;
      // Fixed-window counters shared by every serverless instance (see limits.ts).
      await sql`
        CREATE TABLE IF NOT EXISTS rate_limits (
          key          TEXT NOT NULL,
          window_start BIGINT NOT NULL,
          count        INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (key, window_start)
        )
      `;
      // Purchases (see orders.ts). The id is the pawaPay deposit id, chosen by
      // us before the payment is requested, so a payment can never exist
      // without its order. status: pending | paid | failed | review.
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id             TEXT PRIMARY KEY,
          reference      TEXT NOT NULL UNIQUE,
          teacher_id     TEXT NOT NULL REFERENCES teachers (id),
          product        TEXT NOT NULL,
          description    TEXT NOT NULL,
          amount         INTEGER NOT NULL CHECK (amount > 0),
          term           TEXT,
          phone          TEXT NOT NULL,
          network        TEXT NOT NULL,
          status         TEXT NOT NULL DEFAULT 'pending',
          failure_reason TEXT,
          provider_txn   TEXT,
          created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
          checked_at     TIMESTAMPTZ,
          paid_at        TIMESTAMPTZ
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS orders_teacher_idx ON orders (teacher_id, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC)`;
      // Exam papers a teacher can generate (see entitlements.ts): free ones
      // counted per month, and bought credits that never expire.
      await sql`
        CREATE TABLE IF NOT EXISTS paper_balances (
          teacher_id TEXT PRIMARY KEY REFERENCES teachers (id),
          month      TEXT NOT NULL DEFAULT '',
          free_used  INTEGER NOT NULL DEFAULT 0 CHECK (free_used >= 0),
          credits    INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS paper_usage (
          id         TEXT PRIMARY KEY,
          teacher_id TEXT NOT NULL REFERENCES teachers (id),
          source     TEXT NOT NULL,
          subject    TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS paper_usage_created_idx ON paper_usage (created_at DESC)`;
      // Subject packs, one row per subject per school term bought.
      await sql`
        CREATE TABLE IF NOT EXISTS subject_access (
          teacher_id TEXT NOT NULL REFERENCES teachers (id),
          subject    TEXT NOT NULL,
          term       TEXT NOT NULL,
          order_id   TEXT NOT NULL REFERENCES orders (id),
          PRIMARY KEY (teacher_id, subject, term)
        )
      `;
      // Exam papers the examining panel is writing in the background (see examAgent/jobs.ts).
      await sql`
        CREATE TABLE IF NOT EXISTS exam_jobs (
          id           TEXT PRIMARY KEY,
          status       TEXT NOT NULL DEFAULT 'queued',
          input        JSONB NOT NULL,
          state        JSONB NOT NULL,
          error        TEXT,
          notify_email TEXT,
          link_origin  TEXT NOT NULL,
          slices       INTEGER NOT NULL DEFAULT 0,
          lease_until  TIMESTAMPTZ,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS exam_jobs_created_at_idx ON exam_jobs (created_at)`;
      // Who a paper belongs to and which allowance paid for it, once papers are sold.
      // Added separately: the table was first created without them.
      await sql`ALTER TABLE exam_jobs ADD COLUMN IF NOT EXISTS teacher_id TEXT`;
      await sql`ALTER TABLE exam_jobs ADD COLUMN IF NOT EXISTS reservation JSONB`;
    })().catch((err) => {
      // Let the next request try again rather than caching the failure.
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

/** Round trip to confirm the database is reachable, for /api/health. */
export async function dbReachable(): Promise<boolean> {
  const sql = db();
  if (!sql) return false;
  try {
    await sql`SELECT 1`;
    return true;
  } catch (err) {
    console.error("Database unreachable:", err);
    return false;
  }
}
