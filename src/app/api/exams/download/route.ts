import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Footer, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { examSchema, makeVariant, EXAM_VERSIONS, latexToPlain, type Exam, type ExamVersion, type Figure } from "@/lib/exams";

export const runtime = "nodejs";

const NAVY = "16235B";
const GREEN = "1E9E48";

const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "C4CCD8" };
const CELL_BORDERS = { top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER };

/** A bordered data table for the .docx. */
function dataTable(headers: string[], rows: string[][]): Table {
  const trs: TableRow[] = [];
  if (headers.length) {
    trs.push(
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
  for (const r of rows) {
    trs.push(
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
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: trs, indent: { size: 360, type: WidthType.DXA } });
}

function captionPara(text: string): Paragraph {
  return new Paragraph({ indent: { left: 360 }, spacing: { before: 40, after: 60 }, children: [new TextRun({ text, italics: true, size: 18, color: "555555" })] });
}

function notePara(text: string): Paragraph {
  return new Paragraph({ indent: { left: 360 }, spacing: { before: 40, after: 80 }, children: [new TextRun({ text, italics: true, size: 18, color: "777777" })] });
}

function num(n: number | undefined): string {
  return typeof n === "number" ? String(n) : "";
}

/** Render a figure spec for the .docx. Real tables become native tables;
 * graphic figures (number line / bar chart / coordinates) can't be typeset
 * offline, so we preserve their DATA (as a table or described values) and add a
 * note to draw the diagram — rather than dropping the data to a placeholder. */
function figureBlocks(fig: Figure): (Paragraph | Table)[] {
  const caption = fig.caption?.trim();
  const blocks: (Paragraph | Table)[] = [];

  if (fig.type === "table" && fig.rows?.length) {
    blocks.push(dataTable(fig.headers ?? [], fig.rows));
    if (caption) blocks.push(captionPara(caption));
    return blocks;
  }

  if (fig.type === "barchart" && fig.labels?.length) {
    const values = fig.values ?? [];
    const headers = [fig.xLabel?.trim() || "Category", fig.yLabel?.trim() || "Value"];
    const rows = fig.labels.map((l, i) => [l, num(values[i])]);
    blocks.push(dataTable(headers, rows));
    blocks.push(notePara(caption ? `Bar chart: ${caption} — draw a bar chart from the data above.` : "Draw a bar chart from the data above."));
    return blocks;
  }

  if (fig.type === "coordinates") {
    const pts = fig.points ?? [];
    if (pts.length) {
      const rows = pts.map((p, i) => [p.label?.trim() || String.fromCharCode(65 + i), num(p.x), num(p.y)]);
      blocks.push(dataTable(["Point", "x", "y"], rows));
    }
    const segs = (fig.segments ?? []).map(
      (s) => `${s.label ? `${s.label}: ` : ""}(${num(s.x1)}, ${num(s.y1)}) → (${num(s.x2)}, ${num(s.y2)})`,
    );
    if (segs.length) blocks.push(new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: `Line segments: ${segs.join("; ")}`, size: 20 })] }));
    const range = `x ∈ [${num(fig.xMin)}, ${num(fig.xMax)}], y ∈ [${num(fig.yMin)}, ${num(fig.yMax)}]`;
    blocks.push(notePara(caption ? `Coordinate graph: ${caption} — plot on axes ${range}.` : `Plot the points/segments above on axes ${range}.`));
    return blocks;
  }

  if (fig.type === "numberline") {
    const marks = (fig.marks ?? []).map((m) => `${num(m.value)}${m.label ? ` (${m.label})` : ""}`);
    const spec =
      `Number line from ${num(fig.min)} to ${num(fig.max)}` +
      (typeof fig.step === "number" ? `, step ${fig.step}` : "") +
      (marks.length ? `. Mark: ${marks.join(", ")}` : "") + ".";
    blocks.push(notePara(caption ? `Number line: ${caption} — ${spec}` : spec));
    return blocks;
  }

  // Empty table / bar chart with no data → labelled note (last resort)
  const kind = fig.type === "barchart" ? "Bar chart" : "Data table";
  blocks.push(notePara(caption ? `${kind}: ${caption} — draw the diagram.` : `${kind} — draw the diagram.`));
  return blocks;
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
    const choose = section.choose && section.choose < section.questions.length ? section.choose : 0;
    const headerBits = [section.marks ? `${section.marks} marks` : "", choose ? `answer any ${choose}` : ""].filter(Boolean);
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: `${section.name}${headerBits.length ? `  (${headerBits.join(" · ")})` : ""}`, bold: true, color: GREEN })],
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
