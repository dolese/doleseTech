/**
 * SMS through Beem, the provider ResultsPortal already uses.
 *
 * Configured with SMS_PROVIDER=beem plus BEEM_API_KEY, BEEM_SECRET_KEY and
 * SMS_SENDER_ID. Without that, development prints the message to the
 * terminal so sign-in can be tested without sending anything — but production
 * never does: a sign-in code in the server logs is a leaked password, so there
 * the send fails and the caller reports phone sign-in as unavailable.
 */

export class SmsUnavailableError extends Error {
  constructor() {
    super("SMS is not configured on this server.");
  }
}

function beemConfig() {
  const apiKey = process.env.BEEM_API_KEY?.trim();
  const secret = process.env.BEEM_SECRET_KEY?.trim();
  const sender = process.env.SMS_SENDER_ID?.trim();
  const enabled = process.env.SMS_PROVIDER?.trim().toLowerCase() === "beem";
  return enabled && apiKey && secret && sender ? { apiKey, secret, sender } : null;
}

export function smsAvailable(): boolean {
  return beemConfig() !== null || process.env.NODE_ENV !== "production";
}

/** Send one message to one 255XXXXXXXXX number. */
export async function sendSms(to: string, message: string): Promise<"beem" | "log"> {
  const cfg = beemConfig();
  if (!cfg) {
    if (process.env.NODE_ENV === "production") throw new SmsUnavailableError();
    console.info(`[sms:log] to ${to}: ${message}`);
    return "log";
  }

  const auth = Buffer.from(`${cfg.apiKey}:${cfg.secret}`).toString("base64");
  const res = await fetch("https://apisms.beem.africa/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({
      source_addr: cfg.sender,
      schedule_time: "",
      // Our messages are plain ASCII, which is GSM-7 (encoding 0).
      encoding: 0,
      message,
      // recipient_id must be a number, not a UUID — Beem rejects anything else
      // as "Missing or invalid reference ID" (found the hard way in ResultsPortal).
      recipients: [{ recipient_id: 1, dest_addr: to }],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Beem SMS failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return "beem";
}
