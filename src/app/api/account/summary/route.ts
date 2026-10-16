import { NextRequest, NextResponse } from "next/server";
import { paperAllowance, teacherPacks } from "@/lib/entitlements";
import { refreshPendingFor, teacherOrders } from "@/lib/orders";
import { orderView } from "@/lib/orderView";
import { paymentsAvailable } from "@/lib/pawapay";
import { accountsAvailable, sessionTeacherId } from "@/lib/teacherAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Everything the account page shows: papers left, packs, and purchases. */
export async function GET(req: NextRequest) {
  const teacherId = accountsAvailable() ? sessionTeacherId(req) : null;
  if (!teacherId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  // A teacher who closed the checkout page before the payment confirmed
  // finds it here: pending orders are checked again on the way in.
  if (paymentsAvailable()) await refreshPendingFor(teacherId).catch((err) => console.error("summary: refresh failed", err));

  const [papers, packs, orders] = await Promise.all([
    paperAllowance(teacherId),
    teacherPacks(teacherId),
    teacherOrders(teacherId),
  ]);
  return NextResponse.json({ papers, packs, orders: orders.map(orderView), paymentsAvailable: paymentsAvailable() });
}
