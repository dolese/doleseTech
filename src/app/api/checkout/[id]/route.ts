import { NextRequest, NextResponse } from "next/server";
import { getOrder, refreshOrder } from "@/lib/orders";
import { orderView } from "@/lib/orderView";
import { accountsAvailable, sessionTeacherId } from "@/lib/teacherAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Where a purchase stands. Asks pawaPay while it is still pending. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const teacherId = accountsAvailable() ? sessionTeacherId(req) : null;
  if (!teacherId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const order = await getOrder(params.id);
  // Someone else's order is "not found", not "forbidden": ids are not for guessing.
  if (!order || order.teacherId !== teacherId) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({ order: orderView(await refreshOrder(order)) });
}
