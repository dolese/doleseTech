import { promises as fs } from "fs";
import path from "path";

/**
 * Lifecycle stages a lead can move through in the admin inbox.
 * Kept as a small, fixed set so the UI can render stable filters/badges.
 */
export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const DEFAULT_STATUS: LeadStatus = "new";

export interface LeadMeta {
  status: LeadStatus;
  note: string;
  updatedAt: string;
}

export type StatusStore = Record<string, LeadMeta>;

function statusFilePath(): string {
  const configured = process.env.LEAD_STATUS_FILE?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "data", "lead-status.json");
}

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

/**
 * Read the whole status map. Missing/corrupt file resolves to an empty map so
 * the admin view keeps working before any lead has been triaged.
 */
export async function readStatusStore(): Promise<StatusStore> {
  const file = statusFilePath();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as StatusStore) : {};
  } catch {
    return {};
  }
}

/**
 * Upsert the status/note for a single lead. Returns the stored meta.
 */
export async function updateLeadMeta(
  id: string,
  patch: { status?: LeadStatus; note?: string },
): Promise<LeadMeta> {
  const store = await readStatusStore();
  const existing = store[id];
  const meta: LeadMeta = {
    status: patch.status ?? existing?.status ?? DEFAULT_STATUS,
    note: patch.note ?? existing?.note ?? "",
    updatedAt: new Date().toISOString(),
  };
  store[id] = meta;

  const file = statusFilePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
  return meta;
}
