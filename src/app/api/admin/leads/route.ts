import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, requestHasAdminSession } from "@/lib/adminAuth";
import { isLeadStatus } from "@/lib/leadStatus";
import { listLeads, storageMode, updateLeadMeta } from "@/lib/leadStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(req: NextRequest): NextResponse | null {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Admin not configured. Set the ADMIN_PASSWORD environment variable." },
      { status: 503 },
    );
  }
  if (!requestHasAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = authorize(req);
  if (denied) return denied;

  try {
    const leads = await listLeads();
    return NextResponse.json({ leads, total: leads.length, storage: storageMode() });
  } catch (err) {
    console.error("Failed to read leads:", err);
    return NextResponse.json({ error: "Failed to read leads" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = authorize(req);
  if (denied) return denied;

  let body: { id?: unknown; status?: unknown; note?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "A lead id is required." }, { status: 400 });
  }
  if (body.status !== undefined && !isLeadStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
  }
  if (body.note !== undefined && typeof body.note !== "string") {
    return NextResponse.json({ error: "Invalid note value." }, { status: 400 });
  }

  try {
    const meta = await updateLeadMeta(id, {
      status: body.status,
      note: typeof body.note === "string" ? body.note.slice(0, 2000) : undefined,
    });
    if (!meta) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }
    return NextResponse.json({ id, ...meta });
  } catch (err) {
    console.error("Failed to update lead status:", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
