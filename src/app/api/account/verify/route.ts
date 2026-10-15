import { NextRequest, NextResponse } from "next/server";
import { normalisePhone } from "@/lib/phone";
import { clientIp, hit, tooMany } from "@/lib/limits";
import {
  SESSION_COOKIE,
  accountsAvailable,
  createSession,
  sessionCookieOptions,
  verifySmsCode,
} from "@/lib/teacherAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Check the 6-digit code texted to a phone, and sign the teacher in. */
export async function POST(req: NextRequest) {
  if (!accountsAvailable()) {
    return NextResponse.json({ error: "Sign-in isn't available yet. Please try again later." }, { status: 503 });
  }

  // Each code allows five guesses; this stops a caller cycling through numbers.
  const perCaller = await hit(`signin-verify:ip:${clientIp(req)}`, { limit: 20, windowMs: 15 * 60 * 1000 });
  if (!perCaller.allowed) return tooMany("Too many attempts. Try again in a few minutes.", perCaller.retryAfterSeconds);

  let body: { phone?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const phone = normalisePhone(String(body.phone ?? ""));
  const code = String(body.code ?? "").replace(/\s+/g, "");
  if (!phone || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from the text message." }, { status: 422 });
  }

  const result = await verifySmsCode(phone, code);
  if (!result.ok) {
    const message =
      result.reason === "invalid"
        ? "That code isn't right. Check the text message and try again."
        : result.reason === "too-many-attempts"
          ? "Too many wrong codes. Ask for a new one."
          : "That code has expired or was already used. Ask for a new one.";
    return NextResponse.json({ error: message, reason: result.reason }, { status: 401 });
  }

  const { value, maxAge } = createSession(result.teacherId);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, value, { ...sessionCookieOptions, maxAge });
  return res;
}
