import { NextRequest, NextResponse } from "next/server";
import { emailAvailable } from "@/lib/email";
import { displayPhone } from "@/lib/phone";
import { smsAvailable } from "@/lib/sms";
import { accountsAvailable, getTeacher, sessionTeacherId } from "@/lib/teacherAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who is signed in, and which sign-in methods this server offers. */
export async function GET(req: NextRequest) {
  const available = accountsAvailable();
  const methods = { sms: available && smsAvailable(), email: available && emailAvailable() };

  const id = available ? sessionTeacherId(req) : null;
  const teacher = id ? await getTeacher(id) : null;

  return NextResponse.json({
    available,
    methods,
    teacher: teacher && {
      id: teacher.id,
      phone: teacher.phone ? displayPhone(teacher.phone) : null,
      email: teacher.email,
      name: teacher.name,
      since: teacher.createdAt,
    },
  });
}
