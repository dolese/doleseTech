import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "dolese-tech",
    emailConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    time: new Date().toISOString(),
  });
}
