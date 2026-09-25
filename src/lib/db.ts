import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Postgres (Neon) behind the contact pipeline and the admin inbox.
 *
 * Optional by design: with no DATABASE_URL the app falls back to the JSONL
 * file store, which is what local development uses. On a host with a
 * read-only filesystem — Vercel — the database is the only durable store, so
 * without it leads live only in the notification email.
 */

let client: NeonQueryFunction<false, false> | null | undefined;
let schemaReady: Promise<void> | null = null;

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

export function db(): NeonQueryFunction<false, false> | null {
  if (client !== undefined) return client;
  const url = connectionString();
  client = url ? neon(url) : null;
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
      // Fixed-window counters shared by every serverless instance (see limits.ts).
      await sql`
        CREATE TABLE IF NOT EXISTS rate_limits (
          key          TEXT NOT NULL,
          window_start BIGINT NOT NULL,
          count        INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (key, window_start)
        )
      `;
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
