import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  accountsAvailable,
  createSession,
  sessionCookieOptions,
  verifyEmailToken,
} from "@/lib/teacherAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The link in the sign-in email lands here: check it, sign in, move on. */
export async function GET(req: NextRequest) {
  const back = (path: string) => NextResponse.redirect(new URL(path, req.nextUrl.origin));

  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!accountsAvailable() || !token) return back("/account/sign-in?error=link");

  const result = await verifyEmailToken(token);
  if (!result.ok) return back("/account/sign-in?error=link");

  const { value, maxAge } = createSession(result.teacherId);
  const res = back("/account");
  res.cookies.set(SESSION_COOKIE, value, { ...sessionCookieOptions, maxAge });
  return res;
}
