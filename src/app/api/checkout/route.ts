import { NextRequest, NextResponse } from "next/server";
import { hit, tooMany } from "@/lib/limits";
import { OrderError, createOrder } from "@/lib/orders";
import { orderView } from "@/lib/orderView";
import { paymentsAvailable } from "@/lib/pawapay";
import { normalisePhone } from "@/lib/phone";
import { accountsAvailable, sessionTeacherId } from "@/lib/teacherAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEN_MINUTES = 10 * 60 * 1000;

/**
 * Start a purchase: save the order and send a payment prompt to the phone.
 *
 * Limited per teacher (5 per 10 minutes) and per paying number (3 per 10
 * minutes): a payment prompt lands on someone's phone, so nobody may use this
 * to pester a stranger.
 */
export async function POST(req: NextRequest) {
  const teacherId = accountsAvailable() ? sessionTeacherId(req) : null;
  if (!teacherId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!paymentsAvailable()) {
    return NextResponse.json({ error: "Payments aren't available yet. Please try again later." }, { status: 503 });
  }

  let body: { product?: unknown; phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const perTeacher = await hit(`checkout:teacher:${teacherId}`, { limit: 5, windowMs: TEN_MINUTES });
  if (!perTeacher.allowed) return tooMany("Too many payment attempts. Wait a few minutes, then try again.", perTeacher.retryAfterSeconds);
  const phone = normalisePhone(String(body.phone ?? ""));
  if (phone) {
    const perPhone = await hit(`checkout:phone:${phone}`, { limit: 3, windowMs: TEN_MINUTES });
    if (!perPhone.allowed) {
      return tooMany("We've sent several payment requests to that number. Wait a few minutes.", perPhone.retryAfterSeconds);
    }
  }

  try {
    const order = await createOrder({ teacherId, productId: String(body.product ?? ""), phone: String(body.phone ?? "") });
    return NextResponse.json({ order: orderView(order) });
  } catch (err) {
    if (err instanceof OrderError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("checkout failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
