import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db, ensureSchema } from "./db";
import { rateLimit as memoryRateLimit } from "./rateLimit";

/**
 * Rate limits that hold across serverless instances.
 *
 * The in-memory limiter counts per instance, and Vercel runs many, so a
 * determined client barely noticed it. Counters now live in Postgres, one
 * row per key per fixed window, so every instance sees the same number.
 * With no database — or if it is briefly unreachable — each call falls back
 * to the in-memory limiter: weaker, but never wide open.
 */

export interface LimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Old windows are pruned now and then rather than on every request. */
const PRUNE_EVERY = 50;
let callsSincePrune = 0;

export async function hit(
  key: string,
  { limit, windowMs, cost = 1 }: { limit: number; windowMs: number; cost?: number },
): Promise<LimitResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));

  const sql = db();
  if (sql) {
    try {
      await ensureSchema();
      const rows = (await sql`
        INSERT INTO rate_limits (key, window_start, count)
        VALUES (${key}, ${windowStart}, ${cost})
        ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + ${cost}
        RETURNING count
      `) as { count: number }[];
      const used = Number(rows[0]?.count ?? cost);

      if (++callsSincePrune >= PRUNE_EVERY) {
        callsSincePrune = 0;
        const cutoff = now - 2 * 24 * 60 * 60 * 1000;
        sql`DELETE FROM rate_limits WHERE window_start < ${cutoff}`.catch(() => {});
      }

      return used <= limit
        ? { allowed: true, remaining: limit - used, retryAfterSeconds: 0 }
        : { allowed: false, remaining: 0, retryAfterSeconds };
    } catch (err) {
      console.error("Durable rate limit unavailable; using in-memory fallback:", err);
    }
  }

  // Fallback counts requests, not cost units, so weight it by repeating.
  let result = memoryRateLimit(key, { limit, windowMs });
  for (let i = 1; i < cost && result.allowed; i++) {
    result = memoryRateLimit(key, { limit, windowMs });
  }
  return result;
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip")) || "unknown";
}

export function tooMany(message: string, retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

// ── AI spend protection ─────────────────────────────────────────────────

/**
 * Relative cost of one call per model, so the budget tracks spend rather
 * than request count: many Haiku messages, a handful of Opus ones.
 */
const MODEL_WEIGHT: Record<string, number> = {
  "claude-haiku-4-5": 1,
  "gemini-flash-latest": 1,
  "claude-sonnet-4-6": 3,
  "claude-opus-4-8": 10,
  "gemini-pro-latest": 6,
};

export function modelWeight(model: string): number {
  return MODEL_WEIGHT[model] ?? 3;
}

function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * Check both budgets before an AI call: the visitor's hourly allowance for
 * this feature, then the whole site's daily ceiling. Returns a ready
 * response when the call must not go ahead, or null when it may.
 *
 * The daily ceiling is the backstop against a runaway bill: however many
 * addresses a script rotates through, total spend per day is bounded.
 */
export async function guardAi(
  req: NextRequest,
  feature: "chat" | "exams",
  model: string,
  { calls = 1 }: { calls?: number } = {},
): Promise<NextResponse | null> {
  const cost = modelWeight(model) * calls;

  const perVisitor = await hit(`ai:${feature}:${clientIp(req)}`, {
    limit: feature === "chat" ? envInt("AI_CHAT_HOURLY_UNITS", 60) : envInt("AI_EXAMS_HOURLY_UNITS", 30),
    windowMs: HOUR,
    cost,
  });
  if (!perVisitor.allowed) {
    const minutes = Math.ceil(perVisitor.retryAfterSeconds / 60);
    // Faster models cost less of the allowance, so suggest one only when it would help.
    const hint = modelWeight(model) > 1 ? ", or pick a faster model" : "";
    return tooMany(
      `You've reached the hourly limit for this feature. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}${hint}.`,
      perVisitor.retryAfterSeconds,
    );
  }

  const daily = await hit("ai:global", { limit: envInt("AI_DAILY_UNITS", 1500), windowMs: DAY, cost });
  if (!daily.allowed) {
    console.warn("AI daily budget reached; refusing AI calls until the window resets.");
    return NextResponse.json(
      { error: "The AI assistant is resting for today. Please try again tomorrow, or contact us directly." },
      { status: 503, headers: { "Retry-After": String(daily.retryAfterSeconds) } },
    );
  }

  return null;
}
