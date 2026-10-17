import type { Lead } from "./leads";

export class EmailUnavailableError extends Error {
  constructor() {
    super("Email is not configured on this server.");
  }
}

export function emailAvailable(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim()) || process.env.NODE_ENV !== "production";
}

/**
 * Send one email to one person — sign-in links, receipts.
 *
 * Same rule as SMS: development prints it to the terminal when Resend is not
 * configured; production never does (a sign-in link in the logs is a leaked
 * key) and fails instead, so the caller can say email sign-in is unavailable.
 */
export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<"resend" | "log"> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") throw new EmailUnavailableError();
    console.info(`[email:log] to ${to} — ${subject}\n${text}`);
    return "log";
  }

  const from = process.env.CONTACT_FROM?.trim() || "Dolese Tech <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body.slice(0, 200)}`);
  }
  return "resend";
}

/**
 * Send a notification email for a new lead via the Resend HTTP API.
 *
 * Uses fetch directly (no SDK dependency). If RESEND_API_KEY is not set we
 * silently no-op so the app runs out of the box — the lead is still persisted
 * by the caller regardless.
 *
 * Returns true if an email was dispatched, false if email is not configured.
 */
export async function sendLeadNotification(lead: Lead): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from = process.env.CONTACT_FROM?.trim() || "Dolese Tech <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO?.trim() || "support@dolese.tech";

  const subject = `New inquiry from ${lead.name}${lead.company ? ` (${lead.company})` : ""}`;
  const text = [
    `Name:    ${lead.name}`,
    `Email:   ${lead.email}`,
    `Company: ${lead.company || "—"}`,
    `When:    ${lead.createdAt}`,
    "",
    lead.message,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text, reply_to: lead.email }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
  return true;
}

/**
 * Tell a teacher their paper is ready (or could not be written). Returns
 * false when email is not configured; the paper waits on the site either way.
 */
export async function sendPaperNotice(opts: { to: string; title: string; link: string; ok: boolean; error?: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;
  const from = process.env.CONTACT_FROM?.trim() || "Dolese Tech <onboarding@resend.dev>";

  const subject = opts.ok ? `Your paper is ready: ${opts.title}` : `Your paper could not be written: ${opts.title}`;
  const text = opts.ok
    ? [
        `The examining panel has finished your paper: ${opts.title}.`,
        "",
        "It was written to your plan, answered blind, moderated and revised. Open it, read the examiner's report, and download it:",
        opts.link,
        "",
        "The link works for 30 days. Anyone with it can open the paper, so keep it to yourself until the exam is over.",
        "",
        "Dolese Tech · Exams Composer",
      ].join("\n")
    : [
        `The examining panel could not write your paper: ${opts.title}.`,
        "",
        opts.error ?? "Please try again.",
        "",
        `Your plan is still on the page: ${opts.link}`,
        "",
        "Dolese Tech · Exams Composer",
      ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: opts.to, subject, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
  return true;
}
