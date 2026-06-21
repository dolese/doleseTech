import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_STATUS,
  isLeadStatus,
  readStatusStore,
  updateLeadMeta,
} from "@/lib/leadStatus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(req: NextRequest): NextResponse | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    return NextResponse.json(
      { error: "Admin not configured. Set the ADMIN_PASSWORD environment variable." },
      { status: 503 },
    );
  }

  const provided = req.headers.get("x-admin-password")?.trim();
  if (!provided || provided !== password) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = authorize(req);
  if (denied) return denied;

  try {
    const file = process.env.LEADS_FILE?.trim() || path.join(process.cwd(), "data", "leads.jsonl");
    const raw = await fs.readFile(file, "utf8").catch(() => "");
    const store = await readStatusStore();

    const leads = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse()
      .map((lead: any) => {
        const meta = store[lead.id];
        return {
          ...lead,
          status: meta?.status ?? DEFAULT_STATUS,
          note: meta?.note ?? "",
          statusUpdatedAt: meta?.updatedAt ?? null,
        };
      });

    return NextResponse.json({ leads, total: leads.length });
  } catch (err) {
    console.error("Failed to read leads:", err);
    return NextResponse.json({ error: "Failed to read leads" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = authorize(req);
  if (denied) return denied;

  let body: any;
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
    return NextResponse.json({ id, ...meta });
  } catch (err) {
    console.error("Failed to update lead status:", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
