import { NextResponse } from "next/server";
import { leadStorageWritable } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const emailConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
  const leadStorageWritableNow = await leadStorageWritable();
  return NextResponse.json({
    status: "ok",
    service: "dolese-tech",
    emailConfigured,
    leadStorageWritable: leadStorageWritableNow,
    // The contact form keeps a message only if one of the two paths works.
    contactFormWorking: emailConfigured || leadStorageWritableNow,
    time: new Date().toISOString(),
  });
}
