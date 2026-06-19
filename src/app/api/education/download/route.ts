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

function cell(text: string, opts: { header?: boolean; width?: number } = {}): TableCell {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.header ? { fill: NAVY } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts.header, color: opts.header ? "FFFFFF" : "1A1A1A", size: 18 })],
      }),
    ],
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
    for (const section of buildSchemeOfWork(slug)) {
      children.push(heading(section.form, HeadingLevel.HEADING_2, GREEN));
      const header = new TableRow({
        tableHeader: true,
        children: ["Week", "Topic", "Sub-topic", "Objectives", "Activities", "Resources", "Assessment"].map((h) =>
          cell(h, { header: true }),
        ),
      });
      const rows = section.rows.map(
        (r) =>
          new TableRow({
            children: [r.week, r.topic, r.subTopic, r.objectives, r.activities, r.resources, r.assessment].map((t) =>
              cell(t),
            ),
          }),
      );
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }));
    }
  } else if (material === "lesson-plans") {
    for (const plan of buildLessonPlans(slug)) {
      children.push(heading(`${plan.form}: ${plan.topic}`, HeadingLevel.HEADING_2, GREEN));
      children.push(
        new Paragraph({ children: [new TextRun({ text: "Competence: ", bold: true }), new TextRun(plan.competence)] }),
      );
      children.push(new Paragraph({ children: [new TextRun({ text: "Specific Objectives:", bold: true })] }));
      plan.objectives.forEach((o) =>
        children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(o)] })),
      );
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: "Resources: ", bold: true }), new TextRun(plan.resources)],
        }),
      );
      const header = new TableRow({
        tableHeader: true,
        children: ["Stage", "Time", "Teacher's Activities", "Student's Activities"].map((h) => cell(h, { header: true })),
      });
      const rows = plan.stages.map(
        (s) => new TableRow({ children: [s.stage, s.time, s.teacher, s.student].map((t) => cell(t)) }),
      );
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }));
    }
  } else {
    for (const section of buildLessonNotes(slug)) {
      children.push(heading(section.form, HeadingLevel.HEADING_2, GREEN));
      section.topics.forEach((t) => {
        children.push(heading(t.topic, HeadingLevel.HEADING_3));
        children.push(new Paragraph({ children: [new TextRun(t.intro)] }));
        t.points.forEach((p) => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(p)] })));
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
        properties: {},
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
