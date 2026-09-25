import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { contactSchema } from "@/lib/validation";
import type { Lead } from "@/lib/leads";
import { storeLead } from "@/lib/leadStore";
import { sendLeadNotification } from "@/lib/email";
import { hit } from "@/lib/limits";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  const limit = await hit(`contact:${ip ?? "unknown"}`, { limit: 5, windowMs: 60_000 });
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

  // An enquiry counts as received once EITHER path holds it: written to disk,
  // or emailed. A host with a read-only filesystem has only the second, so a
  // failed write on its own must not turn the visitor away.
  let stored = false;
  try {
    stored = (await storeLead(lead)) !== "none";
  } catch (err) {
    console.error("Failed to persist lead:", err);
  }

  let emailed = false;
  try {
    emailed = await sendLeadNotification(lead);
  } catch (err) {
    console.error("Lead email notification failed:", err);
  }

  if (!stored && !emailed) {
    // Nothing is holding this message, so say so rather than accept it and
    // drop it. The contact section offers email and WhatsApp as a way through.
    console.error("Lead not retained: no writable storage, no email configured.", { id: lead.id });
    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't save your message. Please email or WhatsApp us instead.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
