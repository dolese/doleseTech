import { promises as fs } from "fs";
import path from "path";
import type { ContactInput } from "./validation";

export interface Lead extends ContactInput {
  id: string;
  createdAt: string;
  ip: string | null;
  userAgent: string | null;
}

function leadsFilePath(): string {
  const configured = process.env.LEADS_FILE?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "data", "leads.jsonl");
}

/** Codes a serverless host returns when the filesystem cannot be written. */
const READ_ONLY_CODES = new Set(["EROFS", "EACCES", "EPERM", "ENOSPC"]);

/**
 * Whether this host lets us write the lead file at all. Used by /api/health so
 * the contact pipeline can be checked from outside without sending a message.
 */
export async function leadStorageWritable(): Promise<boolean> {
  const file = leadsFilePath();
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.appendFile(file, "", "utf8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Append a lead to the JSONL store. One JSON object per line keeps writes
 * cheap and append-only (no read-modify-write races). Swap this module for a
 * real database (e.g. Prisma) later without touching the route handler.
 *
 * Returns false — rather than throwing — when the host has no writable disk,
 * as on Vercel, where the bundle directory is read-only. A host without
 * storage must not cost us an enquiry; the caller delivers it by email
 * instead. Anything else is a real fault and still throws.
 */
export async function saveLead(lead: Lead): Promise<boolean> {
  const file = leadsFilePath();
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.appendFile(file, JSON.stringify(lead) + "\n", "utf8");
    return true;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code && READ_ONLY_CODES.has(code)) {
      console.warn(`Lead storage unavailable (${code}); relying on email delivery.`);
      return false;
    }
    throw err;
  }
}
