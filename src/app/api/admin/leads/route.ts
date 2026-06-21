import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

  try {
    const file = process.env.LEADS_FILE?.trim() || path.join(process.cwd(), "data", "leads.jsonl");
    const raw = await fs.readFile(file, "utf8").catch(() => "");
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
      .reverse();

    return NextResponse.json({ leads, total: leads.length });
  } catch (err) {
    console.error("Failed to read leads:", err);
    return NextResponse.json({ error: "Failed to read leads" }, { status: 500 });
  }
}
