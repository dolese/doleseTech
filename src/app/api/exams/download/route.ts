import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Footer, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { examSchema, makeVariant, EXAM_VERSIONS, latexToPlain, type Exam, type ExamVersion, type Figure } from "@/lib/exams";

export const runtime = "nodejs";

const NAVY = "16235B";
const GREEN = "1E9E48";

const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "C4CCD8" };
const CELL_BORDERS = { top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER };

/** Render a figure spec for the .docx: real tables become native tables;
 * graphic figures (number line / bar chart / coordinates) can't be typeset
 * offline, so we emit a labelled caption placeholder the teacher can sketch. */
function figureBlocks(fig: Figure): (Paragraph | Table)[] {
  const caption = fig.caption?.trim();
  if (fig.type === "table" && fig.rows?.length) {
    const headers = fig.headers ?? [];
    const rows: TableRow[] = [];
    if (headers.length) {
      rows.push(
        new TableRow({
          tableHeader: true,
          children: headers.map(
            (h) =>
              new TableCell({
                borders: CELL_BORDERS,
                shading: { fill: "EEF1F6" },
                children: [new Paragraph({ children: [new TextRun({ text: latexToPlain(h), bold: true, size: 20 })] })],
              }),
          ),
        }),
      );
    }
    for (const r of fig.rows) {
      rows.push(
        new TableRow({
          children: r.map(
            (c) =>
              new TableCell({
                borders: CELL_BORDERS,
                children: [new Paragraph({ children: [new TextRun({ text: latexToPlain(c), size: 20 })] })],
              }),
          ),
        }),
      );
    }
    const blocks: (Paragraph | Table)[] = [
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows, indent: { size: 360, type: WidthType.DXA } }),
    ];
    if (caption) blocks.push(new Paragraph({ indent: { left: 360 }, spacing: { before: 40, after: 60 }, children: [new TextRun({ text: caption, italics: true, size: 18, color: "555555" })] }));
    return blocks;
  }
  // Graphic figure → placeholder note
  const kind = fig.type === "numberline" ? "Number line" : fig.type === "barchart" ? "Bar chart" : "Coordinate graph";
  const label = caption ? `${kind}: ${caption}` : kind;
  return [
    new Paragraph({
      indent: { left: 360 },
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text: `[ ${label} — see on-screen diagram ]`, italics: true, size: 18, color: "777777" })],
    }),
  ];
}

function buildDoc(exam: Exam, includeScheme: boolean, watermark: string) {
  const children: (Paragraph | Table)[] = [];

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
            new TextRun({ text: latexToPlain(q.text), size: 22 }),
            new TextRun({ text: `   [${q.marks}]`, bold: true, size: 20, color: "777777" }),
          ],
        }),
      );
      if (q.figure) figureBlocks(q.figure).forEach((b) => children.push(b));
      (q.options ?? []).forEach((opt, i) =>
        children.push(new Paragraph({ indent: { left: 480 }, children: [new TextRun({ text: `${String.fromCharCode(65 + i)}. ${latexToPlain(opt)}`, size: 20 })] })),
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
          new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: latexToPlain(q.answer), size: 20 })] }),
        );
      }
    }
  }

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: watermark || "Generated by Dolese AI Exams Composer", size: 14, color: "AAB0BC" }),
        ],
      }),
    ],
  });

  return new Document({
    creator: "Dolese AI Exams Composer",
    title: exam.title || "Examination",
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{ properties: {}, footers: { default: footer }, children: children as never }],
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
  const opts = body as { includeScheme?: boolean; version?: string; watermark?: string };
  const includeScheme = opts.includeScheme !== false;
  const version = (EXAM_VERSIONS as readonly string[]).includes(opts.version ?? "")
    ? (opts.version as ExamVersion)
    : undefined;
  const watermark = typeof opts.watermark === "string" ? opts.watermark.slice(0, 120) : "";

  const exam = version ? makeVariant(parsed.data, version) : parsed.data;
  const doc = buildDoc(exam, includeScheme, watermark);
  const buffer = await Packer.toBuffer(doc);
  const filename = `${(exam.title || "exam").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.docx`;

  return new Response(buffer as never, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
