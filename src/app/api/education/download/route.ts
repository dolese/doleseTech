import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  PageOrientation,
} from "docx";
import { getSubjectBySlug } from "@/lib/education";
import {
  isMaterialKey,
  materialLabel,
  hasContent,
  buildSchemeOfWork,
  buildLessonPlans,
  buildLessonNotes,
  type MaterialKey,
} from "@/lib/materials";

export const runtime = "nodejs";

const NAVY = "16235B";
const GREEN = "1E9E48";

function cell(text: string | string[], opts: { header?: boolean } = {}): TableCell {
  const lines = Array.isArray(text) ? text : [text];
  return new TableCell({
    shading: opts.header ? { fill: NAVY } : undefined,
    children: lines.map(
      (line) =>
        new Paragraph({
          bullet: !opts.header && lines.length > 1 ? { level: 0 } : undefined,
          children: [
            new TextRun({ text: line, bold: opts.header, color: opts.header ? "FFFFFF" : "1A1A1A", size: 16 }),
          ],
        }),
    ),
  });
}

function field(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun({ text: value })],
  });
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], color = NAVY) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, color, bold: true })],
  });
}

function buildChildren(subject: ReturnType<typeof getSubjectBySlug>, slug: string, material: MaterialKey) {
  if (!subject) return [];
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "DOLESE TECH", bold: true, color: NAVY, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: "Tanzania Teaching Materials · TIE / NECTA aligned", color: "777777", size: 18 })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: `${subject.name} — ${materialLabel(material)}`, color: NAVY, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: `${subject.level} · ${subject.forms}`, color: "555555", size: 20 })],
    }),
  ];

  if (material === "scheme-of-work") {
    for (const section of buildSchemeOfWork(slug, subject.name)) {
      children.push(heading(`${section.form} — Scheme of Work (competence-based)`, HeadingLevel.HEADING_2, GREEN));
      const cols = ["Month", "Week", "Main Competence", "Specific Competences", "Topic", "Sub-topic", "Teaching & Learning Activities", "Methods", "Resources", "Assessment", "Periods", "References", "Remarks"];
      const header = new TableRow({ tableHeader: true, children: cols.map((h) => cell(h, { header: true })) });
      const rows = section.rows.map(
        (r) =>
          new TableRow({
            children: [
              cell(r.month), cell(r.week), cell(r.mainCompetence), cell(r.specificCompetences),
              cell(r.topic), cell(r.subTopic), cell(r.activities), cell(r.methods), cell(r.resources),
              cell(r.assessment), cell(r.periods), cell(r.references), cell("—"),
            ],
          }),
      );
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }));
    }
  } else if (material === "lesson-plans") {
    for (const plan of buildLessonPlans(slug, subject.name)) {
      children.push(heading(`${plan.form}: ${plan.topic} (IDDR)`, HeadingLevel.HEADING_2, GREEN));
      children.push(field("School", "………………………………"));
      children.push(field("Class", plan.form));
      children.push(field("Time", plan.duration));
      children.push(field("No. of Periods", plan.periods));
      children.push(field("No. of Students", "……"));
      children.push(field("Main Competence", plan.mainCompetence));
      children.push(field("Specific Competence", plan.specificCompetence));
      children.push(field("Sub-topic", plan.subTopic));
      children.push(field("Teaching / Learning Resources", plan.resources));
      children.push(field("References", plan.references));
      const header = new TableRow({
        tableHeader: true,
        children: ["Stage (IDDR)", "Time", "Teacher's Activities", "Students' Activities", "Assessment"].map((h) =>
          cell(h, { header: true }),
        ),
      });
      const rows = plan.stages.map(
        (s) =>
          new TableRow({
            children: [`${s.stage} (${s.swahili})`, s.time, s.teacher, s.student, s.assessment].map((t) => cell(t)),
          }),
      );
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }));
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 240 },
          children: [new TextRun({ text: "Teacher's Self-Evaluation: ", bold: true }), new TextRun("……………………………………………………")],
        }),
      );
    }
  } else {
    for (const section of buildLessonNotes(slug)) {
      children.push(heading(section.form, HeadingLevel.HEADING_2, GREEN));
      section.topics.forEach((t) => {
        children.push(heading(t.topic, HeadingLevel.HEADING_3));
        children.push(new Paragraph({ children: [new TextRun(t.intro)] }));
        t.sections.forEach((s) => {
          children.push(
            new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: s.heading, bold: true })] }),
          );
          if (s.body) children.push(new Paragraph({ children: [new TextRun(s.body)] }));
          (s.points ?? []).forEach((p) =>
            children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(p)] })),
          );
        });
      });
    }
  }

  return children;
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const material = req.nextUrl.searchParams.get("material") ?? "";

  const subject = getSubjectBySlug(slug);
  if (!subject || !isMaterialKey(material)) {
    return NextResponse.json({ error: "Unknown subject or material." }, { status: 404 });
  }
  if (!hasContent(slug)) {
    return NextResponse.json({ error: "Full content for this subject is not available yet." }, { status: 404 });
  }

  const doc = new Document({
    creator: "Dolese Tech",
    title: `${subject.name} — ${materialLabel(material)}`,
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [
      {
        properties:
          material === "scheme-of-work"
            ? { page: { size: { orientation: PageOrientation.LANDSCAPE } } }
            : {},
        children: buildChildren(subject, slug, material) as never,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `${slug}-${material}.docx`.replace(/[^a-z0-9.\-]/gi, "-");

  return new NextResponse(buffer as never, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
