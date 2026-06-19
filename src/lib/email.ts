import type { Lead } from "./leads";

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
  const to = process.env.CONTACT_TO?.trim() || "hello@dolese.tech";

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
