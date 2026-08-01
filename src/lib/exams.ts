/**
 * DOLESE AI Exams Composer — Phase 1 core.
 * Types, options, the exam JSON schema, and the prompt builder used by the
 * /api/exams/generate route and the /exams UI. Tanzania (TIE/NECTA) oriented.
 */
import { z } from "zod";
import { blueprintPromptBlock } from "./examBlueprints";

export const EXAM_TYPES = [
  "Quiz",
  "Weekly Test",
  "Monthly Test",
  "Midterm Test",
  "Terminal Exam",
  "Mock Exam",
  "Pre-National Exam",
  "Final Examination",
  "Practice Paper",
  "Revision Paper",
] as const;

export const QUESTION_FORMATS = [
  "Multiple Choice",
  "True/False",
  "Matching",
  "Fill in the Blanks",
  "Short Answer",
  "Structured",
  "Essay",
] as const;

export const DIFFICULTIES = ["Very Easy", "Easy", "Medium", "Difficult", "Very Difficult", "Balanced"] as const;
export const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const;
export const LANGUAGES = ["English", "Kiswahili"] as const;
export const DURATIONS = [30, 45, 60, 90, 120, 150, 180] as const;

export type Language = (typeof LANGUAGES)[number];

export interface ExamConfig {
  subject: string;
  level: string; // O-Level / A-Level
  form: string; // Form I..VI
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  topics: string[];
  formats: string[];
  difficulty: string;
  language: Language;
  school?: string;
}

// ── Figure spec (controlled diagram the model can attach) ───────
export const figureSchema = z.object({
  type: z.enum(["numberline", "barchart", "coordinates", "table"]),
  caption: z.string().optional().default(""),
  // number line
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  marks: z.array(z.object({ value: z.number(), label: z.string().optional() })).optional(),
  // bar chart (labels + values)
  labels: z.array(z.string()).optional(),
  values: z.array(z.number()).optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
  // coordinate plane
  xMin: z.number().optional(),
  xMax: z.number().optional(),
  yMin: z.number().optional(),
  yMax: z.number().optional(),
  points: z.array(z.object({ x: z.number(), y: z.number(), label: z.string().optional() })).optional(),
  segments: z.array(z.object({ x1: z.number(), y1: z.number(), x2: z.number(), y2: z.number(), label: z.string().optional() })).optional(),
  // data table
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
});
export type Figure = z.infer<typeof figureSchema>;

// ── Exam schema (what the model must return) ────────────────────
export const examQuestionSchema = z.object({
  number: z.string(),
  type: z.string(),
  marks: z.number(),
  bloom: z.string().optional().default("Understand"),
  difficulty: z.string().optional().default("Medium"),
  text: z.string(),
  options: z.array(z.string()).optional(),
  figure: figureSchema.optional(),
  answer: z.string(), // model answer / marking scheme
});

export const examSectionSchema = z.object({
  name: z.string(),
  instructions: z.string().optional().default(""),
  marks: z.number().optional().default(0),
  questions: z.array(examQuestionSchema),
});

export const examSchema = z.object({
  title: z.string(),
  subject: z.string(),
  level: z.string().optional().default(""),
  form: z.string().optional().default(""),
  examType: z.string().optional().default(""),
  durationMinutes: z.number().optional().default(0),
  totalMarks: z.number().optional().default(0),
  language: z.string().optional().default("English"),
  instructions: z.array(z.string()).optional().default([]),
  sections: z.array(examSectionSchema),
});

export type Exam = z.infer<typeof examSchema>;
export type ExamQuestion = z.infer<typeof examQuestionSchema>;

export const examConfigSchema = z.object({
  subject: z.string().min(1),
  level: z.string().default(""),
  form: z.string().default(""),
  examType: z.enum(EXAM_TYPES),
  durationMinutes: z.number().int().min(15).max(300),
  totalMarks: z.number().int().min(5).max(200),
  topics: z.array(z.string()).max(40).default([]),
  formats: z.array(z.enum(QUESTION_FORMATS)).min(1),
  difficulty: z.enum(DIFFICULTIES),
  language: z.enum(LANGUAGES),
  school: z.string().max(120).optional(),
  model: z.string().optional(),
  instruction: z.string().max(600).optional(), // optional refine instruction
});

// ── Prompt builder ──────────────────────────────────────────────
export function buildExamPrompt(config: ExamConfig, refine?: string): { system: string; user: string } {
  const system = `You are a senior Tanzanian examiner and TIE curriculum expert who writes NECTA-standard, competence-based examination papers. You know the Tanzania 2023 competence-based curriculum, NECTA paper structure (Sections A/B/C with objective, short/structured, and essay items), marks allocation, timing, and Bloom's taxonomy balance.

You output ONLY a single valid JSON object (no markdown, no code fences, no commentary) with this exact shape:
{
  "title": string,
  "subject": string,
  "level": string,
  "form": string,
  "examType": string,
  "durationMinutes": number,
  "totalMarks": number,
  "language": string,
  "instructions": string[],            // candidate instructions (rubric)
  "sections": [
    {
      "name": string,                  // e.g. "SECTION A"
      "instructions": string,
      "marks": number,                 // total marks for the section
      "questions": [
        {
          "number": string,            // e.g. "1", "2(a)"
          "type": string,              // one of the requested formats
          "marks": number,
          "bloom": string,             // Remember|Understand|Apply|Analyze|Evaluate|Create
          "difficulty": string,
          "text": string,              // the full question (use \n for structured sub-parts)
          "options": string[],         // ONLY for Multiple Choice; otherwise omit
          "figure": {                  // OPTIONAL — include ONLY when the question needs a diagram
            "type": "numberline" | "barchart" | "coordinates" | "table",
            "caption": string,
            // numberline: min, max, step, marks:[{value,label}]
            // barchart:   labels:string[], values:number[], xLabel, yLabel
            // coordinates:xMin,xMax,yMin,yMax, points:[{x,y,label}], segments:[{x1,y1,x2,y2,label}]
            // table:      headers:string[], rows:string[][]
          },
          "answer": string             // model answer / marking scheme with mark breakdown
        }
      ]
    }
  ]
}

Rules:
- Section and question marks MUST sum exactly to totalMarks.
- Keep the whole paper doable within the given duration.
- Balance Bloom's levels across the paper; do not make every item "Remember".
- Only use the requested question formats. Multiple Choice items need 4 options (A–D) and the answer states the correct letter.
- Cover the requested topics; every question must be answerable from the stated subject/form syllabus.
- Every question includes a correct, complete "answer" (model answer) with a brief mark breakdown.
- Write ALL mathematical expressions in LaTeX: inline as $...$ and display as $$...$$ (e.g. fractions $\\frac{3}{4}$, powers $x^{2}$, roots $\\sqrt{x}$, $\\times$, $\\pm$, $\\leq$). Do not write math as plain ASCII.
- Attach a "figure" ONLY when the question genuinely needs a diagram — a data table to read, a bar chart, a number line, or points/lines to plot on a coordinate plane. Use one of the four supported figure types with numeric data (never prose). Do not invent figure types. Most questions need no figure.
- Write in the requested language.`;

  const blueprint = blueprintPromptBlock(config.subject, config.level, config.examType, config.totalMarks);

  const parts = [
    `Create a ${config.examType} for ${config.subject} — ${config.level} ${config.form}.`,
    `Duration: ${config.durationMinutes} minutes. Total marks: ${config.totalMarks}.`,
    `Question formats to use: ${config.formats.join(", ")}.`,
    `Overall difficulty: ${config.difficulty}.`,
    `Language: ${config.language}.`,
    config.topics.length ? `Focus on these topics: ${config.topics.join("; ")}.` : `Cover the core topics of the form.`,
    config.school ? `School: ${config.school}.` : "",
    blueprint ? `\n${blueprint}` : "",
    refine ? `\nApply this change to the paper: ${refine}` : "",
    `\nReturn ONLY the JSON object.`,
  ];
  return { system, user: parts.filter(Boolean).join(" ") };
}

// ── Exam variants (A/B/C/D) — anti-cheat randomisation ──────────
export const EXAM_VERSIONS = ["A", "B", "C", "D"] as const;
export type ExamVersion = (typeof EXAM_VERSIONS)[number];

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Reorder MCQ options and remap the answer's leading letter accordingly. */
function shuffleOptions(q: ExamQuestion, rng: () => number): ExamQuestion {
  if (!q.options || q.options.length < 2) return q;
  const order = shuffle(
    q.options.map((_, i) => i),
    rng,
  );
  const options = order.map((i) => q.options![i]);
  let answer = q.answer;
  const m = q.answer.match(/^\s*([A-Da-d])\b/);
  if (m) {
    const oldIdx = m[1].toUpperCase().charCodeAt(0) - 65;
    const newPos = order.indexOf(oldIdx);
    if (newPos >= 0) answer = q.answer.replace(/^\s*[A-Da-d]\b/, String.fromCharCode(65 + newPos));
  }
  return { ...q, options, answer };
}

/**
 * Produce version A/B/C/D of an exam. A is the canonical order; B/C/D shuffle
 * question order (renumbered continuously) and MCQ options, deterministically
 * per version so the same version always reproduces the same paper.
 */
export function makeVariant(exam: Exam, version: ExamVersion): Exam {
  if (version === "A") return exam;
  const rng = mulberry32(version.charCodeAt(0) * 2654435761);
  let n = 0;
  const sections = exam.sections.map((s) => {
    const questions = shuffle(s.questions, rng).map((q) => {
      n += 1;
      const withOpts = shuffleOptions(q, rng);
      return { ...withOpts, number: String(n) };
    });
    return { ...s, questions };
  });
  return { ...exam, title: `${exam.title} — Version ${version}`, sections };
}

/** Extract a JSON object from a model response that may include stray text/fences. */
export function extractExamJson(raw: string): unknown {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return JSON.parse(s);
}

/**
 * Best-effort LaTeX → readable plain text for the .docx export (which has no
 * equation typesetting). Keeps the common Form II / secondary maths notation.
 */
export function latexToPlain(input: string): string {
  return (input || "")
    .replace(/\$\$?/g, "")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
    .replace(/\^\{([^{}]*)\}/g, "^$1")
    .replace(/_\{([^{}]*)\}/g, "_$1")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\cdot/g, "·")
    .replace(/\\pi/g, "π")
    .replace(/\\theta/g, "θ")
    .replace(/\\infty/g, "∞")
    .replace(/\\(?:degree|circ)/g, "°")
    .replace(/\\left|\\right/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "");
}
