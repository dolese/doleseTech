import { NextRequest, NextResponse } from "next/server";
import { requestHasAdminSession } from "@/lib/adminAuth";
import { isDbConfigured } from "@/lib/db";
import { getOrder, refreshOrder, salesSummary } from "@/lib/orders";
import { paymentsAvailable } from "@/lib/pawapay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Every order and the totals, for the admin Sales view. */
export async function GET(req: NextRequest) {
  if (!requestHasAdminSession(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ configured: false, paymentsAvailable: paymentsAvailable() });
  const summary = await salesSummary();
  return NextResponse.json({ configured: true, paymentsAvailable: paymentsAvailable(), ...summary });
}

/** Ask pawaPay again about one pending order. */
export async function POST(req: NextRequest) {
  if (!requestHasAdminSession(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  const order = id ? await getOrder(id) : null;
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const updated = await refreshOrder(order);
  return NextResponse.json({ status: updated.status });
}
