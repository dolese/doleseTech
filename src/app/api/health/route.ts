import { NextResponse } from "next/server";
import { dbReachable, isDbConfigured } from "@/lib/db";
import { leadStorageWritable } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const emailConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
  const [diskWritable, database] = await Promise.all([
    leadStorageWritable(),
    isDbConfigured() ? dbReachable() : Promise.resolve(false),
  ]);
  const leadsRetained = database || diskWritable;

  return NextResponse.json({
    status: "ok",
    service: "dolese-tech",
    emailConfigured,
    databaseConfigured: isDbConfigured(),
    databaseReachable: database,
    leadStorageWritable: diskWritable,
    // Where a lead ends up: the database if we have one, the disk otherwise,
    // and the notification email either way.
    leadsRetained,
    contactFormWorking: emailConfigured || leadsRetained,
    time: new Date().toISOString(),
  });
}
