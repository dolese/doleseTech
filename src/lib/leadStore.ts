import { promises as fs } from "fs";
import path from "path";
import { db, ensureSchema, isDbConfigured } from "./db";
import { saveLead as appendToFile, type Lead } from "./leads";
import {
  DEFAULT_STATUS,
  readStatusStore,
  removeLeadMeta as removeFileMeta,
  updateLeadMeta as updateFileMeta,
  type LeadMeta,
  type LeadStatus,
} from "./leadStatus";

/**
 * One door to lead data for the routes, over two stores:
 *
 *   Postgres — set DATABASE_URL. Durable, and the only option on a host with
 *              a read-only filesystem.
 *   JSONL    — the local-development fallback, kept so the app still runs
 *              with no configuration at all.
 *
 * Which one answered matters to the caller: the contact route treats a lead
 * as received when EITHER a store held it or the notification email went out.
 */
export type StoredWhere = "db" | "file" | "none";

export interface LeadRecord extends Lead {
  status: LeadStatus;
  note: string;
  statusUpdatedAt: string | null;
}

export async function storeLead(lead: Lead): Promise<StoredWhere> {
  const sql = db();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        INSERT INTO leads (id, name, email, company, message, ip, user_agent, created_at)
        VALUES (${lead.id}, ${lead.name}, ${lead.email}, ${lead.company ?? null},
                ${lead.message}, ${lead.ip}, ${lead.userAgent}, ${lead.createdAt})
        ON CONFLICT (id) DO NOTHING
      `;
      return "db";
    } catch (err) {
      // Fall through to the file store: a database outage should not cost us
      // the lead when the host happens to have a writable disk.
      console.error("Failed to store lead in Postgres:", err);
    }
  }

  try {
    return (await appendToFile(lead)) ? "file" : "none";
  } catch (err) {
    console.error("Failed to store lead in the file store:", err);
    return "none";
  }
}

export async function listLeads(): Promise<LeadRecord[]> {
  const sql = db();
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, name, email, company, message, ip, user_agent, created_at,
             status, note, status_updated_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT 1000
    `) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      company: (r.company as string) ?? undefined,
      message: String(r.message),
      ip: (r.ip as string) ?? null,
      userAgent: (r.user_agent as string) ?? null,
      createdAt: new Date(r.created_at as string).toISOString(),
      status: (r.status as LeadStatus) ?? DEFAULT_STATUS,
      note: String(r.note ?? ""),
      statusUpdatedAt: r.status_updated_at
        ? new Date(r.status_updated_at as string).toISOString()
        : null,
    }));
  }

  return readFileLeads();
}

export async function updateLeadMeta(
  id: string,
  patch: { status?: LeadStatus; note?: string },
): Promise<LeadMeta | null> {
  const sql = db();
  if (sql) {
    await ensureSchema();
    const rows = (await sql`
      UPDATE leads
         SET status = COALESCE(${patch.status ?? null}, status),
             note = COALESCE(${patch.note ?? null}, note),
             status_updated_at = now()
       WHERE id = ${id}
      RETURNING status, note, status_updated_at
    `) as Record<string, unknown>[];
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      status: row.status as LeadStatus,
      note: String(row.note ?? ""),
      updatedAt: new Date(row.status_updated_at as string).toISOString(),
    };
  }

  return updateFileMeta(id, patch);
}

/**
 * Remove a lead for good — for spam, tests and duplicates. Returns false when
 * no lead had that id. The notification email already sent is untouched.
 */
export async function deleteLead(id: string): Promise<boolean> {
  const sql = db();
  if (sql) {
    await ensureSchema();
    const rows = (await sql`DELETE FROM leads WHERE id = ${id} RETURNING id`) as unknown[];
    return rows.length > 0;
  }

  // File store: rewrite the log without the line, then drop its status entry.
  const file = leadsFilePath();
  const raw = await fs.readFile(file, "utf8").catch(() => "");
  let found = false;
  const kept = raw
    .split("\n")
    .filter(Boolean)
    .filter((line) => {
      try {
        if ((JSON.parse(line) as Lead).id === id) {
          found = true;
          return false;
        }
      } catch {
        /* keep lines we cannot parse rather than silently lose them */
      }
      return true;
    });
  if (!found) return false;
  await fs.writeFile(file, kept.length ? kept.join("\n") + "\n" : "", "utf8");
  await removeFileMeta(id);
  return true;
}

/** Where this deployment keeps leads, for the admin systems view. */
export function storageMode(): "postgres" | "file" {
  return isDbConfigured() ? "postgres" : "file";
}

function leadsFilePath(): string {
  return process.env.LEADS_FILE?.trim() || path.join(process.cwd(), "data", "leads.jsonl");
}

async function readFileLeads(): Promise<LeadRecord[]> {
  const raw = await fs.readFile(leadsFilePath(), "utf8").catch(() => "");
  const meta = await readStatusStore();

  return raw
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as Lead];
      } catch {
        return [];
      }
    })
    .reverse()
    .map((lead) => ({
      ...lead,
      status: meta[lead.id]?.status ?? DEFAULT_STATUS,
      note: meta[lead.id]?.note ?? "",
      statusUpdatedAt: meta[lead.id]?.updatedAt ?? null,
    }));
}
