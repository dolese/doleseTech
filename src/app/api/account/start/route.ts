import { NextRequest, NextResponse } from "next/server";
import { normalisePhone } from "@/lib/phone";
import { sendSms, smsAvailable } from "@/lib/sms";
import { emailAvailable, sendEmail } from "@/lib/email";
import { clientIp, hit, tooMany } from "@/lib/limits";
import {
  accountsAvailable,
  createEmailChallenge,
  createSmsChallenge,
  normaliseEmail,
} from "@/lib/teacherAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QUARTER_HOUR = 15 * 60 * 1000;

/**
 * Start a sign-in: text a 6-digit code to a phone, or email a one-time link.
 *
 * Limited per number or address (3 per 15 minutes) so nobody can flood a
 * stranger's phone, and per caller (10 per 15 minutes) so nobody can run up
 * the SMS bill.
 */
export async function POST(req: NextRequest) {
  if (!accountsAvailable()) {
    return NextResponse.json({ error: "Sign-in isn't available yet. Please try again later." }, { status: 503 });
  }

  let body: { method?: unknown; phone?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const perCaller = await hit(`signin-start:ip:${clientIp(req)}`, { limit: 10, windowMs: QUARTER_HOUR });
  if (!perCaller.allowed) return tooMany("Too many sign-in attempts. Try again in a few minutes.", perCaller.retryAfterSeconds);

  if (body.method === "sms") {
    const phone = normalisePhone(String(body.phone ?? ""));
    if (!phone) {
      return NextResponse.json({ error: "Enter a Tanzanian mobile number, like 0754 312 908." }, { status: 422 });
    }
    if (!smsAvailable()) {
      return NextResponse.json({ error: "Sign-in by phone isn't available right now. Use your email instead." }, { status: 503 });
    }
    const perTarget = await hit(`signin-start:sms:${phone}`, { limit: 3, windowMs: QUARTER_HOUR });
    if (!perTarget.allowed) {
      return tooMany("We've sent several codes to that number. Wait a few minutes, then try again.", perTarget.retryAfterSeconds);
    }
    const code = await createSmsChallenge(phone);
    try {
      await sendSms(phone, `Your Dolese Tech code is ${code}. It expires in 10 minutes. Never share it with anyone.`);
    } catch (err) {
      console.error("Sign-in SMS failed:", err);
      return NextResponse.json({ error: "We couldn't send the code. Try again, or use your email." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, method: "sms" });
  }

  if (body.method === "email") {
    const email = normaliseEmail(String(body.email ?? ""));
    if (!email) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
    }
    if (!emailAvailable()) {
      return NextResponse.json({ error: "Sign-in by email isn't available right now. Use your phone instead." }, { status: 503 });
    }
    const perTarget = await hit(`signin-start:email:${email}`, { limit: 3, windowMs: QUARTER_HOUR });
    if (!perTarget.allowed) {
      return tooMany("We've sent several links to that address. Wait a few minutes, then try again.", perTarget.retryAfterSeconds);
    }
    const link = await createEmailChallenge(email);
    try {
      await sendEmail({
        to: email,
        subject: "Your Dolese Tech sign-in link",
        text: [
          "Use this link to sign in to Dolese Tech:",
          "",
          link,
          "",
          "It works once and expires in 20 minutes.",
          "If you didn't ask for it, you can ignore this email — nothing changes on your account.",
        ].join("\n"),
      });
    } catch (err) {
      console.error("Sign-in email failed:", err);
      return NextResponse.json({ error: "We couldn't send the email. Try again, or use your phone." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, method: "email" });
  }

  return NextResponse.json({ error: "Choose phone or email." }, { status: 422 });
}
