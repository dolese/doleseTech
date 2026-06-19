import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { contactSchema } from "@/lib/validation";
import { saveLead, type Lead } from "@/lib/leads";
import { sendLeadNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  const limit = rateLimit(`contact:${ip ?? "unknown"}`, { limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot: if filled, pretend success but drop it silently.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const lead: Lead = {
    ...parsed.data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ip,
    userAgent: req.headers.get("user-agent"),
  };

  try {
    await saveLead(lead);
  } catch (err) {
    console.error("Failed to persist lead:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your message. Please try again." },
      { status: 500 },
    );
  }

  // Email is best-effort: a delivery failure must not lose a saved lead.
  try {
    await sendLeadNotification(lead);
  } catch (err) {
    console.error("Lead saved but email notification failed:", err);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
