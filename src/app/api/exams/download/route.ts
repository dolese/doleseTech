import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { examSchema, type Exam } from "@/lib/exams";

export const runtime = "nodejs";

const NAVY = "16235B";
const GREEN = "1E9E48";

function buildDoc(exam: Exam, includeScheme: boolean) {
  const children: Paragraph[] = [];

  // Cover / header
  children.push(
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: exam.title || "Examination", bold: true, size: 30, color: NAVY })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: [exam.subject, exam.level, exam.form].filter(Boolean).join(" · "), color: "555555", size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: `${exam.examType || "Exam"}  |  Time: ${exam.durationMinutes || "—"} minutes  |  Marks: ${exam.totalMarks || "—"}`, size: 20, color: "333333" })],
    }),
  );

  if (exam.instructions?.length) {
    children.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "INSTRUCTIONS", bold: true, size: 20, color: NAVY })] }));
    exam.instructions.forEach((i) => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: i, size: 20 })] })));
    children.push(new Paragraph({ text: "" }));
  }

  for (const section of exam.sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: `${section.name}${section.marks ? `  (${section.marks} marks)` : ""}`, bold: true, color: GREEN })],
      }),
    );
    if (section.instructions) {
      children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: section.instructions, italics: true, size: 20, color: "555555" })] }));
    }
    for (const q of section.questions) {
      children.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: `${q.number}. `, bold: true, size: 22 }),
            new TextRun({ text: q.text, size: 22 }),
            new TextRun({ text: `   [${q.marks}]`, bold: true, size: 20, color: "777777" }),
          ],
        }),
      );
      (q.options ?? []).forEach((opt, i) =>
        children.push(new Paragraph({ indent: { left: 480 }, children: [new TextRun({ text: `${String.fromCharCode(65 + i)}. ${opt}`, size: 20 })] })),
      );
    }
  }

  if (includeScheme) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        pageBreakBefore: true,
        children: [new TextRun({ text: "MARKING SCHEME", bold: true, color: NAVY })],
      }),
    );
    for (const section of exam.sections) {
      children.push(new Paragraph({ spacing: { before: 160 }, children: [new TextRun({ text: section.name, bold: true, color: GREEN, size: 22 })] }));
      for (const q of section.questions) {
        children.push(
          new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: `${q.number}. `, bold: true, size: 22 }), new TextRun({ text: `(${q.marks} marks · ${q.bloom})`, size: 18, color: "777777" })] }),
          new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: q.answer, size: 20 })] }),
        );
      }
    }
  }

  return new Document({
    creator: "Dolese AI Exams Composer",
    title: exam.title || "Examination",
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{ properties: {}, children: children as never }],
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = examSchema.safeParse((body as { exam?: unknown })?.exam ?? body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid exam payload." }, { status: 422 });
  }
  const includeScheme = (body as { includeScheme?: boolean })?.includeScheme !== false;

  const doc = buildDoc(parsed.data, includeScheme);
  const buffer = await Packer.toBuffer(doc);
  const filename = `${(parsed.data.title || "exam").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.docx`;

  return new Response(buffer as never, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
