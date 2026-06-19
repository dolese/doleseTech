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

/**
 * Append a lead to the JSONL store. One JSON object per line keeps writes
 * cheap and append-only (no read-modify-write races). Swap this module for a
 * real database (e.g. Prisma) later without touching the route handler.
 */
export async function saveLead(lead: Lead): Promise<void> {
  const file = leadsFilePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, JSON.stringify(lead) + "\n", "utf8");
}
