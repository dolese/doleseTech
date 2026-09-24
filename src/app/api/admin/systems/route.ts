import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, requestHasAdminSession } from "@/lib/adminAuth";
import { dbReachable, isDbConfigured } from "@/lib/db";
import { leadStorageWritable } from "@/lib/leads";
import { storageMode } from "@/lib/leadStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESULTS_PORTAL_API =
  process.env.RESULTS_PORTAL_API?.trim() || "https://edurex-production.up.railway.app";

const PROBE_TIMEOUT_MS = 10_000;

/** A health probe that answers in bounded time and never throws. */
async function probe(url: string): Promise<{ ok: boolean; ms: number; detail?: string }> {
  const started = Date.now();
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return { ok: res.ok, ms: Date.now() - started, detail: `HTTP ${res.status}` };
  } catch (err) {
    // "This operation was aborted" tells the reader nothing; say what happened.
    const detail = timedOut
      ? `no answer within ${PROBE_TIMEOUT_MS / 1000}s`
      : err instanceof Error
        ? err.message
        : "unreachable";
    return { ok: false, ms: Date.now() - started, detail };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Admin not configured." }, { status: 503 });
  }
  if (!requestHasAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [resultsPortal, portalWeb, database, diskWritable] = await Promise.all([
    probe(`${RESULTS_PORTAL_API}/api/health`),
    probe("https://results.dolese.tech"),
    isDbConfigured() ? dbReachable() : Promise.resolve(false),
    leadStorageWritable(),
  ]);

  return NextResponse.json({
    site: {
      emailConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
      contactTo: process.env.CONTACT_TO?.trim() || "support@dolese.tech",
      leadStorage: storageMode(),
      databaseConfigured: isDbConfigured(),
      databaseReachable: database,
      diskWritable,
    },
    resultsPortal: {
      api: resultsPortal,
      web: portalWeb,
      adminUrl: "https://results.dolese.tech",
    },
    checkedAt: new Date().toISOString(),
  });
}
