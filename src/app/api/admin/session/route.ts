import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminConfigured,
  createSessionToken,
  passwordMatches,
  requestHasAdminSession,
  sessionCookieOptions,
} from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip")) || "unknown";
}

/** Whether the caller is already signed in — the page asks on load. */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    authenticated: requestHasAdminSession(req),
    configured: adminConfigured(),
  });
}

/** Sign in: password in, session cookie out. */
export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Admin not configured. Set the ADMIN_PASSWORD environment variable." },
      { status: 503 },
    );
  }

  // Slow down guessing. The window is per IP, which is the most a single
  // instance can do without shared state.
  const limit = rateLimit(`admin-login:${clientIp(req)}`, { limit: 5, windowMs: 5 * 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!password || !passwordMatches(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const { value, maxAge } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, { ...sessionCookieOptions, maxAge });
  return res;
}

/** Sign out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
